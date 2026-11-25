import z from "zod";
import { messages } from "../config/db/schema/schema.messages.mjs";
import { db } from "../config/db/db.mjs";
import { inquiries } from "../config/db/schema/schema.inquiries.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import AppError from "../utils/AppError.mjs";
import { and, asc, eq, sql } from "drizzle-orm";
import { notifications } from "../config/db/schema/schema.notifications.mjs";
import { notifyEmployeeOfCustomerReply } from "../config/notificationSocket.mjs";

const inquiryIdSchema = z.string().uuid();

const messageBodySchema = z.object({
    body: z.string().trim().min(1).max(50000),
}).strict();

const customerReplySchema = messageBodySchema.extend({
    replyToMessageId: z.string().uuid().optional(),
});

const messageFields = {
    id: messages.id,
    authorId: messages.authorId,
    authorName: sql`COALESCE(${customer.fullName}, ${employee.fullName}, ${users.email})`.as("author_name"),
    authorRole: users.role,
    body: messages.body,
    replyToMessageId: messages.replyToMessageId,
    createdAt: messages.createdAt,
};

const createMessage = async ({
    inquiryId,
    authorId,
    accessColumn,
    visibility,
    body,
    replyToMessageId = null,
    isCustomerReply = false,
}) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const result = await db.transaction(async (tx) => {
        const [inquiry] = await tx
            .select({
                status: inquiries.status,
                assignedEmployeeId: inquiries.assignedEmployeeId,
            })
            .from(inquiries)
            .where(and(eq(inquiries.id, id), eq(accessColumn, authorId)))
            .for("update");

        if (!inquiry) {
            throw new AppError("Inquiry not found.", 404);
        }

        if (inquiry.status === "CLOSED") {
            const errorMessage =
                visibility === "INTERNAL"
                    ? "This inquiry is closed to new internal notes."
                    : "This inquiry is closed to new replies.";

            throw new AppError(errorMessage, 409);
        }

        if (
            accessColumn === inquiries.customerId &&
            inquiry.status === "RESOLVED"
        ) {
            throw new AppError(
                "This inquiry is resolved and closed to new replies.",
                409,
            );
        }

        if (replyToMessageId) {
            const [employeeMessage] = await tx
                .select({ id: messages.id })
                .from(messages)
                .innerJoin(users, eq(users.id, messages.authorId))
                .where(
                    and(
                        eq(messages.id, replyToMessageId),
                        eq(messages.inquiryId, id),
                        eq(messages.visibility, "PUBLIC"),
                        eq(users.role, "EMPLOYEE"),
                    ),
                )
                .limit(1);

            if (!employeeMessage) {
                throw new AppError("Employee reply not found in this inquiry.", 404);
            }
        }

        const [inserted] = await tx
            .insert(messages)
            .values({ inquiryId: id, authorId, body, visibility, replyToMessageId })
            .returning({ id: messages.id });

        const recipientId = isCustomerReply ? inquiry.assignedEmployeeId : null;

        if (recipientId) {
            await tx.insert(notifications).values({
                recipientId,
                inquiryId: id,
                messageId: inserted.id,
                type: "CUSTOMER_REPLIED",
            });
        }

        const [createdMessage] = await tx
            .select(messageFields)
            .from(messages)
            .innerJoin(users, eq(users.id, messages.authorId))
            .leftJoin(customer, eq(customer.userId, users.id))
            .leftJoin(employee, eq(employee.userId, users.id))
            .where(eq(messages.id, inserted.id))
            .limit(1);

        return { message: createdMessage, recipientId };
    });

    if (result.recipientId) {
        notifyEmployeeOfCustomerReply(result.recipientId);
    }

    return result.message;
};


export const customerSendMessage = (inquiryId, customerId, data) => {
    const { body, replyToMessageId } = customerReplySchema.parse(data);

    return createMessage({
        inquiryId,
        authorId: customerId,
        accessColumn: inquiries.customerId,
        visibility: "PUBLIC",
        body,
        replyToMessageId,
        isCustomerReply: true,
    });
};

export const employeeSendMessage = (inquiryId, employeeId, input) => {
    const { body } = messageBodySchema.parse(input);

    return createMessage({
        inquiryId,
        authorId: employeeId,
        accessColumn: inquiries.assignedEmployeeId,
        visibility: "PUBLIC",
        body,
    });
};

export const employeeSendNote = (inquiryId, employeeId, input) => {
    const { body } = messageBodySchema.parse(input);

    return createMessage({
        inquiryId,
        authorId: employeeId,
        accessColumn: inquiries.assignedEmployeeId,
        visibility: "INTERNAL",
        body,
    });
};

export const customerGetMessages = async (inquiryId, customerId) => {
    const id = inquiryIdSchema.parse(inquiryId);

    const [inquiry] = await db
        .select({ id: inquiries.id })
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, id),
                eq(inquiries.customerId, customerId),
            ),
        )
        .limit(1);

    if (!inquiry) {
        throw new AppError("Inquiry not found.", 404);
    }

    return db
        .select(messageFields)
        .from(messages)
        .innerJoin(inquiries, eq(messages.inquiryId, inquiries.id))
        .innerJoin(users, eq(users.id, messages.authorId))
        .leftJoin(customer, eq(customer.userId, users.id))
        .leftJoin(employee, eq(employee.userId, users.id))
        .where(
            and(
                eq(messages.inquiryId, id),
                eq(inquiries.customerId, customerId),
                eq(messages.visibility, "PUBLIC"),
            ),
        )
        .orderBy(asc(messages.createdAt), asc(messages.id));
};

const getEmployeeMyMessage = async (inquiryId, employeeId, visibility) => {
    const id = inquiryIdSchema.parse(inquiryId);

    const rows = await db
        .select({ message: messageFields })
        .from(inquiries)
        .leftJoin(
            messages,
            and(
                eq(messages.inquiryId, inquiries.id),
                eq(messages.visibility, visibility),
            ),
        )
        .leftJoin(users, eq(users.id, messages.authorId))
        .leftJoin(customer, eq(customer.userId, users.id))
        .leftJoin(employee, eq(employee.userId, users.id))
        .where(
            and(
                eq(inquiries.id, id),
                eq(inquiries.assignedEmployeeId, employeeId),
            ),
        )
        .orderBy(asc(messages.createdAt), asc(messages.id));

    if (rows.length === 0) {
        throw new AppError("Inquiry not found.", 404);
    }

    return rows.flatMap(({ message }) => (message?.id ? [message] : []));
};

export const employeeGetMessage = (inquiryId, employeeId) =>
    getEmployeeMyMessage(inquiryId, employeeId, "PUBLIC");

export const employeeGetNotes = (inquiryId, employeeId) =>
    getEmployeeMyMessage(inquiryId, employeeId, "INTERNAL");