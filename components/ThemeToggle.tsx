"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  // 1. Cek preferensi saat pertama kali load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 2. Handler untuk ganti tema
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-12 h-6 rounded-full bg-gray-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none"
      aria-label="Toggle Theme"
    >
      {/* Tombol Slider Bulat */}
      <div
        className={`absolute left-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={10} className="text-slate-900" />
        ) : (
          <Sun size={10} className="text-yellow-500" />
        )}
      </div>
      
      {/* Icon di Background (Opsional buat variasi) */}
      <div className="flex justify-between w-full px-1.5 opacity-50">
        <Sun size={12} className="text-yellow-600" />
        <Moon size={12} className="text-blue-300" />
      </div>
    </button>
  );
}