import { useEffect } from "react";
import { Plus, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const Sidebar = ({ isOpen, onClose }) => {
    const { chats, selectedChat, fetchChats, addChat, deleteChat, selectChat, isChatsLoading, isPendingChat } = useChatStore();

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed lg:relative top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-full w-72 lg:w-64 z-40 lg:z-auto
          bg-[#03060e] border-r border-neutral-800/60 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-neutral-800/60">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Yangi Suhbat
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2 scrollbar-thin">
                    {isChatsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Pending new chat indicator */}
                            {isPendingChat && (
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-blue-600/10 border border-blue-600/30 text-white mb-1">
                                    <MessageSquare className="w-4 h-4 shrink-0 text-blue-500" />
                                    <span className="text-sm truncate text-neutral-300 italic">Yangi suhbat...</span>
                                </div>
                            )}

                            {chats.length === 0 && !isPendingChat ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <MessageSquare className="w-10 h-10 text-neutral-700 mb-3" strokeWidth={1} />
                                    <p className="text-neutral-500 text-sm">Hali suhbat yo'q</p>
                                    <p className="text-neutral-600 text-xs mt-1">Yangi suhbat boshlang</p>
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                                          ${selectedChat?.id === chat.id && !isPendingChat
                                                ? "bg-blue-600/10 border border-blue-600/30 text-white"
                                                : "hover:bg-white/5 border border-transparent text-neutral-400 hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <MessageSquare className={`w-4 h-4 shrink-0 ${selectedChat?.id === chat.id && !isPendingChat ? "text-blue-500" : "text-neutral-600"}`} />
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
