"use client";

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
} from "react-icons/fa";
import Image from "next/image";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

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
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-950 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300 border-r border-slate-800/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        
        <div className="px-6 py-6 mb-2 flex justify-between items-center">
          <Image
            src="/images/XelSyncLogo4.png"
            alt="XelSync"
            width={160}
            height={50}
            priority
            className="drop-shadow-lg"
          />
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <nav className="mt-2 flex flex-col gap-1 px-3 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group
              ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]"
                  : "hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}