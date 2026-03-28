import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
    chats: [],
    selectedChat: null,
    messages: [],
    isChatsLoading: false,
    isMessagesLoading: false,
    isSending: false,
    isPendingChat: false, // true when "Yangi Suhbat" pressed but not yet saved to server
    abortController: null,
    reset: () => {
        set({
            chats: [],
            selectedChat: null,
            messages: [],
            isChatsLoading: false,
            isMessagesLoading: false,
            isSending: false,
            isPendingChat: false,
            abortController: null
        });
    },

    stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
            abortController.abort();
            set({ abortController: null, isSending: false });
        }
    },

    clearNewFlags: () => {
        set((state) => ({
            messages: state.messages.map(m => ({ ...m, isNew: false }))
        }));
    },

    fetchChats: async () => {
        set({ isChatsLoading: true });
        try {
            const res = await axiosInstance.get("/chat");
            set({ chats: res.data });
        } catch (error) {
            toast.error("Chatlar yuklanmadi");
        } finally {
            set({ isChatsLoading: false });
        }
    },

    // Called when user presses "Yangi Suhbat" — no API call yet, just set pending state
    addChat: () => {
        set({ isPendingChat: true, selectedChat: null, messages: [] });
    },

    deleteChat: async (chatId) => {
        try {
            await axiosInstance.delete(`/chat/${chatId}`);
            set((state) => ({
                chats: state.chats.filter((c) => c.id !== chatId),
                selectedChat: state.selectedChat?.id === chatId ? null : state.selectedChat,
                messages: state.selectedChat?.id === chatId ? [] : state.messages,
            }));
            toast.success("Chat o'chirildi");
        } catch (error) {
            toast.error("Chat o'chirilmadi");
        }
    },

    selectChat: async (chat) => {
        set({ selectedChat: chat, messages: [], isPendingChat: false, isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/chat/${chat.id}/messages`);
            set({ messages: res.data });
        } catch (error) {
            toast.error("Xabarlar yuklanmadi");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (content) => {
        let { selectedChat, isPendingChat } = get();

        // If pending, create the chat now using the first ~40 chars of the message as title
        if (isPendingChat) {
            const title = content.length > 40 ? content.slice(0, 40).trimEnd() + "..." : content;
            try {
                const res = await axiosInstance.post("/chat", { title });
                set((state) => ({ chats: [res.data, ...state.chats], selectedChat: res.data, isPendingChat: false }));
                selectedChat = res.data;
            } catch {
                toast.error("Chat yaratilmadi");
                return;
            }
        }

        if (!selectedChat) return;

        const controller = new AbortController();
        set({ isSending: true, abortController: controller });

        // Optimistically add the user message
        const userMsg = { id: `tmp-${Date.now()}`, content, senderRole: "USER", createdAt: new Date().toISOString() };
        set((state) => ({ messages: [...state.messages, userMsg] }));
        try {
            const res = await axiosInstance.post(`/chat/${selectedChat.id}/message`, { content }, { signal: controller.signal });
            // Replace optimistic with real user message + add AI message
            set((state) => ({
                messages: [...state.messages.filter((m) => m.id !== userMsg.id), res.data.userMessage, { ...res.data.assistantMessage, isNew: true }],
            }));
        } catch (error) {
            if (error.name === 'CanceledError' || error.message === 'canceled') {
                toast("Bekoq qilindi", { icon: "🛑" });
            } else {
                // Rollback optimistic
                set((state) => ({ messages: state.messages.filter((m) => m.id !== userMsg.id) }));
                const errorMessage = error?.response?.data?.message || "Xabar yuborilmadi";
                toast.error(errorMessage);
            }
        } finally {
            set((state) => {
                if (state.abortController === controller) {
                    return { isSending: false, abortController: null };
                }
                return {};
            });
        }
    },
}));
