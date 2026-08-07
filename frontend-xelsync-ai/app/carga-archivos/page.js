"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileAlt,
  FaFileArchive,
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaFolderOpen,
  FaSearch,
  FaTimes,
  FaRedo,
  FaEye,
  FaPause,
  FaPlay,
} from "react-icons/fa";

// ─── Constantes ───────────────────────────────────────
const ALLOWED_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
  "application/octet-stream",
];
const ALLOWED_EXTENSIONS = [".pdf", ".zip", ".txt", ".csv", ".asc", ".err"];
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FaFilePdf className="text-red-500" />;
  if (ext === "zip") return <FaFileArchive className="text-amber-500" />;
  return <FaFileAlt className="text-blue-500" />;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getStatusBadge(estado) {
  const statusMap = {
    SUBIENDO: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <FaSpinner className="animate-spin text-[10px]" />, label: "Subiendo" },
    EXTRAYENDO: { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <FaSpinner className="animate-spin text-[10px]" />, label: "Extrayendo IA" },
    "EXTRAYENDO ZIP": { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: <FaSpinner className="animate-spin text-[10px]" />, label: "Descomprimiendo" },
    "EXTRAYENDO GLOSA": { color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: <FaSpinner className="animate-spin text-[10px]" />, label: "Procesando Glosa" },
    VALIDANDO: { color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: <FaSpinner className="animate-spin text-[10px]" />, label: "Validando" },
    COMPLETADO: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <FaCheckCircle className="text-[10px]" />, label: "Completado" },
    ERROR: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <FaExclamationCircle className="text-[10px]" />, label: "Error" },
    CANCELADO: { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <FaTimes className="text-[10px]" />, label: "Cancelado" },
    PAUSADO: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <FaPause className="text-[10px]" />, label: "Pausado" },
  };
  const s = statusMap[estado] || statusMap["SUBIENDO"];
  return (
    <span className={`flex items-center gap-1.5 text-xs px-3 py-1 font-medium rounded-full border ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Componente Principal ───────────────────────────────
export default function CargaArchivos() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [batchStatus, setBatchStatus] = useState(null);
  const [showZipWarningModal, setShowZipWarningModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Carga Masiva");
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const pollingRef = useRef(null);
  const { isAdmin, isOperador, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin && !isOperador) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, isOperador, router]);

  // ─── Validación de archivos ───────────────────────────
  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Extensión "${ext}" no permitida`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Excede el límite de ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const addFiles = useCallback((newFiles) => {
    const filesArray = Array.from(newFiles);
    const validated = filesArray.map((file) => {
      const error = validateFile(file);
      return {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        file,
        name: file.name,
        size: file.size,
        error,
      };
    });
    setSelectedFiles((prev) => [...prev, ...validated]);
  }, []);

  // ─── Drag & Drop ─────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setSelectedFiles([]);
  };

  // ─── Upload Lote ──────────────────────────────────────
  const handleUpload = async (skipWarning = false) => {
    const validFiles = selectedFiles.filter((f) => !f.error);
    if (validFiles.length === 0) return;

    if (skipWarning !== true) {
      const hasZip = validFiles.some((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ["zip", "rar", "7z"].includes(ext);
      });
      if (hasZip) {
        setShowZipWarningModal(true);
        return;
      }
    }

    setShowZipWarningModal(false);
    setIsUploading(true);
    const formData = new FormData();
    validFiles.forEach((f) => formData.append("files", f.file));

    try {
      const res = await api.post("/cargas-masivas/upload-lote", formData);
      const newBatchId = res.data.batch_id;
      setBatchId(newBatchId);
      localStorage.setItem("xelsync_current_batch_id", newBatchId);
      setSelectedFiles([]);
      // Iniciar polling del lote
      startPolling(newBatchId);
    } catch (err) {
      console.error("Error subiendo lote:", err);
      const dataDetail = err.response?.data?.detail;
      const errorMessage = Array.isArray(dataDetail) 
        ? dataDetail.map(d => `${d.loc ? d.loc[d.loc.length-1] + ': ' : ''}${d.msg}`).join(' | ')
        : dataDetail || "Error al subir los archivos";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Polling de estado del lote ───────────────────────
  const startPolling = (id) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const poll = async () => {
      try {
        const res = await api.get(`/cargas-masivas/lote/${id}`);
        setBatchStatus(res.data);
        setUploadedFiles(res.data.archivos || []);

        // Detener polling si todos terminaron
        const allDone = res.data.archivos?.every(
          (a) => a.estado === "COMPLETADO" || a.estado === "ERROR"
        );
        if (allDone && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (err) {
        console.error("Error polling lote:", err);
        if (err.response?.status === 404) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          localStorage.removeItem("xelsync_current_batch_id");
          setBatchId(null);
        }
      }
    };

    poll(); // Primera llamada inmediata
    pollingRef.current = setInterval(poll, 3000);
  };

  // Cleanup polling on unmount and restore batch from local storage
  useEffect(() => {
    try {
      const savedBatchId = localStorage.getItem("xelsync_current_batch_id");
      console.log("CargaArchivos montado. Buscando batchId local:", savedBatchId);
      
      if (savedBatchId) {
        console.log("Restaurando batch:", savedBatchId);
        setBatchId(savedBatchId);
        startPolling(savedBatchId);
      }
    } catch (err) {
      console.error("Error accediendo a localStorage:", err);
    }

    return () => {
      console.log("CargaArchivos desmontado. Limpiando polling.");
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [batchId]);

  const handleCancel = async (archivoId) => {
    try {
      await api.post(`/cargas-masivas/archivo/${archivoId}/cancelar`);
      setUploadedFiles(prev => prev.map(f => f.id === archivoId ? { ...f, estado: "CANCELADO" } : f));
    } catch (err) {
      console.error("Error al cancelar", err);
      alert(err.response?.data?.detail || "No se pudo cancelar la extracción");
    }
  };

  const handlePause = async (archivoId) => {
    try {
      await api.post(`/cargas-masivas/archivo/${archivoId}/pausar`);
      setUploadedFiles(prev => prev.map(f => f.id === archivoId ? { ...f, estado: "PAUSADO" } : f));
    } catch (err) {
      console.error("Error al pausar", err);
      alert(err.response?.data?.detail || "No se pudo pausar la extracción");
    }
  };

  const handleResume = async (archivoId) => {
    try {
      await api.post(`/cargas-masivas/archivo/${archivoId}/reanudar`);
      setUploadedFiles(prev => prev.map(f => f.id === archivoId ? { ...f, estado: "EN_PROCESO" } : f));
    } catch (err) {
      console.error("Error al reanudar", err);
      alert(err.response?.data?.detail || "No se pudo reanudar la extracción");
    }
  };

  // ─── Retry archivo individual ─────────────────────────
  const handleRetry = async (archivoId) => {
    try {
      await api.post(`/extraccion/retry/${archivoId}`);
      if (batchId) startPolling(batchId);
    } catch (err) {
      console.error("Error reintentando:", err);
    }
  };

  const validCount = selectedFiles.filter((f) => !f.error).length;
  const invalidCount = selectedFiles.length - validCount;

  // Los cancelados desaparecen de la pantalla
  const activeUploadedFiles = uploadedFiles.filter(f => f.estado !== "CANCELADO");
  
  const filteredFiles = activeUploadedFiles.filter((f) =>
    f.nombre_original?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (authLoading || (!isAdmin && !isOperador)) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  }

  // ─── Renderizado ───────────────────────────────────────
  return (
    <MainLayout>
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Carga de Archivos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sube tus pedimentos (PDF), Anexos o Glosas (ZIP, ASC).
            </p>
          </div>
          <InfoModal title="Carga de Archivos">
            <p>
              Sube los archivos necesarios para la validación y extracción inteligente:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>PDF:</strong> Pedimentos simples (IA los extraerá).</li>
              <li><strong>ZIP:</strong> Para carga masiva (fan-out automático).</li>
              <li><strong>Glosa/M3:</strong> Archivos del SAT para validación cruzada.</li>
            </ul>
          </InfoModal>
        </div>
      </div>

      {/* ─── Drop Zone ──────────────────────────────── */}
      <div
        id="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-10 transition-all duration-300 group cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 scale-[1.01] shadow-xl shadow-blue-500/10"
              : "border-gray-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5"
          }
          backdrop-blur-sm
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          id="file-upload-input"
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
          id="folder-upload-input"
        />

        <div className="flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-all duration-300
              ${
                isDragActive
                  ? "bg-blue-500/20 text-blue-500 scale-110"
                  : "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-500/70 group-hover:scale-105 group-hover:text-blue-500"
              }
            `}
          >
            <FaCloudUploadAlt className="text-4xl" />
          </div>

          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {isDragActive
              ? "Suelta los archivos aquí"
              : "Arrastra tus archivos o elige una opción"}
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Seleccionar Archivos
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Seleccionar Carpeta
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            PDF, ZIP, TXT, CSV, ASC — Máximo {MAX_FILE_SIZE_MB}MB por archivo
          </p>

          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {[
              { ext: ".pdf", label: "Pedimentos", color: "text-red-500 bg-red-500/10 border-red-500/20" },
              { ext: ".zip", label: "Carpetas", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
              { ext: ".txt", label: "Archivos M3", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
              { ext: ".asc", label: "Glosas SAT", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
            ].map((t) => (
              <span
                key={t.ext}
                className={`text-xs px-3 py-1 rounded-full border font-medium ${t.color}`}
              >
                {t.ext} {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Lista de archivos seleccionados ─────────── */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="text-blue-500" />
              <h2 className="font-bold text-gray-800 dark:text-gray-100">
                Archivos Seleccionados
              </h2>
              <span className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
                {validCount} válidos
              </span>
              {invalidCount > 0 && (
                <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-full font-medium">
                  {invalidCount} con error
                </span>
              )}
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <FaTimes className="text-xs" /> Limpiar todo
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {selectedFiles.map((f) => (
              <div
                key={f.id}
                className={`flex items-center justify-between px-5 py-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 transition-colors
                  ${f.error ? "bg-red-50/50 dark:bg-red-500/5" : "hover:bg-gray-50 dark:hover:bg-slate-700/30"}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{getFileIcon(f.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(f.size)}
                      {f.error && (
                        <span className="text-red-500 ml-2">— {f.error}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 ml-2"
                >
                  <FaTrashAlt className="text-sm" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {validCount} archivo{validCount !== 1 ? "s" : ""} listo{validCount !== 1 ? "s" : ""} para subir
            </p>
            <button
              id="upload-button"
              onClick={() => handleUpload(false)}
              disabled={validCount === 0 || isUploading}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
                ${
                  validCount > 0 && !isUploading
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95"
                    : "bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt /> Subir {validCount} archivo{validCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Progreso del Lote ──────────────────────── */}
      {batchStatus && (
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <FaSearch className="text-blue-500 text-sm" />
              Progreso del Lote
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              {batchStatus.batch_id?.slice(0, 8)}...
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${batchStatus.progreso_global}%` }}
            />
            {batchStatus.progreso_global < 100 && batchStatus.progreso_global > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{batchStatus.total_archivos}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{batchStatus.completados}</p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Completados</p>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{batchStatus.en_proceso}</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">En Proceso</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{batchStatus.errores}</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70">Errores</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tabla de archivos procesados ────────────── */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">
              Archivos Procesados ({filteredFiles.length})
            </h2>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                id="search-files"
                type="text"
                placeholder="Buscar archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-semibold">Archivo</th>
                  <th className="text-center px-3 py-3 font-semibold">Estado</th>
                  <th className="text-center px-3 py-3 font-semibold">Progreso</th>
                  <th className="text-right px-5 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {filteredFiles.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">
                          {getFileIcon(f.nombre_original)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
                            {f.nombre_original}
                          </p>
                          {f.mensaje_error && (
                          <div className={`text-xs mt-1 ${f.estado === 'COMPLETADO' ? 'text-green-500' : (f.estado === 'ERROR' ? 'text-red-500' : 'text-yellow-500')}`}>
                            {f.mensaje_error}
                          </div>
                        )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {getStatusBadge(f.estado)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              f.estado === "ERROR"
                                ? "bg-red-500"
                                : f.estado === "COMPLETADO"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${f.progreso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-mono w-8 text-right">
                          {f.progreso}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {f.estado === "ERROR" && (
                          <button
                            onClick={() => handleRetry(f.id)}
                            title="Reintentar extracción"
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all"
                          >
                            <FaRedo className="text-sm" />
                          </button>
                        )}
                        {!["COMPLETADO", "ERROR", "CANCELADO"].includes(f.estado) && (
                          <>
                            {f.estado === "PAUSADO" ? (
                              <button
                                onClick={() => handleResume(f.id)}
                                title="Reanudar extracción"
                                className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                              >
                                <FaPlay className="text-sm" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePause(f.id)}
                                title="Pausar extracción"
                                className="p-2 text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-all"
                              >
                                <FaPause className="text-sm" />
                              </button>
                            )}
                            <button
                              onClick={() => handleCancel(f.id)}
                              title="Cancelar extracción"
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          </>
                        )}
                        {f.tracking_id && (
                          <a
                            href={`/pedimentos/${f.tracking_id}`}
                            title="Ver pedimento"
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                          >
                            <FaEye className="text-sm" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Upload Button */}
      {selectedFiles.length > 0 && !isUploading && (
        <div className="fixed bottom-8 right-8 z-40 animate-fade-in">
          <button
            onClick={() => handleUpload(false)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-xl hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 font-semibold text-lg"
          >
            <FaCloudUploadAlt className="text-2xl" />
            Subir {selectedFiles.filter((f) => !f.error).length} archivo(s)
          </button>
        </div>
      )}

      {/* Zip Warning Modal */}
      {showZipWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 flex-shrink-0">
                <FaFileArchive className="text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Validación de Archivos Comprimidos
              </h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4 mb-6">
              <p>
                Has seleccionado uno o más archivos comprimidos (ZIP). Antes de subirlo, por favor asegúrate de que el interior de la carpeta comprimida contenga:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-gray-700 dark:text-gray-200">
                <li>Archivos de Data Stage (M3)</li>
                <li>Archivos de Glosas (.asc)</li>
                <li>Pedimentos en formato PDF</li>
              </ul>
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                <strong>Nota:</strong> Los archivos de acuse de validación (.err) que solo contienen firmas electrónicas y líneas de captura no contienen datos de pedimentos válidos y serán ignorados.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowZipWarningModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Revisar Archivos
              </button>
              <button
                onClick={() => handleUpload(true)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Sí, continuar subida
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
