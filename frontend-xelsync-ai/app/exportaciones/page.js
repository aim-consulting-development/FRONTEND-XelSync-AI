"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaPlaneDeparture,
} from "react-icons/fa";

export default function ExportacionesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [size] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [aduanaFilter, setAduanaFilter] = useState("");

  const fetchExportaciones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        size: size
      });
      if (search) params.append("q", search);
      if (aduanaFilter) params.append("aduana", aduanaFilter);

      const res = await api.get(`/exportaciones?${params.toString()}`);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, aduanaFilter]);

  useEffect(() => {
    fetchExportaciones();
  }, [fetchExportaciones]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExportaciones();
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaPlaneDeparture className="text-emerald-500" /> Exportaciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión e historial de pedimentos de exportación procesados</p>
          </div>
          <InfoModal title="Módulo de Exportaciones (Trade Compliance)">
            <p>
              El módulo de <strong>Exportaciones</strong> consolida la extracción y validación de pedimentos de exportación (ej. claves <strong>RT, V1, IN</strong>).
            </p>
            <p>
              <strong>Impacto Aduanero:</strong> Es vital comprobar que las cantidades descargadas de los pedimentos de importación temporal (IMMEX) cuadren exactamente con lo exportado. Los errores de digitación en los pedimentos de retorno (RT) generan saldos vencidos en el Anexo 24 y Anexo 30, provocando cobros de IVA retroactivos y posibles embargos precautorios.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Valida el <strong>Valor Comercial</strong> y los <strong>Incoterms</strong> (ej. FCA, DAP, DDP).</li>
              <li>Asegúrate de que el pedimento cuente con acuse de validación (DODA/PITA) antes de consolidar el embarque.</li>
            </ul>
          </InfoModal>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] max-w-md relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de pedimento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
          </form>
          
          <div className="flex gap-3">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Filtro Aduana (ej. 430)"
                value={aduanaFilter}
                onChange={(e) => { setAduanaFilter(e.target.value); setPage(1); }}
                className="pl-8 pr-4 py-2 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSpinner className="animate-spin text-4xl mb-4 text-emerald-500" />
              <p>Cargando exportaciones...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSearch className="text-4xl mb-4 opacity-30" />
              <p>No se encontraron operaciones de exportación.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedimento</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aduana</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Régimen</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clave</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Tipo de Cambio</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{item.pedimento}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.descripcion || "Sin descripción"}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.aduana} {item.seccion ? `- ${item.seccion}` : ""}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                      {item.regimen}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {item.clave_pedimento || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right font-mono text-gray-600 dark:text-gray-400">
                      ${Number(item.tipo_cambio).toFixed(4)}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(item.fecha_pago).toLocaleDateString()}
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
