import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { Send, Bot, User, MessageSquareDashed, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponents = {
    p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold text-white tracking-wide" {...props} />,
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-4 border-blue-500/50 pl-3 my-3 italic text-neutral-300 bg-blue-500/5 rounded-r-lg py-2 pr-4 shadow-sm" {...props} />
    ),
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 text-white mt-5 border-b border-neutral-800/60 pb-1" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 text-white mt-4" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 text-neutral-100 mt-3" {...props} />,
    code: ({ node, inline, ...props }) =>
        inline ? (
            <code className="bg-[#040814] text-blue-300 px-1.5 py-0.5 rounded text-[13.5px] font-mono border border-neutral-800 break-words" {...props} />
        ) : (
            <pre className="bg-[#02040a] p-3.5 rounded-xl overflow-x-auto my-3 border border-neutral-800/80 shadow-inner"><code className="text-blue-300 text-[13.5px] font-mono leading-relaxed" {...props} /></pre>
        )
};

const StyledMarkdown = ({ text }) => (
    <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
            {text}
        </ReactMarkdown>
    </div>
);

const TypewriterText = ({ text, speed = 15, onStart, onComplete, forceStop, onTyping }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (onStart) onStart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (forceStop) {
            setDisplayedText(text);
            if (onComplete) onComplete();
            return;
        }

        let i = displayedText.length;
        const intervalId = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i++;
            if (onTyping) onTyping();
            if (i > text.length) {
                clearInterval(intervalId);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed, forceStop]);

    return <StyledMarkdown text={displayedText} />;
};

const MessageItem = React.memo(({ msg, forceStopTyping, setIsTyping, scrollToBottom }) => {
    return (
        <div className={`flex items-start gap-3 ${msg.senderRole === "USER" ? "flex-row-reverse" : ""}`}>
            <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${msg.senderRole === "USER"
                    ? "bg-blue-600/20 border border-blue-600/30"
                    : "bg-neutral-800 border border-neutral-700"
                    }`}
            >
                {msg.senderRole === "USER" ? (
                    <User className="w-4 h-4 text-blue-400" />
                ) : (
                    <Bot className="w-4 h-4 text-blue-400" />
                )}
            </div>
            <div
                className={`max-w-[90%] sm:max-w-[80%] px-4 sm:px-5 py-3.5 rounded-2xl shadow-md text-[14.5px] leading-relaxed ${msg.senderRole === "USER"
                    ? "bg-blue-600 text-white rounded-tr-none whitespace-pre-wrap"
                    : "bg-[#0a0f1c] border border-neutral-800/80 text-neutral-200 rounded-tl-none"
                    }`}
            >
                {msg.isNew && msg.senderRole !== "USER" ? (
                    <TypewriterText
                        text={msg.content}
                        speed={15}
                        forceStop={forceStopTyping}
                        onStart={() => setIsTyping(true)}
                        onComplete={() => setIsTyping(false)}
                        onTyping={scrollToBottom}
                    />
                ) : msg.senderRole !== "USER" ? (
                    <StyledMarkdown text={msg.content} />
                ) : (
                    msg.content
                )}
            </div>
        </div>
    );
});

const ChatArea = () => {
    const { selectedChat, messages, isSending, sendMessage, isPendingChat, stopGeneration, clearNewFlags, isMessagesLoading } = useChatStore();
    const [input, setInput] = useState("");
    const scrollContainerRef = useRef(null);
    const isUserScrollingRef = useRef(false);   // true while user is manually scrolling
    const scrollTimerRef = useRef(null);          // debounce timer
    const [isTyping, setIsTyping] = useState(false);
    const [forceStopTyping, setForceStopTyping] = useState(false);

    // Cleanup when ChatArea is unmounted (e.g. going to profile)
    useEffect(() => {
        return () => {
            clearNewFlags();
        };
    }, [clearNewFlags]);

    // Smart scroll: only scroll to bottom if user hasn't scrolled up
    const scrollToBottom = useCallback((smooth = false) => {
        if (isUserScrollingRef.current) return;
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom <= 200) {
            el.scrollTop = el.scrollHeight;
        }
    }, []);

    // Force scroll to bottom regardless of user position (on send)
    const forceScrollToBottom = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        isUserScrollingRef.current = false;
        el.scrollTop = el.scrollHeight;
    }, []);

    // Detect manual user scroll
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        // If user scrolled more than 200px from bottom, mark as "user scrolling"
        if (distanceFromBottom > 200) {
            isUserScrollingRef.current = true;
        } else {
            // Near bottom — resume auto scroll
            isUserScrollingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (isSending) {
            setForceStopTyping(false);
            setIsTyping(false);
            forceScrollToBottom();
        }
    }, [isSending, forceScrollToBottom]);

    // Regular scrolling for new messages (smart)
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Scroll to bottom immediately when switching chats
    useEffect(() => {
        if (selectedChat && messages.length > 0) {
            // Give React a moment to render the newly loaded messages
            const timer = setTimeout(() => {
                forceScrollToBottom();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedChat, messages.length, forceScrollToBottom]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;
        sendMessage(input.trim());
        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            handleSend(e);
        }
    };

    // Show selection prompt only when there's no active or pending chat
    if (!selectedChat && !isPendingChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#030712]">
                <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-5">
                    <MessageSquareDashed className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Suhbat tanlang</h2>
                <p className="text-neutral-500 text-sm max-w-xs">
                    Chap paneldagi suhbatni bosing yoki yangi suhbat boshlang
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#030712] overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-neutral-800/60 bg-[#040814]/80 backdrop-blur flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">
                        {isPendingChat ? "Yangi Suhbat" : selectedChat?.title}
                    </p>
                    <p className="text-neutral-500 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                        AI Psixolog tayyor
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4"
            >
                {/* Loader when fetching messages */}
                {isMessagesLoading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Welcome message always shown at start */}
                {(messages.length === 0 && !isMessagesLoading) && (
                    <div className="flex items-start gap-3 max-w-lg">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="bg-[#0a0f1c] border border-neutral-800/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                            <p className="text-neutral-200 text-sm leading-relaxed">
                                Salom! 👋 Men sizning shaxsiy AI psixologingizman. Bugun o'zingizni qanday his qilayapsiz? Erkin gaplashing, men tinglayapman.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        msg={msg}
                        forceStopTyping={forceStopTyping}
                        setIsTyping={setIsTyping}
                        scrollToBottom={scrollToBottom}
                    />
                ))}

                {/* AI Typing Indicator */}
                {isSending && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="bg-[#0a0f1c] border border-neutral-800/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Input Area */}
            <div className="px-4 sm:px-6 pb-5 pt-3 border-t border-neutral-800/60 bg-[#040814]/60 backdrop-blur">
                <form onSubmit={handleSend} className="flex items-end gap-3">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="O'z his-tuyg'ularingizni yozing..."
                        className="flex-1 bg-[#0a0f1c]/80 border border-neutral-800/80 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-all shadow-inner max-h-32 overflow-y-auto"
                    />
                    {isSending || isTyping ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (isSending) stopGeneration();
                                else if (isTyping) {
                                    setForceStopTyping(true);
                                    setIsTyping(false);
                                }
                            }}
                            className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 active:scale-95 rounded-2xl flex items-center justify-center shrink-0 transition-all border border-neutral-700 shadow-lg"
                        >
                            <div className="w-3.5 h-3.5 bg-white rounded-[2px]" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    )}
                </form>
                <p className="text-neutral-700 text-xs text-center mt-2.5">Enter — yuborish &nbsp;|&nbsp; Shift+Enter — yangi qator</p>
            </div>
        </div>
    );
};

export default ChatArea;
