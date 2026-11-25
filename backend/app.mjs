import express from "express"
import cookieParser from 'cookie-parser';
import { env } from "./config/env.mjs";
import { apiLimiter } from "./middlewares/rateLimit.mjs";
import errorMiddleware from "./middlewares/error.mjs";
import authRoute from "./routes/auth.routes.mjs";
import inquiryRoute from "./routes/inquiry.routes.mjs";
import messageRoute from "./routes/message.routes.mjs";
import notificationRoute from "./routes/notification.routes.mjs";
import reportRoute from "./routes/report.routes.mjs";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = new Set([
    new URL(env.FRONTEND_ORIGIN).origin,
    "https://coffe-ninja-inquiries.vercel.app",
]);

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        );
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    return next();
});

app.use(express.json());
app.use(cookieParser());
app.use("/api", apiLimiter);




app.get('/', (req, res) => {
    res.status(200).json({
        message: "Coffe Ninja"
    })
});

app.use("/api/v1/", authRoute)
app.use("/api/v1/inquiry", inquiryRoute)
app.use("/api/v1/message", messageRoute)
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/reports", reportRoute);
app.use("/api", (req, res) => {
    return res.status(404).json({
        success: false,
        message: "API route not found.",
    });
});


app.use(errorMiddleware);

export default app;