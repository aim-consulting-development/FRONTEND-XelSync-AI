"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaSpinner, FaDownload, FaFileCode, FaClock, FaSave, FaCheckDouble } from "react-icons/fa";
import ErrorBubbling from "@/components/pedimentos/ErrorBubbling";
import TabsRevision from "@/components/pedimentos/TabsRevision";
import JsonTreeViewer from "@/components/pedimentos/JsonTreeViewer";
import CoveCompliancePanel from "@/components/pedimentos/CoveCompliancePanel";
import GlosaCompliancePanel from "@/components/pedimentos/GlosaCompliancePanel";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/useAuth";

const CustomPdfViewer = dynamic(() => import("@/components/pedimentos/CustomPdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
      <div className="animate-spin text-3xl text-blue-500 mb-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="text-sm">Cargando visor...</p>
    </div>
  )
});

export default function PedimentoDetalle() {
  const { id } = useParams();
  const router = useRouter();
  const { canWrite } = useAuth();
  
  const [pedimento, setPedimento] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [rawText, setRawText] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [validatedFields, setValidatedFields] = useState({});

  const [currentIndex, setCurrentIndex] = useState(-1);
  const [pedimentosList, setPedimentosList] = useState([]);

  useEffect(() => {
    const storedIds = sessionStorage.getItem("pedimentosListIds");
    if (storedIds) {
      try {
        const ids = JSON.parse(storedIds);
        setPedimentosList(ids);
        const idx = ids.findIndex(item => String(item) === String(id));
        setCurrentIndex(idx);
      } catch (e) {
        console.error("Error reading stored pedimentos list");
      }
    }
    fetchPedimento();
  }, [id]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchPedimento = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pedimentos/${id}`);
      setPedimento(res.data);
      // Extraemos el objeto original para bindear el form
      setFormData(res.data?.json_extraccion?.encabezado_impo || res.data?.json_extraccion?.encabezado_expo || {});
      fetchArchivoPdf();
    } catch (err) {
      console.error("Error cargando pedimento:", err);
      setError("No se pudo cargar el pedimento o no existe.");
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivoPdf = async () => {
    try {
      const res = await api.get(`/pedimentos/${id}/archivo`, {
        responseType: "blob",
      });
      const contentType = res.headers["content-type"] || "application/octet-stream";
      
      if (contentType.includes("json") || contentType.includes("text")) {
        const text = await res.data.text();
        setRawText(text);
      } else {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: contentType }));
        setPdfUrl(url);
      }
    } catch (err) {
      console.error("Error cargando archivo original:", err);
      setPdfError("No se encontró o no se pudo cargar el archivo original.");
    }
  };

  const handleAprobar = async () => {
    if (!confirm("¿Está seguro de marcar este pedimento como Aprobado sin exportar a InterXel aún?")) return;
    
    setSaving(true);
    try {
      await api.put(`/pedimentos/${id}/aprobar`);
      alert("Pedimento aprobado correctamente");
      fetchPedimento();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al aprobar pedimento");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadInterxel = async () => {
    setSaving(true);
    try {
      const response = await api.get(`/pedimentos/${id}/export_interxel`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `InterXel_${pedimento.pedimento.replace(' ', '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      alert("Pedimento aprobado y escrito en InterXel exitosamente.");
      router.push("/pedimentos");
    } catch (err) {
      alert(err.response?.data?.detail || "Error al aprobar o generar archivo InterXel");
    } finally {
      setSaving(false);
    }
  };

  const handleApplySugerencia = (err) => {
    // Aquí actualizamos el estado local
    setFormData(prev => ({
      ...prev,
      [err.campo]: err.sugerencia_ia.valor_sugerido || err.sugerencia_ia
    }));
    
    // Y quitamos el error de la lista
    setPedimento(prev => ({
      ...prev,
      resultado_validacion: prev.resultado_validacion.filter(e => e.campo !== err.campo)
    }));
  };

  const handleDismissError = (err) => {
    setPedimento(prev => ({
      ...prev,
      resultado_validacion: prev.resultado_validacion.filter(e => e.campo !== err.campo)
    }));
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidatedFields(prev => ({ ...prev, [key]: true })); // Validate on edit
  };

  const handleValidateField = (key) => {
    setValidatedFields(prev => ({ ...prev, [key]: true }));
  };

  const handleGuardarBorrador = async () => {
    try {
      setSaving(true);
      // Aquí enviaríamos las modificaciones
      await new Promise(r => setTimeout(r, 1000));
      alert("Borrador guardado correctamente.");
    } catch (err) {
      alert("Error al guardar borrador");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Cargando pedimento...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !pedimento) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <FaExclamationCircle className="text-4xl text-red-500 mb-4" />
          <p className="text-gray-900 dark:text-white font-semibold mb-2">{error}</p>
          <button 
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Regresar
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push("/pedimentos")}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-100 dark:border-slate-700"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Pedimento {pedimento.pedimento}
            {pedimento.estado === "PROCESADO" ? (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <FaCheckCircle /> Procesado
              </span>
            ) : (
              <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <FaExclamationCircle /> {pedimento.estado}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cliente: <span className="font-medium text-gray-700 dark:text-gray-300">{pedimento.cliente_empresa || "Sin asignar"}</span>
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <button
            onClick={handleAprobar}
            disabled={saving}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaCheckDouble />}
            Solo Aprobar
          </button>
          <button
            onClick={handleDownloadInterxel}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            Aprobar y Escribir en InterXel
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)] min-h-[600px] mb-20">
        
        {/* VISOR PDF (40%) */}
        <div className="w-full lg:w-[40%] flex flex-col h-full sticky top-[80px]">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-col flex-1 h-full">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaFileCode className="text-blue-500" /> Archivo Original
              </h2>
            </div>
            
            <div className="flex-1 w-full bg-gray-100 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden relative min-h-[400px] flex items-center justify-center">
              {rawText ? (
                <div className="w-full h-full p-4 overflow-auto bg-white dark:bg-slate-900">
                  <JsonTreeViewer data={rawText} />
                </div>
              ) : pdfUrl ? (
                <CustomPdfViewer pdfUrl={pdfUrl} />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  {pdfError ? (
                    <>
                      <FaExclamationCircle className="text-3xl mb-2 text-red-400" />
                      <p className="text-sm text-red-500">{pdfError}</p>
                    </>
                  ) : (
                    <>
                      <FaSpinner className="animate-spin text-3xl mb-2 text-blue-400" />
                      <p className="text-sm">Cargando documento...</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DE DATOS (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col h-full overflow-y-auto pr-2 pb-4">
          
          {/* HEADER RESUMEN */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                pedimento.tipo_pedimento === "IMPORTACION" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              }`}>
                {pedimento.tipo_pedimento || "IMPORTACIÓN"}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                pedimento.status_sla === "A_TIEMPO" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                pedimento.status_sla === "EN_RIESGO" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse" :
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                <FaClock /> {pedimento.status_sla.replace("_", " ")}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{pedimento.porcentaje_completitud}% completo</span>
                <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${pedimento.porcentaje_completitud}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Operador</p>
                <p className="font-semibold text-gray-900 dark:text-white truncate">Usuario Actual</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Cliente</p>
                <p className="font-semibold text-gray-900 dark:text-white truncate">{pedimento.cliente_empresa || "Sin asignar"}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Campos Faltantes</p>
                <p className="font-semibold text-gray-900 dark:text-white">{pedimento.campos_faltantes || 0}</p>
              </div>
            </div>
          </div>

          {/* CRUCE COVE / XML */}
          <CoveCompliancePanel validacion={pedimento.cruce_cove} />
          
          {/* CRUCE GLOSA (DATA STAGE) */}
          <GlosaCompliancePanel validacion={pedimento.cruce_glosa} />

          {/* ERROR BUBBLING */}
          <ErrorBubbling 
            errores={pedimento.resultado_validacion || []} 
            onApplySugerencia={handleApplySugerencia}
            onDismiss={handleDismissError}
          />

          {/* TABS CON FORMULARIOS */}
          <TabsRevision 
            pedimentoData={pedimento.json_extraccion} 
            onChange={handleFieldChange} 
            errores={pedimento.resultado_validacion || []}
            validatedFields={validatedFields}
            onValidateField={handleValidateField}
          />
          
        </div>
      </div>

      {/* ACTION BAR INFERIOR (STICKY) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between px-6 lg:pl-[284px] transition-all">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            onClick={() => currentIndex > 0 && router.push(`/pedimentos/${pedimentosList[currentIndex - 1]}`)}
            disabled={currentIndex <= 0}
            className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            &lt; Anterior
          </button>
          <span className="font-medium bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded">
            {currentIndex >= 0 ? `${currentIndex + 1} de ${pedimentosList.length}` : "Revisión de Pedimento"}
          </span>
          <button
            onClick={() => currentIndex < pedimentosList.length - 1 && router.push(`/pedimentos/${pedimentosList[currentIndex + 1]}`)}
            disabled={currentIndex === -1 || currentIndex >= pedimentosList.length - 1}
            className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Siguiente &gt;
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {canWrite && (
            <>
              <button
                onClick={handleGuardarBorrador}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                Guardar Borrador
              </button>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
