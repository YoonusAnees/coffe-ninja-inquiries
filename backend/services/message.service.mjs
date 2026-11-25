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
import {
    notifyEmployeeOfCustomerReply,
    notifyCustomerOfEmployeeReply,
} from "../config/notificationSocket.mjs";
import { attachments } from "../config/db/schema/schema.attachments.mjs";
import {
    validateReplyAttachment,
    uploadReplyAttachment,
    deleteUploadedAttachment,
} from "./attachment.service.mjs";

const inquiryIdSchema = z.string().uuid();

const messageBodySchema = z
    .object({
        body: z.string().trim().min(1).max(50000),
    })
    .strict();

const customerReplySchema = messageBodySchema.extend({
    replyToMessageId: z.string().uuid().optional(),
});

const getWritableInquiry = async ({
    database,
    inquiryId,
    authorId,
    accessColumn,
    visibility,
    lock = false,
}) => {
    const query = database
        .select({
            id: inquiries.id,
            status: inquiries.status,
            customerId: inquiries.customerId,
            assignedEmployeeId: inquiries.assignedEmployeeId,
        })
        .from(inquiries)
        .where(and(eq(inquiries.id, inquiryId), eq(accessColumn, authorId)));

    const [inquiry] = lock ? await query.for("update") : await query;

    if (!inquiry) {
        throw new AppError("Inquiry not found.", 404);
    }

    if (inquiry.status === "CLOSED") {
        const message =
            visibility === "INTERNAL"
                ? "This inquiry is closed to new internal notes."
                : "This inquiry is closed to new replies.";

        throw new AppError(message, 409);
    }

    return inquiry;
};

const messageFields = {
    id: messages.id,
    authorId: messages.authorId,
    authorName:
        sql`COALESCE(${customer.fullName}, ${employee.fullName}, ${users.email})`.as(
            "author_name",
        ),
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
    file,
}) => {
    const id = inquiryIdSchema.parse(inquiryId);

    const access = {
        inquiryId: id,
        authorId,
        accessColumn,
        visibility,
    };

    let uploaded = null;

    if (file) {
        if (visibility !== "PUBLIC") {
            throw new AppError(
                "Attachments are available on public replies only.",
                400,
            );
        }

        await getWritableInquiry({ database: db, ...access });

        const validated = await validateReplyAttachment(file);

        try {
            uploaded = await uploadReplyAttachment(validated);
        } catch {
            throw new AppError(
                "Could not upload the attachment. Please try again.",
                502,
            );
        }
    }

    let writesFinished = false;
    let result;

    try {
        result = await db.transaction(async (tx) => {
            const inquiry = await getWritableInquiry({
                database: tx,
                ...access,
                lock: true,
            });

            if (replyToMessageId) {
                const [originalMessage] = await tx
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

                if (!originalMessage) {
                    throw new AppError(
                        "Employee reply not found in this inquiry.",
                        404,
                    );
                }
            }

            const [inserted] = await tx
                .insert(messages)
                .values({
                    inquiryId: id,
                    authorId,
                    body,
                    visibility,
                    replyToMessageId,
                })
                .returning({ id: messages.id });

            let attachment = null;

            if (uploaded) {
                const [savedAttachment] = await tx
                    .insert(attachments)
                    .values({
                        messageId: inserted.id,
                        ...uploaded,
                    })
                    .returning({
                        id: attachments.id,
                        originalName: attachments.originalName,
                        mimeType: attachments.mimeType,
                        sizeBytes: attachments.sizeBytes,
                    });

                attachment = savedAttachment;
            }

            let notification = null;

            if (visibility === "PUBLIC") {
                if (isCustomerReply && inquiry.assignedEmployeeId) {
                    notification = {
                        recipientId: inquiry.assignedEmployeeId,
                        type: "CUSTOMER_REPLIED",
                    };
                } else if (!isCustomerReply) {
                    notification = {
                        recipientId: inquiry.customerId,
                        type: "EMPLOYEE_REPLIED",
                    };
                }
            }

            if (notification) {
                await tx.insert(notifications).values({
                    ...notification,
                    inquiryId: id,
                    messageId: inserted.id,
                });
            }

            const [message] = await tx
                .select(messageFields)
                .from(messages)
                .innerJoin(users, eq(users.id, messages.authorId))
                .leftJoin(customer, eq(customer.userId, users.id))
                .leftJoin(employee, eq(employee.userId, users.id))
                .where(eq(messages.id, inserted.id))
                .limit(1);

            writesFinished = true;

            return {
                message: attachment ? { ...message, attachment } : message,
                notification,
            };
        });
    } catch (error) {
        if (uploaded && !writesFinished) {
            try {
                await deleteUploadedAttachment(uploaded);
            } catch {
                console.error(
                    "Attachment cleanup failed:",
                    uploaded.cloudinaryPublicId,
                );
            }
        } else if (uploaded) {
            console.error(
                "Check attachment after commit error:",
                uploaded.cloudinaryPublicId,
            );
        }

        throw error;
    }

    const { message, notification } = result;

    if (notification) {
        if (notification.type === "EMPLOYEE_REPLIED") {
            notifyCustomerOfEmployeeReply(notification.recipientId);
        } else {
            notifyEmployeeOfCustomerReply(notification.recipientId);
        }
    }

    return message;
};

export const customerSendMessage = (inquiryId, customerId, input, file) => {
    const { body, replyToMessageId } = customerReplySchema.parse(input);

    return createMessage({
        inquiryId,
        authorId: customerId,
        accessColumn: inquiries.customerId,
        visibility: "PUBLIC",
        body,
        replyToMessageId,
        isCustomerReply: true,
        file,
    });
};

export const employeeSendMessage = (inquiryId, employeeId, input, file) => {
    const { body } = messageBodySchema.parse(input);

    return createMessage({
        inquiryId,
        authorId: employeeId,
        accessColumn: inquiries.assignedEmployeeId,
        visibility: "PUBLIC",
        body,
        file,
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

const getPublicReplies = async (inquiryId, accessColumn, viewerId) => {
    const id = inquiryIdSchema.parse(inquiryId);

    const rows = await db
        .select({
            reply: messageFields,
            attachment: {
                id: attachments.id,
                originalName: attachments.originalName,
                mimeType: attachments.mimeType,
                sizeBytes: attachments.sizeBytes,
            },
        })
        .from(inquiries)
        .leftJoin(
            messages,
            and(
                eq(messages.inquiryId, inquiries.id),
                eq(messages.visibility, "PUBLIC"),
            ),
        )
        .leftJoin(attachments, eq(attachments.messageId, messages.id))
        .leftJoin(users, eq(users.id, messages.authorId))
        .leftJoin(customer, eq(customer.userId, users.id))
        .leftJoin(employee, eq(employee.userId, users.id))
        .where(and(eq(inquiries.id, id), eq(accessColumn, viewerId)))
        .orderBy(asc(messages.createdAt), asc(messages.id));

    if (rows.length === 0) {
        throw new AppError("Inquiry not found.", 404);
    }

    const replies = [];

    for (const row of rows) {
        if (row.reply?.id) {
            replies.push({
                ...row.reply,
                attachment: row.attachment?.id ? row.attachment : null,
            });
        }
    }

    return replies;
};

export const customerGetMessages = (inquiryId, customerId) => {
    return getPublicReplies(inquiryId, inquiries.customerId, customerId);
};

export const employeeGetMessage = (inquiryId, employeeId) => {
    return getPublicReplies(inquiryId, inquiries.assignedEmployeeId, employeeId);
};

export const employeeGetNotes = async (inquiryId, employeeId) => {
    const id = inquiryIdSchema.parse(inquiryId);

    const rows = await db
        .select({ message: messageFields })
        .from(inquiries)
        .leftJoin(
            messages,
            and(
                eq(messages.inquiryId, inquiries.id),
                eq(messages.visibility, "INTERNAL"),
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