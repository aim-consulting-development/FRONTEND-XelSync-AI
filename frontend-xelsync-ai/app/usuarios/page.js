"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaUsers,
  FaEnvelope,
  FaBriefcase,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaTh,
  FaList,
  FaClock,
  FaHistory,
  FaFileAlt,
  FaEye,
  FaChartBar,
} from "react-icons/fa";

const ESTADO_COLORS = {
  PENDIENTE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  INCOMPLETO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EN_REVISION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESADO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  APROBADO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INTERXEL_GENERADO: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  RECHAZADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarteraOpen, setIsCarteraOpen] = useState(false);
  const [isActividadOpen, setIsActividadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartera, setCartera] = useState([]);
  const [carteraLoading, setCarteraLoading] = useState(false);
  const [actividadData, setActividadData] = useState(null);
  const [actividadLoading, setActividadLoading] = useState(false);
  // C17: Bitácora
  const [bitacoraData, setBitacoraData] = useState(null);
  const [bitacoraLoading, setBitacoraLoading] = useState(false);
  const [bitacoraRango, setBitacoraRango] = useState("semana");
  const [actividadTab, setActividadTab] = useState("actividad"); // "actividad" | "bitacora"
  const [viewMode, setViewMode] = useState("grid"); // "grid" o "list"

  // Formularios
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "OPERADOR",
  });
  const [nuevoClienteCartera, setNuevoClienteCartera] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
    }
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await api.get("/usuarios");
      setUsuarios(res.data.items || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post("/usuarios", formData);
      setIsModalOpen(false);
      setFormData({ nombre: "", email: "", password: "", rol: "OPERADOR" });
      fetchUsuarios();
    } catch (error) {
      console.error("Error creando usuario:", error);
      const dataDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(dataDetail) 
        ? dataDetail.map(d => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(' | ')
        : dataDetail || "Error al crear usuario";
      alert(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const openCartera = async (user) => {
    setSelectedUser(user);
    setIsCarteraOpen(true);
    setCarteraLoading(true);
    try {
      const res = await api.get(`/usuarios/${user.id}/cartera`);
      setCartera(res.data.items || []);
    } catch (error) {
      console.error("Error cargando cartera:", error);
    } finally {
      setCarteraLoading(false);
    }
  };

  const openActividad = async (user) => {
    setSelectedUser(user);
    setIsActividadOpen(true);
    setActividadLoading(true);
    setActividadTab("actividad");
    setBitacoraData(null);
    try {
      const res = await api.get(`/usuarios/${user.id}/actividad`);
      setActividadData(res.data);
    } catch (error) {
      console.error("Error cargando actividad:", error);
    } finally {
      setActividadLoading(false);
    }
  };

  // C17: Cargar bitácora de sesiones
  const loadBitacora = async (userId, rango = "semana") => {
    setBitacoraLoading(true);
    try {
      const res = await api.get(`/usuarios/${userId}/bitacora?rango=${rango}`);
      setBitacoraData(res.data);
    } catch (error) {
      console.error("Error cargando bitácora:", error);
      setBitacoraData(null);
    } finally {
      setBitacoraLoading(false);
    }
  };

  const handleBitacoraTabClick = () => {
    setActividadTab("bitacora");
    if (selectedUser && !bitacoraData) {
      loadBitacora(selectedUser.id, bitacoraRango);
    }
  };

  const handleBitacoraRangoChange = (nuevoRango) => {
    setBitacoraRango(nuevoRango);
    if (selectedUser) loadBitacora(selectedUser.id, nuevoRango);
  };

  const handleAddCartera = async (e) => {
    e.preventDefault();
    if (!nuevoClienteCartera) return;
    setFormLoading(true);
    try {
      await api.post(`/usuarios/${selectedUser.id}/cartera/agregar`, {
        cliente_id: nuevoClienteCartera,
      });
      setNuevoClienteCartera("");
      const res = await api.get(`/usuarios/${selectedUser.id}/cartera`);
      setCartera(res.data.items || []);
    } catch (error) {
      console.error("Error agregando a cartera:", error);
      alert(error.response?.data?.detail || "Error al agregar cliente a cartera");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveCartera = async (carteraId) => {
    try {
      await api.delete(`/usuarios/${selectedUser.id}/cartera/${carteraId}`);
      setCartera(cartera.filter((c) => c.id !== carteraId));
    } catch (error) {
      console.error("Error eliminando de cartera:", error);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/usuarios/${userId}/estado`);
      fetchUsuarios();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert(error.response?.data?.detail || "Error cambiando estado");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario permanentemente?")) return;
    try {
      await api.delete(`/usuarios/${userId}`);
      fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert(error.response?.data?.detail || "Error eliminando usuario");
    }
  };

  const getRoleBadge = (rol) => {
    const roles = {
      ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      OPERADOR: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      AUDITOR: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      SOLO_LECTURA: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roles[rol] || roles.SOLO_LECTURA}`}>
        {rol}
      </span>
    );
  };

  const formatUltimoAcceso = (fecha) => {
    if (!fecha) return "Nunca";
    const d = new Date(fecha);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Justo ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getConexionColor = (fecha) => {
    if (!fecha) return "text-gray-400";
    const diffMs = new Date() - new Date(fecha);
    const diffHrs = diffMs / 3600000;
    if (diffHrs < 1) return "text-emerald-500";
    if (diffHrs < 24) return "text-blue-500";
    if (diffHrs < 72) return "text-amber-500";
    return "text-red-400";
  };

  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestiona los accesos, roles y la cartera de clientes de los operadores.
            </p>
          </div>
          <InfoModal title="Módulo de Usuarios">
            <p>
              Crea y administra las cuentas de usuarios (Administradores, Auditores, Operadores, Lectura).
              Para los operadores, puedes asignarles acceso a clientes específicos usando la Cartera de Clientes.
            </p>
          </InfoModal>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <FaUserPlus /> Nuevo Usuario
        </button>
      </div>

      {/* Controles */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" 
                ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            title="Vista de Tarjetas"
          >
            <FaTh />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" 
                ? "bg-white dark:bg-slate-600 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            title="Vista de Lista"
          >
            <FaList />
          </button>
        </div>
      </div>

      {/* Lista de Usuarios */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.nombre?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {user.nombre}
                    </h3>
                    {getRoleBadge(user.rol)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaEnvelope className="text-gray-400" /> {user.email}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaCheckCircle className={user.estado === "ACTIVO" ? "text-emerald-500" : "text-gray-400"} />
                  {user.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </p>
                <p className={`flex items-center gap-2 text-sm ${getConexionColor(user.ultimo_acceso)}`}>
                  <FaClock /> Última conexión: {formatUltimoAcceso(user.ultimo_acceso)}
                </p>
              </div>

              {/* Actividad resumen */}
              <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-3 mb-4 border border-gray-100 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FaFileAlt className="text-blue-400" />
                    <span>Pedimentos: <span className="font-bold text-gray-900 dark:text-white">{user.pedimentos_procesados || 0}</span></span>
                  </div>
                  {user.ultimo_pedimento && (
                    <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                      {user.ultimo_pedimento}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-4">
                <button
                  onClick={() => openActividad(user)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  title="Ver Actividad"
                >
                  <FaHistory />
                </button>
                <button
                  onClick={() => openCartera(user)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Gestionar Cartera"
                >
                  <FaBriefcase />
                </button>
                <button
                  onClick={() => handleToggleStatus(user.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    user.estado === "ACTIVO" 
                      ? "text-amber-700 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50" 
                      : "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
                  }`}
                  title={user.estado === "ACTIVO" ? "Desactivar Usuario" : "Activar Usuario"}
                >
                  {user.estado === "ACTIVO" ? <FaTimes /> : <FaCheckCircle />}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  title="Eliminar Usuario"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Correo</th>
                  <th className="p-4 font-medium">Rol</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium">Última Conexión</th>
                  <th className="p-4 font-medium">Pedimentos</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {user.nombre?.charAt(0).toUpperCase() || "U"}
                      </div>
                      {user.nombre}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="p-4">{getRoleBadge(user.rol)}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 ${user.estado === "ACTIVO" ? "text-emerald-500" : "text-gray-400"}`}>
                        <FaCheckCircle /> {user.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs ${getConexionColor(user.ultimo_acceso)}`}>
                        <FaClock /> {formatUltimoAcceso(user.ultimo_acceso)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{user.pedimentos_procesados || 0}</span>
                        {user.ultimo_pedimento && (
                          <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                            {user.ultimo_pedimento}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openActividad(user)}
                          className="p-2 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                          title="Ver Actividad"
                        >
                          <FaHistory />
                        </button>
                        <button
                          onClick={() => openCartera(user)}
                          className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Gestionar Cartera"
                        >
                          <FaBriefcase />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.estado === "ACTIVO" 
                              ? "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30 dark:hover:bg-amber-900/50" 
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50"
                          }`}
                          title={user.estado === "ACTIVO" ? "Desactivar Usuario" : "Activar Usuario"}
                        >
                          {user.estado === "ACTIVO" ? <FaTimes /> : <FaCheckCircle />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                          title="Eliminar Usuario"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol del Sistema
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="OPERADOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="SOLO_LECTURA">Solo Lectura</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {formLoading ? <FaSpinner className="animate-spin" /> : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cartera */}
      {isCarteraOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cartera de Clientes</h2>
                <p className="text-sm text-gray-500">{selectedUser.nombre}</p>
              </div>
              <button onClick={() => setIsCarteraOpen(false)} className="text-gray-400 hover:text-gray-500">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleAddCartera} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="ID del Cliente a agregar..."
                  value={nuevoClienteCartera}
                  onChange={(e) => setNuevoClienteCartera(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={formLoading || !nuevoClienteCartera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Agregar
                </button>
              </form>

              {carteraLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : cartera.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaBriefcase className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>Este usuario no tiene clientes en su cartera.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  {cartera.map((item) => (
                    <li key={item.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700/30">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Cliente ID: {item.cliente_id}</p>
                        <p className="text-xs text-gray-500">Agregado: {new Date(item.fecha_asignacion).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveCartera(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <FaTrashAlt />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Actividad del Operador */}
      {isActividadOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.nombre?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Actividad de {selectedUser.nombre}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email} • {selectedUser.rol}</p>
                </div>
              </div>
              <button onClick={() => setIsActividadOpen(false)} className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* C17: Sub-tabs Actividad | Bitácora */}
            <div className="flex border-b border-gray-100 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setActividadTab("actividad")}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  actividadTab === "actividad"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <FaHistory className="inline mr-2" />Actividad de Pedimentos
              </button>
              <button
                onClick={handleBitacoraTabClick}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  actividadTab === "bitacora"
                    ? "border-purple-500 text-purple-600 dark:text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <FaClock className="inline mr-2" />Bitácora de Sesiones
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {actividadTab === "actividad" && (
                actividadLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FaSpinner className="animate-spin text-3xl text-blue-500 mb-3" />
                    <p className="text-gray-500">Cargando actividad...</p>
                  </div>
                ) : actividadData ? (
                  <>
                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-800/30">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{actividadData.estadisticas.total_pedimentos}</p>
                        <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">Total Pedimentos</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-800/30">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{actividadData.estadisticas.aprobados}</p>
                        <p className="text-xs text-emerald-500 dark:text-emerald-300 mt-1">Aprobados</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center border border-amber-100 dark:border-amber-800/30">
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{actividadData.estadisticas.pendientes}</p>
                        <p className="text-xs text-amber-500 dark:text-amber-300 mt-1">Pendientes</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-100 dark:border-purple-800/30">
                        <p className={`text-sm font-bold ${getConexionColor(actividadData.usuario.ultimo_acceso)}`}>
                          {formatUltimoAcceso(actividadData.usuario.ultimo_acceso)}
                        </p>
                        <p className="text-xs text-purple-500 dark:text-purple-300 mt-1">Última Conexión</p>
                      </div>
                    </div>

                    {/* Historial de Pedimentos */}
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FaHistory className="text-blue-500" /> Pedimentos Recientes
                    </h3>
                    
                    {actividadData.pedimentos_recientes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FaFileAlt className="text-4xl mx-auto mb-3 opacity-30" />
                        <p>Este usuario no tiene pedimentos registrados.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {actividadData.pedimentos_recientes.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                            onClick={() => { setIsActividadOpen(false); router.push(`/pedimentos/${p.id}`); }}
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">{p.pedimento}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.cliente_empresa || "Sin cliente"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[p.estado] || ESTADO_COLORS.PENDIENTE}`}>
                                {p.estado}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {p.fecha_recepcion ? new Date(p.fecha_recepcion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : "—"}
                              </span>
                              <FaEye className="text-blue-400 text-xs" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-red-500">
                    <p>Error al cargar la actividad del usuario.</p>
                  </div>
                )
              )}

              {/* C17: Bitácora de sesiones */}
              {actividadTab === "bitacora" && (
                <div>
                  {/* Filtros de rango */}
                  <div className="flex gap-2 mb-5">
                    {["dia","semana","mes"].map(r => (
                      <button
                        key={r}
                        onClick={() => handleBitacoraRangoChange(r)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          bitacoraRango === r
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200"
                            : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600"
                        }`}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>

                  {bitacoraLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <FaSpinner className="animate-spin text-3xl text-purple-500" />
                    </div>
                  ) : bitacoraData ? (
                    <>
                      {/* Resumen */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{bitacoraData.total_horas_periodo}h</p>
                          <p className="text-xs text-purple-500 mt-1">Horas totales ({bitacoraRango})</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
                          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{bitacoraData.total_sesiones}</p>
                          <p className="text-xs text-gray-500 mt-1">Sesiones totales</p>
                        </div>
                      </div>

                      {/* Días */}
                      <div className="space-y-3">
                        {(bitacoraData.dias || []).length === 0 ? (
                          <div className="text-center py-10 text-gray-400">
                            <FaClock className="text-3xl mx-auto mb-2 opacity-40" />
                            <p>No hay sesiones registradas en este período.</p>
                          </div>
                        ) : (
                          bitacoraData.dias.map((dia, idx) => (
                            <div key={idx} className={`rounded-xl border p-4 ${
                              dia.semaforo === "VERDE"
                                ? "border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-900/10"
                                : "border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10"
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    dia.semaforo === "VERDE" ? "bg-green-500" : "bg-red-500"
                                  } animate-pulse`} />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                    {new Date(dia.fecha + "T12:00:00").toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                                <span className={`text-sm font-bold ${
                                  dia.semaforo === "VERDE" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                }`}>
                                  {dia.total_horas}h / 8h requeridas
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {dia.sesiones.map((ses, si) => (
                                  <div key={si} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-slate-800/70 rounded-lg px-3 py-1.5">
                                    <span>
                                      {ses.inicio ? new Date(ses.inicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : "?"}
                                      {" → "}
                                      {ses.fin ? new Date(ses.fin).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : "Activa"}
                                    </span>
                                    <span className={`font-semibold ${
                                      ses.estado === "ACTIVO" ? "text-green-500" : "text-gray-500"
                                    }`}>
                                      {ses.horas_activas}h • {ses.estado}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <FaClock className="text-3xl mx-auto mb-2 opacity-40" />
                      <p>No se pudo cargar la bitácora de sesiones.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}