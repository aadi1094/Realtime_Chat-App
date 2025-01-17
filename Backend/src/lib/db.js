import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

export const connectDB= async()=>{
    try {

        if(!process.env.MONGODB_URL){
            console.log("Can't connect to Database")
        }

       await mongoose.connect(process.env.MONGODB_URL) 
       console.log('Database Connected :)');
       
    } catch (error) {
        console.log(error)
    }
}