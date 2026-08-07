"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
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
  FaDownload,
  FaCheckSquare,
} from "react-icons/fa";

const ESTADOS = [
  "PENDIENTE",
  "INCOMPLETO",
  "EN_REVISION",
  "PROCESADO",
  "APROBADO",
  "INTERXEL_GENERADO",
  "RECHAZADO"
];

const TIPOS = ["IMP", "EXP"];

const SLA_COLORS = {
  NORMAL: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EN_RIESGO: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  VENCIDO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const ESTADO_COLORS = {
  PENDIENTE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  INCOMPLETO: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  EN_REVISION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESADO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  APROBADO: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  INTERXEL_GENERADO: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  RECHAZADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/**
 * Determina si un pedimento tiene una fecha fuera de rango (Punto 1).
 */
function isFechaFueraDeRango(item) {
  const fechaStr = item.fecha_despacho_agente || item.fecha_recepcion_sistema;
  if (!fechaStr) return false;
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  if (fecha.getFullYear() < ahora.getFullYear()) return true;
  const diffMs = ahora - fecha;
  const diffMeses = diffMs / (1000 * 60 * 60 * 24 * 30);
  if (diffMeses > 4) return true;
  return false;
}

export default function PedimentosPage() {
  const router = useRouter();
  const { canWrite } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [size] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [operadorFilter, setOperadorFilter] = useState("");
  const [orden, setOrden] = useState("desc");

  const [operadores, setOperadores] = useState([]);
  const { isAdmin } = useAuth();

  // ─── Selección para InterXel masivo ───
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportingLote, setExportingLote] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api.get("/usuarios?limit=100").then(res => {
        setOperadores(res.data.items.filter(u => u.rol === "OPERADOR"));
      }).catch(err => console.error(err));
    }
  }, [isAdmin]);

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
      if (isAdmin && operadorFilter) params.append("operador_id", operadorFilter);
      params.append("orden", orden);

      const res = await api.get(`/pedimentos?${params.toString()}`);
      const fetchedItems = res.data.items || [];
      setItems(fetchedItems);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);

      const ids = fetchedItems.map(item => item.id);
      sessionStorage.setItem("pedimentosListIds", JSON.stringify(ids));
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

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleExportLote = async () => {
    if (selectedIds.size === 0) return;
    setExportingLote(true);
    try {
      const res = await api.post("/pedimentos/interxel/lote", {
        pedimento_ids: [...selectedIds]
      }, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `InterXel_Lote_${selectedIds.size}_pedimentos.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSelectedIds(new Set());
      fetchPedimentos();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Error al generar InterXel masivo");
    } finally {
      setExportingLote(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedimentos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión y seguimiento de pedimentos aduanales</p>
          </div>
          <InfoModal title="Módulo de Pedimentos">
            <p>
              Revisa y gestiona todos los pedimentos extraídos, validados y auditados.
            </p>
          </InfoModal>
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={handleExportLote}
            disabled={exportingLote}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {exportingLote ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            Generar InterXel ({selectedIds.size} seleccionados)
          </button>
        )}
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
            
            {isAdmin && (
              <select
                value={operadorFilter}
                onChange={(e) => { setOperadorFilter(e.target.value); setPage(1); }}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los Operadores</option>
                {operadores.map(op => <option key={op.id} value={op.id}>{op.nombre}</option>)}
              </select>
            )}
            
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
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Seleccionar todos"
                    />
                  </th>
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
                {items.map((item) => {
                  const fueraDeRango = isFechaFueraDeRango(item);
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.has(item.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">{item.pedimento}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.referencia_interna || "Sin ref"}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                        {item.cliente_empresa}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.fecha_recepcion_sistema ? new Date(item.fecha_recepcion_sistema).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                        </span>
                        {fueraDeRango && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold uppercase tracking-wider border border-red-200 dark:border-red-800/50 animate-pulse">
                            Fuera de Fecha
                          </span>
                        )}
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
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADO_COLORS[item.estado] || ESTADO_COLORS.PENDIENTE}`}>
                            {item.estado}
                          </span>
                          {item.cruce_cove && item.cruce_cove.xmls_encontrados === 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold uppercase tracking-wider border border-red-200 dark:border-red-800/50">
                              Sin COVE
                            </span>
                          )}
                        </div>
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
                  );
                })}
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
              {selectedIds.size > 0 && (
                <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">
                  • {selectedIds.size} seleccionados
                </span>
              )}
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