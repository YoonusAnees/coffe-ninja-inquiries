import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../config/db/db.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import AppError from "../utils/AppError.mjs";
import { verifyToken } from "../utils/token.mjs";

const tokenPayloadSchema = z.object({
    id: z.string().uuid(),
});

export const verifyUser = async (req, res, next) => {
    try {
        if (!req.cookies) {
            return next(new AppError("Please sign in.", 401));
        }

        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Please sign in.", 401));
        }

        const decodedToken = verifyToken(token);
        const payload = tokenPayloadSchema.safeParse(decodedToken);

        if (!payload.success) {
            return next(new AppError("Invalid session. Please sign in again.", 401));
        }

        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
            })
            .from(users)
            .where(eq(users.id, payload.data.id))
            .limit(1);

        if (!user || !user.isActive) {
            return next(new AppError("Your account is unavailable.", 401));
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Your session expired. Please sign in again.", 401));
        }

        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            return next(new AppError("Invalid session. Please sign in again.", 401));
        }

        return next(error);
    }
};