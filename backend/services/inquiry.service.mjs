import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/db/db.mjs"
import { inquiries } from "../config/db/schema/schema.inquiries.mjs";
import { z } from "zod"
import AppError from "../utils/AppError.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";

const createInquirySchema = z.object({
    subject: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(5000),
}).strict();

const inquiryIdSchema = z.string().uuid();


const formatInquiry = ({ number, ...inquiryDetails }) => {
    const year = inquiryDetails.createdAt.getUTCFullYear();
    const paddedNumber = String(number).padStart(4, "0");

    return {
        ...inquiryDetails,
        reference: `INQ-ID-${year}-${paddedNumber}`,
    };
};


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

    return formatInquiry(inquiry);

};


export const listMyInquiries = async (customerId) => {
    const inquiry = await db
        .select({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            status: inquiries.status,
            createdAt: inquiries.createdAt,
        })
        .from(inquiries)
        .where(eq(inquiries.customerId, customerId))
        .orderBy(desc(inquiries.createdAt), desc(inquiries.number));

    return inquiry.map(formatInquiry);
}

export const getMyInquryById = async (customerId, dataId) => {

    const inquiryId = inquiryIdSchema.parse(dataId);
    const [inquiry] = await db
        .select({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            description: inquiries.description,
            status: inquiries.status,
            createdAt: inquiries.createdAt
        })
        .from(inquiries)
        .where(
            and(
                eq(inquiries.id, inquiryId),
                eq(inquiries.customerId, customerId),
            )
        ).limit(1);

    if (!inquiry) {
        throw AppError("Inquiry not Found", 404)
    }

    return formatInquiry(inquiry)
}

export const inquriesAdmin = async () => {
    const inquiry = await db
        .select({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            status: inquiries.status,
            priority: inquiries.priority,
            customerName: customer.fullName,
            assignedEmployeeId: inquiries.assignedEmployeeId,
            assignedEmployeeName: employee.fullName,
            version: inquiries.version,
            createdAt: inquiries.createdAt,
        }).from(inquiries)
        .innerJoin(customer, eq(customer.userId, inquiries.customerId))
        .leftJoin(employee, eq(employee.userId, inquiries.assignedEmployeeId))
        .orderBy(desc(inquiries.createdAt), desc(inquiries.number));
    return inquiry.map(formatInquiry)
}