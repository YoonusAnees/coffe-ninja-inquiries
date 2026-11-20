import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const envPath = fileURLToPath(new URL("../config.env", import.meta.url));
const result = dotenv.config({ path: envPath });

if (result.error) {
    throw new Error(`Could not load ${envPath}`, { cause: result.error });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Check backend/config/config.env.");
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./config/db/schema/index.mjs",
    out: "./migration",
    dbCredentials: {
        url: databaseUrl,
    },
});