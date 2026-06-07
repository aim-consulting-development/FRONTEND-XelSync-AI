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
} from "react-icons/fa";
import Image from "next/image";

export default function Sidebar() {
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
    <aside className="w-64 bg-slate-950 text-white min-h-screen">
      
    <Image
                    src="/images/XelSyncLogo4.png"
                    alt="XelSync"
                    width={180}
                    height={60}
                    priority
                  />
      <nav className="mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-5 py-3 transition
            ${
              pathname === item.href
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}