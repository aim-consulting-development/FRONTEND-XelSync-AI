"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import InfoModal from '@/components/shared/InfoModal';
import { FaShieldAlt, FaCheckCircle, FaLink, FaExclamationTriangle, FaSearch, FaSpinner } from 'react-icons/fa';

export default function CatalogosPendientesPage() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  
  // Modals for actions could go here, but for now we'll do direct actions with confirm
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendientes();
  }, [filtroTipo]);

  const fetchPendientes = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/catalogos/pendientes?estado=PENDIENTE&limit=50';
      if (filtroTipo) url += `&tipo=${filtroTipo}`;
      if (search) url += `&q=${search}`;
      
      const res = await api.get(url);
      setPendientes(res.data.items || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la bandeja de cuarentena.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPendientes();
  };

  const handleAprobarAlta = async (id) => {
    if (!confirm('¿Estás seguro de que deseas dar de alta este registro oficialmente en el catálogo maestro?')) return;
    
    try {
      setActionLoading(id);
      await api.post(`/catalogos/pendientes/${id}/alta`);
      // Remover de la lista
      setPendientes(prev => prev.filter(p => p.id !== id));
      alert('Registro dado de alta correctamente.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Ocurrió un error al procesar el alta.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVincular = async (id) => {
    const catalogo_id = prompt('Ingresa el ID numérico del catálogo existente al que deseas vincular este registro:');
    if (!catalogo_id || isNaN(catalogo_id)) return;
    
    try {
      setActionLoading(id);
      await api.post(`/catalogos/pendientes/${id}/vincular?catalogo_id=${catalogo_id}`);
      setPendientes(prev => prev.filter(p => p.id !== id));
      alert('Registro vinculado correctamente.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Ocurrió un error al vincular.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col transition-all duration-300">
        <Navbar />
        <main className="p-8">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaShieldAlt className="text-orange-500" />
                  Bandeja de Cuarentena (Catálogos)
                </h1>
                <InfoModal title="Bandeja de Cuarentena">
                  <p>
                    Revisa las extracciones realizadas por la IA que no hicieron "match" automático con los catálogos de Comercio Exterior (Materiales, Proveedores, Clientes).
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Vincular:</strong> Relaciona este registro a un catálogo existente para "entrenar" a la IA y evitar duplicados.</li>
                    <li><strong>Aprobar Alta:</strong> Da de alta oficialmente este registro nuevo en la base de datos de XelSync.</li>
                  </ul>
                </InfoModal>
              </div>
              <p className="text-gray-500 mt-2">
                Registros extraídos por la IA que no se encontraron en los catálogos maestros. 
                Aprueba su alta o vincúlalos a registros existentes para evitar duplicidad.
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los tipos</option>
                <option value="MATERIAL">Materiales</option>
                <option value="PROVEEDOR">Proveedores</option>
                <option value="CLIENTE">Clientes</option>
              </select>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Buscar clave o descripción..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <FaSearch size={18} />
              </button>
            </form>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Clave Extraída</th>
                    <th className="px-6 py-4 font-medium">Descripción</th>
                    <th className="px-6 py-4 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <FaSpinner className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Cargando bandeja...
                      </td>
                    </tr>
                  ) : pendientes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                          <FaCheckCircle size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Bandeja Limpia</h3>
                        <p className="text-gray-500">No hay catálogos pendientes de revisión.</p>
                      </td>
                    </tr>
                  ) : (
                    pendientes.map((item) => (
                      <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            item.tipo === 'MATERIAL' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            item.tipo === 'PROVEEDOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.clave_extraida}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.descripcion_extraida || <span className="text-gray-400 italic">Sin descripción</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleVincular(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 disabled:opacity-50 flex items-center gap-1.5"
                              title="Vincular a un registro existente"
                            >
                              <FaLink size={16} /> Vincular
                            </button>
                            <button
                              onClick={() => handleAprobarAlta(item.id)}
                              disabled={actionLoading === item.id}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 flex items-center gap-1.5"
                              title="Dar de alta como nuevo registro"
                            >
                              {actionLoading === item.id ? <FaSpinner size={16} className="animate-spin" /> : <FaCheckCircle size={16} />}
                              Aprobar Alta
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
