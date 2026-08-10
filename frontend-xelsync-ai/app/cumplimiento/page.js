"use client";

import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/api";
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaSync,
  FaTimesCircle,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";

const SEMAFORO_COLOR = (val) => {
  if (val >= 95) return { bar: "bg-green-500", text: "text-green-600 dark:text-green-400", label: "Excelente" };
  if (val >= 80) return { bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", label: "Bueno" };
  if (val >= 60) return { bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Regular" };
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400", label: "Crítico" };
};

const ALERTA_COLORS = {
  ALTA: { bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", text: "text-red-600 dark:text-red-400", badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  MEDIA: { bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
  BAJA: { bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
};

export default function CumplimientoPage() {
  const { user, isAdmin, isOperador, loading: authLoading } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [resumen, setResumen] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertasLoading, setAlertasLoading] = useState(true);
  const [historialLoading, setHistorialLoading] = useState(true);
  const [historialPage, setHistorialPage] = useState(1);
  const [historialTotal, setHistorialTotal] = useState(0);
  const [historialPages, setHistorialPages] = useState(1);
  const [searchAlerta, setSearchAlerta] = useState("");
  const [filterSev, setFilterSev] = useState("todas");

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCliente ? `/obligaciones/resumen?cliente_empresa=${encodeURIComponent(selectedCliente)}` : "/obligaciones/resumen";
      const res = await api.get(url);
      setResumen(res.data);
    } catch {
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCliente]);

  const fetchAlertas = useCallback(async () => {
    setAlertasLoading(true);
    try {
      const url = selectedCliente ? `/obligaciones/alertas?cliente_empresa=${encodeURIComponent(selectedCliente)}` : "/obligaciones/alertas";
      const res = await api.get(url);
      setAlertas(res.data || []);
    } catch {
      setAlertas([]);
    } finally {
      setAlertasLoading(false);
    }
  }, [selectedCliente]);

  const fetchHistorial = useCallback(async () => {
    setHistorialLoading(true);
    try {
      const url = selectedCliente ? `/obligaciones/conciliaciones?page=${historialPage}&size=15&cliente_empresa=${encodeURIComponent(selectedCliente)}` : `/obligaciones/conciliaciones?page=${historialPage}&size=15`;
      const res = await api.get(url);
      setHistorial(res.data.items || []);
      setHistorialTotal(res.data.total || 0);
      setHistorialPages(res.data.pages || 1);
    } catch {
      setHistorial([]);
    } finally {
      setHistorialLoading(false);
    }
  }, [historialPage, selectedCliente]);

  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        api.get("/usuarios/cartera/todos-los-clientes").then(res => {
          setClientes(res.data.clientes || []);
        });
      } else {
        api.get("/usuarios/mi-cartera").then(res => {
          setClientes(res.data.empresas || []);
        });
      }
    }
  }, [authLoading, isAdmin]);

  useEffect(() => {
    fetchResumen();
    fetchAlertas();
  }, [fetchResumen, fetchAlertas]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const handleRefresh = () => {
    fetchResumen();
    fetchAlertas();
    fetchHistorial();
  };

  const filteredAlertas = alertas.filter((a) => {
    const matchSearch = !searchAlerta || (a.pedimento || "").toLowerCase().includes(searchAlerta.toLowerCase()) || (a.empresa || "").toLowerCase().includes(searchAlerta.toLowerCase());
    const matchSev = filterSev === "todas" || a.severidad === filterSev;
    return matchSearch && matchSev;
  });

  const semaforos = resumen?.semaforos
    ? [
        { nombre: "Anexo 24", porcentaje: resumen.semaforos.anexo_24 },
        { nombre: "Anexo 30", porcentaje: resumen.semaforos.anexo_30 },
        { nombre: "IVA / IEPS", porcentaje: resumen.semaforos.iva_ieps },
        { nombre: "Cumplimiento Total", porcentaje: resumen.semaforos.cumplimiento_total },
      ]
    : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaShieldAlt className="text-blue-500" />
              Centro de Cumplimiento
            </h1>
            <InfoModal title="Centro de Cumplimiento Trade">
              <p>Monitoreo proactivo de tu salud aduanera para evitar requerimientos del SAT o multas en auditorías de comercio exterior.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Anexo 24:</strong> Evalúa si los pedimentos cuentan con la data mínima (90%+) para tus descargos.</li>
                <li><strong>Anexo 30:</strong> Mide la tasa de expedientes digitalmente procesados vs los recibidos.</li>
                <li><strong>Conciliación SAT (Glosa):</strong> Detecta discrepancias de valor/IVA o pedimentos no registrados en Data Stage.</li>
              </ul>
            </InfoModal>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              title="Refrescar datos"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Pestañas por cliente */}
        {clientes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <button
              onClick={() => setSelectedCliente("")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCliente === "" 
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              Todos los Clientes
            </button>
            {clientes.map(c => {
              const nombre = c.nombre || c.cliente_empresa;
              return (
                <button
                  key={nombre}
                  onClick={() => setSelectedCliente(nombre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCliente === nombre
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700"
                  }`}
                >
                  {nombre}
                </button>
              )
            })}
          </div>
        )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            title: "Completitud Promedio",
            value: loading ? "…" : `${resumen?.completitud_promedio ?? 0}%`,
            icon: <FaCheckCircle className="text-green-500" size={26} />,
            sub: "Todos los pedimentos",
            color: "text-green-600 dark:text-green-400",
          },
          {
            title: "Alertas SLA Activas",
            value: loading ? "…" : resumen?.alertas_sla_activas ?? 0,
            icon: <FaClock className="text-orange-500" size={26} />,
            sub: "En riesgo o vencidas",
            color: "text-orange-600 dark:text-orange-400",
          },
          {
            title: "Discrepancias SAT",
            value: loading ? "…" : resumen?.discrepancias_pendientes ?? 0,
            icon: <FaExclamationTriangle className="text-red-500" size={26} />,
            sub: "Pendientes de resolver",
            color: "text-red-600 dark:text-red-400",
          },
          {
            title: "Tasa de Aprobación",
            value: loading ? "…" : `${resumen?.tasa_aprobacion ?? 0}%`,
            icon: <FaShieldAlt className="text-blue-500" size={26} />,
            sub: `${resumen?.pedimentos_aprobados ?? 0} de ${resumen?.total_pedimentos ?? 0} pedimentos`,
            color: "text-blue-600 dark:text-blue-400",
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <h2 className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{kpi.sub}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Semáforos + Próximo vencimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Semáforos */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FaShieldAlt className="text-blue-500" />
            Indicadores de Cumplimiento
          </h2>
          {loading ? (
            <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-3xl text-blue-500" /></div>
          ) : (
            <div className="space-y-5">
              {semaforos.map((s) => {
                const colors = SEMAFORO_COLOR(s.porcentaje);
                return (
                  <div key={s.nombre}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
                        <span className={`text-sm font-bold ${colors.text}`}>{s.porcentaje}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${colors.bar}`}
                        style={{ width: `${s.porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {semaforos.length === 0 && (
                <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">No hay datos disponibles</p>
              )}
            </div>
          )}
        </div>

        {/* Próximo vencimiento */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-orange-500" />
            Próximo Vencimiento SLA
          </h2>
          {loading ? (
            <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-2xl text-blue-500" /></div>
          ) : resumen?.proximo_vencimiento ? (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{resumen.proximo_vencimiento.pedimento}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resumen.proximo_vencimiento.empresa}</p>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                  <FaClock size={12} />
                  {new Date(resumen.proximo_vencimiento.deadline).toLocaleString("es-MX")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FaCheckCircle className="text-4xl text-green-400 mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Sin vencimientos próximos</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Todos los pedimentos están a tiempo</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-500" />
            Alertas de Cumplimiento ({filteredAlertas.length})
          </h2>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Buscar pedimento..."
                value={searchAlerta}
                onChange={(e) => setSearchAlerta(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filterSev}
              onChange={(e) => setFilterSev(e.target.value)}
              className="text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-1.5"
            >
              <option value="todas">Todas</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {alertasLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
          ) : filteredAlertas.length === 0 ? (
            <div className="text-center py-10">
              <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white">¡Sin alertas activas!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">El sistema está operando dentro de los parámetros normales.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlertas.map((a, i) => {
                const colors = ALERTA_COLORS[a.severidad] || ALERTA_COLORS.BAJA;
                return (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${colors.bg}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      {a.severidad === "ALTA" ? (
                        <FaTimesCircle className={`text-lg ${colors.text}`} />
                      ) : (
                        <FaExclamationTriangle className={`text-lg ${colors.text}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                          {a.pedimento || a.tipo}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                          {a.severidad}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          {a.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {a.descripcion ||
                          (a.tipo === "SLA"
                            ? `Estado SLA: ${a.estado_sla} — ${a.horas_restantes != null ? `${Math.abs(a.horas_restantes)}h ${a.horas_restantes < 0 ? "vencido" : "restantes"}` : "Sin deadline"}`
                            : "")}
                      </p>
                      {a.empresa && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.empresa}</p>
                      )}
                    </div>
                    {a.tipo === "SLA" && a.horas_restantes != null && (
                      <div className="flex-shrink-0 text-right">
                        <p className={`text-sm font-bold ${a.horas_restantes < 0 ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`}>
                          {a.horas_restantes < 0 ? "VENCIDO" : `${Math.abs(a.horas_restantes).toFixed(0)}h`}
                        </p>
                        {a.horas_restantes >= 0 && (
                          <p className="text-xs text-gray-400">restantes</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Historial de conciliaciones */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaFileAlt className="text-purple-500" />
            Historial de Conciliaciones ({historialTotal})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {historialLoading ? (
            <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-3xl text-blue-500" /></div>
          ) : historial.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FaFileAlt className="text-4xl opacity-30 mx-auto mb-3" />
              <p>No hay conciliaciones registradas aún.</p>
              <p className="text-sm mt-1">Ejecuta una conciliación SAT desde el módulo correspondiente.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  {["Período", "Pedimento", "Campo", "Valor Sistema", "Valor SAT", "Severidad", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {historial.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{d.periodo || "—"}</td>
                    <td className="px-5 py-3 font-mono text-sm text-gray-900 dark:text-white">{d.pedimento || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{d.campo || "—"}</td>
                    <td className="px-5 py-3 text-sm font-mono text-blue-600 dark:text-blue-400">{d.valor_interxel || "—"}</td>
                    <td className="px-5 py-3 text-sm font-mono text-purple-600 dark:text-purple-400">{d.valor_sat || "—"}</td>
                    <td className="px-5 py-3">
                      {d.severidad ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${(ALERTA_COLORS[d.severidad] || ALERTA_COLORS.BAJA).badge}`}>
                          {d.severidad}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        d.estado_resolucion === "RESUELTO"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}>
                        {d.estado_resolucion || "PENDIENTE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación historial */}
        {historialPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Página {historialPage} de {historialPages} — {historialTotal} registros
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setHistorialPage((p) => Math.max(1, p - 1))}
                disabled={historialPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                ← Anterior
              </button>
              <button
                onClick={() => setHistorialPage((p) => Math.min(historialPages, p + 1))}
                disabled={historialPage === historialPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </MainLayout>
  );
}