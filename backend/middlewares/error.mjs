import AppError from "../utils/AppError.mjs";
export default (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";

    // Zod validation error
    if (error.name === "ZodError") {
        statusCode = 400;
        message = error.issues?.[0]?.message || "Validation failed";
    }

    // PostgreSQL duplicate value (e.g., email already exists)
    if (error.code === "23505") {
        statusCode = 409;
        message = "Duplicate value already exists.";
    }

    // PostgreSQL invalid UUID / input format
    if (error.code === "22P02") {
        statusCode = 400;
        message = "Invalid ID format.";
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

