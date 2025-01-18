import express from "express"
import { authRoutes } from "./routes/auth.route.js";
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"
import messageRoute from "./routes/message.route.js";
import cors from "cors"

dotenv.config()

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods:["OPTIONS","OPTION","GET","POST","PUT","DELETE"]
}))

const PORT=process.env.PORT

app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoute)

app.listen(PORT,()=>{
    console.log("Server is running on PORT:"+PORT);
    connectDB()
    
})
