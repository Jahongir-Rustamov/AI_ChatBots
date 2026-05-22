import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader2 } from "lucide-react";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    // Theme ni localStorage dan yuklash
    setTheme(theme);
  }, [checkAuth, theme, setTheme]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen theme-bg-primary flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#0a0f1c" : "#ffffff",
            color: theme === "dark" ? "#fff" : "#0f172a",
            border: theme === "dark" ? "1px solid #1e293b" : "1px solid #e2e8f0",
          },
        }}
      />
    </>
  );
}

export default App;
