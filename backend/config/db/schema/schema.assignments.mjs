import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { employee } from "./schema.employees.mjs";
import { inquiries } from "./schema.inquiries.mjs";
import { users } from "./schema.users.mjs";

export const assignments = pgTable(
    "assignments",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        inquiryId: uuid("inquiry_id")
            .notNull()
            .references(() => inquiries.id),

        employeeId: uuid("employee_id")
            .notNull()
            .references(() => employee.userId),

        assignedBy: uuid("assigned_by")
            .notNull()
            .references(() => users.id),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("assignments_inquiry_created_idx").on(
            table.inquiryId,
            table.createdAt,
        ),
    ],
);