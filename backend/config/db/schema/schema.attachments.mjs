import { sql } from "drizzle-orm";
import {
    check,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

import { messages } from "./schema.messages.mjs";

export const attachments = pgTable(
    "attachments",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        messageId: uuid("message_id")
            .notNull()
            .references(() => messages.id, { onDelete: "restrict" }),

        cloudinaryPublicId: text("cloudinary_public_id").notNull(),
        resourceType: text("resource_type").notNull(),

        originalName: text("original_name").notNull(),
        mimeType: text("mime_type").notNull(),
        sizeBytes: integer("size_bytes").notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("attachments_message_idx").on(table.messageId),
        check("attachments_size_positive", sql`${table.sizeBytes} > 0`),
    ],
);