"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice,
  FaDollarSign,
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileAlt,
  FaEye,
  FaChartLine,
  FaFileImport,
  FaFileExport,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("semana");

  // Datos de tarjetas KPI
  const kpiCards = [
    {
      title: "Operaciones del Día",
      value: "12",
      change: "+8%",
      trend: "up",
      icon: <FaFileInvoice />,
      color: "bg-blue-500",
    },
    {
      title: "Valor en Aduana (USD)",
      value: "$2,345,678",
      change: "+12%",
      trend: "up",
      icon: <FaDollarSign />,
      color: "bg-green-500",
    },
    {
      title: "Impuestos Pagados (MXN)",
      value: "$456,789",
      change: "+5%",
      trend: "up",
      icon: <FaMoneyBillWave />,
      color: "bg-purple-500",
    },
    {
      title: "Pendientes de Revisión",
      value: "5",
      change: "-2%",
      trend: "down",
      icon: <FaClock />,
      color: "bg-orange-500",
    },
  ];

  // Datos de tendencia de pedimentos (últimos 7 días)
  const trendData = [
    { date: "28 May", pedimentos: 8 },
    { date: "29 May", pedimentos: 12 },
    { date: "30 May", pedimentos: 14 },
    { date: "31 May", pedimentos: 15 },
    { date: "01 Jun", pedimentos: 11 },
    { date: "02 Jun", pedimentos: 14 },
    { date: "03 Jun", pedimentos: 12 },
  ];

  // Datos de distribución por tipo de operación
  const operacionData = [
    { name: "Importación", value: 142, percentage: 68, color: "#3B82F6" },
    { name: "Exportación", value: 68, percentage: 32, color: "#10B981" },
  ];

  // Datos de estados de pedimentos
  const estadosData = [
    { name: "Aprobados", value: 142, percentage: 68, color: "#22C55E" },
    { name: "En Revisión", value: 35, percentage: 17, color: "#EAB308" },
    { name: "Borrador", value: 18, percentage: 9, color: "#F97316" },
    { name: "Incompleto", value: 15, percentage: 7, color: "#EF4444" },
  ];

  // Datos de alertas SLA
  const alertasData = [
    {
      id: 1,
      pedimento: "26 48 3949 6001064",
      cliente: "AIM S.A. de C.V.",
      tiempo: "2.5h restantes",
      estado: "EN RIESGO",
      estadoColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: 2,
      pedimento: "26 64 1733 6000425",
      cliente: "Logística Internacional de México",
      tiempo: "Vencido hace 4h",
      estado: "VENCIDO",
      estadoColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      id: 3,
      pedimento: "26 48 3950 6001125",
      cliente: "AIM S.A. de C.V.",
      tiempo: "8h restantes",
      estado: "EN RIESGO",
      estadoColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  // Datos de últimas operaciones
  const ultimasOperaciones = [
    {
      id: 1,
      pedimento: "26 48 3949 6001064",
      tipo: "IMPO",
      cliente: "AIM S.A. de C.V.",
      fecha: "03/06/2026",
      estado: "BORRADOR",
      sla: "EN RIESGO",
      slaColor: "text-orange-600 dark:text-orange-400",
    },
    {
      id: 2,
      pedimento: "26 64 1733 6000425",
      tipo: "EXPO",
      cliente: "PCE PARAGON SA DE CV",
      fecha: "03/06/2026",
      estado: "APROBADO",
      sla: "A TIEMPO",
      slaColor: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      pedimento: "26 48 3950 6001125",
      tipo: "IMPO",
      cliente: "AIM S.A. de C.V.",
      fecha: "02/06/2026",
      estado: "EN REVISIÓN",
      sla: "EN RIESGO",
      slaColor: "text-orange-600 dark:text-orange-400",
    },
    {
      id: 4,
      pedimento: "26 64 1734 6000789",
      tipo: "EXPO",
      cliente: "Maquilas del Norte",
      fecha: "02/06/2026",
      estado: "APROBADO",
      sla: "A TIEMPO",
      slaColor: "text-green-600 dark:text-green-400",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Pedimentos: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg text-white`}>
                {card.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  card.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {card.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}
                {card.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {card.title}
            </p>
          </div>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Tendencia de Pedimentos */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Tendencias de Pedimentos (Últimos 7 días)
            </h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
            >
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
              <option value="trimestre">Último trimestre</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="pedimentos"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alertas SLA */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-500" />
              Alertas SLA
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {alertasData.map((alerta) => (
              <div key={alerta.id} className={`p-4 ${alerta.bgColor}`}>
                <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {alerta.pedimento}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alerta.cliente}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {alerta.tiempo}
                  </p>
                  <p className={`text-xs font-semibold ${alerta.estadoColor}`}>
                    {alerta.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribución por Tipo de Operación */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaFileImport className="text-blue-500" />
            Distribución por Tipo de Operación
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={operacionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {operacionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {operacionData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estados de Pedimentos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Estados de Pedimentos
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={estadosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {estadosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {estadosData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tasa de Aprobación
                  </span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    68%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Operaciones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFileAlt className="text-purple-500" />
            Últimas Operaciones
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PEDIMENTO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  TIPO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CLIENTE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  FECHA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {ultimasOperaciones.map((operacion) => (
                <tr
                  key={operacion.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-white">
                    {operacion.pedimento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        operacion.tipo === "IMPO"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {operacion.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {operacion.cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {operacion.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        operacion.estado === "APROBADO"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : operacion.estado === "EN REVISIÓN"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {operacion.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${operacion.slaColor}`}>
                      {operacion.sla}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200">
                      <FaEye className="text-xs" />
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}