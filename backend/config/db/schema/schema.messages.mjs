import {
    index,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { inquiries } from "./schema.inquiries.mjs";
import { users } from "./schema.users.mjs";

export const messageVisibilityEnum = pgEnum("inquiry_message_visibility", [
    "PUBLIC",
    "INTERNAL",
]);

export const messages = pgTable(
    "messages",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        inquiryId: uuid("inquiry_id")
            .notNull()
            .references(() => inquiries.id, { onDelete: "restrict" }),

        authorId: uuid("author_id")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),

        body: text("body").notNull(),
        visibility: messageVisibilityEnum("visibility").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("messages_inquiry_visibility_created_idx").on(
            table.inquiryId,
            table.visibility,
            table.createdAt,
            table.id,
        ),
    ],
);