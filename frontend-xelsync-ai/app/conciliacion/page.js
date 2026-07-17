"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".zip") && !file.name.endsWith(".asc")) {
      setError("Solo se aceptan archivos .zip o .asc del SAT.");
      return;
    }
    setUploadedFile(file.name);
    setUploadedFileObj(file);
    setError(null);
    setResultado(null);
  };

  const handleExecute = async () => {
    if (!uploadedFileObj) {
      setError("Debes seleccionar un archivo SAT (.zip o .asc) antes de ejecutar.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("archivo_sat", uploadedFileObj);
      formData.append("periodo", selectedPeriod);
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

  return (
    <MainLayout>
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conciliación SAT</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Comparación automática entre el sistema y los reportes del SAT
        </p>
      </div>

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