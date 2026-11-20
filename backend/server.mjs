import app from "./app.mjs";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is Running On Port ${PORT}`)
});

