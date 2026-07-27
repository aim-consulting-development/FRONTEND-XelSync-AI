"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";

const ESTADOS = [
  "PENDIENTE",
  "INCOMPLETO",
  "EN_REVISION",
  "PROCESADO",
  "APROBADO",
  "RECHAZADO"
];

const TIPOS = ["IMP", "EXP"];

const SLA_COLORS = {
  NORMAL: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EN_RIESGO: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  VENCIDO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ESTADO_COLORS = {
  PENDIENTE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  INCOMPLETO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EN_REVISION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESADO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  APROBADO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  RECHAZADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function PedimentosPage() {
  const router = useRouter();
  const { canWrite } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [size] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [orden, setOrden] = useState("desc");

  const fetchPedimentos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        size: size
      });
      if (search) params.append("q", search);
      if (estadoFilter) params.append("estado", estadoFilter);
      if (tipoFilter) params.append("tipo_operacion", tipoFilter);
      params.append("orden", orden);

      const res = await api.get(`/pedimentos?${params.toString()}`);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, estadoFilter, tipoFilter, orden]);

  useEffect(() => {
    fetchPedimentos();
  }, [fetchPedimentos]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPedimentos();
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedimentos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión y seguimiento de pedimentos aduanales</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] max-w-md relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por pedimento o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </form>
          
          <div className="flex gap-3">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={estadoFilter}
                onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
                className="pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Todos los Estados</option>
                {ESTADOS.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            
            <select
              value={tipoFilter}
              onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los Tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            
            <select
              value={orden}
              onChange={(e) => { setOrden(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguos primero</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSpinner className="animate-spin text-4xl mb-4 text-blue-500" />
              <p>Cargando pedimentos...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSearch className="text-4xl mb-4 opacity-30" />
              <p>No se encontraron pedimentos.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedimento</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha de Carga</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completitud</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SLA</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">{item.pedimento}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.referencia_interna || "Sin ref"}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.cliente_empresa}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.fecha_recepcion_sistema ? new Date(item.fecha_recepcion_sistema).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {item.tipo_operacion || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden w-16">
                          <div
                            className={`h-full ${item.porcentaje_completitud === 100 ? "bg-green-500" : "bg-blue-500"}`}
                            style={{ width: `${item.porcentaje_completitud || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {Math.round(item.porcentaje_completitud || 0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 w-max ${SLA_COLORS[item.status_sla] || SLA_COLORS.NORMAL}`}>
                        {item.status_sla === "VENCIDO" ? <FaExclamationTriangle /> : item.status_sla === "EN_RIESGO" ? <FaClock /> : <FaCheckCircle />}
                        {item.status_sla?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADO_COLORS[item.estado] || ESTADO_COLORS.PENDIENTE}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => router.push(`/pedimentos/${item.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Ver Detalles"
                      >
                        <FaEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando página <span className="font-semibold text-gray-900 dark:text-white">{page}</span> de <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              {' '}({total} resultados)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}