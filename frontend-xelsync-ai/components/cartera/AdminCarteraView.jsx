"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FaCheck, FaTimes, FaExchangeAlt, FaBuilding, FaPlus, FaSpinner, FaUsers, FaSearch } from "react-icons/fa";

export default function AdminCarteraView() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [todosClientes, setTodosClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newClient, setNewClient] = useState("");
  const [selectedOp, setSelectedOp] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchClientes, setSearchClientes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSol, resOps, resTodos] = await Promise.all([
        api.get("/usuarios/cartera/traspasos"),
        api.get("/usuarios?limit=100"),
        api.get("/usuarios/cartera/todos-los-clientes")
      ]);
      setSolicitudes(resSol.data);
      setOperadores(resOps.data.items.filter(u => u.rol === "OPERADOR"));
      setTodosClientes(resTodos.data.clientes || []);
    } catch (err) {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (id, aprobar) => {
    try {
      await api.post(`/usuarios/cartera/traspasos/${id}/resolver?aprobar=${aprobar}`);
      fetchData();
    } catch (err) {
      alert("Error al resolver la solicitud");
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.trim() || !selectedOp) return;
    setAdding(true);
    try {
      await api.post(`/usuarios/${selectedOp}/cartera/agregar`, {
        empresas: [newClient.trim()]
      });
      setNewClient("");
      setSelectedOp("");
      alert("Cliente asignado exitosamente");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al asignar cliente");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveClient = async (operadorId, carteraId) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente de la cartera del operador?")) return;
    try {
      await api.delete(`/usuarios/${operadorId}/cartera/${carteraId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Error eliminando cliente de la cartera");
    }
  };

  const filteredClientes = todosClientes.filter(c => 
    c.cliente_empresa.toLowerCase().includes(searchClientes.toLowerCase()) || 
    c.operador_nombre.toLowerCase().includes(searchClientes.toLowerCase())
  );

  if (loading) return <div>Cargando panel de administrador...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <FaPlus className="text-blue-500" /> Dar de Alta y Asignar Cliente
        </h2>
        <form onSubmit={handleAddClient} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Cliente / Empresa</label>
            <input
              type="text"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
              placeholder="Ej. Empresa ABC S.A. de C.V."
              className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operador Destino</label>
            <select
              value={selectedOp}
              onChange={(e) => setSelectedOp(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un operador...</option>
              {operadores.map(op => (
                <option key={op.id} value={op.id}>{op.nombre} ({op.email})</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={adding || !newClient || !selectedOp}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 h-[42px]"
          >
            {adding ? <FaSpinner className="animate-spin" /> : "Asignar"}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <FaExchangeAlt className="text-blue-500" /> Solicitudes de Traspaso Pendientes
        </h2>
        {solicitudes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No hay solicitudes pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Origen (ID)</th>
                  <th className="px-6 py-3">Destino (ID)</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {solicitudes.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{s.cliente_empresa}</td>
                    <td className="px-6 py-4">{s.operador_origen_id}</td>
                    <td className="px-6 py-4">{s.operador_destino_id}</td>
                    <td className="px-6 py-4">{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button onClick={() => handleResolver(s.id, true)} className="text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" title="Aprobar"><FaCheck /></button>
                      <button onClick={() => handleResolver(s.id, false)} className="text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Rechazar"><FaTimes /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <FaBuilding className="text-blue-500" /> Todos los Clientes en el Sistema
          </h2>
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente u operador..."
              value={searchClientes}
              onChange={(e) => setSearchClientes(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-800 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Empresa / Cliente</th>
                <th className="px-6 py-4">Operador Asignado</th>
                <th className="px-6 py-4">Fecha Alta</th>
                <th className="px-6 py-4 text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredClientes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {c.cliente_empresa}
                    {c.rfc_empresa && <span className="block text-xs text-gray-400 font-normal">{c.rfc_empresa}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {c.operador_nombre?.charAt(0) || "U"}
                      </div>
                      <span className="text-gray-900 dark:text-gray-300">{c.operador_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.fecha_asignacion || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveClient(c.operador_id, c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Eliminar de la cartera del operador"
                    >
                      <FaTimes /> Quitar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {todosClientes.length === 0 ? "No hay clientes asignados en el sistema." : "No se encontraron resultados para la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
