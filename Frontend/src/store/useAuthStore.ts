
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.ts";
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL= import.meta.env.VITE_API_URL

type AuthStore = {
    authUser: any | null; // Replace 'any' with the actual type of your user object if available
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    checkAuth: () => Promise<void>;
    signup:(data:any)=>Promise<void>
    logout:()=>Promise<void>,
    login:(data:any)=>Promise<void>,
    updateProfile:(data:any)=>Promise<void>,
    onlineUsers:any,
    socket:any| null,
    connectSocket:any,
    disconnectSocket:any,
    
    
};

export const useAuthStore=create<AuthStore>((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    onlineUsers:[],
    isCheckingAuth:true,
    socket:null,
    

    checkAuth:async()=>{
        try {
            const res=await axiosInstance.get("/auth/check")

            set({authUser:res.data})
            get().connectSocket()
        } catch (error) {
            console.log("Error in checkAuth",error);
            
            set({authUser:null})
        } finally{
            set({isCheckingAuth:false})
        }
    },

    signup: async(data:any) : Promise<void>=>{
        set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket()
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
    },

    logout:async()=>{
        try {
           await axiosInstance.post("/auth/logout");
           set({authUser:null}) 
           toast.success("Logged out successfully");
           get().disconnectSocket()
        } catch (error) {
            toast.error((error as any).response.data.message);
        }
    },

    login:async(data:any):Promise<void>=>{
        set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error((error as any).response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
    },

    updateProfile:async(data:any):Promise<void>=>{
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.put("/auth/updateProfile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
          } catch (error) {
            console.log("error in update profile:", error);
            toast.error((error as any).response.data.message);
          } finally {
            set({ isUpdatingProfile: false });
          }
    },

    connectSocket:()=>{
      const {authUser}=get()
      if(!authUser || get().socket?.connected) return ;

      const socket=io(BASE_URL,{
        query:{
          userId:authUser._id
        }
      })
      socket.connect()

      set({socket:socket})

      socket.on("getOnlineUsers",(userIds)=>{
        set({onlineUsers:userIds})
      })
    },

    disconnectSocket:()=>{
      if(get().socket?.connected) get().socket.disconnect();
    }
    
}))

    