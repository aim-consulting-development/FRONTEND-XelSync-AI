"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
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
  FaSpinner,
  FaSync,
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
  ResponsiveContainer,
} from "recharts";

const ESTADO_COLORS = {
  INTERXEL_GENERADO: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  APROBADO: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  PROCESADO: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  EN_REVISION: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  PENDIENTE: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  INCOMPLETO: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  BORRADOR: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
};

const SLA_COLORS = {
  A_TIEMPO: "text-green-600 dark:text-green-400",
  EN_RIESGO: "text-orange-600 dark:text-orange-400",
  VENCIDO: "text-red-600 dark:text-red-400",
};

const SLA_BG = {
  EN_RIESGO: "bg-orange-50 dark:bg-orange-900/20",
  VENCIDO: "bg-red-50 dark:bg-red-900/20",
};

export default function Dashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [ultimasOps, setUltimasOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clienteFilter, setClienteFilter] = useState("");
  const [clientes, setClientes] = useState([]);
  const [bitacoraOperadores, setBitacoraOperadores] = useState([]);
  const { isAdmin } = useAuth();

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (clienteFilter) params.append("cliente_empresa", clienteFilter);
      
      const kpisUrl = `/dashboard/kpis${clienteFilter ? '?' + params.toString() : ''}`;
      
      const [kpisRes, alertasRes, opsRes, bitacoraRes] = await Promise.all([
        api.get(kpisUrl),
        api.get("/dashboard/alertas-sla"),
        api.get(`/pedimentos?size=6&page=1${clienteFilter ? '&' + params.toString() : ''}`),
        isAdmin ? api.get("/dashboard/bitacora/operadores") : Promise.resolve({ data: [] }),
      ]);
      setKpis(kpisRes.data);
      setAlertas(alertasRes.data);
      setUltimasOps(opsRes.data.items || []);
      if (isAdmin) setBitacoraOperadores(bitacoraRes.data);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      api.get("/usuarios/cartera/todos-los-clientes").then(res => {
        setClientes(res.data.clientes || []);
      }).catch(err => console.error(err));
    } else {
      api.get("/usuarios/me/cartera").then(res => {
        setClientes(res.data.empresas || []);
      }).catch(err => console.error(err));
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [clienteFilter]);

  const formatUSD = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val || 0);
  const formatMXN = (val) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(val || 0);

  const variacion = kpis?.variacion_dia_anterior || {};

  const kpiCards = kpis
    ? [
        {
          title: "Pedimentos Hoy",
          value: kpis.pedimentos_hoy,
          change: variacion.pedimentos >= 0 ? `+${variacion.pedimentos}` : `${variacion.pedimentos}`,
          trend: variacion.pedimentos >= 0 ? "up" : "down",
          icon: <FaFileInvoice />,
          color: "bg-blue-500",
        },
        {
          title: "Valor en Aduana (USD)",
          value: formatUSD(kpis.total_importado_usd),
          change: variacion.valor_usd >= 0 ? `+${formatUSD(variacion.valor_usd)}` : formatUSD(variacion.valor_usd),
          trend: variacion.valor_usd >= 0 ? "up" : "down",
          icon: <FaDollarSign />,
          color: "bg-green-500",
        },
        {
          title: "Impuestos Pagados (MXN)",
          value: formatMXN(kpis.impuestos_pagados_mxn),
          change: variacion.impuestos >= 0 ? `+${formatMXN(variacion.impuestos)}` : formatMXN(variacion.impuestos),
          trend: variacion.impuestos >= 0 ? "up" : "down",
          icon: <FaMoneyBillWave />,
          color: "bg-purple-500",
        },
        {
          title: "Discrepancias Pendientes",
          value: kpis.discrepancias_pendientes,
          change: `Tasa errores: ${kpis.tasa_errores}%`,
          trend: kpis.discrepancias_pendientes === 0 ? "up" : "down",
          icon: <FaClock />,
          color: "bg-orange-500",
        },
      ]
    : [];

  // Tendencia: últimos 30 días del backend, mostrar últimos 10 para el gráfico
  const trendData = (kpis?.pedimentos_tendencia_30d || [])
    .slice(-10)
    .map((d) => ({ date: d.fecha.slice(5), pedimentos: d.cantidad }));

  // PieChart de SLA desde alertas
  const slaConteo = alertas.reduce(
    (acc, a) => {
      acc[a.estado] = (acc[a.estado] || 0) + 1;
      return acc;
    },
    {}
  );
  const slaPieData = [
    { name: "En Riesgo", value: slaConteo["EN_RIESGO"] || 0, color: "#F97316" },
    { name: "Vencido", value: slaConteo["VENCIDO"] || 0, color: "#EF4444" },
  ].filter((d) => d.value > 0);

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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <p className="text-gray-500 dark:text-gray-400">Cargando datos del dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Datos en tiempo real del sistema</p>
          </div>
          <InfoModal title="Dashboard">
            <p>
              Vista general de las métricas clave de la operación.
            </p>
          </InfoModal>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Pestañas por cliente */}
      {clientes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <button
            onClick={() => setClienteFilter("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              clienteFilter === "" 
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
            }`}
          >
            Todos los Clientes
          </button>
          {clientes.map(c => (
            <button
              key={c.cliente_empresa}
              onClick={() => setClienteFilter(c.cliente_empresa)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                clienteFilter === c.cliente_empresa 
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              {c.cliente_empresa}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg text-white`}>{card.icon}</div>
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  card.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {card.trend === "up" ? <FaArrowUp /> : <FaArrowDown />}
                <span className="truncate max-w-[90px] text-xs">{card.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{card.value}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Estadísticas Personales (Solo Operador) */}
      {kpis?.mis_estadisticas && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-5 border border-blue-100 dark:border-slate-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaEye className="text-blue-500" />
            Mis Estadísticas Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Asignados</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.mis_estadisticas.total_asignados}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center border-b-4 border-purple-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">InterXel Generados (Listos)</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{kpis.mis_estadisticas.interxel_generados}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center border-b-4 border-orange-500">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes por Extraer</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{kpis.mis_estadisticas.pendientes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Rendimiento por Operador (Solo Admin) */}
        {kpis?.operadores_data && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 col-span-1 lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Operadores (Pedimentos Procesados)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.operadores_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Eficiencia de Operadores (Bitácora) */}
        {isAdmin && bitacoraOperadores.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Eficiencia de Operadores (SLA 8 Hrs)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Operador</th>
                    <th className="px-4 py-3">Inicio de Sesión</th>
                    <th className="px-4 py-3">Horas Activas</th>
                    <th className="px-4 py-3">Estado SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacoraOperadores.map((bo, idx) => (
                    <tr key={idx} className="border-b dark:border-slate-700 bg-white dark:bg-slate-800">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{bo.operador}</td>
                      <td className="px-4 py-3">{new Date(bo.inicio_sesion).toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono">{bo.horas_activas.toFixed(2)}h</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bo.excedido ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {bo.excedido ? "SLA EXCEDIDO" : "EN TIEMPO"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tendencia de pedimentos */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Tendencia de Pedimentos (últimos 30 días)
            </h2>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9CA3AF" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="pedimentos"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 dark:text-gray-500">
              <p>No hay datos de tendencia disponibles aún.</p>
            </div>
          )}
        </div>

        {/* Alertas SLA */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-500" />
              Alertas SLA
              {alertas.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {alertas.length}
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
            {alertas.length === 0 ? (
              <div className="p-6 text-center text-gray-400 dark:text-gray-500">
                <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-2" />
                <p className="text-sm">Todos los pedimentos en SLA ✓</p>
              </div>
            ) : (
              alertas.map((alerta, i) => (
                <div key={i} className={`p-4 ${SLA_BG[alerta.estado] || ""}`}>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {alerta.pedimento}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                    {alerta.cliente_empresa}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {alerta.horas_restantes > 0
                        ? `${alerta.horas_restantes}h restantes`
                        : `Vencido hace ${Math.abs(alerta.horas_restantes).toFixed(1)}h`}
                    </p>
                    <p className={`text-xs font-bold ${SLA_COLORS[alerta.estado]}`}>
                      {alerta.estado.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PieChart SLA (solo si hay alertas) */}
      {slaPieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaFileImport className="text-orange-500" />
              Distribución de Alertas SLA
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={slaPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {slaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1E293B", border: "none", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-shrink-0">
                {slaPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasa de errores */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 flex flex-col justify-center items-center text-center">
            <FaCheckCircle className="text-5xl text-green-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Tasa de Errores</h2>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">{kpis?.tasa_errores ?? 0}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Pedimentos con estado INCOMPLETO sobre el total
            </p>
          </div>
        </div>
      )}

      {/* Últimas Operaciones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFileAlt className="text-purple-500" />
            Últimas Operaciones
          </h2>
          <button
            onClick={() => router.push("/pedimentos")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todos →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                {["PEDIMENTO", "TIPO", "CLIENTE", "FECHA", "ESTADO", "SLA", "ACCIONES"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {ultimasOps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                    No hay operaciones recientes.
                  </td>
                </tr>
              ) : (
                ultimasOps.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-white">
                      {op.pedimento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        op.tipo_operacion === "IMPORTACION"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}>
                        {op.tipo_operacion === "IMPORTACION" ? "IMPO" : "EXPO"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 max-w-[160px] truncate">
                      {op.cliente_empresa || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {op.fecha_recepcion_sistema
                        ? new Date(op.fecha_recepcion_sistema).toLocaleDateString("es-MX")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[op.estado] || "bg-gray-100 text-gray-600"}`}>
                        {op.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold ${SLA_COLORS[op.status_sla] || "text-gray-500"}`}>
                        {(op.status_sla || "").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/pedimentos/${op.id}`)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
                      >
                        <FaEye className="text-xs" />
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}