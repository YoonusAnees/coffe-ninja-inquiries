import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { inquiries } from "./schema.inquiries.mjs";
import { users } from "./schema.users.mjs";
import { messages } from "./schema.messages.mjs";
export const notificationTypeEnum = pgEnum("notification_type", [
    "INQUIRY_ASSIGNED",
    "CUSTOMER_REPLIED"
]);

export const notifications = pgTable(
    "notifications",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        recipientId: uuid("recipient_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        inquiryId: uuid("inquiry_id")
            .notNull()
            .references(() => inquiries.id, { onDelete: "cascade" }),

        messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }),

        type: notificationTypeEnum("type").notNull(),

        readAt: timestamp("read_at", { withTimezone: true }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("notifications_recipient_created_idx").on(
            table.recipientId,
            table.createdAt,
        ),
    ],
);