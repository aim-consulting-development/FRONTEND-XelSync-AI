"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaChartBar,
  FaDownload,
  FaFilter,
  FaSpinner,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";

export default function Reportes() {
  const [kpis, setKpis] = useState(null);
  const [reportData, setReportData] = useState({ trend_data: [], sla_data: [] });
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dateRange, setDateRange] = useState("mes"); // semana, mes, año

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpisRes, reportRes] = await Promise.all([
        api.get("/dashboard/kpis"),
        api.get(`/dashboard/reportes?rango=${dateRange}`)
      ]);
      setKpis(kpisRes.data);
      setReportData(reportRes.data);
    } catch (error) {
      console.error("Error cargando datos de reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const trendData = reportData.trend_data;
  const slaData = reportData.sla_data;

  const handleExport = () => {
    alert("Funcionalidad de exportación a Excel/CSV estará disponible pronto.");
  };

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes y Métricas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualiza el rendimiento operativo, valor en aduana y cumplimiento de SLAs.
            </p>
          </div>
          <InfoModal title="Módulo de Reportes">
            <p>
              Genera reportes detallados y gráficas sobre la operación aduanera.
              Puedes descargar la información en formato InterXel / ARANXEL para su posterior procesamiento.
            </p>
          </InfoModal>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700 p-1 flex">
            {["Semana", "Mes", "Año"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r.toLowerCase())}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === r.toLowerCase()
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all shadow-sm"
          >
            <FaDownload /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Valor Total en Aduana</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(kpis?.total_importado_usd || 0).toLocaleString()} USD
              </p>
              <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">
                +12% vs periodo anterior
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Impuestos Pagados</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(kpis?.impuestos_pagados_mxn || 0).toLocaleString()} MXN
              </p>
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                -3% vs periodo anterior
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Operaciones Exitosas</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {kpis?.pedimentos_hoy || 0}
              </p>
              <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">
                +5% vs periodo anterior
              </p>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de Valor en Aduana */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Tendencia de Importaciones (USD)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rendimiento SLA */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Cumplimiento de SLAs</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                      {
                        slaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}