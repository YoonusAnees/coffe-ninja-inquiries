import { env } from "./env.mjs";

export const allowedOrigins = new Set([
    new URL(env.FRONTEND_ORIGIN).origin,
    "https://coffe-ninja-inquiries.vercel.app",
    "http://localhost:5173",
]);

