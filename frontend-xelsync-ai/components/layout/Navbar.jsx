"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaBell,
  FaMoon,
  FaSun,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaUserCircle,
  FaCheckCircle,
} from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const user = {
    name: "Alejandro Olca",
    role: "Administrador",
    initials: "AO",
  };

  const notifications = [
    {
      id: 1,
      title: "Pedimento pendiente",
      description: "El pedimento 6001164 requiere revisión",
    },
    {
      id: 2,
      title: "Conciliación completada",
      description: "Proceso SAT finalizado correctamente",
    },
    {
      id: 3,
      title: "Nuevo usuario",
      description: "Daniel Gloria fue agregado al sistema",
    },
    {
      id: 4,
      title: "SLA próximo a vencer",
      description: "Pedimento 6000425",
    },
    {
      id: 5,
      title: "Nueva importación",
      description: "Se registró una nueva operación",
    },
  ];

  const recentSearches = [
    "Pedimento 6001164",
    "AIM S.A. de C.V.",
    "Conciliación SAT",
    "Materiales",
    "Cumplimiento IVA IEPS",
  ];

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const isDark = savedMode === "true" || (savedMode === null && prefersDark);
    setDarkMode(isDark);
  }, []);

  // Aplicar dark mode al HTML y guardar en localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearch(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <header
      className="
        h-16
        bg-white
        dark:bg-slate-950
        border-b
        border-gray-200
        dark:border-slate-800
        flex
        items-center
        justify-between
        px-6
        relative
        transition-colors
        duration-300
      "
    >
      {/* Logo */}
      <Image
        src="/images/XelSyncLogo1.png"
        alt="XelSync"
        width={180}
        height={60}
        priority
      />

      <div className="flex items-center gap-6">
        {/* BUSCADOR */}
        <div className="relative" ref={searchRef}>
          <div
            className="relative cursor-pointer"
            onClick={() => setShowSearch(true)}
          >
            <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar (Ctrl+K)"
              className="border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {showSearch && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Búsquedas recientes
                </h3>
              </div>

              <div className="p-2">
                {recentSearches.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-slate-800 rounded cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 p-3 text-sm text-blue-600 dark:text-blue-400">
                Búsqueda rápida
              </div>
            </div>
          )}
        </div>

        {/* NOTIFICACIONES */}
        <div className="relative" ref={notificationRef}>
          <button onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell className="text-gray-600 dark:text-gray-400 text-lg hover:text-gray-900 dark:hover:text-gray-200 transition-colors" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
              <div className="flex justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Notificaciones
                </h3>
                <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Marcar leídas
                </button>
              </div>

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notification.description}
                  </p>
                </div>
              ))}

              <div className="p-4 text-center">
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TEMA */}
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? (
            <FaSun className="text-yellow-500 text-lg" />
          ) : (
            <FaMoon className="text-gray-600 dark:text-gray-400 text-lg" />
          )}
        </button>

        {/* PERFIL */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors"
          >
            {user.initials}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </p>
              </div>

              <button className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors">
                <FaUser className="text-gray-500 dark:text-gray-400" />
                Mi Perfil
              </button>

              <button
                onClick={logout}
                className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
              >
                <FaSignOutAlt />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}