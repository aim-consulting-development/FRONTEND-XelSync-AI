"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/api";
import { FaBuilding, FaExchangeAlt, FaSearch } from "react-icons/fa";
import ModalTraspaso from "@/components/cartera/ModalTraspaso";
import AdminCarteraView from "@/components/cartera/AdminCarteraView";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";

export default function CarteraPage() {
  const { user, isOperador, isAdmin } = useAuth();
  const [cartera, setCartera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!isOperador && !isAdmin) {
      setError("No tienes permisos para ver esta sección.");
      setLoading(false);
      return;
    }

    if (isAdmin) {
      setLoading(false);
      return; // El componente de Admin hará sus propias llamadas
    }

    const fetchCartera = async () => {
      try {
        const res = await api.get("/usuarios/mi-cartera");
        setCartera(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Error al cargar la cartera");
      } finally {
        setLoading(false);
      }
    };

    fetchCartera();
  }, [user, isOperador, isAdmin]);

  const handleTraspasoClick = (cliente) => {
    setSelectedClient(cliente.cliente_empresa);
    setModalOpen(true);
  };

  const filteredEmpresas = cartera?.empresas?.filter(c => 
    c.cliente_empresa.toLowerCase().includes(search.toLowerCase()) || 
    (c.rfc_empresa && c.rfc_empresa.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaBuilding className="text-blue-500" />
            Mi Cartera de Clientes
          </h1>
          <InfoModal title="Módulo de Cartera">
            <p>
              Visualiza y gestiona las empresas (Aduanas/Patentes) a las que tienes acceso como Operador o Auditor.
            </p>
          </InfoModal>
        </div>
        <p className="text-gray-500 mt-2">
          Gestiona los clientes asignados a tu perfil. Total: {cartera?.total_empresas || 0}
        </p>
      </div>

      {isAdmin ? (
        <AdminCarteraView />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o RFC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-800 dark:text-gray-300">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Empresa / Cliente</th>
                    <th className="px-6 py-4">RFC</th>
                    <th className="px-6 py-4">Asignado el</th>
                    <th className="px-6 py-4 text-right rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {empresa.cliente_empresa}
                      </td>
                      <td className="px-6 py-4">
                        {empresa.rfc_empresa || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {empresa.fecha_asignacion || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleTraspasoClick(empresa)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        >
                          <FaExchangeAlt />
                          Traspasar
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredEmpresas.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No se encontraron clientes en tu cartera.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ModalTraspaso 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            clienteEmpresa={selectedClient} 
          />
        </>
      )}
    </div>
    </MainLayout>
  );
}
