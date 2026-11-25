import { and, asc, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "../config/db/db.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";
import { inquiries, inquiryStatusEnum } from "../config/db/schema/schema.inquiries.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import AppError from "../utils/AppError.mjs";

const openStatuses = [
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_CUSTOMER",
];

export const getEmployeeWorkload = async (viewer) => {
    if (viewer.role !== "ADMIN") {
        throw new AppError("Only admins can view employee workload.", 403);
    }

    const openCount = count(inquiries.id);

    return db
        .select({
            employeeId: employee.userId,
            fullName: employee.fullName,
            isActive: users.isActive,
            openInquiryCount: openCount,
        })
        .from(employee)
        .innerJoin(users, eq(users.id, employee.userId))
        .leftJoin(
            inquiries,
            and(
                eq(inquiries.assignedEmployeeId, employee.userId),
                inArray(inquiries.status, openStatuses),
            ),
        )
        .where(eq(users.role, "EMPLOYEE"))
        .groupBy(employee.userId, employee.fullName, users.isActive)
        .orderBy(
            desc(users.isActive),
            asc(openCount),
            asc(employee.fullName),
            asc(employee.userId),
        );
};

export const getInquiryStatusReport = async (viewer) => {
    if (viewer.role !== "ADMIN") {
        throw new AppError("Only admins can view inquiry reports.", 403);
    }

    const rows = await db
        .select({
            status: inquiries.status,
            count: count(),
        })
        .from(inquiries)
        .groupBy(inquiries.status);

    const countsByStatus = new Map();

    for (const row of rows) {
        countsByStatus.set(row.status, row.count);
    }

    const statuses = inquiryStatusEnum.enumValues.map((status) => ({
        status,
        count: countsByStatus.get(status) ?? 0,
    }));

    const total = statuses.reduce((sum, item) => sum + item.count, 0);

    return { total, statuses };
};