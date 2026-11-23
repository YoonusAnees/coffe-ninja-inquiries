import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { inquiries, inquiryStatusEnum } from "./schema.inquiries.mjs";
import { users } from "./schema.users.mjs";

export const statusHistory = pgTable(
  "status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    inquiryId: uuid("inquiry_id")
      .notNull()
      .references(() => inquiries.id),

    changedBy: uuid("changed_by")
      .notNull()
      .references(() => users.id),

    fromStatus: inquiryStatusEnum("from_status"),
    toStatus: inquiryStatusEnum("to_status").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("status_history_inquiry_created_idx").on(
      table.inquiryId,
      table.createdAt,
    ),
  ],
);