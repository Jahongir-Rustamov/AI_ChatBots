import { BrainCircuit, LogOut, User, Menu } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
    const { authUser, logout } = useAuthStore();

    return (
        <header className="h-16 bg-[#040814]/90 backdrop-blur-md border-b border-neutral-800/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {/* Sol Tomon: Hamburger (Mobile) + Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/30 group-hover:bg-blue-600/20 transition-all">
                        <BrainCircuit className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-bold text-white tracking-tight hidden sm:block">
                        AI<span className="text-blue-500"> Psixolog</span>
                    </span>
                </Link>
            </div>

            {/* O'ng Tomon: Profil + Logout */}
            <div className="flex items-center gap-2">
                <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                        {authUser?.firstName
                            ? `${authUser.lastName?.[0]?.toUpperCase() ?? ""}.${authUser.firstName?.slice(0, 1).toUpperCase() + authUser.firstName?.slice(1) ?? ""}`
                            : "Profil"}
                    </span>
                </Link>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">Chiqish</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
