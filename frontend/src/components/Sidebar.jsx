import { useEffect } from "react";
import { Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";

const Sidebar = ({ isOpen, onClose }) => {
    const { chats, selectedChat, fetchChats, addChat, deleteChat, selectChat, isChatsLoading, isPendingChat } = useChatStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    const handleNewChat = () => {
        addChat();
        onClose?.();
    };

    const handleSelectChat = (chat) => {
        selectChat(chat);
        onClose?.();
    };

    const handleDelete = async (e, chatId) => {
        e.stopPropagation();
        await deleteChat(chatId);
    };

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 lg:hidden transition-opacity duration-300"
                    style={{ backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)' }}
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed lg:relative top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-full w-72 lg:w-64 z-40 lg:z-auto
          border-r flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
                style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : '#03060e',
                    borderColor: theme === 'light' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b" style={{ borderColor: theme === 'light' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(255, 255, 255, 0.1)' }}>
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-lg active:scale-[0.98]"
                        style={{
                            backgroundColor: theme === 'light' ? '#10b981' : '#2563eb',
                            boxShadow: theme === 'light' ? '0 4px 20px rgba(16, 185, 129, 0.2)' : '0 4px 20px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Yangi Suhbat
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2 custom-scrollbar">
                    {isChatsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme === 'light' ? '#059669' : '#10b981' }} />
                        </div>
                    ) : (
                        <>
                            {/* Pending new chat indicator */}
                            {isPendingChat && (
                                <div
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border mb-1"
                                    style={{
                                        backgroundColor: theme === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                                        borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.3)',
                                        color: theme === 'light' ? '#0f172a' : '#ffffff'
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4 shrink-0" style={{ color: theme === 'light' ? '#059669' : '#10b981' }} />
                                    <span className="text-sm truncate italic" style={{ color: theme === 'light' ? '#475569' : '#d4d4d8' }}>Yangi suhbat...</span>
                                </div>
                            )}

                            {chats.length === 0 && !isPendingChat ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <MessageSquare
                                        className="w-10 h-10 mb-3"
                                        strokeWidth={1}
                                        style={{ color: theme === 'light' ? '#cbd5e1' : '#404040' }}
                                    />
                                    <p className="text-sm" style={{ color: theme === 'light' ? '#64748b' : '#737373' }}>Hali suhbat yo'q</p>
                                    <p className="text-xs mt-1" style={{ color: theme === 'light' ? '#94a3b8' : '#525252' }}>Yangi suhbat boshlang</p>
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border`}
                                        style={{
                                            backgroundColor: selectedChat?.id === chat.id && !isPendingChat
                                                ? (theme === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)')
                                                : 'transparent',
                                            borderColor: selectedChat?.id === chat.id && !isPendingChat
                                                ? (theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.3)')
                                                : 'transparent',
                                            color: selectedChat?.id === chat.id && !isPendingChat
                                                ? (theme === 'light' ? '#0f172a' : '#ffffff')
                                                : (theme === 'light' ? '#64748b' : '#a3a3a3')
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedChat?.id !== chat.id || isPendingChat) {
                                                e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(5, 150, 105, 0.05)' : 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedChat?.id !== chat.id || isPendingChat) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <MessageSquare
                                                className={`w-4 h-4 shrink-0`}
                                                style={{
                                                    color: selectedChat?.id === chat.id && !isPendingChat
                                                        ? (theme === 'light' ? '#059669' : '#10b981')
                                                        : (theme === 'light' ? '#94a3b8' : '#525252')
                                                }}
                                            />
                                            <span className="text-sm truncate">{chat.title}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, chat.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
