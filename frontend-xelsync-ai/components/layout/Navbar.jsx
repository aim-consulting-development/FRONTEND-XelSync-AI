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

export default function Navbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar problemas de hidratación en SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-300">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Image
          src={mounted && theme === 'dark' ? "/images/XelSyncLogo4.png" : "/images/XelSyncLogo1.png"}
          alt="XelSync"
          width={130}
          height={40}
          priority
          className="lg:hidden"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        <div className="relative group hidden sm:block">
          <FaSearch className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />

          <input
            type="text"
            placeholder="Buscar..."
            className="border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all w-48 md:w-64 focus:w-80"
          />
        </div>

        <button className="sm:hidden p-2 text-gray-600 dark:text-gray-300">
          <FaSearch />
        </button>

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