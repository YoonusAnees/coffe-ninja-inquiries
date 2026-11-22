import express from "express"
import cookieParser from 'cookie-parser';
import errorMiddleware from "./middlewares/error.mjs";
import authRoute from "./routes/auth.routes.mjs";
import inquiryRoute from "./routes/inquiry.routes.mjs";

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



app.use(errorMiddleware);

export default app;