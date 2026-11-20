import { z } from "zod";
import { db } from "../config/db/db.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import { hashPassword } from "../utils/password.mjs";
import AppError from "../utils/AppError.mjs";

const registerSchema = z.object({
    fullName: z.string().trim().min(1).max(150),
    email: z.string().trim().min(1).max(254).email(),
    password: z.string().min(15).refine((password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must be 72 bytes or fewer"),
    phone: z.string().trim().max(32).optional(),
}).strict();


export const registerUser = async (data) => {
    const { fullName, email, password, phone } = registerSchema.parse(data);
    const passwordHash = await hashPassword(password);

    return db.transaction(async (t) => {
        const [user] = await t
            .insert(users)
            .values({
                email,
                passwordHash,
                role: "CUSTOMER"
            })
            .onConflictDoNothing({ target: users.email })
            .returning({
                id: users.id,
                email: users.email,
                role: users.role,
            });

        if (!user) {
            throw new AppError("An Account with this email already exists.", 409);
        }

        await t.insert(customer).values({
            userId: user.id,
            fullName,
            phone: phone || null,
        });

        return {
            ...user,
            fullName
        }
    });
}