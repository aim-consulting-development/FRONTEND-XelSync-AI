"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBell,
  FaMoon,
  FaSun,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
  FaCog,
} from "react-icons/fa";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

const TIPO_ICON = {
  WARNING: <FaExclamationTriangle className="text-orange-400" />,
  ERROR: <FaExclamationTriangle className="text-red-400" />,
  SUCCESS: <FaCheckCircle className="text-green-400" />,
  INFO: <FaInfoCircle className="text-blue-400" />,
};

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Notificaciones reales
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Cargar preferencia dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedMode === "true" || (savedMode === null && prefersDark);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Obtener contador de no leídas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notificaciones/no-leidas/count");
      setUnreadCount(res.data.count || 0);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // cada 60 segundos
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Cargar notificaciones al abrir panel
  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/notificaciones?size=10");
      setNotifications(res.data.items || []);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleOpenNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) loadNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notificaciones/leer-todas");
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotification = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    try {
      await api.delete(`/notificaciones/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !notif.leida) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleAprobarTraspaso = async (id) => {
    try {
      await api.post(`/usuarios/cartera/aprobar-traspaso/${id}`);
      // Actualizar local
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      alert("Traspaso aprobado exitosamente.");
    } catch (err) {
      alert("Error al aprobar el traspaso.");
    }
  };

  const handleRechazarTraspaso = async (id) => {
    try {
      await api.post(`/usuarios/cartera/rechazar-traspaso/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      alert("Error al rechazar el traspaso.");
    }
  };

  // Cerrar dropdowns al click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSearch(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target))
        setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const initials = user?.nombre
    ? user.nombre.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const rolLabel = {
    ADMIN: "Administrador",
    OPERADOR: "Operador",
    AUDITOR: "Auditor",
    SOLO_LECTURA: "Solo Lectura",
  }[user?.rol] || user?.rol || "—";

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 relative transition-colors duration-300">
      {/* Logo */}
      <Image
        src="/images/XelSyncLogo1.png"
        alt="XelSync"
        width={180}
        height={60}
        priority
        style={{ width: "auto", height: "40px" }}
      />

      <div className="flex items-center gap-4">
        {/* BUSCADOR */}
        <div className="relative" ref={searchRef}>
          <div className="relative cursor-pointer" onClick={() => setShowSearch(true)}>
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar (Ctrl+K)"
              readOnly
              className="border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 w-52 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          {showSearch && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Busca pedimentos, clientes o módulos...</p>
            </div>
          )}
        </div>

        {/* NOTIFICACIONES */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleOpenNotifications}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FaBell className="text-gray-600 dark:text-gray-400 text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FaBell className="text-blue-500" />
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center gap-1"
                  >
                    <FaCheckCircle size={12} />
                    Marcar todas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                {notifLoading ? (
                  <div className="p-6 text-center">
                    <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 dark:text-gray-500">
                    <FaBell className="text-3xl opacity-30 mx-auto mb-2" />
                    <p className="text-sm">No tienes notificaciones</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                        !n.leida ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {TIPO_ICON[n.tipo] || <FaInfoCircle className="text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => !n.leida && markAsRead(n.id)}>
                        <p className={`text-sm font-medium truncate ${!n.leida ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                          {n.titulo}
                          {!n.leida && <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-1">
                          {n.created_at ? new Date(n.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }) : ""}
                        </p>
                        
                        {n.tipo === "TRASPASO_CARTERA" && !n.leida && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAprobarTraspaso(n.id); }}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] rounded"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRechazarTraspaso(n.id); }}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors mt-1"
                        title="Eliminar"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 dark:border-slate-800 text-center">
                <Link
                  href="/configuracion"
                  onClick={() => setShowNotifications(false)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver configuración →
                </Link>
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
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            {initials}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{user?.nombre || "Usuario"}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                    user?.rol === "ADMIN"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : user?.rol === "OPERADOR"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {rolLabel}
                  </span>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/configuracion"
                  onClick={() => setShowProfile(false)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors rounded-lg text-sm"
                >
                  <FaUser className="text-gray-400" />
                  Mi Perfil
                </Link>
                <Link
                  href="/configuracion"
                  onClick={() => setShowProfile(false)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors rounded-lg text-sm"
                >
                  <FaCog className="text-gray-400" />
                  Configuración
                </Link>
                <hr className="my-1 border-gray-200 dark:border-slate-700" />
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors rounded-lg text-sm"
                >
                  <FaSignOutAlt />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}