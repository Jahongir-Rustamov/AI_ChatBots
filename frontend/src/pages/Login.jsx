import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles, BrainCircuit } from "lucide-react";
import MatrixRain from "../components/MatrixRain";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const { login, isLoggingIn } = useAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData);
    };

    const isFormValid = formData.email.trim() !== "" && formData.password.length >= 6;

    return (
        <div className="min-h-screen flex text-white bg-[#060a12] font-sans">
            {/* Chap Tomon: Kreativ Abstrakt Qism + Oqib turgan 0 va 1 lar */}
            <div className="hidden lg:flex lg:w-1/2 bg-black relative items-center justify-center overflow-hidden">
                <MatrixRain />

                {/* Glow effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full z-0"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-black/60 blur-[60px] rounded-full z-0"></div>

                <div className="relative z-10 p-12 max-w-lg text-center backdrop-blur-md bg-black/40 rounded-3xl border border-neutral-800/80 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                    <BrainCircuit className="w-20 h-20 text-blue-600 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-pulse" />
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight leading-loose">
                        AI Psixologingiz <br /> Har Doim Yoningizda
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed">
                        Hissiyotlaringizni erkin baham ko'ring va professional neyron tarmoq orqali chuqur ruhshunoslik maslahatlarini oling. Tizimga kiring va o'z xotirjamligingizni kashf eting.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-black to-transparent pointer-events-none z-0"></div>
            </div>

            {/* O'ng Tomon: Login Forma Qismi */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 relative bg-[#040814]">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#040814] to-[#010205] pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-600/30">
                            <Sparkles className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Tizimga Kirish</h2>
                        <p className="text-neutral-500">O'z AI yordamchingiz safiga qayting</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 relative group">
                            <label className="text-sm font-medium text-neutral-400 group-focus-within:text-blue-500 transition-colors block mb-1">
                                Elektron pochta
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    className="w-full bg-[#0a0f1c]/80 border border-neutral-800/80 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-neutral-600 shadow-inner"
                                    placeholder="exam@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 relative group">
                            <label className="text-sm font-medium text-neutral-400 group-focus-within:text-blue-500 transition-colors block mb-1">
                                Parol
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-[#0a0f1c]/80 border border-neutral-800/80 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-neutral-600 shadow-inner"
                                    placeholder="Eng kamida 6ta belgi"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn || !isFormValid}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:shadow-none"
                        >
                            {isLoggingIn ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Kirilmoqda...
                                </>
                            ) : (
                                <>
                                    Kirish <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-[#0a0f1c]/60 py-4 rounded-xl border border-neutral-800/50">
                        <p className="text-neutral-400 text-sm">
                            Hali akkauntingiz yo'qmi?{" "}
                            <Link to="/signup" className="text-blue-500 font-semibold hover:text-blue-400 transition-colors hover:underline">
                                Ro'yxatdan o'tish
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
