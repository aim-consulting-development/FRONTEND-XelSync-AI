"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaUpload,
  FaPlay,
  FaFileExcel,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaChartLine,
  FaSync,
  FaCalendarAlt,
  FaFilter,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

const SEVERIDAD_COLORS = {
  ALTA: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  MEDIA: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  BAJA: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

export default function ConciliacionPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [operationType, setOperationType] = useState("todas");
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [pedimentosList, setPedimentosList] = useState([]);
  const [loadingPedimentos, setLoadingPedimentos] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const { user, isAdmin, isOperador, loading: authLoading } = useAuth();
  const router = useRouter();

  const isStrictAuditor = user?.rol === "AUDITOR";

  useEffect(() => {
    if (user && !isAdmin && !isOperador && !isStrictAuditor) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, isOperador, isStrictAuditor, router]);

  useEffect(() => {
    if (!authLoading && (isAdmin || isOperador || isStrictAuditor)) {
      // Fetch clientes
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
  }, [authLoading, isAdmin, isOperador, isStrictAuditor, router]);

  useEffect(() => {
    if (selectedCliente) {
      setLoadingPedimentos(true);
      api.get(`/pedimentos?cliente_empresa=${encodeURIComponent(selectedCliente)}&size=100`)
        .then(res => setPedimentosList(res.data.items || []))
        .catch(() => setPedimentosList([]))
        .finally(() => setLoadingPedimentos(false));
    } else {
      setPedimentosList([]);
    }
  }, [selectedCliente, selectedPeriod]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".zip") && !file.name.endsWith(".asc") && !file.name.endsWith(".txt")) {
      setError("Solo se aceptan archivos .zip, .asc (Glosa) o .txt (M3).");
      return;
    }
    setUploadedFile(file.name);
    setUploadedFileObj(file);
    setError(null);
    setResultado(null);
  };

  const handleExecute = async () => {
    if (!uploadedFileObj) {
      setError("Debes seleccionar un archivo (.zip, .asc o .txt) antes de ejecutar.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("archivo_sat", uploadedFileObj);
      formData.append("periodo", selectedPeriod);
      if (selectedCliente) {
        formData.append("cliente_empresa", selectedCliente);
      }
      const res = await api.post("/conciliacion/ejecutar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error ejecutando la conciliación. Verifica el archivo e intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = resultado
    ? [
        {
          title: "Total Pedimentos",
          value: resultado.total_pedimentos,
          icon: <FaFileExcel className="text-blue-500" size={28} />,
          color: "text-blue-500",
        },
        {
          title: "Conciliados",
          value: resultado.conciliados,
          icon: <FaCheckCircle className="text-green-500" size={28} />,
          color: "text-green-600",
        },
        {
          title: "Con Discrepancias",
          value: resultado.con_discrepancias,
          icon: <FaExclamationTriangle className="text-red-500" size={28} />,
          color: "text-red-600",
        },
        {
          title: "No Encontrados",
          value: resultado.no_encontrados,
          icon: <FaTimesCircle className="text-orange-500" size={28} />,
          color: "text-orange-600",
        },
      ]
    : [
        {
          title: "Sin ejecutar",
          value: "—",
          icon: <FaSync className="text-gray-400" size={28} />,
          color: "text-gray-400",
        },
        {
          title: "Selecciona un archivo SAT",
          value: "—",
          icon: <FaUpload className="text-gray-400" size={28} />,
          color: "text-gray-400",
        },
        {
          title: "y presiona Ejecutar",
          value: "—",
          icon: <FaPlay className="text-gray-400" size={28} />,
          color: "text-gray-400",
        },
        {
          title: "para ver resultados",
          value: "—",
          icon: <FaChartLine className="text-gray-400" size={28} />,
          color: "text-gray-400",
        },
      ];

  if (authLoading || (!isAdmin && !isOperador && !isStrictAuditor)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  return (
    <MainLayout>
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conciliación SAT</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comparación automática entre el sistema y los reportes del SAT
            </p>
          </div>
          <InfoModal title="Módulo de Conciliación SAT (Trade Compliance)">
            <p>
              La <strong>Conciliación SAT vs Data Stage (Glosa)</strong> es una auditoría preventiva para detectar desviaciones entre los pedimentos extraídos y lo que la Autoridad (SAT/AGA) tiene registrado en sus sistemas.
            </p>
            <p>
              <strong>Impacto Aduanero:</strong> Un pedimento no registrado en el SAT, o registrado con montos de contribuciones diferentes, puede detonar facultades de comprobación (PACO/PAMA). Asegura la deducción del IVA y previene multas de la Administración General de Auditoría de Comercio Exterior (AGACE).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Revisa inmediatamente las alertas de <strong>"No encontrados en SAT"</strong>.</li>
              <li>Aclara diferencias en el <strong>Valor en Aduana</strong> o IVA pagado.</li>
              <li>Conserva siempre el acuse electrónico del DODA o Aviso Consolidado.</li>
            </ul>
          </InfoModal>
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
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <h2 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h2>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuración + Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configuración */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaSync className="text-blue-500" />
              Configuración de Conciliación
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periodo</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Operación</label>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="todas">Todas</option>
                  <option value="importacion">Importación</option>
                  <option value="exportacion">Exportación</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pedimentos del Cliente ({pedimentosList.length})</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-slate-600 rounded-lg p-2 bg-gray-50 dark:bg-slate-900/50 text-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {loadingPedimentos ? (
                  <p className="text-gray-500 text-center py-4"><FaSpinner className="animate-spin inline mr-2"/>Cargando...</p>
                ) : pedimentosList.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {selectedCliente ? "No hay pedimentos registrados para este cliente." : "Selecciona un cliente para ver sus pedimentos."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {pedimentosList.map(p => (
                      <li key={p.id} className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{p.numero_pedimento || "Sin Número"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.tipo_operacion === 'IMPORTACION' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                            {p.tipo_operacion || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Clave: {p.clave_pedimento || "N/A"}</span>
                          <span>{p.fecha_recepcion_sistema ? new Date(p.fecha_recepcion_sistema).toLocaleDateString() : ""}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={isProcessing || !uploadedFileObj}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-white font-medium ${
                isProcessing || !uploadedFileObj
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] shadow-md"
              }`}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Procesando conciliación...
                </>
              ) : (
                <>
                  <FaPlay />
                  Ejecutar Conciliación
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <FaExclamationTriangle />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Carga de Archivo SAT */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUpload className="text-purple-500" />
              Archivo SAT
            </h2>
          </div>
          <div className="p-6">
            <div
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                uploadedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                  : "border-gray-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
              }`}
            >
              <input
                type="file"
                accept=".zip,.asc"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-sat"
              />
              <FaUpload
                size={44}
                className={`mb-4 ${uploadedFile ? "text-green-500" : "text-gray-400 dark:text-gray-500"}`}
              />

              {uploadedFile ? (
                <>
                  <p className="font-medium text-gray-900 dark:text-white text-base mb-1">{uploadedFile}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-4">Archivo listo para procesar</p>
                  <div className="flex gap-3">
                    <label
                      htmlFor="file-upload-sat"
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      Cambiar archivo
                    </label>
                    <button
                      onClick={() => { setUploadedFile(null); setUploadedFileObj(null); setResultado(null); setError(null); }}
                      className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">Arrastra tu archivo SAT aquí</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">o</p>
                  <label
                    htmlFor="file-upload-sat"
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all inline-flex items-center gap-2 font-medium"
                  >
                    <FaUpload size={14} />
                    Seleccionar archivo
                  </label>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    Formatos aceptados: .zip, .asc (reporte SAT)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedimentos del Cliente */}
      {selectedCliente && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaFileExcel className="text-blue-500" />
              Pedimentos relacionados a {selectedCliente}
            </h2>
            <span className="text-sm font-medium px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              {pedimentosList.length} registros
            </span>
          </div>
          <div className="p-0">
            {loadingPedimentos ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <FaSpinner className="animate-spin text-2xl" />
                <span className="ml-3">Cargando pedimentos...</span>
              </div>
            ) : pedimentosList.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No se encontraron pedimentos para este cliente.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-slate-900 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Pedimento</th>
                      <th className="px-6 py-3">Clave</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Fecha Recepción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {pedimentosList.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-3 font-mono font-medium text-gray-900 dark:text-white">{p.pedimento}</td>
                        <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{p.cve_pedimento}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.tipo_operacion === 'IMP' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {p.tipo_operacion}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                          {p.fecha_recepcion_sistema ? new Date(p.fecha_recepcion_sistema).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resultados de discrepancias */}
      {resultado && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-orange-500" />
              Discrepancias Detectadas ({resultado.discrepancias?.length || 0})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {resultado.sin_discrepancias} sin diferencias · {resultado.no_encontrados} no encontrados
              </span>
            </div>
          </div>

          {resultado.discrepancias && resultado.discrepancias.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    {["Pedimento", "Campo", "Valor Sistema", "Valor SAT", "Diferencia", "Severidad"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {resultado.discrepancias.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{d.pedimento}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{d.campo}</td>
                      <td className="px-6 py-4 font-mono text-sm text-blue-600 dark:text-blue-400">{d.valor_interno}</td>
                      <td className="px-6 py-4 font-mono text-sm text-purple-600 dark:text-purple-400">{d.valor_sat}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{d.diferencia}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${SEVERIDAD_COLORS[d.severidad] || "bg-gray-100 text-gray-600"}`}>
                          {d.severidad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">¡Sin discrepancias!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Todos los pedimentos conciliados coinciden con el SAT.
              </p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}