import express from "express"
import cookieParser from 'cookie-parser';
import { apiLimiter } from "./middlewares/rateLimit.mjs";
import errorMiddleware from "./middlewares/error.mjs";
import authRoute from "./routes/auth.routes.mjs";
import inquiryRoute from "./routes/inquiry.routes.mjs";
import messageRoute from "./routes/message.routes.mjs";
import notificationRoute from "./routes/notification.routes.mjs";
import reportRoute from "./routes/report.routes.mjs";

app.use("/api", apiLimiter);
const app = express();
app.use(express.json());
app.use(cookieParser());



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