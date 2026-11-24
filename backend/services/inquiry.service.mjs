import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../config/db/db.mjs"
import { inquiries, inquiryPriorityEnum } from "../config/db/schema/schema.inquiries.mjs";
import { z } from "zod"
import AppError from "../utils/AppError.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import { assignments } from "../config/db/schema/schema.assignments.mjs";
import { statusHistory } from "../config/db/schema/schema.statusHistory.mjs";

const createInquirySchema = z.object({
    subject: z.string().trim().min(1).max(150),
    description: z.string().trim().min(1).max(5000),
}).strict();

const assignInquirySchema = z.object({
    employeeId: z.string().uuid(),
    priority: z.enum(inquiryPriorityEnum.enumValues).optional(),
    version: z.number().int().positive(),
}).strict();

const inquiryIdSchema = z.string().uuid();

const employeeStatusSchema = z.object({
    status: z.enum(["IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED"]),
    version: z.number().int().positive(),
}).strict();

const allowedEmployeeTransitions = {
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["WAITING_FOR_CUSTOMER", "RESOLVED"],
    WAITING_FOR_CUSTOMER: ["IN_PROGRESS", "RESOLVED"],
};


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
        throw new AppError("Inquiry not Found", 404)
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


export const listAssignableEmployee = async () => {
    return db
        .select({
            id: users.id,
            fullName: employee.fullName,
            email: users.email
        })
        .from(employee)
        .innerJoin(users, eq(users.id, employee.userId))
        .where(and(
            eq(users.role, "EMPLOYEE"),
            eq(users.isActive, true)
        ))
        .orderBy(asc(employee.fullName), asc(users.id));
}


export const assignInquiry = async (inquiryId, adminId, data) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const { employeeId, priority, version } = assignInquirySchema.parse(data);

    return db.transaction(async (t) => {
        const [inquiry] = await t
            .select()
            .from(inquiries)
            .where(eq(inquiries.id, id))
            .for("update");

        if (!inquiry) {
            throw new AppError("Inquiry not Found", 404);
        }

        if (inquiry.version !== version) {
            throw new AppError("This Inquiry was updated", 409)
        }

        if (inquiry.status === "RESOLVED") {
            throw new AppError("Inquiry Relosved", 409)
        }

        if (inquiry.status === "CLOSED") {
            throw new AppError("Inquiry CLOSED", 409)
        }

        const [assignee] = await t
            .select({
                role: users.role,
                isActive: users.isActive
            })
            .from(employee)
            .innerJoin(users, eq(users.id, employee.userId))
            .where(eq(employee.userId, employeeId))
            .for("share");

        if (!assignee || assignee.role !== "EMPLOYEE" || !assignee.isActive) {
            throw new AppError("Not an Emploee", 400)
        }

        const employeeChanged = inquiry.assignedEmployeeId !== employeeId;
        const nextPriority = priority === undefined ? inquiry.priority : priority;
        const nextStatus = inquiry.status === "NEW" ? "ASSIGNED" : inquiry.status;
        const statusChanged = nextStatus !== inquiry.status;

        if (!employeeChanged && !statusChanged && nextPriority === inquiry.priority) {
            return formatInquiry(inquiry);
        }

        const [updatedInquiry] = await t
            .update(inquiries)
            .set({
                assignedEmployeeId: employeeId,
                priority: nextPriority,
                status: nextStatus,
                version: inquiry.version + 1,
                updatedAt: new Date(),
            })
            .where(eq(inquiries.id, id))
            .returning();

        if (employeeChanged) {
            await t.insert(assignments).values({
                inquiryId: id,
                employeeId,
                assignedBy: adminId,
            });
        }

        if (statusChanged) {
            await t.insert(statusHistory).values({
                inquiryId: id,
                changedBy: adminId,
                fromStatus: inquiry.status,
                toStatus: nextStatus,
            })
        }

        return formatInquiry(updatedInquiry);
    })
}


export const getAssignedInquires = async (employeeId) => {
    const inquiry = await db
        .select({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            status: inquiries.status,
            priority: inquiries.priority,
            createdAt: inquiries.createdAt
        })
        .from(inquiries)
        .where(eq(inquiries.assignedEmployeeId, employeeId))
        .orderBy(desc(inquiries.createdAt), desc(inquiries.number))

    return inquiry.map(formatInquiry)
}

export const getAssignedInquiry = async (inquiryId, employeeId) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const [inquiry] = await db
        .select({
            id: inquiries.id,
            number: inquiries.number,
            subject: inquiries.subject,
            description: inquiries.description,
            status: inquiries.status,
            priority: inquiries.priority,
            version: inquiries.version,
            createdAt: inquiries.createdAt

        }).from(inquiries)
        .where(
            and(eq(inquiries.id, id),
                eq(inquiries.assignedEmployeeId, employeeId)
            )
        ).limit(1);

    if (!inquiry) {
        throw new AppError("Inquiry not found", 404);
    }

    return formatInquiry(inquiry)
}

export const updateAssignedInquiryStatus = async (inquiryId, employeeId, data) => {
    const id = inquiryIdSchema.parse(inquiryId);
    const { status, version } = employeeStatusSchema.parse(data);

    return db.transaction(async (t) => {
        const [inquiry] = await t
            .select()
            .from(inquiries)
            .where(
                and(
                    eq(inquiries.id, id),
                    eq(inquiries.assignedEmployeeId, employeeId),
                ),
            )
            .for("update");

        if (!inquiry) {
            throw new AppError("Inquiry not found.", 404);
        }

        if (inquiry.version !== version) {
            throw new AppError("This inquiry was updated. Refresh and try again.", 409);
        }

        const allowedNext = allowedEmployeeTransitions[inquiry.status] ?? [];
        if (!allowedNext.includes(status)) {
            throw new AppError("This status change is not allowed.", 409);
        }

        const [updatedInquiry] = await t
            .update(inquiries)
            .set({
                status,
                version: inquiry.version + 1,
                updatedAt: new Date(),
            })
            .where(eq(inquiries.id, id))
            .returning();

        await t.insert(statusHistory).values({
            inquiryId: id,
            changedBy: employeeId,
            fromStatus: inquiry.status,
            toStatus: status,
        });

        return formatInquiry(updatedInquiry);
    });
};

