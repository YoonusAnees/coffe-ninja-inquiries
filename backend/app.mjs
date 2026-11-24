import express from "express"
import cookieParser from 'cookie-parser';
import errorMiddleware from "./middlewares/error.mjs";
import authRoute from "./routes/auth.routes.mjs";
import inquiryRoute from "./routes/inquiry.routes.mjs";
import messageRoute from "./routes/message.routes.mjs";
import notificationRoute from "./routes/notification.routes.mjs";;

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



app.use(errorMiddleware);

export default app;