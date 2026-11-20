import app from "./app.mjs";
import dotenv from "dotenv";

dotenv.config({ path: './config/env.mjs' })
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`)
});

