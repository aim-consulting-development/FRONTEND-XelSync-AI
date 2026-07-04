"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaFileExport,
  FaPlus,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaUpload,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFileAlt,
  FaPrint,
  FaEnvelope,
} from "react-icons/fa";

export default function Pedimentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPedimento, setSelectedPedimento] = useState(null);
  const [sortField, setSortField] = useState("fecha");
  const [sortDirection, setSortDirection] = useState("desc");
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);

  // Datos de ejemplo con más registros
  const [pedimentos, setPedimentos] = useState([
    {
      id: 1,
      numero: "240123456789",
      tipo: "Importación",
      cliente: "AIM Consulting",
      fecha: "05/06/2026",
      estado: "Procesado",
      sla: "24h",
      prioridad: "Alta",
      valor: "$45,678.00",
      agente: "Juan Pérez",
    },
    {
      id: 2,
      numero: "240123456790",
      tipo: "Exportación",
      cliente: "Tesla México",
      fecha: "05/06/2026",
      estado: "Pendiente",
      sla: "48h",
      prioridad: "Media",
      valor: "$123,456.00",
      agente: "María López",
    },
    {
      id: 3,
      numero: "240123456791",
      tipo: "Importación",
      cliente: "Flextronics",
      fecha: "04/06/2026",
      estado: "En revisión",
      sla: "12h",
      prioridad: "Alta",
      valor: "$234,567.00",
      agente: "Carlos Ruiz",
    },
    {
      id: 4,
      numero: "240123456792",
      tipo: "Importación",
      cliente: "AIM Consulting",
      fecha: "03/06/2026",
      estado: "Procesado",
      sla: "6h",
      prioridad: "Baja",
      valor: "$12,345.00",
      agente: "Juan Pérez",
    },
    {
      id: 5,
      numero: "240123456793",
      tipo: "Exportación",
      cliente: "PCE Paragon",
      fecha: "03/06/2026",
      estado: "Pendiente",
      sla: "72h",
      prioridad: "Media",
      valor: "$89,012.00",
      agente: "Ana Martínez",
    },
    {
      id: 6,
      numero: "240123456794",
      tipo: "Importación",
      cliente: "Maquilas del Norte",
      fecha: "02/06/2026",
      estado: "En revisión",
      sla: "8h",
      prioridad: "Alta",
      valor: "$567,890.00",
      agente: "Carlos Ruiz",
    },
    {
      id: 7,
      numero: "240123456795",
      tipo: "Importación",
      cliente: "AIM Consulting",
      fecha: "02/06/2026",
      estado: "Procesado",
      sla: "2h",
      prioridad: "Baja",
      valor: "$34,567.00",
      agente: "María López",
    },
  ]);

  // KPIs
  const totalPedimentos = pedimentos.length;
  const procesados = pedimentos.filter(p => p.estado === "Procesado").length;
  const pendientes = pedimentos.filter(p => p.estado === "Pendiente").length;
  const slaCritico = pedimentos.filter(p => {
    const horas = parseInt(p.sla);
    return horas <= 12 && p.estado !== "Procesado";
  }).length;

  // Filtrar datos
  const filteredData = pedimentos.filter((item) => {
    const matchesSearch = 
      item.numero.includes(searchTerm) ||
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.agente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || item.tipo === filterTipo;
    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
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

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Procesado":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "Pendiente":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "En revisión":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Procesado":
        return <FaCheckCircle className="text-green-500" />;
      case "Pendiente":
        return <FaClock className="text-yellow-500" />;
      case "En revisión":
        return <FaExclamationTriangle className="text-blue-500" />;
      default:
        return <FaTimesCircle className="text-gray-500" />;
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "Alta":
        return "text-red-600 dark:text-red-400";
      case "Media":
        return "text-yellow-600 dark:text-yellow-400";
      case "Baja":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getSLAColor = (sla) => {
    const horas = parseInt(sla);
    if (horas <= 12) return "text-red-600 dark:text-red-400";
    if (horas <= 24) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  // Funciones CRUD
  const handleAdd = () => {
    setSelectedPedimento(null);
    setShowModal(true);
  };

  const handleEdit = (pedimento) => {
    setSelectedPedimento(pedimento);
    setShowModal(true);
  };

  const handleView = (pedimento) => {
    setSelectedPedimento(pedimento);
    // Aquí iría la lógica para ver detalle
    alert(`Ver detalle de pedimento ${pedimento.numero}`);
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pedimento?")) {
      setPedimentos(pedimentos.filter(p => p.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowModal(false);
    alert(selectedPedimento ? "Pedimento actualizado" : "Pedimento creado");
  };

  const handleExport = () => {
    alert("Exportando pedimentos...");
  };

  const handlePrint = (pedimento) => {
    alert(`Imprimiendo pedimento ${pedimento.numero}`);
  };

  const handleSendEmail = (pedimento) => {
    alert(`Enviando email para pedimento ${pedimento.numero}`);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterTipo("todos");
    setFilterEstado("todos");
    setCurrentPage(1);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pedimentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestión y monitoreo de operaciones aduanales
          </p>
        </div>
        <div className="flex gap-3">
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
            Nuevo Pedimento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalPedimentos}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Procesados</p>
          <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
            {procesados}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendientes}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <p className="text-sm text-gray-500 dark:text-gray-400">SLA Crítico</p>
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">
            {slaCritico}
          </h2>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6 overflow-hidden transition-all duration-300">
        <div className="p-5">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedimento, cliente o agente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all duration-200"
            >
              <FaFilter />
              Filtros
            </button>

            {searchTerm || filterTipo !== "todos" || filterEstado !== "todos" ? (
              <button
                onClick={handleResetFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Limpiar filtros
              </button>
            ) : null}

            <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
              {filteredData.length} pedimentos encontrados
            </span>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={filterTipo}
                    onChange={(e) => {
                      setFilterTipo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="todos">Todos</option>
                    <option value="Importación">Importación</option>
                    <option value="Exportación">Exportación</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => {
                      setFilterEstado(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="todos">Todos</option>
                    <option value="Procesado">Procesado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFileAlt className="text-blue-500" />
            Lista de Pedimentos
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-sm"
          >
            <FaDownload />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("numero")}
                >
                  <div className="flex items-center gap-2">
                    Pedimento
                    {sortField === "numero" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "numero" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("tipo")}
                >
                  <div className="flex items-center gap-2">
                    Tipo
                    {sortField === "tipo" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "tipo" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("cliente")}
                >
                  <div className="flex items-center gap-2">
                    Cliente
                    {sortField === "cliente" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "cliente" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("fecha")}
                >
                  <div className="flex items-center gap-2">
                    Fecha
                    {sortField === "fecha" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "fecha" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("estado")}
                >
                  <div className="flex items-center gap-2">
                    Estado
                    {sortField === "estado" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "estado" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th 
                  className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => handleSort("sla")}
                >
                  <div className="flex items-center gap-2">
                    SLA
                    {sortField === "sla" && (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== "sla" && <FaSort className="opacity-30" />}
                  </div>
                </th>
                <th className="p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {currentItems.length > 0 ? (
                currentItems.map((pedimento) => (
                  <tr
                    key={pedimento.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {pedimento.numero}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {pedimento.agente}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${getPrioridadColor(pedimento.prioridad)}`}>
                        {pedimento.tipo}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {pedimento.cliente}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {pedimento.valor}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {pedimento.fecha}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusColor(pedimento.estado)}`}>
                        {getStatusIcon(pedimento.estado)}
                        {pedimento.estado}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-bold ${getSLAColor(pedimento.sla)}`}>
                        {pedimento.sla}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(pedimento)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver detalle"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEdit(pedimento)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePrint(pedimento)}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleSendEmail(pedimento)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Enviar email"
                        >
                          <FaEnvelope />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FaSearch className="text-4xl opacity-30" />
                      <p className="text-lg font-medium">No se encontraron pedimentos</p>
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
              <span className="font-medium">{filteredData.length}</span> pedimentos
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedPedimento ? "Editar Pedimento" : "Nuevo Pedimento"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Pedimento
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.numero || ""}
                      placeholder="Ej: 240123456789"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.tipo || "Importación"}
                    >
                      <option value="Importación">Importación</option>
                      <option value="Exportación">Exportación</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cliente
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.cliente || ""}
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agente Aduanal
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.agente || ""}
                      placeholder="Nombre del agente"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.fecha || ""}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.estado || "Pendiente"}
                    >
                      <option value="Procesado">Procesado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revisión">En revisión</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SLA (horas)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.sla || "24h"}
                      placeholder="Ej: 24h"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridad
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedPedimento?.prioridad || "Media"}
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor (USD)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    defaultValue={selectedPedimento?.valor || ""}
                    placeholder="$0.00"
                  />
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
                  {selectedPedimento ? "Guardar Cambios" : "Crear Pedimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}