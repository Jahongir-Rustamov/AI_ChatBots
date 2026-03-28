import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMoodStore = create((set, get) => ({
    moodLogs: [],
    weeklyStats: null,
    aiAnalyses: [],
    aiEvaluation: null,
    isLoading: false,
    isSummaryLoading: false,
    isCreating: false,

    fetchMoodLogs: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get("/mood");
            set({ moodLogs: res.data });
        } catch (error) {
            console.error("fetchMoodLogs error:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchWeeklyStats: async () => {
        try {
            const res = await axiosInstance.get("/mood/stats/week");
            set({ weeklyStats: res.data });
        } catch (error) {
            console.error("fetchWeeklyStats error:", error);
        }
    },

    fetchProfileSummary: async () => {
        set({ isSummaryLoading: true });
        try {
            const res = await axiosInstance.get("/profile/summary");
            set({
                aiAnalyses: res.data?.data?.aiAnalyses ?? [],
                aiEvaluation: res.data?.data?.aiEvaluation ?? null,
            });
        } catch (error) {
            console.error("fetchProfileSummary error:", error);
        } finally {
            set({ isSummaryLoading: false });
        }
    },

    createMoodLog: async (data) => {
        set({ isCreating: true });
        try {
            const res = await axiosInstance.post("/mood", data);
            set((state) => ({ moodLogs: [res.data, ...state.moodLogs] }));
            // Real-time: refresh weekly stats immediately after creating
            await get().fetchWeeklyStats();
            toast.success("Kayfiyat muvaffaqiyatli saqlandi!");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Kayfiyatni saqlashda xatolik");
            return false;
        } finally {
            set({ isCreating: false });
        }
    },
}));
