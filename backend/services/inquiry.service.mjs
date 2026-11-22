import { db } from "../config/db/db.mjs"
import { inquiries } from "../config/db/schema/schema.inquiries.mjs";
import { z } from "zod"

const createInquirySchema = z.object({
    subject: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(5000),
}).strict();


export const createInqury = async (customerId, data) => {

    const { subject, description } = createInquirySchema.parse(data);

    const [inquiry] = await db
        .insert(inquiries)
        .values({
            customerId,
            subject,
            description
        }).returning({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            description: inquiries.description,
            status: inquiries.status,
            priority: inquiries.priority,
            createdAt: inquiries.createdAt,
        });

    const { number, ...inquiryDetails } = inquiry;
    const year = inquiryDetails.createdAt.getFullYear();
    const paddedNumber = String(number).padStart(4, "0");

    return {
        ...inquiryDetails,
        reference: `INQ-ID${year}-${paddedNumber}`,
    }
        ;
}