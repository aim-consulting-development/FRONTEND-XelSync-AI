"use client";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpiRes, alertasRes] = await Promise.all([
          api.get("/dashboard/kpis"),
          api.get("/dashboard/alertas-sla")
        ]);
        setKpis(kpiRes.data);
        setAlertas(alertasRes.data);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">Cargando datos del servidor...</p>
        </div>
      </MainLayout>
    );
  }

  const cards = [
    {
      title: "Operaciones del Día",
      value: kpis?.pedimentos_hoy || "0",
    },
    {
      title: "Valor en Aduana",
      value: `$${(kpis?.total_importado_usd || 0).toLocaleString()}`,
    },
    {
      title: "Impuestos Pagados",
      value: `$${(kpis?.impuestos_pagados_mxn || 0).toLocaleString()}`,
    },
    {
      title: "Pendientes",
      value: kpis?.discrepancias_pendientes || "0",
    },
  ];

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
          >
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide uppercase">
              {card.title}
            </h3>

            <p className="text-3xl font-extrabold mt-3 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 group-hover:from-blue-600 group-hover:to-indigo-500 transition-colors duration-300">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-6">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-6">
            Tendencia de Pedimentos
          </h2>

          <div className="h-64 flex items-center justify-center text-gray-400">
            Aquí irá la gráfica (Recharts)
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-6">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-6">
            Alertas SLA
          </h2>

          <div className="space-y-4">
            {alertas.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay pedimentos en riesgo.</p>
            ) : (
              alertas.map((alerta, index) => (
                <div key={index} className="border border-gray-100 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Pedimento {alerta.pedimento}</span>
                    <span className={`text-xs px-3 py-1 font-medium rounded-full shadow-sm ${alerta.estado === 'VENCIDO' ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'}`}>
                      {alerta.estado === 'VENCIDO' ? '⚠️ Vencido' : '⏳ En Riesgo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {alerta.horas_restantes < 0 
                      ? `Excedido por ${Math.abs(alerta.horas_restantes)}h`
                      : `Quedan ${alerta.horas_restantes}h`
                    }
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}