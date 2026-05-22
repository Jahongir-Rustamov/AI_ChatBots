import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: "dark", // 'dark' yoki 'light'

            toggleTheme: () => set((state) => {
                const newTheme = state.theme === "dark" ? "light" : "dark";
                // HTML element ga class qo'shish
                if (newTheme === "light") {
                    document.documentElement.classList.add("light");
                } else {
                    document.documentElement.classList.remove("light");
                }
                return { theme: newTheme };
            }),

            setTheme: (theme) => set(() => {
                if (theme === "light") {
                    document.documentElement.classList.add("light");
                } else {
                    document.documentElement.classList.remove("light");
                }
                return { theme };
            }),
        }),
        {
            name: "theme-storage", // localStorage key
        }
    )
);
