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
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <FaBoxOpen className="text-blue-500" /> Catálogos en Cuarentena
            </h1>
            <p className="text-zinc-400 mt-2">
              Revisa y aprueba los registros extraídos por IA que no existen en los catálogos principales.
            </p>
          </div>
          <button
            onClick={fetchPendientes}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
          >
            Actualizar
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
          ) : pendientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
              <FaBoxOpen className="text-6xl mb-4 text-zinc-700" />
              <p className="text-lg">No hay registros pendientes de revisión</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-400">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Clave/RFC</th>
                    <th className="px-4 py-3">Nombre/Descripción</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientes.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="px-4 py-3 font-medium text-zinc-200">
                        {item.tipo}
                      </td>
                      <td className="px-4 py-3">{item.clave_extraida}</td>
                      <td className="px-4 py-3 truncate max-w-[300px]" title={item.descripcion_extraida}>
                        {item.descripcion_extraida}
                      </td>
                      <td className="px-4 py-3 flex justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleAprobar(item.id)}
                              title="Aprobar"
                              className="flex items-center justify-center p-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleRechazar(item.id)}
                              title="Rechazar"
                              className="flex items-center justify-center p-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : isOperador ? (
                          <button
                            onClick={() => handleSolicitarAprobacion(item.id)}
                            title="Solicitar Aprobación"
                            className="flex items-center justify-center gap-2 p-2 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            <FaPaperPlane />
                            <span className="text-xs">Solicitar</span>
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
