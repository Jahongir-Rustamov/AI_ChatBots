import { BrainCircuit, LogOut, User, Menu, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
    const { authUser, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    return (
        <header
            className="h-16 backdrop-blur-md border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 transition-all duration-300"
            style={{
                background: theme === 'light'
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : 'rgba(4, 8, 20, 0.9)',
                borderColor: theme === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: theme === 'light'
                    ? '0 4px 20px rgba(5, 150, 105, 0.15)'
                    : '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
        >
            {/* Sol Tomon: Hamburger (Mobile) + Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg transition-all"
                    style={{
                        color: theme === 'light' ? '#ffffff' : '#a3a3a3',
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
                        style={{
                            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                            borderColor: theme === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        <BrainCircuit className="w-5 h-5" style={{ color: theme === 'light' ? '#ffffff' : '#60a5fa' }} />
                    </div>
                    <span
                        className="font-bold tracking-tight hidden sm:block"
                        style={{ color: theme === 'light' ? '#ffffff' : '#ffffff' }}
                    >
                        AI<span style={{ color: theme === 'light' ? '#dcfce7' : '#60a5fa' }}> Psixolog</span>
                    </span>
                </Link>
            </div>

            {/* O'ng Tomon: Theme Toggle + Profil + Logout */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                    style={{
                        color: theme === 'light' ? '#ffffff' : '#a3a3a3',
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>

                <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                    style={{
                        color: theme === 'light' ? '#ffffff' : '#a3a3a3',
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-lg border flex items-center justify-center"
                        style={{
                            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                            borderColor: theme === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <User className="w-4 h-4" style={{ color: theme === 'light' ? '#ffffff' : '#60a5fa' }} />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                        {authUser?.firstName
                            ? `${authUser.lastName?.[0]?.toUpperCase() ?? ""}.${authUser.firstName?.slice(0, 1).toUpperCase() + authUser.firstName?.slice(1) ?? ""}`
                            : "Profil"}
                    </span>
                </Link>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border"
                    style={{
                        color: theme === 'light' ? '#ffffff' : '#a3a3a3',
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f87171';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'light' ? '#ffffff' : '#a3a3a3';
                        e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">Chiqish</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
