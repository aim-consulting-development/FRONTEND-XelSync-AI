"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  FaUser,
  FaBell,
  FaShieldAlt,
  FaMoon,
  FaSun,
  FaKey,
  FaCheck,
  FaServer,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
} from "react-icons/fa";

function Alert({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg text-sm mb-4 ${
        type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
      }`}
    >
      {type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

export default function Configuracion() {
  const { user, refreshProfile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");
  const [darkMode, setDarkMode] = useState(false);

  // Perfil
  const [perfil, setPerfil] = useState({ nombre: "", telefono: "" });
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState(null);
  const [perfilError, setPerfilError] = useState(null);

  // Contraseña
  const [passForm, setPassForm] = useState({ password_actual: "", password_nueva: "", confirmar: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState(null);
  const [passError, setPassError] = useState(null);

  // Configuración del sistema (solo ADMIN)
  const [sysConfigs, setSysConfigs] = useState([]);
  const [sysLoading, setSysLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [sysMsg, setSysMsg] = useState(null);

  // Cargar perfil real
  useEffect(() => {
    if (user) {
      setPerfil({ nombre: user.nombre || "", telefono: user.telefono || "" });
    }
  }, [user]);

  // Cargar dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    setDarkMode(saved === "true");
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Guardar perfil
  const handleSavePerfil = async (e) => {
    e.preventDefault();
    setPerfilLoading(true);
    setPerfilMsg(null);
    setPerfilError(null);
    try {
      await api.put("/auth/perfil", {
        nombre: perfil.nombre,
        telefono: perfil.telefono || null,
      });
      refreshProfile();
      setPerfilMsg("Perfil actualizado correctamente.");
    } catch (err) {
      setPerfilError(err.response?.data?.detail || "Error al actualizar el perfil.");
    } finally {
      setPerfilLoading(false);
    }
  };

  // Cambiar contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    setPassError(null);
    if (passForm.password_nueva !== passForm.confirmar) {
      setPassError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setPassLoading(true);
    try {
      await api.put("/auth/cambiar-password", {
        password_actual: passForm.password_actual,
        password_nueva: passForm.password_nueva,
      });
      setPassMsg("Contraseña actualizada exitosamente.");
      setPassForm({ password_actual: "", password_nueva: "", confirmar: "" });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "object" && detail?.requisitos_faltantes) {
        setPassError(detail.requisitos_faltantes.join(" "));
      } else {
        setPassError(detail || "Error al cambiar la contraseña.");
      }
    } finally {
      setPassLoading(false);
    }
  };

  // Cargar configuración del sistema
  const loadSysConfig = async () => {
    setSysLoading(true);
    try {
      const res = await api.get("/configuracion/sistema");
      setSysConfigs(res.data);
    } catch {
      setSysConfigs([]);
    } finally {
      setSysLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sistema" && isAdmin) loadSysConfig();
  }, [activeTab, isAdmin]);

  const handleSaveSysConfig = async (clave) => {
    try {
      await api.put(`/configuracion/sistema/${clave}`, { valor: editingValue });
      setSysConfigs((prev) =>
        prev.map((c) => (c.clave === clave ? { ...c, valor: editingValue } : c))
      );
      setEditingKey(null);
      setSysMsg("Configuración guardada.");
      setTimeout(() => setSysMsg(null), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Error al guardar.");
    }
  };

  // Cambiar pestaña activa si el usuario no es admin (solo pueden ver seguridad)
  useEffect(() => {
    if (user && !isAdmin && activeTab !== "seguridad") {
      setActiveTab("seguridad");
    }
  }, [user, isAdmin, activeTab]);

  const tabs = [
    ...(isAdmin ? [{ id: "perfil", label: "Perfil", icon: <FaUser /> }] : []),
    ...(isAdmin ? [{ id: "preferencias", label: "Preferencias", icon: <FaBell /> }] : []),
    { id: "seguridad", label: "Seguridad", icon: <FaShieldAlt /> },
    ...(isAdmin ? [{ id: "sistema", label: "Sistema", icon: <FaServer /> }] : []),
  ];

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors";

  return (
    <MainLayout>
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra tu perfil, preferencias y opciones del sistema.
          </p>
        </div>
        <InfoModal title="Configuración">
          <p>
            Modifica la contraseña de tu cuenta, preferencias de interfaz y otras opciones de perfil.
          </p>
        </InfoModal>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar de tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-blue-600/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">

          {/* ── PERFIL ── */}
          {activeTab === "perfil" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Información Personal</h2>
              <Alert type="success" message={perfilMsg} onClose={() => setPerfilMsg(null)} />
              <Alert type="error" message={perfilError} onClose={() => setPerfilError(null)} />
              <form onSubmit={handleSavePerfil} className="space-y-6 max-w-2xl">
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {perfil.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.nombre || "—"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      {user?.rol || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={perfil.nombre}
                      onChange={(e) => setPerfil((p) => ({ ...p, nombre: e.target.value }))}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      value={perfil.telefono}
                      onChange={(e) => setPerfil((p) => ({ ...p, telefono: e.target.value }))}
                      className={inputClass}
                      placeholder="+52 000 000 0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className={`${inputClass} bg-gray-100 dark:bg-slate-700/50 cursor-not-allowed text-gray-500`}
                    />
                    <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar desde aquí.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button
                    type="submit"
                    disabled={perfilLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {perfilLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── PREFERENCIAS ── */}
          {activeTab === "preferencias" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Preferencias de la Cuenta</h2>
              <div className="space-y-8 max-w-2xl">
                {/* Tema */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Tema Visual</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => !darkMode || toggleTheme()}
                      className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                        !darkMode ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <FaSun className={`text-2xl ${!darkMode ? "text-blue-500" : "text-gray-400"}`} />
                      <span className={`font-medium text-sm ${!darkMode ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}>Claro</span>
                    </button>
                    <button
                      onClick={() => darkMode || toggleTheme()}
                      className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                        darkMode ? "border-blue-500 bg-slate-700" : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <FaMoon className={`text-2xl ${darkMode ? "text-blue-400" : "text-gray-400"}`} />
                      <span className={`font-medium text-sm ${darkMode ? "text-blue-100" : "text-gray-600"}`}>Oscuro</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {activeTab === "seguridad" && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Seguridad de la Cuenta</h2>
              <Alert type="success" message={passMsg} onClose={() => setPassMsg(null)} />
              <Alert type="error" message={passError} onClose={() => setPassError(null)} />
              <form onSubmit={handleCambiarPassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
                  <input
                    type="password"
                    value={passForm.password_actual}
                    onChange={(e) => setPassForm((p) => ({ ...p, password_actual: e.target.value }))}
                    className={inputClass}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={passForm.password_nueva}
                    onChange={(e) => setPassForm((p) => ({ ...p, password_nueva: e.target.value }))}
                    className={inputClass}
                    required
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={passForm.confirmar}
                    onChange={(e) => setPassForm((p) => ({ ...p, confirmar: e.target.value }))}
                    className={inputClass}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                  >
                    {passLoading ? <FaSpinner className="animate-spin" /> : <FaKey />}
                    Cambiar Contraseña
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SISTEMA (solo ADMIN) ── */}
          {activeTab === "sistema" && isAdmin && (
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ajustes del Sistema</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Parámetros globales de la plataforma XelSync.</p>
              {sysMsg && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <FaCheckCircle /> {sysMsg}
                </div>
              )}
              {sysLoading ? (
                <div className="flex justify-center py-10">
                  <FaSpinner className="animate-spin text-3xl text-blue-500" />
                </div>
              ) : sysConfigs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FaServer className="text-4xl mx-auto mb-3 opacity-30" />
                  <p>No hay parámetros de configuración disponibles.</p>
                  <p className="text-sm mt-1">Los parámetros se configuran desde la base de datos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    sysConfigs.reduce((acc, c) => {
                      if (!acc[c.categoria]) acc[c.categoria] = [];
                      acc[c.categoria].push(c);
                      return acc;
                    }, {})
                  ).map(([categoria, configs]) => (
                    <div key={categoria}>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">{categoria}</h3>
                      <div className="space-y-2">
                        {configs.map((config) => (
                          <div
                            key={config.clave}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{config.clave}</p>
                              {config.descripcion && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{config.descripcion}</p>
                              )}
                            </div>
                            {editingKey === config.clave ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="border border-blue-400 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-40"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveSysConfig(config.clave)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => setEditingKey(null)}
                                  className="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{config.valor}</span>
                                {config.modificable && (
                                  <button
                                    onClick={() => { setEditingKey(config.clave); setEditingValue(config.valor); }}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}