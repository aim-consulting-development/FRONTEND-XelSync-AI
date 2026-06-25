"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaFileExcel,
  FaCalendarAlt,
  FaDownload,
  FaChartLine,
  FaFileInvoice,
  FaDollarSign,
  FaClock,
} from "react-icons/fa";

export default function Reportes() {
  const [reporteType, setReporteType] = useState("operaciones");
  const [periodo, setPeriodo] = useState("mes-actual");

  const stats = [
    {
      title: "Total de Pedimentos",
      value: "210",
      icon: <FaFileInvoice />,
      color: "bg-blue-500",
    },
    {
      title: "Valor Total USD",
      value: "$3.83M",
      icon: <FaDollarSign />,
      color: "bg-green-500",
    },
  ];

  
  const operacionesData = [
    {
      tipo: "IMPORTACIÓN",
      cantidad: 142,
      valorUSD: "$2,845,678.58",
      impuestosMXN: "$1,245,898.25",
      promSLA: "32.5",
    },
    {
      tipo: "EXPORTACIÓN",
      cantidad: 68,
      valorUSD: "$985,432.10",
      impuestosMXN: "-",
      promSLA: "28.3",
    },
  ];

  const handleExportExcel = () => {
    // Lógica para exportar a Excel
    console.log("Exportando a Excel...");
    alert("Exportando a Excel...");
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reportes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Análisis y exportación de datos operativos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 mb-6 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={reporteType}
              onChange={(e) => setReporteType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="operaciones">Operaciones por Periodo</option>
              <option value="impuestos">Impuestos y Contribuciones</option>
              <option value="cumplimiento">Cumplimiento SLA</option>
              <option value="productos">Productos más Importados</option>
            </select>
          </div>

          {/* Periodo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periodo
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="mes-actual">Mes Actual (Junio 2026)</option>
                <option value="mes-anterior">Mes Anterior (Mayo 2026)</option>
                <option value="trimestre">Trimestre Actual</option>
                <option value="semestre">Semestre Actual</option>
                <option value="anio">Año 2026</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botón Exportar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <FaFileExcel className="text-lg" />
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Resumen de Operaciones */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Resumen de Operaciones - Junio 2026
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full text-white text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla de Operaciones */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TIPO OPERACIÓN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CANTIDAD
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VALOR USD
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IMPUESTOS MXN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PROM. SLA (HRS)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {operacionesData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.valorUSD}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.impuestosMXN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-blue-500 dark:text-blue-400" />
                        {item.promSLA}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Gráficos adicionales (opcional) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Tendencia de Operaciones
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900 rounded-lg">
            Aquí irá la gráfica de tendencias
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Top Productos
          </h3>
          <div className="space-y-3">
            {[
              { producto: "Circuitos integrados", cantidad: 450, valor: "$2.1M" },
              { producto: "Maquinaria industrial", cantidad: 120, valor: "$1.2M" },
              { producto: "Componentes electrónicos", cantidad: 890, valor: "$890K" },
              { producto: "Materias primas", cantidad: 340, valor: "$450K" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.producto}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.cantidad}</p>
                </div>
                <p className="font-semibold text-green-600 dark:text-green-400">{item.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}