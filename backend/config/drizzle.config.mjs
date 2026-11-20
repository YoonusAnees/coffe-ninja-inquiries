import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file');
}

export default defineConfig({
    schema: './index.js', // Your schema file path
    out: './migration', // Your migrations folder
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});