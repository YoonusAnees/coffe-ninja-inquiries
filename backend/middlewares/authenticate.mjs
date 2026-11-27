import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../config/db/db.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";
import AppError from "../utils/AppError.mjs";
import { verifyToken } from "../utils/token.mjs";

const tokenPayloadSchema = z.object({
    id: z.string().uuid(),
});

/** Extract the JWT from the auth cookie or Authorization Bearer header. */
export const extractRequestToken = (req) => {
    const cookieToken = req.cookies?.token;
    if (typeof cookieToken === "string" && cookieToken.trim()) {
        return cookieToken.trim();
    }

    const authHeader = req.headers?.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        const bearerToken = authHeader.slice(7).trim();
        if (bearerToken) {
            return bearerToken;
        }
    }

    return null;
};

/** Verify a JWT string and load the active user profile from the database. */
export const resolveUserFromToken = async (token) => {
    if (!token) {
        throw new AppError("Please sign in.", 401);
    }

    let decodedToken;
    try {
        decodedToken = verifyToken(token);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError("Your session expired. Please sign in again.", 401);
        }

        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            throw new AppError("Invalid session. Please sign in again.", 401);
        }

        throw error;
    }

    const payload = tokenPayloadSchema.safeParse(decodedToken);

    if (!payload.success) {
        throw new AppError("Invalid session. Please sign in again.", 401);
    }

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            customerFullName: customer.fullName,
            employeeFullName: employee.fullName,
        })
        .from(users)
        .leftJoin(customer, eq(customer.userId, users.id))
        .leftJoin(employee, eq(employee.userId, users.id))
        .where(eq(users.id, payload.data.id))
        .limit(1);

    if (!user || !user.isActive) {
        throw new AppError("Your account is unavailable.", 401);
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.customerFullName ?? user.employeeFullName ?? "",
    };
};

export const verifyUser = async (req, res, next) => {
    try {
        const token = extractRequestToken(req);
        req.user = await resolveUserFromToken(token);
        return next();
    } catch (error) {
        return next(error);
    }
};
