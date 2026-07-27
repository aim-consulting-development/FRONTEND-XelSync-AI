"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaTags,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function IdentificadoresPage() {
  const { canWrite } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [size] = useState(15);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");

  const fetchIdentificadores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        size: size
      });
      if (search) params.append("q", search);
      if (nivelFilter) params.append("nivel", nivelFilter);

      const res = await api.get(`/identificadores?${params.toString()}`);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, search, nivelFilter]);

  useEffect(() => {
    fetchIdentificadores();
  }, [fetchIdentificadores]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIdentificadores();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este identificador?")) return;
    try {
      await api.delete(`/identificadores/${id}`);
      fetchIdentificadores();
    } catch (error) {
      alert("Error al eliminar el identificador.");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaTags className="text-blue-500" /> Identificadores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión de identificadores a nivel pedimento y partida</p>
          </div>
          <InfoModal title="Módulo de Identificadores (Trade Compliance)">
            <p>
              Los <strong>Identificadores</strong> (Apéndice 8 del Anexo 22) detallan supuestos de aplicación específicos y declaran información adicional obligatoria tanto a Nivel Global (Cabecera) como a Nivel Partida.
            </p>
            <p>
              <strong>Impacto Aduanero:</strong> La omisión de identificadores clave (como <strong>EN, PT, TL, V1, RT</strong>) puede resultar en multas por Datos Inexactos y causar el desconocimiento de Preferencias Arancelarias (PROSEC, Regla 8va, Tratados).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Revisa que los identificadores de <strong>Nivel Partida</strong> coincidan con los requerimientos específicos de la Fracción Arancelaria.</li>
              <li>Asegúrate de incluir complementos precisos, ya que la Autoridad realiza auditorías electrónicas basadas en estos códigos.</li>
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
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </form>
          
          <div className="flex gap-3">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={nivelFilter}
                onChange={(e) => { setNivelFilter(e.target.value); setPage(1); }}
                className="pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Todos los Niveles</option>
                <option value="PEDIMENTO">PEDIMENTO</option>
                <option value="PARTIDA">PARTIDA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSpinner className="animate-spin text-4xl mb-4 text-blue-500" />
              <p>Cargando identificadores...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaSearch className="text-4xl mb-4 opacity-30" />
              <p>No se encontraron identificadores.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedimento</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nivel</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo / Clave</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complemento 1</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complemento 2</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complemento 3</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">{item.pedimento}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${item.nivel === 'PEDIMENTO' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'}`}>
                        {item.nivel}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mr-2">{item.tipo}</span>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{item.clave || "—"}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.complemento1 || "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.complemento2 || "—"}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.complemento3 || "—"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {canWrite ? (
                          <>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => alert("Función de edición en construcción")}
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Eliminar"
                              onClick={() => handleDelete(item.id)}
                            >
                              <FaTrash size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Solo lectura</span>
                        )}
                      </div>
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
