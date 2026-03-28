import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-[#030712] text-white flex flex-col overflow-hidden">
            <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 overflow-hidden flex flex-col">
                    <ChatArea />
                </main>
            </div>
        </div>
    );
};

export default Home;
