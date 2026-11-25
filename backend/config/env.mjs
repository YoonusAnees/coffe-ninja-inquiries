import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const envPath = fileURLToPath(new URL("./config.env", import.meta.url));
const { error } = dotenv.config({ path: envPath });

if (error && error.code !== "ENOENT") {
    throw new Error("Could not load backend/config/config.env", {
        cause: error,
    });
}

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
    FRONTEND_ORIGIN: z.string().url(),
    CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
    CLOUDINARY_API_KEY: z.string().trim().min(1),
    CLOUDINARY_API_SECRET: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);
