import { rateLimit } from "express-rate-limit";

const minute = 60 * 1000;

export const apiLimiter = rateLimit({
    windowMs: 5 * minute,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again in a few minutes.",
    },
});

export const loginLimiter = rateLimit({
    windowMs: 15 * minute,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many sign-in attempts. Please try again in 15 minutes.",
    },
});

export const registerLimiter = rateLimit({
    windowMs: 60 * minute,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many registration requests. Please try again later.",
    },
});