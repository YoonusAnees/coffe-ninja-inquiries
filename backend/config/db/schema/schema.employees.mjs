import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./schema.users.mjs";

export const employee = pgTable("employee_profiles", {
    userId: uuid("user_id")
        .primaryKey()
        .references(() => users.id, { onDelete: "restrict" }),
    fullName: varchar("full_name", { length: 150 }).notNull(),
});