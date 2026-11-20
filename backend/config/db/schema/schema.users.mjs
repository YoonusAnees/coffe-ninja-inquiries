import { sql } from "drizzle-orm"
import { boolean, check, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["CUSTOMER", "EMPLOYEE", "ADMIN"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 254 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

}, (table) => [
    check("user_email_constraint",
        sql`${table.email} = lower(btrim(${table.email})) AND ${table.email} <> ''`
    )
])