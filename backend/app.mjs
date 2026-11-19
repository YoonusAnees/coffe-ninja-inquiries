import express from "express"
const app = express();
app.use(express.json());



app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Coffe Ninja"
    })
});

export default app;