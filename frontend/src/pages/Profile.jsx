import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
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

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
);

const StatCard = ({ label, value, color, Icon, sub }) => (
    <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-4 flex items-center gap-4 hover:border-white/15 transition-all">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{label}</p>
            <p className="text-lg font-bold truncate" style={{ color }}>{value}</p>
            {sub && <p className="text-[11px] text-gray-600 truncate">{sub}</p>}
        </div>
    </div>
);

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
const DashboardTab = ({ weeklyStats, moodLogs }) => {
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
                    color={sentCol(stats.overallAvgSentiment)} Icon={TrendingUp} sub="Bu hafta" />
                <StatCard label="Avg Stress" value={`${Number(stats.overallAvgStress ?? 0).toFixed(1)}/10`}
                    color={stressCol(stats.overallAvgStress)} Icon={AlertTriangle} sub="Bu hafta" />
                <StatCard label="Yozuvlar" value={stats.totalLogs}
                    color="#a78bfa" Icon={Activity} sub="Jami" />
                <StatCard label="Dominant" value={em(stats.dominantEmotion)}
                    color="#f472b6" Icon={Smile} sub="Eng ko'p" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <div>
                            <p className="text-sm font-bold text-white">Sentiment & Stress</p>
                            <p className="text-xs text-gray-600">7 kunlik o'zgarish</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
                            <XAxis dataKey="day" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<Tip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6b7280", paddingTop: 6 }} />
                            <Line type="monotone" dataKey="avgSentiment" name="Sentiment" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: "#22d3ee", r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                            <Line type="monotone" dataKey="avgStress" name="Stress/10" stroke="#fb923c" strokeWidth={2.5} dot={{ fill: "#fb923c", r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 className="w-4 h-4 text-purple-400" />
                        <div>
                            <p className="text-sm font-bold text-white">Kunlik aktivlik</p>
                            <p className="text-xs text-gray-600">Yozuvlar soni</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
                            <XAxis dataKey="day" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                                itemStyle={{ color: "#a78bfa" }} labelStyle={{ color: "#6b7280" }} />
                            <Bar dataKey="count" name="Yozuvlar" radius={[5, 5, 0, 0]} fill="url(#bGrad)" />
                            <defs>
                                <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a78bfa" />
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
                    <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <Smile className="w-4 h-4 text-pink-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Hissiyotlar taqsimoti</p>
                                <p className="text-xs text-gray-600">Bu hafta ulushi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="50%" height={160}>
                                <PieChart>
                                    <Pie data={distData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5 min-w-0">
                                {distData.map((e, i) => (
                                    <div key={e.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-xs text-gray-400 truncate">{e.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-white flex-shrink-0">{e.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Hissiyot radari</p>
                                <p className="text-xs text-gray-600">Ko'p o'lchovli tahlil</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#4b5563", fontSize: 10 }} />
                                <Radar name="Hissiyot" dataKey="A" stroke="#facc15" fill="#facc15" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                                    itemStyle={{ color: "#facc15" }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Tab: AI Analysis ─────────────────────────────────────────────────────────
const AITab = ({ analyses, evaluation, isLoading }) => {
    if (isLoading) return (
        <div className="space-y-4">
            <Skeleton className="h-36" /><Skeleton className="h-24" /><Skeleton className="h-48" />
        </div>
    );
    if (!analyses?.length && !evaluation) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="w-10 h-10 text-gray-700 mb-4" />
            <p className="text-gray-600 text-sm">AI tahlil ma'lumotlari yo'q</p>
        </div>
    );

    const latest = analyses?.[0];
    const riskStyle = latest ? (RISK[latest.riskLevel] ?? RISK.LOW) : null;
    const summaryText = typeof evaluation === "string" ? evaluation
        : typeof evaluation?.summary === "string" ? evaluation.summary : null;
    const advices = Array.isArray(evaluation?.advices) ? evaluation.advices : [];

    return (
        <div className="space-y-5">
            {/* AI Summary */}
            {summaryText && (
                <div className="rounded-2xl p-5 border"
                    style={{ background: "linear-gradient(135deg,#1e3a8a18,#581c8718)", borderColor: "rgba(59,130,246,0.2)" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-white">AI Psixolog xulosasi</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{summaryText}</p>
                </div>
            )}

            {/* Advices */}
            {advices.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">💡 Maslahatlar</p>
                    <div className="space-y-3">
                        {advices.map((a, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-sm text-gray-300 leading-relaxed">
                                    {typeof a === "string" ? a : JSON.stringify(a)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Latest analysis + riskLevel */}
            {latest && riskStyle && (
                <div className="rounded-2xl border p-5" style={{ background: riskStyle.bg, borderColor: riskStyle.border }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" style={{ color: riskStyle.color }} />
                            <span className="text-sm font-bold text-white">Oxirgi AI analiz</span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                            style={{ color: riskStyle.color, borderColor: riskStyle.border, background: riskStyle.bg }}>
                            {riskStyle.label}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Hissiyot</p>
                            <p className="text-sm font-bold text-white">{em(latest.detectedEmotion)}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                            <p className="text-sm font-bold" style={{ color: sentCol(latest.sentimentScore) }}>
                                {signStr(latest.sentimentScore ?? 0)}
                            </p>
                        </div>
                    </div>
                    {typeof latest.suggestions === "string" && (
                        <div className="bg-white/5 rounded-xl p-3 mb-2">
                            <p className="text-xs text-gray-500 mb-1">AI tavsiya</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{latest.suggestions}</p>
                        </div>
                    )}
                    <p className="text-xs text-gray-600">{fmtDate(latest.createdAt)}</p>
                </div>
            )}

            {/* Risk breakdown */}
            {analyses.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-[#080d1a]/60 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                        <p className="text-sm font-bold text-white">Xavf darajasi tahlili</p>
                        <span className="ml-auto text-xs text-gray-600">{analyses.length} ta tahlil</span>
                    </div>
                    {["LOW", "MEDIUM", "HIGH"].map(level => {
                        const r = RISK[level];
                        const count = analyses.filter(a => a.riskLevel === level).length;
                        const pct = analyses.length > 0 ? Math.round((count / analyses.length) * 100) : 0;
                        return (
                            <div key={level} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
                                    <span className="text-xs text-gray-500">{count} ta &nbsp;({pct}%)</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />
                                </div>
                            </div>
                        );
                    })}
                    {/* Dot timeline */}
                    {analyses.length > 1 && (
                        <div className="mt-5 pt-4 border-t border-white/6">
                            <p className="text-xs text-gray-600 mb-2.5">Trend (yangi → eski)</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {analyses.slice(0, 12).map((a, i) => {
                                    const r = RISK[a.riskLevel] ?? RISK.LOW;
                                    return (
                                        <div key={a.id ?? i} title={`${r.label} — ${fmtDate(a.createdAt)}`}
                                            className="w-4 h-4 rounded-full border-2 border-black/30 cursor-default transition-transform hover:scale-125"
                                            style={{ background: r.color, boxShadow: `0 0 6px ${r.color}80` }} />
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
                        { label: "Jami tahlil", value: analyses.length, color: "#a78bfa" },
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
const HistoryTab = ({ moodLogs, onAdd }) => {
    if (!moodLogs?.length) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="w-10 h-10 text-gray-700 mb-4" />
            <p className="text-gray-600 text-sm mb-4">Hali kayfiyat yozuvlari yo'q</p>
            <button onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all">
                <Plus className="w-4 h-4" />Birinchi yozuv
            </button>
        </div>
    );
    return (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:ml-[1.45rem] sm:before:ml-[2.45rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {moodLogs.map((log) => {
                const color = sentCol(log.sentimentScore);
                const isPositive = log.sentimentScore >= 0;
                return (
                    <div key={log.id} className="relative group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-6 sm:-left-8 mt-1.5 w-4 h-4 rounded-full border-4 border-[#030712] transition-transform group-hover:scale-125 duration-300 z-10"
                            style={{ background: color, boxShadow: `0 0 10px ${color}80` }} />

                        {/* Content Card */}
                        <div className="bg-[#080d1a]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all shadow-lg hover:shadow-xl hover:bg-white/[0.02]">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="text-base font-bold text-white flex items-center gap-1.5">
                                        {em(log.dominantEmotion)}
                                    </span>
                                    <div className="flex gap-1.5">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                            style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
                                            Sentiment: {signStr(log.sentimentScore ?? 0)}
                                        </span>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                            style={{ color: stressCol(log.stressLevel), background: `${stressCol(log.stressLevel)}15`, border: `1px solid ${stressCol(log.stressLevel)}30` }}>
                                            Stress: {log.stressLevel}/10
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5" />
                                    {fmtDate(log.createdAt)}
                                </span>
                            </div>

                            {log.notes ? (
                                <div className="mt-3 pl-3 border-l-2 border-white/10">
                                    <p className="text-sm text-gray-300 leading-relaxed italic">"{log.notes}"</p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600 italic">Izoh qoldirilmagan</p>
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
        <div className="h-screen text-white flex flex-col overflow-hidden" style={{ backgroundColor: "#030712" }}>

            {/* ── Top Navbar ────────────────────────────────── */}
            <header className="h-14 border-b border-white/8 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 backdrop-blur-md"
                style={{ backgroundColor: "rgba(3,7,18,0.92)" }}>
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-600/25 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                        <ArrowLeft className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors hidden sm:block">Chatga qaytish</span>
                </Link>

                <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <BrainCircuit className="w-4 h-4 text-blue-500" />
                    AI <span className="text-blue-500 ml-1">Psixolog</span>
                </div>

                <button onClick={doLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/8 transition-all border border-transparent hover:border-red-500/20 text-sm">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Chiqish</span>
                </button>
            </header>

            {/* ── Main layout ───────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left Sidebar (Fixed) ──────────────────────────── */}
                <aside className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-white/8 bg-[#040814]/50 p-5 flex-shrink-0">
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6 py-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl border border-white/10 mb-3">
                                {initials}
                            </div>
                            <h1 className="text-base font-bold text-white capitalize">
                                {authUser?.firstName} {authUser?.lastName}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">{authUser?.email}</p>
                            <span className="mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/25">
                                {authUser?.role === "ADMIN" ? "Admin" : "Foydalanuvchi"}
                            </span>
                        </div>

                        {/* Quick stats */}
                        {stats && (
                            <div className="space-y-2 mb-6">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1 mb-3">Tezkor statistika</p>
                                {[
                                    { label: "Yozuvlar", value: stats.totalLogs, color: "#a78bfa" },
                                    { label: "Avg Sentiment", value: signStr(stats.overallAvgSentiment ?? 0), color: sentCol(stats.overallAvgSentiment) },
                                    { label: "Avg Stress", value: `${Number(stats.overallAvgStress ?? 0).toFixed(1)}/10`, color: stressCol(stats.overallAvgStress) },
                                    { label: "AI tahlillar", value: aiAnalyses?.length ?? 0, color: "#22d3ee" },
                                    { label: "Dominant", value: em(stats.dominantEmotion), color: "#f472b6" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/3 border border-white/6">
                                        <span className="text-xs text-gray-500">{label}</span>
                                        <span className="text-xs font-bold" style={{ color }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add mood */}
                        <button onClick={() => setShowModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-blue-600/20 mb-3">
                            <Plus className="w-4 h-4" />Kayfiyat qo'shish
                        </button>

                        <Link to="/"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-blue-400 border border-blue-500/25 hover:bg-blue-500/10 transition-all">
                            <MessageSquareDashed className="w-4 h-4" />AI bilan suhbat
                        </Link>

                        {/* Account info */}
                        <div className="mt-8 pt-5 border-t border-white/6">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>A'zo: {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString("uz-UZ") : "—"}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Content ───────────────────────────────── */}
                <main className="flex-1 flex flex-col overflow-hidden">

                    {/* Mobile user strip */}
                    <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#040814]/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{authUser?.firstName} {authUser?.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{authUser?.email}</p>
                        </div>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600/20 border border-blue-500/30 text-blue-400 transition-all hover:bg-blue-600/30">
                            <Plus className="w-3.5 h-3.5" />Kayfiyat
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 px-4 sm:px-6 py-3 border-b border-white/8 bg-[#040814]/30 overflow-x-auto flex-shrink-0">
                        {TABS.map(({ id, label, Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === id
                                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                        {isLoading && !weeklyStats ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="w-9 h-9 text-blue-500 animate-spin" />
                            </div>
                        ) : activeTab === "dashboard" ? (
                            <DashboardTab weeklyStats={weeklyStats} moodLogs={moodLogs} />
                        ) : activeTab === "ai" ? (
                            <AITab analyses={aiAnalyses ?? []} evaluation={aiEvaluation} isLoading={isSummaryLoading} />
                        ) : (
                            <HistoryTab moodLogs={moodLogs} onAdd={() => setShowModal(true)} />
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
