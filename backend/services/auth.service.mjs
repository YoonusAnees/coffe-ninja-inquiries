import { z } from "zod";
import { db } from "../config/db/db.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import { comparePassword, hashPassword } from "../utils/password.mjs";
import AppError from "../utils/AppError.mjs";
import { eq } from "drizzle-orm"

const registerSchema = z.object({
    fullName: z.string().trim().min(1).max(150),
    email: z.string().trim().min(1).max(254).email(),
    password: z.string().min(15).refine((password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must be 72 bytes or fewer"),
    phone: z.string().trim().max(32).optional(),
}).strict();

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().max(252).email(),
    password: z.string().min(1).refine((password) => {
        return Buffer.byteLength(password, "utf-8") <= 72,
            "Password must be 72 bytes or fewer"
    })
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


export const loginUser = async (data) => {
    const { email, password } = loginSchema.parse(data);

    const [user] = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        passwordHash: users.passwordHash,
    }).from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user || !user.isActive) {
        throw new AppError("Invalid Email or Passowrd", 401)
    }

    const passMatch = await comparePassword(password, user.passwordHash);

    if (!passMatch) {
        throw new AppError("Invalid Email or Password", 401)
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
    };
}