import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { useMoodStore } from "../store/useMoodStore";
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
    CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import {
    Brain, TrendingUp, Activity, Smile, AlertTriangle, Plus, X,
    LogOut, Calendar, Sparkles, ChevronRight, Loader2, BrainCircuit,
    ShieldAlert, BarChart2, Star, CheckCircle2, MessageSquareDashed,
    LayoutDashboard, Clock, Bot, User, ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOTION_MAP = {
    happy: "Baxtli", sad: "Qayg'umli", anxious: "Xavotirli",
    calm: "Sokin", excited: "Hayajonli", tired: "Charchagan",
    angry: "Jahldor", optimistic: "Optimistik", depressed: "Tushkun", joyful: "Xursand",
};
const PIE_COLORS = ["#22d3ee", "#f43f5e", "#fb923c", "#a78bfa", "#facc15", "#34d399", "#60a5fa", "#f472b6", "#94a3b8", "#ef4444"];
const RISK = {
    LOW: { label: "Past xavf", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
    MEDIUM: { label: "O'rta xavf", color: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" },
    HIGH: { label: "Yuqori xavf", color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.25)" },
};
const EMOTIONS = [
    { value: "happy", label: "😊 Baxtli" }, { value: "calm", label: "😌 Sokin" },
    { value: "excited", label: "⚡ Hayajonli" }, { value: "optimistic", label: "🌟 Optimistik" },
    { value: "anxious", label: "😰 Xavotirli" }, { value: "sad", label: "😢 Qayg'uli" },
    { value: "tired", label: "😴 Charchagan" }, { value: "angry", label: "😠 Jahldor" },
    { value: "depressed", label: "😞 Tushkun" }, { value: "joyful", label: "🥰 Xursand" },
];
const TABS = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "ai", label: "AI Tahlil", Icon: Bot },
    { id: "history", label: "Tarix", Icon: Clock },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const em = (e) => EMOTION_MAP[e] ?? e ?? "—";
const sentCol = (v) => {
    if (v == null) return "#475569";
    if (v >= 0.5) return "#22d3ee";
    if (v >= 0) return "#facc15";
    if (v >= -0.5) return "#fb923c";
    return "#f43f5e";
};
const stressCol = (v) => {
    if (v <= 3) return "#34d399";
    if (v <= 6) return "#facc15";
    return "#f43f5e";
};
const fmtDay = (d) => ["Yak", "Du", "Se", "Ch", "Pa", "Ju", "Sh"][new Date(d).getDay()];
const fmtDate = (d) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const signStr = (v) => (v >= 0 ? "+" : "") + Number(v).toFixed(2);

// ─── Subcomponents ────────────────────────────────────────────────────────────
const Slider = ({ min, max, step, value, onChange, colorFn, left, mid, right }) => {
    const pct = ((value - min) / (max - min)) * 100;
    const color = colorFn(value);
    return (
        <div className="select-none">
            <div className="relative h-3 rounded-full bg-white/10">
                <div className="absolute left-0 top-0 h-3 rounded-full pointer-events-none transition-all"
                    style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}88, ${color})` }} />
                <input type="range" min={min} max={max} step={step} value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer" style={{ zIndex: 10 }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-[3px] border-white shadow-lg pointer-events-none transition-all"
                    style={{ left: `calc(${pct}% - 10px)`, background: color, boxShadow: `0 0 8px ${color}88` }} />
            </div>
            <div className="flex justify-between text-[11px] text-gray-600 mt-1.5 px-0.5">
                <span>{left}</span>{mid && <span>{mid}</span>}<span>{right}</span>
            </div>
        </div>
    );
};

const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0f172a]/95 border border-white/10 rounded-xl p-3 shadow-2xl text-xs space-y-1 backdrop-blur">
            <p className="text-gray-400 font-semibold">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value != null ? Number(p.value).toFixed(2) : "—"}</b></p>
            ))}
        </div>
    );
};

const Skeleton = ({ className, theme }) => {
    const isDark = theme === 'dark';
    return (
        <div
            className={`animate-pulse rounded-2xl ${className}`}
            style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
        />
    );
};

const StatCard = ({ label, value, color, Icon, sub, theme }) => {
    const isDark = theme === 'dark';
    return (
        <div
            className="rounded-2xl border p-4 flex items-center gap-4 hover:border-opacity-100 transition-all"
            style={{
                backgroundColor: isDark ? '#080d1a60' : '#f8fafc',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                    background: isDark ? `${color}15` : `${color}12`,
                    border: isDark ? `1px solid ${color}30` : `1px solid ${color}25`
                }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: isDark ? '#a3a3a3' : '#64748b' }}>{label}</p>
                <p className="text-lg font-bold truncate" style={{ color }}>{value}</p>
                {sub && <p className="text-[11px] truncate" style={{ color: isDark ? '#737373' : '#94a3b8' }}>{sub}</p>}
            </div>
        </div>
    );
};

// ─── Mood Modal ───────────────────────────────────────────────────────────────
const MoodModal = ({ onClose, onSave, isSaving }) => {
    const [emotion, setEmotion] = useState("happy");
    const [sentiment, setSentiment] = useState(0.5);
    const [stress, setStress] = useState(5);
    const [notes, setNotes] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        const ok = await onSave({ dominantEmotion: emotion, sentimentScore: sentiment, stressLevel: stress, notes });
        if (ok) onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
            onClick={onClose}>
            <div className="w-full sm:max-w-[460px] bg-[#080d1e] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-0 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-[#080d1e] z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                            <Brain className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-base font-bold text-white">Kayfiyat qo'shish</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-6">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hissiyot</p>
                        <div className="grid grid-cols-2 gap-2">
                            {EMOTIONS.map((e) => (
                                <button key={e.value} type="button" onClick={() => setEmotion(e.value)}
                                    className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${emotion === e.value
                                        ? "bg-blue-600/25 border-blue-500/60 text-blue-200"
                                        : "bg-white/4 border-white/8 text-gray-400 hover:bg-white/8"}`}>
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sentiment</p>
                            <span className="text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-lg"
                                style={{ color: sentCol(sentiment), background: `${sentCol(sentiment)}18` }}>
                                {signStr(sentiment)}
                            </span>
                        </div>
                        <Slider min={-1} max={1} step={0.01} value={sentiment} onChange={setSentiment}
                            colorFn={sentCol} left="Salbiy (−1)" mid="Neytral" right="Ijobiy (+1)" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stress darajasi</p>
                            <span className="text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-lg"
                                style={{ color: stressCol(stress), background: `${stressCol(stress)}18` }}>
                                {stress}/10
                            </span>
                        </div>
                        <Slider min={1} max={10} step={1} value={stress} onChange={setStress}
                            colorFn={stressCol} left="Past (1)" right="Yuqori (10)" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Izoh (ixtiyoriy)</p>
                        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                            placeholder="Bugun o'zingizni qanday his qilyapsiz?..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/40 transition-all resize-none" />
                    </div>
                    <button type="submit" disabled={isSaving}
                        className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saqlanmoqda...</>
                            : <><Plus className="w-4 h-4" />Saqlash</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Tab: Dashboard ───────────────────────────────────────────────────────────
const DashboardTab = ({ weeklyStats, moodLogs, theme }) => {
    const isDark = theme === 'dark';
    const stats = weeklyStats?.summary;
    const hasData = !!(stats && stats.totalLogs > 0);
    const dailyData = (weeklyStats?.dailyTimeline ?? []).map((d) => ({
        ...d, day: fmtDay(d.date),
        avgSentiment: d.avgSentiment != null ? +Number(d.avgSentiment).toFixed(3) : null,
        avgStress: d.avgStress != null ? +Number(d.avgStress).toFixed(1) : null,
    }));
    const distData = (weeklyStats?.emotionDistribution ?? []).map((e) => ({ ...e, name: em(e.name) }));
    const radarData = distData.map((e) => ({ subject: e.name, A: e.value }));

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <Brain className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ma'lumot yo'q</h3>
                <p className="text-sm text-gray-600 max-w-xs">Haftalik statistika ko'rish uchun kayfiyat yozuvlarini qo'shing.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Stat strip */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Avg Sentiment" value={signStr(stats.overallAvgSentiment ?? 0)}
                    color={sentCol(stats.overallAvgSentiment)} Icon={TrendingUp} sub="Bu hafta" theme={theme} />
                <StatCard label="Avg Stress" value={`${Number(stats.overallAvgStress ?? 0).toFixed(1)}/10`}
                    color={stressCol(stats.overallAvgStress)} Icon={AlertTriangle} sub="Bu hafta" theme={theme} />
                <StatCard label="Yozuvlar" value={stats.totalLogs}
                    color="#a78bfa" Icon={Activity} sub="Jami" theme={theme} />
                <StatCard label="Dominant" value={em(stats.dominantEmotion)}
                    color="#f472b6" Icon={Smile} sub="Eng ko'p" theme={theme} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                        backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <div>
                            <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Sentiment & Stress</p>
                            <p className="text-xs" style={{ color: isDark ? '#737373' : '#6B7280' }}>7 kunlik o'zgarish</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff07" : "#E5E7EB"} />
                            <XAxis dataKey="day" tick={{ fill: isDark ? "#4b5563" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: isDark ? "#4b5563" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<Tip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: isDark ? "#6b7280" : "#6B7280", paddingTop: 6 }} />
                            <Line type="monotone" dataKey="avgSentiment" name="Sentiment" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: "#06B6D4", r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                            <Line type="monotone" dataKey="avgStress" name="Stress/10" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                        backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 className="w-4 h-4 text-purple-400" />
                        <div>
                            <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Kunlik aktivlik</p>
                            <p className="text-xs" style={{ color: isDark ? '#737373' : '#6B7280' }}>Yozuvlar soni</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff07" : "#E5E7EB"} />
                            <XAxis dataKey="day" tick={{ fill: isDark ? "#4b5563" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: isDark ? "#4b5563" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#FFFFFF", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }}
                                itemStyle={{ color: "#8B5CF6" }} labelStyle={{ color: isDark ? "#6b7280" : "#6B7280" }} />
                            <Bar dataKey="count" name="Yozuvlar" radius={[5, 5, 0, 0]} fill="url(#bGrad)" />
                            <defs>
                                <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie + Radar */}
            {distData.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div
                        className="rounded-2xl border p-5 transition-all"
                        style={{
                            backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Smile className="w-4 h-4 text-pink-400" />
                            <div>
                                <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Hissiyotlar taqsimoti</p>
                                <p className="text-xs" style={{ color: isDark ? '#737373' : '#6B7280' }}>Bu hafta ulushi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={160}>
                                <PieChart>
                                    <Pie data={distData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#FFFFFF", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5 min-w-0">
                                {distData.map((e, i) => (
                                    <div key={e.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-xs truncate" style={{ color: isDark ? '#a3a3a3' : '#6B7280' }}>{e.name}</span>
                                        </div>
                                        <span className="text-xs font-bold flex-shrink-0" style={{ color: isDark ? '#ffffff' : '#111827' }}>{e.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl border p-5 transition-all"
                        style={{
                            backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <div>
                                <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Hissiyot radari</p>
                                <p className="text-xs" style={{ color: isDark ? '#737373' : '#6B7280' }}>Ko'p o'lchovli tahlil</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <PolarGrid stroke={isDark ? "#ffffff10" : "#E5E7EB"} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? "#4b5563" : "#6B7280", fontSize: 10 }} />
                                <Radar name="Hissiyot" dataKey="A" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip contentStyle={{ background: isDark ? "#0f172a" : "#FFFFFF", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB", borderRadius: 12, fontSize: 12 }}
                                    itemStyle={{ color: "#F59E0B" }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Tab: AI Analysis ─────────────────────────────────────────────────────────
const AITab = ({ analyses, evaluation, isLoading, theme }) => {
    const isDark = theme === 'dark';

    if (isLoading) return (
        <div className="space-y-4">
            <Skeleton className="h-36" theme={theme} />
            <Skeleton className="h-24" theme={theme} />
            <Skeleton className="h-48" theme={theme} />
        </div>
    );
    if (!analyses?.length && !evaluation) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="w-10 h-10 mb-4" style={{ color: isDark ? '#4b5563' : '#9CA3AF' }} />
            <p className="text-sm" style={{ color: isDark ? '#737373' : '#6B7280' }}>AI tahlil ma'lumotlari yo'q</p>
        </div>
    );

    const latest = analyses?.[0];
    const riskStyle = latest ? (RISK[latest.riskLevel] ?? RISK.LOW) : null;
    const summaryText = typeof evaluation === "string" ? evaluation
        : typeof evaluation?.summary === "string" ? evaluation.summary : null;
    const advices = Array.isArray(evaluation?.advices) ? evaluation.advices : [];

    // Helper: display emotion — handles both English keys and Uzbek strings from AI
    const displayEmotion = (val) => {
        if (!val || val === 'Not detected') return '—';
        return EMOTION_MAP[val] ?? val; // if not in map, show as-is (e.g. "G'azab")
    };

    return (
        <div className="space-y-5">
            {/* AI Summary */}
            {summaryText && (
                <div
                    className="rounded-2xl p-5 border transition-all"
                    style={{
                        background: isDark
                            ? "linear-gradient(135deg,#1e3a8a18,#581c8718)"
                            : "linear-gradient(135deg,#EFF6FF,#F5F3FF)",
                        borderColor: isDark ? "rgba(59,130,246,0.2)" : "#DBEAFE",
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(59,130,246,0.08)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        <span className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>AI Psixolog xulosasi</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: isDark ? '#d1d5db' : '#374151' }}>{summaryText}</p>
                </div>
            )}

            {/* Advices */}
            {advices.length > 0 && (
                <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                        backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>💡 Maslahatlar</p>
                    <div className="space-y-3">
                        {advices.map((a, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                                        borderColor: isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.2)'
                                    }}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                                </div>
                                <span className="text-sm leading-relaxed" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                                    {typeof a === "string" ? a : JSON.stringify(a)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Latest analysis + riskLevel */}
            {latest && (
                <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                        background: isDark ? riskStyle.bg : '#FFFFFF',
                        borderColor: isDark ? riskStyle.border : '#E5E7EB',
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" style={{ color: riskStyle.color }} />
                            <span className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Oxirgi AI analiz</span>
                        </div>
                        <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full border"
                            style={{
                                color: riskStyle.color,
                                borderColor: isDark ? riskStyle.border : `${riskStyle.color}40`,
                                background: isDark ? riskStyle.bg : `${riskStyle.color}10`
                            }}
                        >
                            {riskStyle.label}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div
                            className="rounded-xl p-3"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                        >
                            <p className="text-xs mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Hissiyot</p>
                            <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>{displayEmotion(latest.detectedEmotion)}</p>
                        </div>
                        <div
                            className="rounded-xl p-3"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                        >
                            <p className="text-xs mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>Sentiment</p>
                            <p className="text-sm font-bold" style={{ color: sentCol(latest.sentimentScore) }}>
                                {signStr(latest.sentimentScore ?? 0)}
                            </p>
                        </div>
                    </div>
                    {latest.suggestions && typeof latest.suggestions === "string" && latest.suggestions.trim() && (
                        <div
                            className="rounded-xl p-3 mb-2"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                        >
                            <p className="text-xs mb-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>AI tavsiya</p>
                            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#d1d5db' : '#374151' }}>{latest.suggestions}</p>
                        </div>
                    )}
                    <p className="text-xs" style={{ color: isDark ? '#737373' : '#9CA3AF' }}>{fmtDate(latest.createdAt)}</p>
                </div>
            )}

            {/* Risk breakdown */}
            {analyses.length > 0 && (
                <div
                    className="rounded-2xl border p-5 transition-all"
                    style={{
                        backgroundColor: isDark ? '#080d1a60' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                        boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldAlert className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        <p className="text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#111827' }}>Xavf darajasi tahlili</p>
                        <span className="ml-auto text-xs" style={{ color: isDark ? '#737373' : '#6B7280' }}>{analyses.length} ta tahlil</span>
                    </div>
                    {["LOW", "MEDIUM", "HIGH"].map(level => {
                        const r = RISK[level];
                        const count = analyses.filter(a => a.riskLevel === level).length;
                        const pct = analyses.length > 0 ? Math.round((count / analyses.length) * 100) : 0;
                        return (
                            <div key={level} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
                                    <span className="text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>{count} ta &nbsp;({pct}%)</span>
                                </div>
                                <div
                                    className="h-2.5 rounded-full overflow-hidden"
                                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}
                                >
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />
                                </div>
                            </div>
                        );
                    })}
                    {/* Dot timeline */}
                    {analyses.length > 1 && (
                        <div
                            className="mt-5 pt-4 border-t"
                            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB' }}
                        >
                            <p className="text-xs mb-2.5" style={{ color: isDark ? '#737373' : '#6B7280' }}>Trend (yangi → eski)</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {analyses.slice(0, 12).map((a, i) => {
                                    const r = RISK[a.riskLevel] ?? RISK.LOW;
                                    return (
                                        <div key={a.id ?? i} title={`${r.label} — ${fmtDate(a.createdAt)}`}
                                            className="w-4 h-4 rounded-full border-2 cursor-default transition-transform hover:scale-125"
                                            style={{
                                                background: r.color,
                                                boxShadow: `0 0 6px ${r.color}80`,
                                                borderColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            {analyses.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Jami tahlil", value: analyses.length, color: "#8B5CF6" },
                        {
                            label: "Avg sentiment",
                            value: signStr(analyses.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / analyses.length),
                            color: sentCol(analyses.reduce((s, a) => s + (a.sentimentScore ?? 0), 0) / analyses.length),
                        },
                        { label: "Yuqori xavf", value: analyses.filter((a) => a.riskLevel === "HIGH").length, color: "#f43f5e" },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl bg-white/5 border border-white/8 p-3 text-center hover:border-white/15 transition-all">
                            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Tab: History ─────────────────────────────────────────────────────────────
const HistoryTab = ({ moodLogs, onAdd, theme }) => {
    const isDark = theme === 'dark';

    if (!moodLogs?.length) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="w-10 h-10 mb-4" style={{ color: isDark ? '#4b5563' : '#9CA3AF' }} />
            <p className="text-sm mb-4" style={{ color: isDark ? '#737373' : '#6B7280' }}>Hali kayfiyat yozuvlari yo'q</p>
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
                style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    boxShadow: isDark ? '0 4px 12px rgba(59,130,246,0.2)' : '0 4px 12px rgba(59,130,246,0.25)'
                }}
            >
                <Plus className="w-4 h-4" />Birinchi yozuv
            </button>
        </div>
    );
    return (
        <div
            className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:ml-[1.45rem] sm:before:ml-[2.45rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:to-transparent"
            style={{
                '--timeline-color': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}
        >
            <style>{`
                .relative.pl-6::before {
                    background: linear-gradient(to bottom, transparent, var(--timeline-color), transparent);
                }
            `}</style>
            {moodLogs.map((log) => {
                const color = sentCol(log.sentimentScore);
                const isPositive = log.sentimentScore >= 0;
                return (
                    <div key={log.id} className="relative group">
                        {/* Timeline Dot */}
                        <div
                            className="absolute -left-6 sm:-left-8 mt-1.5 w-4 h-4 rounded-full border-4 transition-transform group-hover:scale-125 duration-300 z-10"
                            style={{
                                background: color,
                                boxShadow: `0 0 10px ${color}80`,
                                borderColor: isDark ? '#030712' : '#F5F7FB'
                            }}
                        />

                        {/* Content Card */}
                        <div
                            className="rounded-2xl p-4 sm:p-5 transition-all shadow-lg hover:shadow-xl"
                            style={{
                                backgroundColor: isDark ? 'rgba(8,13,26,0.8)' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #E5E7EB',
                                backdropFilter: isDark ? 'blur(8px)' : 'none',
                                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#D1D5DB';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB';
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span
                                        className="text-base font-bold flex items-center gap-1.5"
                                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                                    >
                                        {em(log.dominantEmotion)}
                                    </span>
                                    <div className="flex gap-1.5">
                                        <span
                                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                                            style={{
                                                color,
                                                background: isDark ? `${color}15` : `${color}12`,
                                                border: isDark ? `1px solid ${color}30` : `1px solid ${color}25`
                                            }}
                                        >
                                            Sentiment: {signStr(log.sentimentScore ?? 0)}
                                        </span>
                                        <span
                                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                                            style={{
                                                color: stressCol(log.stressLevel),
                                                background: isDark ? `${stressCol(log.stressLevel)}15` : `${stressCol(log.stressLevel)}12`,
                                                border: isDark ? `1px solid ${stressCol(log.stressLevel)}30` : `1px solid ${stressCol(log.stressLevel)}25`
                                            }}
                                        >
                                            Stress: {log.stressLevel}/10
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className="text-xs font-medium flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg"
                                    style={{
                                        color: isDark ? '#9CA3AF' : '#6B7280',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'
                                    }}
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    {fmtDate(log.createdAt)}
                                </span>
                            </div>

                            {log.notes ? (
                                <div
                                    className="mt-3 pl-3 border-l-2"
                                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}
                                >
                                    <p
                                        className="text-sm leading-relaxed italic"
                                        style={{ color: isDark ? '#d1d5db' : '#374151' }}
                                    >
                                        "{log.notes}"
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs italic" style={{ color: isDark ? '#737373' : '#9CA3AF' }}>Izoh qoldirilmagan</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Profile = () => {
    const { authUser, logout } = useAuthStore();
    const { theme } = useThemeStore();
    const {
        weeklyStats, moodLogs, aiAnalyses, aiEvaluation, isLoading, isSummaryLoading,
        fetchWeeklyStats, fetchMoodLogs, fetchProfileSummary, createMoodLog, isCreating,
    } = useMoodStore();
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const navigate = useNavigate();

    useEffect(() => {
        fetchWeeklyStats();
        fetchMoodLogs();
        fetchProfileSummary();
    }, []);

    const doLogout = async () => { await logout(); navigate("/login"); };
    const initials = `${authUser?.firstName?.[0] ?? ""}${authUser?.lastName?.[0] ?? ""}`.toUpperCase() || "U";
    const stats = weeklyStats?.summary;

    return (
        <div
            className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
            style={{
                backgroundColor: theme === 'light' ? '#F5F7FB' : '#030712',
                color: theme === 'light' ? '#111827' : '#ffffff'
            }}
        >

            {/* ── Top Navbar ────────────────────────────────── */}
            <header
                className="h-16 border-b flex items-center justify-between px-6 sticky top-0 z-50 transition-all"
                style={{
                    background: theme === 'light'
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'rgba(3,7,18,0.92)',
                    borderColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                    boxShadow: theme === 'light' ? '0 2px 8px rgba(5,150,105,0.15)' : 'none'
                }}
            >
                <Link to="/" className="flex items-center gap-2 group">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{
                            backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.1)',
                            border: theme === 'light' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(59,130,246,0.25)'
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" style={{ color: theme === 'light' ? '#ffffff' : '#3B82F6' }} />
                    </div>
                    <span
                        className="text-sm font-medium transition-colors hidden sm:block"
                        style={{ color: theme === 'light' ? 'rgba(255,255,255,0.9)' : '#9CA3AF' }}
                    >
                        Chatga qaytish
                    </span>
                </Link>

                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#ffffff' }}>
                    <BrainCircuit className="w-5 h-5" style={{ color: theme === 'light' ? '#ffffff' : '#3B82F6' }} />
                    <span>Psixolog</span>
                </div>

                <button
                    onClick={doLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                        color: theme === 'light' ? 'rgba(255,255,255,0.9)' : '#9CA3AF',
                        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.15)' : 'transparent',
                        border: theme === 'light' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#FEF2F2' : 'rgba(239,68,68,0.08)';
                        e.currentTarget.style.color = '#EF4444';
                        e.currentTarget.style.borderColor = theme === 'light' ? '#FEE2E2' : 'rgba(239,68,68,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = theme === 'light' ? '#6B7280' : '#9CA3AF';
                        e.currentTarget.style.borderColor = theme === 'light' ? '#E5E7EB' : 'transparent';
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Chiqish</span>
                </button>
            </header>

            {/* ── Main layout ───────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left Sidebar (Fixed) ──────────────────────────── */}
                <aside
                    className="hidden lg:flex flex-col w-72 xl:w-80 border-r p-6 flex-shrink-0 transition-all"
                    style={{
                        backgroundColor: theme === 'light' ? '#FFFFFF' : '#040814',
                        borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.08)'
                    }}
                >
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6 py-4">
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-3"
                                style={{
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                    border: theme === 'light' ? '3px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {initials}
                            </div>
                            <h1
                                className="text-base font-bold capitalize"
                                style={{ color: theme === 'light' ? '#111827' : '#ffffff' }}
                            >
                                {authUser?.firstName} {authUser?.lastName}
                            </h1>
                            <p className="text-xs mt-0.5" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>
                                {authUser?.email}
                            </p>
                            <span
                                className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: theme === 'light' ? '#EFF6FF' : 'rgba(59,130,246,0.2)',
                                    color: '#3B82F6',
                                    border: theme === 'light' ? '1px solid #DBEAFE' : '1px solid rgba(59,130,246,0.25)'
                                }}
                            >
                                {authUser?.role === "ADMIN" ? "Admin" : "Foydalanuvchi"}
                            </span>
                        </div>

                        {/* Quick stats */}
                        {stats && (
                            <div className="space-y-2 mb-6">
                                <p
                                    className="text-xs font-semibold uppercase tracking-wider px-1 mb-3"
                                    style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}
                                >
                                    Tezkor statistika
                                </p>
                                {[
                                    { label: "Yozuvlar", value: stats.totalLogs, color: "#8B5CF6" },
                                    { label: "Avg Sentiment", value: signStr(stats.overallAvgSentiment ?? 0), color: sentCol(stats.overallAvgSentiment) },
                                    { label: "Avg Stress", value: `${Number(stats.overallAvgStress ?? 0).toFixed(1)}/10`, color: stressCol(stats.overallAvgStress) },
                                    { label: "AI tahlillar", value: aiAnalyses?.length ?? 0, color: "#06B6D4" },
                                    { label: "Dominant", value: em(stats.dominantEmotion), color: "#EC4899" },
                                ].map(({ label, value, color }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
                                        style={{
                                            backgroundColor: theme === 'light' ? '#F9FAFB' : 'rgba(255,255,255,0.03)',
                                            border: theme === 'light' ? '1px solid #F3F4F6' : '1px solid rgba(255,255,255,0.06)'
                                        }}
                                    >
                                        <span className="text-xs" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>{label}</span>
                                        <span className="text-xs font-bold" style={{ color }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add mood */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all mb-3"
                            style={{
                                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                                boxShadow: theme === 'light' ? '0 4px 12px rgba(59,130,246,0.25)' : '0 4px 12px rgba(59,130,246,0.2)'
                            }}
                        >
                            <Plus className="w-4 h-4" />Kayfiyat qo'shish
                        </button>

                        <Link
                            to="/"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                            style={{
                                color: '#3B82F6',
                                backgroundColor: theme === 'light' ? '#EFF6FF' : 'rgba(59,130,246,0.1)',
                                border: theme === 'light' ? '1px solid #DBEAFE' : '1px solid rgba(59,130,246,0.25)'
                            }}
                        >
                            <MessageSquareDashed className="w-4 h-4" />AI bilan suhbat
                        </Link>

                        {/* Account info */}
                        <div
                            className="mt-8 pt-5 border-t"
                            style={{ borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.06)' }}
                        >
                            <div className="flex items-center gap-2 text-xs" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>A'zo: {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("uz-UZ") : "—"}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Content ───────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* Mobile user strip */}
                    <div
                        className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
                        style={{
                            backgroundColor: theme === 'light' ? '#FFFFFF' : '#040814',
                            borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.08)'
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
                        >
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: theme === 'light' ? '#111827' : '#ffffff' }}>
                                {authUser?.firstName} {authUser?.lastName}
                            </p>
                            <p className="text-xs truncate" style={{ color: theme === 'light' ? '#6B7280' : '#9CA3AF' }}>
                                {authUser?.email}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{
                                backgroundColor: theme === 'light' ? '#EFF6FF' : 'rgba(59,130,246,0.2)',
                                border: theme === 'light' ? '1px solid #DBEAFE' : '1px solid rgba(59,130,246,0.3)',
                                color: '#3B82F6'
                            }}
                        >
                            <Plus className="w-3.5 h-3.5" />Kayfiyat
                        </button>
                    </div>

                    {/* Tabs */}
                    <div
                        className="flex items-center gap-2 px-4 sm:px-6 py-3 border-b overflow-x-auto flex-shrink-0"
                        style={{
                            backgroundColor: theme === 'light' ? '#FFFFFF' : '#040814',
                            borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.08)'
                        }}
                    >
                        {TABS.map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                                style={{
                                    backgroundColor: activeTab === id
                                        ? (theme === 'light' ? '#EFF6FF' : 'rgba(59,130,246,0.2)')
                                        : 'transparent',
                                    color: activeTab === id
                                        ? '#3B82F6'
                                        : (theme === 'light' ? '#6B7280' : '#9CA3AF'),
                                    border: activeTab === id
                                        ? (theme === 'light' ? '1px solid #DBEAFE' : '1px solid rgba(59,130,246,0.3)')
                                        : '1px solid transparent'
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div
                        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
                        style={{ backgroundColor: theme === 'light' ? '#F5F7FB' : '#030712' }}
                    >
                        {isLoading && !weeklyStats ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="w-9 h-9 animate-spin" style={{ color: '#3B82F6' }} />
                            </div>
                        ) : activeTab === "dashboard" ? (
                            <DashboardTab weeklyStats={weeklyStats} moodLogs={moodLogs} theme={theme} />
                        ) : activeTab === "ai" ? (
                            <AITab analyses={aiAnalyses ?? []} evaluation={aiEvaluation} isLoading={isSummaryLoading} theme={theme} />
                        ) : (
                            <HistoryTab moodLogs={moodLogs} onAdd={() => setShowModal(true)} theme={theme} />
                        )}
                    </div>
                </main>
            </div>

            {/* Modal */}
            {showModal && (
                <MoodModal onClose={() => setShowModal(false)} onSave={createMoodLog} isSaving={isCreating} />
            )}
        </div>
    );
};

export default Profile;
