
import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

export const authRoutes=express.Router()

authRoutes.post("/signup",signup)
authRoutes.post("/login",login)
authRoutes.post("/logout",logout)

authRoutes.put("/updateProfile",protectRoute,updateProfile)
authRoutes.get("/check",protectRoute,checkAuth)
