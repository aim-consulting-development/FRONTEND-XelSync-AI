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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow p-5"
          >
            <h3 className="text-gray-500">
              {card.title}
            </h3>

            <p className="text-2xl font-bold mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            Tendencia de Pedimentos
          </h2>

          <div className="h-64 flex items-center justify-center text-gray-400">
            Aquí irá la gráfica (Recharts)
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            Alertas SLA
          </h2>

          <div className="space-y-3">
            {alertas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay pedimentos en riesgo.</p>
            ) : (
              alertas.map((alerta, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pedimento {alerta.pedimento}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${alerta.estado === 'VENCIDO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                      {alerta.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tiempo restante: {alerta.horas_restantes}h</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}