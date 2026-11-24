import z from "zod";
import { messages } from "../config/db/schema/schema.messages.mjs";
import { db } from "../config/db/db.mjs";
import { inquiries } from "../config/db/schema/schema.inquiries.mjs";
import AppError from "../utils/AppError.mjs";
import { and, asc, eq } from "drizzle-orm";

const inquiryIdSchema = z.string().uuid();
const publicReplySchema = z.object({
    body: z.string().trim().min(1).max(50000),
}).strict();

const replyFields = {
    id: messages.id,
    body: messages.body,
    createdAt: messages.createdAt
};

export const createAssignedInquiryReplay = async (inquiryId, employeeId, data) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const { body } = publicReplySchema.parse(data);

    return db.transaction(async (t) => {
        const [inquiry] = await t
            .select({ status: inquiries.status })
            .from(inquiries)
            .where(
                and(
                    eq(inquiries.id, id),
                    eq(inquiries.assignedEmployeeId, employeeId)
                )
            )
            .for("update");

        if (!inquiry) {
            throw new AppError("Inquiry not found", 404)
        }

        if (!inquiry.status === "CLOSED") {
            throw new AppError("This Inquiry is closed to new replies", 409)
        }

        const [reply] = await t
            .insert(messages)
            .values({
                inquiryId: id,
                authorId: employeeId,
                body,
                visibility: "PUBLIC"
            })
            .returning(replyFields);

        return reply
    })
}

export const getCustomerInquiryReplies = async (inquiryId, customerId) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const [inquiry] = await db
        .select({ id: inquiries.id })
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, id),
                eq(inquiries.customerId, customerId)
            )
        ).limit(1);

    if (!inquiry) {
        throw new AppError("Inquiry not found", 404)
    }

    return db.select(replyFields)
        .from(messages)
        .innerJoin(inquiries, eq(messages.inquiryId, inquiries.id))
        .where(
            and(
                eq(messages.inquiryId, id),
                eq(inquiries.customerId, customerId),
                eq(messages.visibility, "PUBLIC")
            )
        ).orderBy(asc(messages.createdAt), asc(messages.id))
}