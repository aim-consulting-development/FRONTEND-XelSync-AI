"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FaCheck, FaTimes, FaExchangeAlt, FaBuilding, FaPlus, FaSpinner } from "react-icons/fa";

export default function AdminCarteraView() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newClient, setNewClient] = useState("");
  const [selectedOp, setSelectedOp] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSol, resOps] = await Promise.all([
        api.get("/usuarios/cartera/traspasos"),
        api.get("/usuarios?limit=100")
      ]);
      setSolicitudes(resSol.data);
      setOperadores(resOps.data.items.filter(u => u.rol === "OPERADOR"));
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
    } catch (err) {
      alert(err.response?.data?.detail || "Error al asignar cliente");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div>Cargando solicitudes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
              className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operador Destino</label>
            <select
              value={selectedOp}
              onChange={(e) => setSelectedOp(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaExchangeAlt className="text-blue-500" /> Solicitudes de Traspaso Pendientes
        </h2>
        {solicitudes.length === 0 ? (
          <p className="text-gray-500">No hay solicitudes pendientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Empresa</th>
                  <th className="px-6 py-3">Origen (ID)</th>
                  <th className="px-6 py-3">Destino (ID)</th>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map(s => (
                  <tr key={s.id} className="border-b">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.cliente_empresa}</td>
                    <td className="px-6 py-4">{s.operador_origen_id}</td>
                    <td className="px-6 py-4">{s.operador_destino_id}</td>
                    <td className="px-6 py-4">{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => handleResolver(s.id, true)} className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-100" title="Aprobar"><FaCheck /></button>
                      <button onClick={() => handleResolver(s.id, false)} className="text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100" title="Rechazar"><FaTimes /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
