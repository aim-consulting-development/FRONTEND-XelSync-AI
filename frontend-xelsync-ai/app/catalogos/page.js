"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import {
  FaSearch,
  FaPlus,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaSync,
} from "react-icons/fa";

// Mapeo de tabs a endpoints del backend
const TAB_CONFIG = {
  Materiales: {
    endpoint: "/catalogos/materiales",
    fields: ["clave", "descripcion", "categoria_imp", "activo"],
    labels: { clave: "Clave", descripcion: "Descripción", categoria_imp: "Categoría", activo: "Estatus" },
    createFields: ["clave", "descripcion", "categoria_imp"],
  },
  Proveedores: {
    endpoint: "/catalogos/proveedores",
    fields: ["clave", "nombre", "pais", "activo"],
    labels: { clave: "Clave", nombre: "Nombre", pais: "País", activo: "Estatus" },
    createFields: ["clave", "nombre", "pais"],
  },
  Clientes: {
    endpoint: "/catalogos/clientes",
    fields: ["clave", "nombre", "nacionalidad", "activo"],
    labels: { clave: "Clave", nombre: "Nombre", nacionalidad: "Nacionalidad", activo: "Estatus" },
    createFields: ["clave", "nombre", "nacionalidad"],
  },
  Fracciones: {
    endpoint: "/catalogos/fracciones",
    fields: ["clave", "descripcion", "unidad_medida"],
    labels: { clave: "Fracción", descripcion: "Descripción", unidad_medida: "Unidad" },
    createFields: [],
    readOnly: true,
  },
};

const TABS = Object.keys(TAB_CONFIG);

export default function CatalogosPage() {
  const { canWrite } = useAuth();
  const [activeTab, setActiveTab] = useState("Materiales");
  const [items, setItems] = useState([]);
  const [totales, setTotales] = useState({ Materiales: 0, Proveedores: 0, Clientes: 0, Fracciones: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("clave");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const PAGE_SIZE = 15;
  const config = TAB_CONFIG[activeTab];

  // Cargar totales de todas las categorías al inicio
  useEffect(() => {
    const fetchTotales = async () => {
      try {
        const results = await Promise.allSettled(
          TABS.map((tab) => api.get(`${TAB_CONFIG[tab].endpoint}?size=1`))
        );
        const newTotales = {};
        TABS.forEach((tab, i) => {
          if (results[i].status === "fulfilled") {
            newTotales[tab] = results[i].value.data.total || 0;
          } else {
            newTotales[tab] = 0;
          }
        });
        setTotales(newTotales);
      } catch (e) {
        console.error("Error fetching totales", e);
      }
    };
    fetchTotales();
  }, []);

  // Cargar datos del tab activo
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        size: PAGE_SIZE,
        ...(searchTerm ? { q: searchTerm } : {}),
      });
      const res = await api.get(`${config.endpoint}?${params}`);
      const data = res.data;
      setItems(data.items || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page cuando cambia tab o búsqueda
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [activeTab]);

  // Ordenar localmente
  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortField] ?? "";
    const bVal = b[sortField] ?? "";
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDirection("asc"); }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.clave || item.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`${config.endpoint}/${item.id}`);
      fetchData();
      // Actualizar total
      setTotales((prev) => ({ ...prev, [activeTab]: Math.max(0, (prev[activeTab] || 1) - 1) }));
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar el registro.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (selectedItem) {
        await api.put(`${config.endpoint}/${selectedItem.id}`, formData);
      } else {
        await api.post(config.endpoint, formData);
        setTotales((prev) => ({ ...prev, [activeTab]: (prev[activeTab] || 0) + 1 }));
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al guardar el registro.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    // Simulate upload or actual endpoint if exists
    // const formData = new FormData();
    // formData.append('file', uploadFile);
    // await api.post(`${config.endpoint}/upload`, formData);
    
    alert(`Archivo "${uploadFile.name}" preparado para procesar en el catálogo de ${activeTab}. (Funcionalidad simulada para la demo)`);
    setShowUploadModal(false);
    setUploadFile(null);
  };


  const getStatusBadge = (val) =>
    val
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";

  const renderCellValue = (item, field) => {
    const val = item[field];
    if (field === "activo") {
      return (
        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold w-fit ${getStatusBadge(val)}`}>
          {val ? <FaCheckCircle /> : <FaTimesCircle />}
          {val ? "Activo" : "Inactivo"}
        </span>
      );
    }
    return <span className="text-sm text-gray-700 dark:text-gray-300">{val ?? "—"}</span>;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Administración de catálogos maestros</p>
          </div>
          <InfoModal title="Módulo de Catálogos (Trade Compliance)">
            <p>
              Mantener los <strong>Catálogos de Comercio Exterior</strong> sincronizados (Materiales, Proveedores, Clientes y Fracciones) es fundamental para evitar inconsistencias en el Anexo 24 y Anexo 30.
            </p>
            <p>
              <strong>Impacto Aduanero:</strong> Las multas por declarar claves o descripciones inexactas pueden ser considerables (Art. 184 L.A.). Además, la correcta clasificación arancelaria garantiza el pago adecuado de contribuciones y el cumplimiento de Regulaciones y Restricciones No Arancelarias (RRNAs).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verifica que la <strong>Fracción Arancelaria</strong> coincida con el Sistema Armonizado (TIGIE).</li>
              <li>Actualiza regularmente los proveedores (Tax ID/Tax Payer) para asegurar la trazabilidad del T-MEC y otros Tratados de Libre Comercio.</li>
            </ul>
          </InfoModal>
        </div>
        {!config.readOnly && canWrite && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <FaUpload />
              Carga Masiva
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <FaPlus />
              Nuevo {activeTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* KPIs / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border transition-all duration-300 cursor-pointer ${
              activeTab === tab
                ? "border-blue-500 dark:border-blue-400 shadow-blue-100 dark:shadow-blue-900/20 scale-[1.02]"
                : "border-gray-200 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02]"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{tab}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {totales[tab]?.toLocaleString() ?? "…"}
            </h2>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6">
        {/* Tab bar */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-5 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar en ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalItems.toLocaleString()} registros totales
          </span>
          <button onClick={fetchData} className="p-2 text-blue-500 hover:text-blue-700 transition-colors" title="Recargar">
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                {config.fields.map((field) => (
                  <th
                    key={field}
                    className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center gap-2">
                      {config.labels[field]}
                      {sortField === field ? (
                        sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort className="opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
                {!config.readOnly && canWrite && (
                  <th className="p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={config.fields.length + 1} className="p-10 text-center">
                    <FaSpinner className="animate-spin text-3xl text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={config.fields.length + 1} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <FaSearch className="text-4xl opacity-30 mx-auto mb-2" />
                    <p>No se encontraron registros</p>
                    {searchTerm && <p className="text-sm mt-1">Intenta ajustar tu búsqueda</p>}
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    {config.fields.map((field) => (
                      <td key={field} className="p-4">
                        {field === "clave" ? (
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{item[field]}</span>
                        ) : (
                          renderCellValue(item, field)
                        )}
                      </td>
                    ))}
                    {!config.readOnly && canWrite && (
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Página <span className="font-medium">{currentPage}</span> de{" "}
              <span className="font-medium">{totalPages}</span> — {totalItems.toLocaleString()} registros totales
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && !config.readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedItem ? `Editar ${activeTab.slice(0, -1)}` : `Nuevo ${activeTab.slice(0, -1)}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xl">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                {config.createFields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {config.labels[field] || field}
                    </label>
                    <input
                      type="text"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
                {selectedItem && "activo" in selectedItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estatus</label>
                    <select
                      value={formData.activo ? "true" : "false"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.value === "true" }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading && <FaSpinner className="animate-spin" />}
                  {selectedItem ? "Guardar Cambios" : "Crear Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaUpload className="text-blue-500" /> Carga Masiva - {activeTab}
              </h2>
              <button
                type="button"
                onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                className="relative z-10 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-4 sm:p-6 flex flex-col gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Sube un archivo de Excel (.xlsx, .xls) o CSV con los registros de <strong>{activeTab}</strong>.
              </div>
              <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-900/30">
                <FaFileExport className="text-4xl text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                  {uploadFile ? uploadFile.name : "Haz clic o arrastra un archivo"}
                </p>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title=""
                />
                {!uploadFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Formatos soportados: Excel, CSV
                  </p>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaUpload />
                  Procesar Archivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}