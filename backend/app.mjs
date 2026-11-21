import express from "express"
import cookieParser from 'cookie-parser';
import errorMiddleware from "./middlewares/error.mjs";
import authRoute from "./routes/auth.routes.mjs"

const app = express();
app.use(express.json());
app.use(cookieParser());



app.get('/', (req, res) => {
    res.status(200).json({
        message: "Coffe Ninja"
    })
});

app.use("/api/v1/", authRoute)



app.use(errorMiddleware);

export default app;