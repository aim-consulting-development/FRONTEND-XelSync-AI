"use client";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "@/components/dashboard/SortableCard";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el orden de las tarjetas (usamos IDs fijos)
  const [cardOrder, setCardOrder] = useState([
    "operaciones", "valor", "impuestos", "pendientes"
  ]);

  // Cargar orden guardado en localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem("dashboardCardOrder");
    if (savedOrder) {
      setCardOrder(JSON.parse(savedOrder));
    }
  }, []);

  // Configuración de los sensores de arrastre
  // Añadimos un pequeño retraso al puntero para emular "mantener presionado"
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Diccionario de tarjetas con sus valores dinámicos
  const cardsData = {
    operaciones: {
      id: "operaciones",
      title: "Operaciones del Día",
      value: kpis?.pedimentos_hoy || "0",
    },
    valor: {
      id: "valor",
      title: "Valor en Aduana",
      value: `$${(kpis?.total_importado_usd || 0).toLocaleString()}`,
    },
    impuestos: {
      id: "impuestos",
      title: "Impuestos Pagados",
      value: `$${(kpis?.impuestos_pagados_mxn || 0).toLocaleString()}`,
    },
    pendientes: {
      id: "pendientes",
      title: "Pendientes",
      value: kpis?.discrepancias_pendientes || "0",
    },
  };

  // Función al finalizar el arrastre
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCardOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("dashboardCardOrder", JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 hidden sm:block">
          Mantén presionada una tarjeta para moverla.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cardOrder}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cardOrder.map((id) => (
              <SortableCard key={id} card={cardsData[id]} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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