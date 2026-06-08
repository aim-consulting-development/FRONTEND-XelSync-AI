"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  FaBell,
  FaMoon,
  FaSun,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación en SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      
      <Image
        src={mounted && theme === 'dark' ? "/images/XelSyncLogo4.png" : "/images/XelSyncLogo1.png"}
        alt="XelSync"
        width={180}
        height={60}
        priority
      />

      <div className="flex items-center gap-5">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Buscar..."
            className="border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none dark:text-white"
          />
        </div>

        <FaBell className="cursor-pointer text-gray-600 dark:text-gray-300" />

        {mounted ? (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            {theme === "dark" ? (
              <FaSun className="text-yellow-400" size={18} />
            ) : (
              <FaMoon className="text-gray-600" size={18} />
            )}
          </button>
        ) : (
          <div className="w-8 h-8"></div>
        )}

        <FaUserCircle
          size={28}
          className="cursor-pointer text-blue-600"
        />
      </div>
    </header>
  );
}