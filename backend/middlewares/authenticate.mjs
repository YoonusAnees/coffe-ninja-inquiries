import z, { jwt } from "zod"
import { db } from "../config/db/db.mjs"
import { users } from "../config/db/schema/schema.users.mjs"
import { AppError } from "../utils/AppError.mjs"
import { verifyToken } from "../utils/token.mjs"
import { eq } from "drizzle-orm"


const tokenPayLoadSchema = z.object({
    id: z.string().uuid(),
});


export const verifyUser = async (req, res, next) => {
    try {
        if (!req.cookies) {
            return next(new AppError("Access Denied. Please login to access", 401));
        }

        const { token } = req.cookies;

        if (!token) {
            return next(new AppError("Access Denied. Please login to access", 401));
        }

        const decodedToken = jwt.verifyToken(token);
        const payload = tokenPayLoadSchema(decodedToken);

        if (!payload.success) {
            return next(new AppError("Invalid Session"))
        }

        const [user] = await db.select({
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,

        }).from(users)
            .where(eq(users.id, payload.data.id))
            .limit(1);

        if (!user || !user.isActive) {
            return next(new AppError("Account is Unavailable", 401));
        }

        req.user = user;
        return next();


    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return next(new AppError("Your Session has expired, Please login again", 401));
        }
        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            return next(new AppError("Invalid Session. Please sign in again", 401))
        }
    }
}