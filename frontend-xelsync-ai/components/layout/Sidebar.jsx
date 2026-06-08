"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaFileAlt,
  FaBook,
  FaBalanceScale,
  FaShieldAlt,
  FaChartBar,
  FaUsers,
  FaCog,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Image from "next/image";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <FaHome /> },
    { name: "Pedimentos", href: "/pedimentos", icon: <FaFileAlt /> },
    { name: "Catálogos", href: "/catalogos", icon: <FaBook /> },
    { name: "Conciliación SAT", href: "/conciliacion", icon: <FaBalanceScale /> },
    { name: "Cumplimiento", href: "/cumplimiento", icon: <FaShieldAlt /> },
    { name: "Reportes", href: "/reportes", icon: <FaChartBar /> },
    { name: "Usuarios", href: "/usuarios", icon: <FaUsers /> },
    { name: "Configuración", href: "/configuracion", icon: <FaCog /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen bg-slate-950 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300 border-r border-slate-800/50 shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-blue-600 text-white rounded-full p-1.5 shadow-lg hover:bg-blue-500 transition-colors z-50 ring-2 ring-slate-900"
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>

        <div className={`py-6 mb-4 flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 flex items-center ${isCollapsed ? 'w-0 opacity-0' : 'w-36 opacity-100'}`}>
            <Image
              src="/images/XelSyncLogo4.png"
              alt="XelSync"
              width={160}
              height={50}
              priority
              className="drop-shadow-lg w-auto h-auto min-w-[130px]"
            />
          </div>

          <button 
            className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide pb-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 py-3 rounded-xl font-medium transition-all duration-300 group
              ${isActive
                  ? "bg-blue-600/15 text-blue-400 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]"
                  : "hover:bg-slate-800/50 hover:text-white"
              }
              ${isCollapsed ? "px-0 justify-center" : "px-4"}
              `}
            >
              <span className={`transition-transform duration-300 flex-shrink-0 text-lg ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 group-hover:translate-x-1"}`}>
                {item.name}
              </span>
            </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}