"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaSearch,
  FaPlus,
  FaFileExport,
  FaEdit,
  FaTrash,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaUpload,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

export default function CatalogosPage() {
  const [activeTab, setActiveTab] = useState("Materiales");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortField, setSortField] = useState("clave");
  const [sortDirection, setSortDirection] = useState("asc");
  const [itemsPerPage] = useState(5);

  const tabs = ["Materiales", "Clientes", "Proveedores", "Fracciones"];

  // Datos de ejemplo por categoría
  const allData = {
    Materiales: [
      { id: 1, clave: "MAT-001", descripcion: "Microcontrolador STM32", categoria: "Electrónicos", estatus: "Activo", fechaCreacion: "2024-01-15" },
      { id: 2, clave: "MAT-002", descripcion: "Sensor de Temperatura", categoria: "Electrónicos", estatus: "Activo", fechaCreacion: "2024-01-20" },
      { id: 3, clave: "MAT-003", descripcion: "Conector USB-C", categoria: "Accesorios", estatus: "Inactivo", fechaCreacion: "2024-02-01" },
      { id: 4, clave: "MAT-004", descripcion: "Resistencia 10kΩ", categoria: "Electrónicos", estatus: "Activo", fechaCreacion: "2024-02-10" },
      { id: 5, clave: "MAT-005", descripcion: "Capacitor 100µF", categoria: "Electrónicos", estatus: "Activo", fechaCreacion: "2024-02-15" },
      { id: 6, clave: "MAT-006", descripcion: "Transistor BC547", categoria: "Electrónicos", estatus: "Inactivo", fechaCreacion: "2024-03-01" },
      { id: 7, clave: "MAT-007", descripcion: "LED Rojo 5mm", categoria: "Iluminación", estatus: "Activo", fechaCreacion: "2024-03-10" },
    ],
    Clientes: [
      { id: 8, clave: "CLI-001", descripcion: "AIM S.A. de C.V.", categoria: "Empresa", estatus: "Activo", fechaCreacion: "2024-01-10" },
      { id: 9, clave: "CLI-002", descripcion: "PCE PARAGON SA DE CV", categoria: "Empresa", estatus: "Activo", fechaCreacion: "2024-01-25" },
      { id: 10, clave: "CLI-003", descripcion: "Maquilas del Norte", categoria: "Empresa", estatus: "Inactivo", fechaCreacion: "2024-02-05" },
    ],
    Proveedores: [
      { id: 11, clave: "PRO-001", descripcion: "Distribuidora Electrónica", categoria: "Nacional", estatus: "Activo", fechaCreacion: "2024-01-05" },
      { id: 12, clave: "PRO-002", descripcion: "Importaciones Globales", categoria: "Internacional", estatus: "Activo", fechaCreacion: "2024-01-18" },
      { id: 13, clave: "PRO-003", descripcion: "Suministros Industriales", categoria: "Nacional", estatus: "Inactivo", fechaCreacion: "2024-02-20" },
    ],
    Fracciones: [
      { id: 14, clave: "FRA-001", descripcion: "8542.31.01", categoria: "Electrónicos", estatus: "Activo", fechaCreacion: "2024-01-08" },
      { id: 15, clave: "FRA-002", descripcion: "9025.80.02", categoria: "Instrumentos", estatus: "Activo", fechaCreacion: "2024-01-22" },
      { id: 16, clave: "FRA-003", descripcion: "8471.50.01", categoria: "Computación", estatus: "Inactivo", fechaCreacion: "2024-02-12" },
    ],
  };

  // KPIs por categoría
  const kpis = {
    Materiales: 2154,
    Clientes: 145,
    Proveedores: 328,
    Fracciones: 987,
  };

  const currentData = allData[activeTab] || [];
  const totalItems = kpis[activeTab] || 0;

  // Filtrar datos
  const filteredData = currentData.filter((item) => {
    const matchesSearch = 
      item.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || item.estatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Ordenar datos
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar página
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Cambiar orden
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Funciones CRUD
  const handleAdd = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm(`¿Estás seguro de que deseas eliminar este registro?`)) {
      alert(`Registro ${id} eliminado`);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowModal(false);
    alert(selectedItem ? "Registro actualizado" : "Registro creado");
  };

  const handleExport = () => {
    alert(`Exportando datos de ${activeTab}...`);
  };

  const handleImport = () => {
    alert(`Importando datos de ${activeTab}...`);
  };

  const getStatusBadge = (status) => {
    return status === "Activo" 
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  };

  const getStatusIcon = (status) => {
    return status === "Activo" 
      ? <FaCheckCircle className="text-green-500" />
      : <FaTimesCircle className="text-red-500" />;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Catálogos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administración de catálogos maestros
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
          >
            <FaUpload />
            Importar
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
          >
            <FaFileExport />
            Exportar
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <FaPlus />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`
              bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border transition-all duration-300 cursor-pointer
              ${activeTab === tab 
                ? "border-blue-500 dark:border-blue-400 shadow-blue-100 dark:shadow-blue-900/20" 
                : "border-gray-200 dark:border-slate-700 hover:shadow-xl hover:scale-[1.02]"}
            `}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm("");
              setFilterStatus("todos");
              setCurrentPage(1);
            }}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{tab}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpis[tab].toLocaleString()}
            </h2>
          </div>
        ))}
      </div>

      {/* Tabs y Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6 overflow-hidden transition-all duration-300">
        <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm("");
                setFilterStatus("todos");
                setCurrentPage(1);
              }}
              className={`
                px-6 py-4 font-medium transition-all duration-200
                ${activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="p-5 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por clave, descripción o categoría..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredData.length} registros encontrados
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("clave")}
                >
                  <div className="flex items-center gap-2">
                    Clave
                    {sortField === "clave" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "clave" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("descripcion")}
                >
                  <div className="flex items-center gap-2">
                    Descripción
                    {sortField === "descripcion" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "descripcion" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("categoria")}
                >
                  <div className="flex items-center gap-2">
                    Categoría
                    {sortField === "categoria" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "categoria" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("estatus")}
                >
                  <div className="flex items-center gap-2">
                    Estatus
                    {sortField === "estatus" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "estatus" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <td className="p-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {item.clave}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {item.descripcion}
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusBadge(item.estatus)}`}>
                        {getStatusIcon(item.estatus)}
                        {item.estatus}
                      </span>
                    </td>
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
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaSearch className="text-4xl opacity-30" />
                      <p>No se encontraron registros</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredData.length)}
              </span> de{" "}
              <span className="font-medium">{filteredData.length}</span> registros
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === number
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Creación/Edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 transition-all duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedItem ? "Editar Registro" : "Nuevo Registro"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clave
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedItem?.clave || ""}
                    placeholder="Ej: MAT-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedItem?.descripcion || ""}
                    placeholder="Descripción del registro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedItem?.categoria || ""}
                    placeholder="Categoría"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estatus
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedItem?.estatus || "Activo"}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedItem ? "Guardar Cambios" : "Crear Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}