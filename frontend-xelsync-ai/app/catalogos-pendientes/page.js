"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/api";
import { FaCheck, FaTimes, FaSpinner, FaBoxOpen, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function CatalogosPendientes() {
  const { isOperador, isAdmin } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/catalogos-pendientes?estado=PENDIENTE&size=100");
      setPendientes(res.data.items || []);
    } catch (error) {
      toast.error("Error al cargar catálogos pendientes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendientes();
  }, []);

  const handleAprobar = async (id) => {
    try {
      await api.post(`/catalogos-pendientes/${id}/aprobar`);
      toast.success("Catálogo aprobado y guardado en la base de datos.");
      fetchPendientes();
    } catch (error) {
      toast.error("Error al aprobar catálogo");
    }
  };

  const handleRechazar = async (id) => {
    try {
      await api.post(`/catalogos-pendientes/${id}/rechazar`);
      toast.success("Catálogo rechazado.");
      fetchPendientes();
    } catch (error) {
      toast.error("Error al rechazar catálogo");
    }
  };

  const handleSolicitarAprobacion = async (id) => {
    try {
      await api.post(`/catalogos-pendientes/${id}/solicitar-aprobacion`);
      toast.success("Solicitud enviada al administrador.");
    } catch (error) {
      toast.error("Error al solicitar aprobación");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <FaBoxOpen className="text-blue-500" /> Catálogos en Cuarentena
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2">
              Revisa y aprueba los registros extraídos por IA que no existen en los catálogos principales.
            </p>
          </div>
          <button
            onClick={fetchPendientes}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            Actualizar
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-10">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : pendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 dark:text-slate-500">
              <FaBoxOpen className="text-6xl mb-4 text-gray-300 dark:text-slate-600" />
              <p className="text-lg">No hay registros pendientes de revisión</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Clave/RFC</th>
                    <th className="px-4 py-3">Nombre/Descripción</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {item.tipo}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{item.clave_extraida}</td>
                      <td className="px-4 py-3 truncate max-w-[300px] text-gray-700 dark:text-slate-300" title={item.descripcion_extraida}>
                        {item.descripcion_extraida}
                      </td>
                      <td className="px-4 py-3 flex justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleAprobar(item.id)}
                              title="Aprobar"
                              className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleRechazar(item.id)}
                              title="Rechazar"
                              className="flex items-center justify-center p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : isOperador ? (
                          <button
                            onClick={() => handleSolicitarAprobacion(item.id)}
                            title="Solicitar Aprobación"
                            className="flex items-center justify-center gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            <FaPaperPlane />
                            <span className="text-xs font-semibold">Solicitar</span>
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
