"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaUpload,
  FaPlay,
  FaFileExcel,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaChartLine,
  FaSync,
  FaCalendarAlt,
  FaFilter,
  FaEye,
} from "react-icons/fa";

export default function ConciliacionPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026-06");
  const [operationType, setOperationType] = useState("todas");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const stats = [
    {
      title: "Conciliaciones",
      value: "24",
      icon: <FaCheckCircle className="text-green-500" size={30} />,
      color: "text-green-500",
    },
    {
      title: "Diferencias",
      value: "11",
      icon: <FaExclamationTriangle className="text-red-500" size={30} />,
      color: "text-red-500",
    },
    {
      title: "Procesadas",
      value: "98%",
      icon: <FaCheckCircle className="text-green-500" size={30} />,
      color: "text-green-600",
    },
    {
      title: "Última Ejecución",
      value: "Hoy",
      icon: <FaClock className="text-blue-500" size={30} />,
      color: "text-blue-500",
    },
  ];

  const historial = [
    {
      periodo: "Mayo 2026",
      fecha: "05/06/2026",
      diferencias: 3,
      estado: "Completado",
      estadoColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      reporte: true,
    },
    {
      periodo: "Abril 2026",
      fecha: "02/05/2026",
      diferencias: 0,
      estado: "Completado",
      estadoColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      reporte: true,
    },
    {
      periodo: "Marzo 2026",
      fecha: "04/04/2026",
      diferencias: 8,
      estado: "Revisión",
      estadoColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
      reporte: false,
    },
    {
      periodo: "Febrero 2026",
      fecha: "05/03/2026",
      diferencias: 12,
      estado: "Pendiente",
      estadoColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
      reporte: false,
    },
    {
      periodo: "Enero 2026",
      fecha: "04/02/2026",
      diferencias: 5,
      estado: "Completado",
      estadoColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      reporte: true,
    },
  ];

  const handleExecute = () => {
    setIsProcessing(true);
    // Simular proceso de conciliación
    setTimeout(() => {
      setIsProcessing(false);
      alert("Conciliación ejecutada correctamente");
    }, 3000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file.name);
      alert(`Archivo ${file.name} cargado correctamente`);
    }
  };

  const handleDownloadReport = (periodo) => {
    console.log(`Descargando reporte de ${periodo}`);
    alert(`Descargando reporte de ${periodo}`);
  };

  return (
    <MainLayout>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Conciliación SAT
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comparación automática entre sistema y SAT
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <h2 className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </h2>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuración + Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configuración */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaSync className="text-blue-500" />
              Configuración de Conciliación
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Periodo
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Operación
                </label>
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <select
                    value={operationType}
                    onChange={(e) => setOperationType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <option value="todas">Todas</option>
                    <option value="importacion">Importación</option>
                    <option value="exportacion">Exportación</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExecute}
                disabled={isProcessing}
                className={`
                  w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200
                  ${isProcessing 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] shadow-md"}
                  text-white font-medium
                `}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaPlay />
                    Ejecutar Conciliación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Estado del Proceso */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-green-500" />
              Estado del Proceso
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Extracción SAT</span>
                  <span className="font-semibold text-gray-900 dark:text-white">100%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-green-500 rounded-full w-full transition-all duration-500"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Comparación</span>
                  <span className="font-semibold text-gray-900 dark:text-white">75%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-blue-500 rounded-full w-3/4 transition-all duration-500"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Generación Reporte</span>
                  <span className="font-semibold text-gray-900 dark:text-white">40%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-yellow-500 rounded-full w-2/5 transition-all duration-500"></div>
                </div>
              </div>

              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                    Procesando conciliación...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carga de archivos - Versión alternativa */}
<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300 mb-8">
  <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
      <FaUpload className="text-purple-500" />
      Archivos SAT
    </h2>
  </div>
  <div className="p-8">
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className={`
          w-full
          border-2 border-dashed rounded-xl p-12
          transition-all duration-200
          flex flex-col items-center justify-center
          ${uploadedFile 
            ? "border-green-500 bg-green-50 dark:bg-green-900/10" 
            : "border-gray-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"}
        `}
      >
        <input
          type="file"
          accept=".xlsx,.csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <FaUpload
          size={48}
          className={`mb-4 ${uploadedFile ? "text-green-500" : "text-gray-400 dark:text-gray-500"}`}
        />
        
        {uploadedFile ? (
          <>
            <p className="font-medium text-gray-900 dark:text-white text-base">
              {uploadedFile}
            </p>
            <div className="flex gap-3 mt-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                Cambiar archivo
              </label>
              <button
                onClick={() => setUploadedFile(null)}
                className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                Eliminar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Arrastra y suelta tu archivo aquí
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              o
            </p>
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 inline-flex items-center gap-2 font-medium"
            >
              <FaUpload size={14} />
              Seleccionar archivo
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Formatos soportados: XLSX, CSV, TXT (Máx. 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  </div>
</div>

      {/* Historial */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Conciliaciones
          </h2>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Diferencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reporte
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {historial.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.periodo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {item.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        item.diferencias > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {item.diferencias}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.estadoColor}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleDownloadReport(item.periodo)}
                      disabled={!item.reporte}
                      className={`
                        inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all duration-200
                        ${item.reporte 
                          ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" 
                          : "text-gray-400 dark:text-gray-600 cursor-not-allowed"}
                      `}
                    >
                      <FaFileExcel />
                      {item.reporte ? "Exportar" : "Pendiente"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer del historial */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Mostrando {historial.length} registros
            </span>
            <button className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <FaDownload size={12} />
              Exportar historial
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}