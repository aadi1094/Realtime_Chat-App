import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';


type User = {
    _id: string;
    fullName: string;
    profilePic:string,
    
};

type Message = {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: string;
    image: string;
    createdAt:Date
    
};

type ChatStore = {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUserLoading: boolean;
    isMessagesLoading: boolean;
    onlineUsers:User[],
    // onlineUsers: any
    getMessages: (userId: any) => Promise<void>,
    setSelectedUser: (selectedUser: any) => void,
    sendMessage: (messageData: any) => Promise<void>,
    subscribeToMessages: () => void,
    unsubscribeFromMessages: () => void,


    getUsers: () => Promise<void>;
};

export const useChatStore = create<ChatStore>((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    onlineUsers:[],
    
    

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data });
        } catch (error) {
            toast.error((error as any).response.data.message);
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages:async(userId:any)=>{
        set({isMessagesLoading:true})
        try {
            const res= await axiosInstance.get(`/message/${userId}`)
            set({messages:res.data})
        } catch (error) {
            toast.error((error as any).response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage:async(messageData:any)=>{
        const {selectedUser,messages}=get()
        try {
            const res=await axiosInstance.post(`/message/send/${selectedUser?._id}`,messageData)
            set({messages:[...messages,res.data]})
        } catch (error) {
            toast.error((error as any).response.data.message);
        }
    },

    subscribeToMessages:()=>{
        const{selectedUser}=get()
        if(!selectedUser) return;

        const socket=useAuthStore.getState().socket

        socket.on("newMessage",(newMessage:any)=>{
            const isMessageSentBySelectedUser=newMessage.senderId===selectedUser._id

            if(!isMessageSentBySelectedUser) return
            set({
                messages:[...get().messages,newMessage],
            })
        })
    },

    unsubscribeFromMessages:()=>{
        const socket=useAuthStore.getState().socket
        socket.off("newMessage")
    },

    setSelectedUser:(selectedUser:any)=>set({selectedUser}),

    
}));
