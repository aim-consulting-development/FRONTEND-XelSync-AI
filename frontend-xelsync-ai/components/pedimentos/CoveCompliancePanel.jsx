import { useState, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaFileInvoice, FaBoxes, FaUpload, FaSpinner } from "react-icons/fa";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CoveCompliancePanel({ validacion, pedimentoId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!validacion) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case "GREEN": return "bg-green-100 text-green-800 border-green-200";
      case "YELLOW": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "GREEN": return <FaCheckCircle className="text-green-600 text-2xl" />;
      case "YELLOW": return <FaExclamationTriangle className="text-yellow-600 text-2xl" />;
      case "RED": return <FaTimesCircle className="text-red-600 text-2xl" />;
      default: return null;
    }
  };

  const handleUploadCove = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xml")) {
      toast.error("El archivo debe ser un XML.");
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
    <div className={`mt-6 mb-6 p-4 rounded-lg border ${getStatusColor(status)} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="font-semibold text-lg">Cruce Inteligente (Compliance)</h3>
            <p className="text-sm opacity-80">
              Validación de valores del Pedimento vs. Documentos XML (COVE / CFDI)
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
            <FaFileInvoice className="opacity-70" />
            <span>Facturas en Pedimento: {facturas_pedimento}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
            <FaBoxes className="opacity-70" />
            <span>XMLs cruzados en Lote: {xmls_encontrados}</span>
          </div>
        </div>
      </div>

      {discrepancias && discrepancias.length > 0 ? (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Discrepancias Detectadas:</h4>
          <ul className="space-y-2">
            {discrepancias.map((disc, idx) => (
              <li key={idx} className="bg-white/60 p-3 rounded-md text-sm flex justify-between items-center gap-2">
                <div>
                  <span className="font-semibold text-red-900">{disc.factura}:</span>{" "}
                  {disc.mensaje}
                </div>
              </li>
            ))}
          </ul>
          
          {hasMissingXmls && (
            <div className="mt-4 flex items-center gap-3">
              <input
                type="file"
                accept=".xml"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadCove}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              >
                {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                {isUploading ? "Procesando..." : "Subir Archivo COVE/XML"}
              </button>
              <p className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded">
                Sube el XML faltante para validar automáticamente.
              </p>
            </div>
          )}
        </div>
      ) : (
        status === "GREEN" && (
          <div className="mt-4 bg-white/60 p-3 rounded-md text-sm text-green-900 font-medium flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Todos los valores y cantidades cuadran al 100% entre el Pedimento y los Acuses COVE.
          </div>
        )
      )}
    </div>
  );
}
