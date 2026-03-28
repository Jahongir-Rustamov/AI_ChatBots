import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check-auth");
            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data.user });
            localStorage.setItem("auth-token", res.data.token);
            useChatStore.getState().reset();
            toast.success("Hisob muvaffaqiyatli yaratildi!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Hisob yaratishda xatolik yuz berdi");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data.user });
            localStorage.setItem("auth-token", res.data.token);
            useChatStore.getState().reset();
            toast.success("Muvaffaqiyatli kirdingiz!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Kirishda xatolik yuz berdi");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.delete("/auth/logout");
            set({ authUser: null });
            localStorage.removeItem("auth-token");
            useChatStore.getState().reset();
            toast.success("Tizimdan chiqdingiz");
        } catch (error) {
            toast.error(error.response?.data?.message || "Tizimdan chiqishda xatolik yuz berdi");
        }
    },
}));
