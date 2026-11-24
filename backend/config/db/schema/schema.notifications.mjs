import {
    index,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { inquiries } from "./schema.inquiries.mjs";
import { users } from "./schema.users.mjs";

export const notificationTypeEnum = pgEnum("notification_type", [
    "INQUIRY_ASSIGNED",
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