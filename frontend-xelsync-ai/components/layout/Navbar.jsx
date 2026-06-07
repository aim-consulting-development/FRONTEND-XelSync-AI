"use client";

import {
  FaBell,
  FaMoon,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      
      <Image
                src="/images/XelSyncLogo1.png"
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
            className="border rounded-lg pl-10 pr-4 py-2"
          />
        </div>

        <FaBell className="cursor-pointer text-gray-600" />

        <FaMoon className="cursor-pointer text-gray-600" />

        <FaUserCircle
          size={28}
          className="cursor-pointer text-blue-600"
        />
      </div>
    </header>
  );
}