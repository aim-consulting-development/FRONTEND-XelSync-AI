"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { FaTimes, FaExchangeAlt, FaSpinner } from "react-icons/fa";

export default function ModalTraspaso({ isOpen, onClose, clienteEmpresa }) {
  const [operadores, setOperadores] = useState([]);
  const [selectedOperador, setSelectedOperador] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError("");
      setSelectedOperador("");
      fetchOperadores();
    }
  }, [isOpen]);

  const fetchOperadores = async () => {
    setLoading(true);
    try {
      // Pedimos lista de usuarios
      const res = await api.get("/usuarios?limit=100");
      // Filtramos solo los operadores
      const ops = res.data.items.filter(u => u.rol === "OPERADOR");
      setOperadores(ops);
    } catch (err) {
      setError("Error al cargar la lista de operadores.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOperador) {
      setError("Por favor, selecciona un operador destino.");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      await api.post("/usuarios/cartera/solicitar-traspaso", {
        cliente_empresa: clienteEmpresa,
        operador_destino_id: parseInt(selectedOperador)
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al solicitar traspaso.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaExchangeAlt className="text-blue-500" />
            Traspasar Cliente
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExchangeAlt size={30} />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">¡Solicitud Enviada!</h4>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Se ha notificado al Administrador para su validación.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cliente a traspasar
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium">
                  {clienteEmpresa}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operador Destino
                </label>
                {loading ? (
                  <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-500">
                    <FaSpinner className="animate-spin" /> Cargando operadores...
                  </div>
                ) : (
                  <select
                    value={selectedOperador}
                    onChange={(e) => setSelectedOperador(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    <option value="">Selecciona un operador...</option>
                    {operadores.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.nombre} ({op.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || loading || !selectedOperador}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  Solicitar Traspaso
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
