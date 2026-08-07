"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaFileAlt,
  FaCloudUploadAlt,
  FaBook,
  FaBalanceScale,
  FaShieldAlt,
  FaChartBar,
  FaUsers,
  FaCog,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlaneDeparture,
  FaTags,
} from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/api";

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isAdmin, isAuditor, isOperador, canWrite } = useAuth();
  const [pendientesCount, setPendientesCount] = useState(0);

  // Definición de todos los items del menú con control de roles
  const allMenuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <FaHome />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Carga de Archivos",
      href: "/carga-archivos",
      icon: <FaCloudUploadAlt />,
      // Auditores y solo lectura NO pueden cargar archivos
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Pedimentos",
      href: "/pedimentos",
      icon: <FaFileAlt />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Exportaciones",
      href: "/exportaciones",
      icon: <FaPlaneDeparture />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Identificadores",
      href: "/identificadores",
      icon: <FaTags />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Catálogos",
      href: "/catalogos",
      icon: <FaBook />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Catálogos Pendientes",
      href: "/catalogos-pendientes",
      icon: <FaShieldAlt />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR"],
      badge: pendientesCount > 0 ? pendientesCount : null,
    },
    {
      name: "Conciliación SAT",
      href: "/conciliacion",
      icon: <FaBalanceScale />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR"],
    },
    {
      name: "Cumplimiento",
      href: "/cumplimiento",
      icon: <FaShieldAlt />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Reportes",
      href: "/reportes",
      icon: <FaChartBar />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
    {
      name: "Usuarios",
      href: "/usuarios",
      icon: <FaUsers />,
      // Solo ADMIN puede gestionar usuarios
      roles: ["ADMIN"],
    },
    {
      name: "Mi Cartera",
      href: "/cartera",
      icon: <FaUsers />,
      roles: ["ADMIN", "OPERADOR"],
    },
    {
      name: "Configuración",
      href: "/configuracion",
      icon: <FaCog />,
      roles: ["ADMIN", "OPERADOR", "AUDITOR", "SOLO_LECTURA"],
    },
  ];

  // Filtrar según el rol del usuario activo
  const userRol = isAdmin
    ? "ADMIN"
    : isOperador
    ? "OPERADOR"
    : isAuditor
    ? "AUDITOR"
    : "SOLO_LECTURA";

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(userRol)
  );

  useEffect(() => {
    let interval;
    if (["ADMIN", "OPERADOR", "AUDITOR"].includes(userRol)) {
      const fetchCount = async () => {
        try {
          const res = await api.get("/catalogos-pendientes/count");
          setPendientesCount(res.data.count || 0);
        } catch (error) {
          console.error("Error fetching pendientes count:", error);
        }
      };
      
      fetchCount(); // Initial fetch
      interval = setInterval(fetchCount, 30000); // Poll every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userRol]);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-slate-950 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300 border-r border-slate-800/50 shadow-2xl z-50 transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Botón colapsar (solo desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 bg-blue-600 text-white rounded-full p-1.5 shadow-lg hover:bg-blue-500 transition-colors z-50 ring-2 ring-slate-900"
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div
          className={`py-6 mb-4 flex items-center transition-all duration-300 ${
            isCollapsed ? "justify-center px-0" : "justify-between px-5"
          }`}
        >
          <div
            className={`transition-all duration-300 overflow-hidden flex-shrink-0 flex items-center ${
              isCollapsed ? "w-0 opacity-0" : "w-36 opacity-100"
            }`}
          >
            <Image
              src="/images/XelSyncLogo4.png"
              alt="XelSync"
              width={160}
              height={50}
              priority
              style={{ width: "auto", height: "auto" }}
              className="drop-shadow-lg min-w-[130px]"
            />
          </div>

          <button
            className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Badge de rol */}
        {!isCollapsed && (
          <div className="px-5 mb-4">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isAdmin
                  ? "bg-purple-900/40 text-purple-300"
                  : isOperador
                  ? "bg-blue-900/40 text-blue-300"
                  : "bg-slate-700/50 text-slate-400"
              }`}
            >
              {isAdmin ? "🔑 Administrador" : isOperador ? "👷 Operador" : "👁 Auditor"}
            </span>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide pb-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={`flex items-center gap-3 py-3 rounded-xl font-medium transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05)]"
                      : "hover:bg-slate-800/50 hover:text-white"
                  }
                  ${isCollapsed ? "px-0 justify-center" : "px-4"}
                `}
              >
                <span
                  className={`transition-transform duration-300 flex-shrink-0 text-lg ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`transition-all duration-300 flex-1 whitespace-nowrap overflow-hidden flex items-center justify-between ${
                    isCollapsed
                      ? "w-0 opacity-0"
                      : "w-auto opacity-100 group-hover:translate-x-1"
                  }`}
                >
                  <span>{item.name}</span>
                  {item.badge && !isCollapsed && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}