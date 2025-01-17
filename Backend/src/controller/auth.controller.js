import bcrypt from 'bcrypt'
import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js"
import cloudinary from '../lib/cloudinary.js';
export const signup=async(req,res)=>{
    
    try {
       const email = req.body.email;
       const fullName = req.body.fullName;
       const password = req.body.password

        if(!email || !fullName || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        const user=await User.findOne({email})
        if (user) return res.status(400).json({
            message:"Email already exists"
        })

        const hash=await bcrypt.hash(password,12)

        const newUser=await User.create({
            email:email,
            fullName:fullName,
            password:hash
        })

        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save()
        }
        res.status(200).json({
            message:"New user created successfully"
        })


    } catch (error) {
        console.log("Error in signup controller",error.message)
    }
}

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body
        if(!email || !password){
            return res.status(400).json({
                message:"All fields are required"
            })
        }

        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }    
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }

        generateToken(user._id,res)
        res.status(200).json({
            message:"User logged in successfully"
        })
        
    } catch (error) {
        console.log("Error in login controller",error.message)
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const logout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({
            message:"User logged out successfully"
        })

    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({
            message:"Internal Server Error"
        }) 
    }
}

export const updateProfile=async(req,res)=>{
    try {
        const {profilePic}=req.body
        const userId=req.user._id

        if(!profilePic){
            res.status(400).json({
                message:"Profile pic is required"
            })
        }
        const uploadresponse=await cloudinary.uploader.upload(profilePic)
        const updateUser=await User.findByIdAndUpdate(userId,{
            profilePic:uploadresponse.secure_url
        },{
            new:true
        })

        res.status(200).json(updateUser)
    } catch (error) {
        console.log("error in updateProfile",error.message)
    }
}

export const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("error in checkAuth",error.message)
    }
}

