"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
} from "react-icons/fa";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarteraOpen, setIsCarteraOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartera, setCartera] = useState([]);
  const [carteraLoading, setCarteraLoading] = useState(false);
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

  useEffect(() => {
    fetchUsuarios();
  }, []);

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

  const filteredUsers = usuarios.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los accesos, roles y la cartera de clientes de los operadores.
          </p>
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

              <div className="space-y-2 mb-6">
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaEnvelope className="text-gray-400" /> {user.email}
                </p>
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FaCheckCircle className={user.estado === "ACTIVO" ? "text-emerald-500" : "text-gray-400"} />
                  {user.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </p>
              </div>

              <div className="flex gap-2 border-t border-gray-100 dark:border-slate-700 pt-4">
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
    </MainLayout>
  );
}