import React, { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Bot, User, MessageSquareDashed, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownComponents = (theme) => ({
    p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" style={{ color: theme === 'light' ? '#0f172a' : '#e5e7eb' }} {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" style={{ color: theme === 'light' ? '#0f172a' : '#e5e7eb' }} {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" style={{ color: theme === 'light' ? '#0f172a' : '#e5e7eb' }} {...props} />,
    li: ({ node, ...props }) => <li className="pl-1" style={{ color: theme === 'light' ? '#0f172a' : '#e5e7eb' }} {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold tracking-wide" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }} {...props} />,
    blockquote: ({ node, ...props }) => (
        <blockquote
            className="border-l-4 pl-3 my-3 italic rounded-r-lg py-2 pr-4 shadow-sm"
            style={{
                borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.5)',
                backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.05)',
                color: theme === 'dark' ? '#d4d4d8' : '#0f172a'
            }}
            {...props}
        />
    ),
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-5 border-b pb-1" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff', borderColor: theme === 'light' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.1)' }} {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-4" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }} {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2 mt-3" style={{ color: theme === 'light' ? '#0f172a' : '#ffffff' }} {...props} />,
    code: ({ node, inline, ...props }) =>
        inline ? (
            <code
                className="px-1.5 py-0.5 rounded text-[13.5px] font-mono border break-words"
                style={{
                    backgroundColor: theme === 'dark' ? '#040814' : '#dcfce7',
                    color: theme === 'dark' ? '#10b981' : '#047857',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(5, 150, 105, 0.2)'
                }}
                {...props}
            />
        ) : (
            <pre
                className="p-3.5 rounded-xl overflow-x-auto my-3 border shadow-inner"
                style={{
                    backgroundColor: theme === 'dark' ? '#02040a' : '#f0fdf4',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(5, 150, 105, 0.15)'
                }}
            >
                <code
                    className="text-[13.5px] font-mono leading-relaxed"
                    style={{ color: theme === 'dark' ? '#10b981' : '#047857' }}
                    {...props}
                />
            </pre>
        )
});

const StyledMarkdown = ({ text, theme }) => (
    <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents(theme)}>
            {text}
        </ReactMarkdown>
    </div>
);

const TypewriterText = ({ text, speed = 15, onStart, onComplete, forceStop, onTyping, theme }) => {
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

    return <StyledMarkdown text={displayedText} theme={theme} />;
};

const MessageItem = React.memo(({ msg, forceStopTyping, setIsTyping, scrollToBottom, theme }) => {
    // Dark mode: Avvalgi holatda (ko'k USER, qora AI)
    // Light mode: USER = ko'k, AI = yashil

    let messageBgColor, messageTextColor, messageBorderColor;

    if (theme === 'light') {
        // Light mode
        if (msg.senderRole === "USER") {
            messageBgColor = '#2563eb'; // ko'k
            messageTextColor = '#ffffff';
            messageBorderColor = 'rgba(37, 99, 235, 0.3)';
        } else {
            messageBgColor = '#e0f2fe'; // och yashil-oq
            messageTextColor = '#0f172a';
            messageBorderColor = 'rgba(0, 0, 0, 0.08)';
        }
    } else {
        // Dark mode: Avvalgi holatda
        if (msg.senderRole === "USER") {
            messageBgColor = '#2563eb'; // ko'k
            messageTextColor = '#ffffff';
            messageBorderColor = 'transparent';
        } else {
            messageBgColor = '#0a0f1c'; // qora
            messageTextColor = '#e5e7eb';
            messageBorderColor = 'rgba(255, 255, 255, 0.1)';
        }
    }

    return (
        <div className={`flex items-start gap-3 ${msg.senderRole === "USER" ? "flex-row-reverse" : ""}`}>
            <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 border`}
                style={{
                    backgroundColor: msg.senderRole === "USER"
                        ? (theme === 'light' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.2)')
                        : (theme === 'light' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: msg.senderRole === "USER"
                        ? (theme === 'light' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.3)')
                        : (theme === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                }}
            >
                {msg.senderRole === "USER" ? (
                    <User className="w-4 h-4" style={{ color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                ) : (
                    <Bot className="w-4 h-4" style={{ color: theme === 'light' ? '#10b981' : '#60a5fa' }} />
                )}
            </div>
            <div
                className={`max-w-[90%] sm:max-w-[80%] px-4 sm:px-5 py-3.5 rounded-2xl shadow-md text-[14.5px] leading-relaxed ${msg.senderRole === "USER"
                    ? "rounded-tr-none whitespace-pre-wrap"
                    : "border rounded-tl-none"
                    }`}
                style={{
                    backgroundColor: messageBgColor,
                    color: messageTextColor,
                    borderColor: messageBorderColor
                }}
            >
                {msg.isNew && msg.senderRole !== "USER" ? (
                    <TypewriterText
                        text={msg.content}
                        speed={15}
                        forceStop={forceStopTyping}
                        onStart={() => setIsTyping(true)}
                        onComplete={() => setIsTyping(false)}
                        onTyping={scrollToBottom}
                        theme={theme}
                    />
                ) : msg.senderRole !== "USER" ? (
                    <StyledMarkdown text={msg.content} theme={theme} />
                ) : (
                    msg.content
                )}
            </div>
        </div>
    );
});

const ChatArea = () => {
    const { selectedChat, messages, isSending, sendMessage, isPendingChat, stopGeneration, clearNewFlags, isMessagesLoading } = useChatStore();
    const { theme } = useThemeStore();
    const [input, setInput] = useState("");
    const scrollContainerRef = useRef(null);
    const isUserScrollingRef = useRef(false);
    const scrollTimerRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [forceStopTyping, setForceStopTyping] = useState(false);

    useEffect(() => {
        return () => {
            clearNewFlags();
        };
    }, [clearNewFlags]);

    const scrollToBottom = useCallback((smooth = false) => {
        if (isUserScrollingRef.current) return;
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom <= 200) {
            el.scrollTop = el.scrollHeight;
        }
    }, []);

    const forceScrollToBottom = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        isUserScrollingRef.current = false;
        el.scrollTop = el.scrollHeight;
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom > 200) {
            isUserScrollingRef.current = true;
        } else {
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

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (selectedChat && messages.length > 0) {
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

    if (!selectedChat && !isPendingChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 theme-bg-primary">
                <div
                    className="w-20 h-20 rounded-2xl border flex items-center justify-center mb-5"
                    style={{
                        backgroundColor: theme === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                        borderColor: theme === 'light' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <MessageSquareDashed className="w-10 h-10" style={{ color: theme === 'light' ? '#2563eb' : '#60a5fa' }} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold theme-text-primary mb-2">Suhbat tanlang</h2>
                <p className="theme-text-secondary text-sm max-w-xs">
                    Chap paneldagi suhbatni bosing yoki yangi suhbat boshlang
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full theme-bg-primary overflow-hidden">
            {/* Chat Header */}
            <div
                className="px-6 py-4 border-b backdrop-blur flex items-center gap-3"
                style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(4, 8, 20, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <div
                    className="w-8 h-8 rounded-lg border flex items-center justify-center"
                    style={{
                        backgroundColor: theme === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                        borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 99, 235, 0.2)'
                    }}
                >
                    <Bot className="w-4 h-4" style={{ color: theme === 'light' ? '#10b981' : '#60a5fa' }} />
                </div>
                <div>
                    <p className="theme-text-primary font-semibold text-sm">
                        {isPendingChat ? "Yangi Suhbat" : selectedChat?.title}
                    </p>
                    <p className="theme-text-secondary text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                        AI Psixolog tayyor
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 custom-scrollbar"
            >
                {isMessagesLoading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                    </div>
                )}

                {(messages.length === 0 && !isMessagesLoading) && (
                    <div className="flex items-start gap-3 max-w-lg">
                        <div
                            className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-1"
                            style={{
                                backgroundColor: theme === 'light' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <Bot className="w-4 h-4" style={{ color: theme === 'light' ? '#10b981' : '#60a5fa' }} />
                        </div>
                        <div
                            className="rounded-2xl rounded-tl-none px-4 py-3 shadow-md"
                            style={{
                                backgroundColor: theme === 'light' ? '#10b981' : '#0a0f1c',
                                borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                border: theme === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <p className="text-sm leading-relaxed">
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
                        theme={theme}
                    />
                ))}

                {isSending && (
                    <div className="flex items-start gap-3">
                        <div
                            className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-1"
                            style={{
                                backgroundColor: theme === 'light' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <Bot className="w-4 h-4" style={{ color: theme === 'light' ? '#10b981' : '#60a5fa' }} />
                        </div>
                        <div
                            className="rounded-2xl rounded-tl-none px-4 py-3 shadow-md"
                            style={{
                                backgroundColor: theme === 'light' ? '#10b981' : '#0a0f1c',
                                borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                border: theme === 'light' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div
                className="px-4 sm:px-6 pb-5 pt-3 border-t backdrop-blur"
                style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : 'rgba(4, 8, 20, 0.6)',
                    borderColor: theme === 'light' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                }}
            >
                <form onSubmit={handleSend} className="flex items-end gap-3">
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="O'z his-tuyg'ularingizni yozing..."
                        className="flex-1 border rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 resize-none transition-all shadow-inner max-h-32 overflow-y-auto"
                        style={{
                            backgroundColor: theme === 'light' ? '#f0fdf4' : 'rgba(10, 15, 28, 0.8)',
                            borderColor: theme === 'light' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: theme === 'light' ? '#0f172a' : '#ffffff',
                            focusRingColor: theme === 'light' ? '#059669' : '#10b981'
                        }}
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
                            className="w-12 h-12 active:scale-95 rounded-2xl flex items-center justify-center shrink-0 transition-all border shadow-lg"
                            style={{
                                backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151',
                                borderColor: theme === 'light' ? '#d1d5db' : '#4b5563'
                            }}
                        >
                            <div className="w-3.5 h-3.5 rounded-[2px]" style={{ backgroundColor: theme === 'light' ? '#1f2937' : '#ffffff' }} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-12 h-12 active:scale-95 disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-lg"
                            style={{
                                backgroundColor: theme === 'light' ? '#10b981' : '#2563eb',
                                boxShadow: theme === 'light' ? '0 4px 20px rgba(16, 185, 129, 0.2)' : '0 4px 20px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    )}
                </form>
                <p className="theme-text-tertiary text-xs text-center mt-2.5">Enter — yuborish &nbsp;|&nbsp; Shift+Enter — yangi qator</p>
            </div>
        </div>
    );
};

export default ChatArea;
