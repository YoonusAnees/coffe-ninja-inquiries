import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { customer } from "./schema.customers.mjs";

export const inquiryStatusEnum = pgEnum("inquiry_status", [
    "NEW",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_FOR_CUSTOMER",
    "RESOLVED",
    "CLOSED",
]);

export const inquiryPriorityEnum = pgEnum("inquiry_priority", [
    "LOW",
    "NORMAL",
    "URGENT",
]);


export const inquiries = pgTable(
    "inquiries", {
    id: uuid("id").defaultRandom().primaryKey(),
    number: integer("number").generatedAlwaysAsIdentity().unique(),
    customerId: uuid("customer_id").notNull().references(() => customer.userId, { onDelete: "restrict" }),
    subject: varchar("subject", { length: 150 }).notNull(),
    description: text("description").notNull(),
    status: inquiryStatusEnum("status").default("NEW").notNull(),
    priority: inquiryPriorityEnum("priority").default("NORMAL").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
},
    (table) => [
        index("inquiries_customer_created_index").on(table.customerId, table.createdAt)
    ],
)