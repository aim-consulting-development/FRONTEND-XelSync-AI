import { useState, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaFileInvoice, FaBoxes, FaUpload, FaSpinner, FaChevronDown, FaChevronUp } from "react-icons/fa";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CoveCompliancePanel({ validacion, pedimentoId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const fileInputRef = useRef(null);

  if (!validacion) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case "GREEN": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "YELLOW": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "RED": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "GREEN": return <FaCheckCircle className="text-green-600 dark:text-green-400 text-2xl" />;
      case "YELLOW": return <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-2xl" />;
      case "RED": return <FaTimesCircle className="text-red-600 dark:text-red-400 text-2xl" />;
      default: return null;
    }
  };

  const handleUploadCove = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== "xml" && ext !== "pdf") {
      toast.error("El archivo debe ser un XML o PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const uploadToast = toast.loading("Subiendo y validando COVE...");
    try {
      await api.post(`/pedimentos/${pedimentoId}/cove-xml`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("COVE cargado y validado exitosamente.", { id: uploadToast });
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Error subiendo COVE:", error);
      const errorMsg = error.response?.data?.detail || "Hubo un error al subir el archivo COVE.";
      toast.error(errorMsg, { id: uploadToast });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { status, facturas_pedimento, xmls_encontrados, discrepancias } = validacion;
  const hasMissingXmls = discrepancias?.some(disc => disc.mensaje.includes("No se encontró el XML"));

  return (
    <div className={`mt-6 mb-6 p-4 rounded-lg border ${getStatusColor(status)} shadow-sm transition-all duration-300`}>
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Cruce Inteligente (Compliance)
              <span className="text-sm bg-white/30 dark:bg-black/20 px-2 py-0.5 rounded-full font-medium">
                {isMinimized ? "Minimizado" : "Expandido"}
              </span>
            </h3>
            {!isMinimized && (
              <p className="text-sm opacity-80 mt-1">
                Validación de valores del Pedimento vs. Documentos XML (COVE / CFDI)
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium items-center">
          <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            <FaFileInvoice className="opacity-70" />
            <span>Facturas: {facturas_pedimento}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            <FaBoxes className="opacity-70" />
            <span>XMLs: {xmls_encontrados}</span>
          </div>
          <button 
            className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
            title={isMinimized ? "Expandir panel" : "Minimizar panel"}
          >
            {isMinimized ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Alerta de múltiples COVEs (Punto 3) */}
          {facturas_pedimento > 1 && (
            <div className="mt-3 mb-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 p-3 rounded-lg text-sm font-medium">
              <FaExclamationTriangle className="text-amber-500 text-lg flex-shrink-0" />
              <div>
                <span className="font-bold">Múltiples e-documentos/COVE detectados ({facturas_pedimento}).</span>{" "}
                Se requiere validar la factura de cada COVE individualmente. Suba el XML o PDF de cada factura para completar la validación.
              </div>
            </div>
          )}

          {discrepancias && discrepancias.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-semibold mb-2 opacity-90">Discrepancias Detectadas:</h4>
              <ul className="space-y-2">
                {discrepancias.map((disc, idx) => (
                  <li key={idx} className="bg-white/60 dark:bg-black/20 p-3 rounded-md text-sm flex justify-between items-center gap-2 border border-black/5 dark:border-white/5">
                    <div>
                      <span className="font-semibold opacity-90">{disc.factura}:</span>{" "}
                      <span className="opacity-80">{disc.mensaje}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              {hasMissingXmls && (
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/30 dark:bg-black/20 p-4 rounded-lg border border-black/5 dark:border-white/10">
                  <input
                    type="file"
                    accept=".xml,.pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUploadCove}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    disabled={isUploading}
                    className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    {isUploading ? "Procesando..." : "Subir Archivo (XML/PDF)"}
                  </button>
                  <p className="text-xs opacity-70">
                    Sube el documento faltante para validar automáticamente.
                  </p>
                </div>
              )}
            </div>
          ) : (
            status === "GREEN" && (
              <div className="mt-4 bg-white/60 dark:bg-black/20 p-3 rounded-md text-sm font-medium flex items-center gap-2 border border-black/5 dark:border-white/5">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                <span className="opacity-90">¡Éxito! El pedimento ya tiene su COVE asociado y los valores cuadran al 100%.</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
