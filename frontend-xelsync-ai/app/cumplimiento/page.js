"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaBell,
  FaEye,
  FaDownload,
  FaFilter,
  FaSearch,
  FaChevronRight,
} from "react-icons/fa";

export default function CumplimientoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [obligaciones, setObligaciones] = useState([
    {
      id: 1,
      nombre: "Reporte Anexo 30",
      vencimiento: "15/06/2026",
      estado: "Pendiente",
      prioridad: "Alta",
    },
    {
      id: 2,
      nombre: "Descargos de Inventario",
      vencimiento: "18/06/2026",
      estado: "En Proceso",
      prioridad: "Media",
    },
    {
      id: 3,
      nombre: "Validación IVA/IEPS",
      vencimiento: "25/06/2026",
      estado: "Completado",
      prioridad: "Baja",
    },
    {
      id: 4,
      nombre: "Declaración Anual",
      vencimiento: "30/06/2026",
      estado: "Pendiente",
      prioridad: "Alta",
    },
    {
      id: 5,
      nombre: "Dictamen Fiscal",
      vencimiento: "10/07/2026",
      estado: "En Proceso",
      prioridad: "Media",
    },
  ]);

  const [alertas, setAlertas] = useState([
    {
      id: 1,
      titulo: "Certificación próxima a vencer",
      dias: 45,
      tipo: "warning",
      descripcion: "La certificación IVA/IEPS vence en 45 días",
    },
    {
      id: 2,
      titulo: "Permanencia excedida",
      dias: 12,
      tipo: "danger",
      descripcion: "Se ha excedido el tiempo de permanencia",
    },
    {
      id: 3,
      titulo: "Diferencias detectadas",
      dias: 3,
      tipo: "danger",
      descripcion: "Se detectaron diferencias en la conciliación",
    },
    {
      id: 4,
      titulo: "Nueva obligación disponible",
      dias: 7,
      tipo: "info",
      descripcion: "Se ha agregado una nueva obligación fiscal",
    },
  ]);

  const [semafotos, setSemafotos] = useState([
    { nombre: "Anexo 24", porcentaje: 98, color: "bg-green-500" },
    { nombre: "Anexo 30", porcentaje: 92, color: "bg-blue-500" },
    { nombre: "IVA / IEPS", porcentaje: 96, color: "bg-purple-500" },
    { nombre: "Cumplimiento Total", porcentaje: 95, color: "bg-indigo-500" },
  ]);

  const [showAllObligaciones, setShowAllObligaciones] = useState(false);
  const [showAllAlertas, setShowAllAlertas] = useState(false);
  const [selectedObligacion, setSelectedObligacion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notificaciones, setNotificaciones] = useState(3);

  // Filtrar obligaciones
  const filteredObligaciones = obligaciones.filter((item) => {
    const matchesSearch = item.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === "todos" || item.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const displayedObligaciones = showAllObligaciones
    ? filteredObligaciones
    : filteredObligaciones.slice(0, 3);

  const displayedAlertas = showAllAlertas ? alertas : alertas.slice(0, 3);

  // Función para cambiar estado de obligación
  const handleUpdateEstado = (id, nuevoEstado) => {
    setObligaciones(
      obligaciones.map((item) =>
        item.id === id ? { ...item, estado: nuevoEstado } : item
      )
    );
    // Simular notificación
    mostrarNotificacion(`Obligación actualizada a ${nuevoEstado}`);
  };

  // Función para ver detalle de obligación
  const handleViewDetail = (obligacion) => {
    setSelectedObligacion(obligacion);
    setShowDetailModal(true);
  };

  // Función para descargar reporte
  const handleDownloadReport = () => {
    alert("Descargando reporte de cumplimiento...");
  };

  // Función para renovar certificación
  const handleRenovarCertificacion = () => {
    alert("Iniciando proceso de renovación de certificación...");
  };

  // Función para mostrar notificación
  const mostrarNotificacion = (mensaje) => {
    // En una implementación real, aquí iría un toast/notification
    console.log(`🔔 ${mensaje}`);
    setNotificaciones(notificaciones + 1);
  };

  // Función para eliminar alerta
  const handleEliminarAlerta = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta alerta?")) {
      setAlertas(alertas.filter((alerta) => alerta.id !== id));
      mostrarNotificacion("Alerta eliminada");
    }
  };

  // Función para marcar alerta como leída
  const handleMarcarLeida = (id) => {
    setAlertas(
      alertas.map((alerta) =>
        alerta.id === id ? { ...alerta, leida: true } : alerta
      )
    );
    mostrarNotificacion("Alerta marcada como leída");
  };

  // Función para actualizar semáforo
  const handleActualizarSemafoto = () => {
    const nuevosPorcentajes = semafotos.map((item) => ({
      ...item,
      porcentaje: Math.min(100, item.porcentaje + Math.floor(Math.random() * 3) - 1),
    }));
    setSemafotos(nuevosPorcentajes);
    mostrarNotificacion("Semáforo actualizado");
  };

  // Efecto para simular llegada de nuevas alertas
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular una nueva alerta cada 30 segundos
      // (Descomentar para probar)
      // const nuevasAlertas = [...alertas];
      // nuevasAlertas.push({
      //   id: Date.now(),
      //   titulo: "Nueva alerta de cumplimiento",
      //   dias: Math.floor(Math.random() * 10) + 1,
      //   tipo: "warning",
      //   descripcion: "Se ha detectado una nueva inconsistencia",
      // });
      // setAlertas(nuevasAlertas);
      // setNotificaciones(notificaciones + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Completado":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "En Proceso":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "Pendiente":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "Alta":
        return "text-red-600 dark:text-red-400";
      case "Media":
        return "text-yellow-600 dark:text-yellow-400";
      case "Baja":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTipoAlertaColor = (tipo) => {
    switch (tipo) {
      case "danger":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <MainLayout>
      {/* Encabezado con notificaciones */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cumplimiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoreo de obligaciones y certificaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
          >
            <FaDownload />
            Descargar Reporte
          </button>
          <button className="relative p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <FaBell className="text-gray-600 dark:text-gray-400" />
            {notificaciones > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificaciones}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cumplimiento</p>
              <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">96%</h2>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FaCheckCircle size={30} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Alertas Activas</p>
              <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">5</h2>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <FaExclamationTriangle size={30} className="text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Obligaciones</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">18</h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FaFileAlt size={30} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Próximo Vencimiento</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">15 Jun</h2>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <FaCalendarAlt size={30} className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Certificación IVA/IEPS */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FaShieldAlt />
              Certificación IVA / IEPS
            </h2>
            <p className="text-purple-200">Certificación vigente</p>
          </div>
          <button
            onClick={handleRenovarCertificacion}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            Renovar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-200">Vigencia</p>
            <p className="font-bold text-white text-lg">31/12/2026</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-200">Días Restantes</p>
            <p className="font-bold text-white text-lg">208</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm text-purple-200">Estatus</p>
            <p className="font-bold text-green-300 text-lg flex items-center gap-2">
              <FaCheckCircle />
              Vigente
            </p>
          </div>
        </div>
      </div>

      {/* Obligaciones + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Obligaciones */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaFileAlt className="text-blue-500" />
              Obligaciones Periódicas
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {displayedObligaciones.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.nombre}
                      </h3>
                      <span className={`text-xs font-semibold ${getPrioridadColor(item.prioridad)}`}>
                        ● {item.prioridad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Vence: {item.vencimiento}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(item.estado)}`}>
                      {item.estado}
                    </span>
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Ver detalle"
                    >
                      <FaEye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredObligaciones.length > 3 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowAllObligaciones(!showAllObligaciones)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {showAllObligaciones ? "Ver menos" : `Ver todas (${filteredObligaciones.length})`}
                <FaChevronRight className={`transform transition-transform ${showAllObligaciones ? "rotate-90" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Alertas de Cumplimiento
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {displayedAlertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 ${getTipoAlertaColor(alerta.tipo)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {alerta.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alerta.descripcion}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-red-500">
                      <FaClock size={14} />
                      <span className="text-sm font-semibold">{alerta.dias}d</span>
                    </div>
                    <button
                      onClick={() => handleMarcarLeida(alerta.id)}
                      className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      title="Marcar como leída"
                    >
                      <FaCheckCircle size={14} />
                    </button>
                    <button
                      onClick={() => handleEliminarAlerta(alerta.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Eliminar alerta"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alertas.length > 3 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowAllAlertas(!showAllAlertas)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {showAllAlertas ? "Ver menos" : `Ver todas (${alertas.length})`}
                <FaChevronRight className={`transform transition-transform ${showAllAlertas ? "rotate-90" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Semáforo */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaShieldAlt className="text-green-500" />
            Semáforo de Cumplimiento
          </h2>
          <button
            onClick={handleActualizarSemafoto}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
          >
            <FaClock size={14} />
            Actualizar
          </button>
        </div>

        <div className="space-y-5">
          {semafotos.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.nombre}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.porcentaje}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${item.color}`}
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Óptimo (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Riesgo (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Crítico (&lt;60%)</span>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      {showDetailModal && selectedObligacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 transition-all duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalle de Obligación
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedObligacion.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vencimiento</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedObligacion.vencimiento}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(selectedObligacion.estado)}`}>
                  {selectedObligacion.estado}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Prioridad</p>
                <p className={`font-medium ${getPrioridadColor(selectedObligacion.prioridad)}`}>
                  {selectedObligacion.prioridad}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Cambiar Estado</p>
                <div className="flex gap-2">
                  {["Pendiente", "En Proceso", "Completado"].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => {
                        handleUpdateEstado(selectedObligacion.id, estado);
                        setShowDetailModal(false);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        selectedObligacion.estado === estado
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}