import AppError from "../utils/AppError.mjs";

export default (error, req, res, next) => {
    // Log the real error on the server so you can debug it
    console.error("Error:", error);

    let statusCode = 500;
    let message = "Internal Server Error";

    // 1. Intentional errors thrown by your app
    if (error instanceof AppError) {
        statusCode = error.statusCode || 500;
        message = error.message;
    }

    // 2. Zod validation error
    if (error.name === "ZodError") {
        statusCode = 400;
        message = error.issues?.[0]?.message || "Validation failed";
    }

    // 3. PostgreSQL errors (Drizzle puts the pg error inside error.cause)
    const pgCode = error.code || error.cause?.code;

    if (pgCode === "23505") {
        statusCode = 409;
        message = "Duplicate value already exists.";
    }

    if (pgCode === "22P02") {
        statusCode = 400;
        message = "Invalid ID format.";
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};