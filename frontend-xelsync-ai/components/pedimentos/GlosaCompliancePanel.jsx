import { useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaDatabase, FaListOl, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function GlosaCompliancePanel({ validacion }) {
  const [isMinimized, setIsMinimized] = useState(false);

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

  const { status, puntos_revisados, discrepancias } = validacion;

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
              Cruce Data Stage (Glosa SAT)
              <span className="text-sm bg-white/30 dark:bg-black/20 px-2 py-0.5 rounded-full font-medium">
                {isMinimized ? "Minimizado" : "Expandido"}
              </span>
            </h3>
            {!isMinimized && (
              <p className="text-sm opacity-80 mt-1">
                Validación de pedimento vs Data Stage M3 mensual del SAT
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium items-center">
          <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            <FaDatabase className="opacity-70" />
            <span>Verificado en Glosa</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full">
            <FaListOl className="opacity-70" />
            <span>Puntos Revisados: {puntos_revisados}</span>
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
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-2">
          {discrepancias && discrepancias.length > 0 ? (
            <div>
              <h4 className="font-semibold mb-2">Discrepancias Detectadas (Riesgo Fiscal):</h4>
              <ul className="space-y-2">
                {discrepancias.map((disc, idx) => (
                  <li key={idx} className="bg-white/60 dark:bg-black/20 p-3 rounded-md text-sm flex gap-2">
                    <span className="font-semibold text-red-900 dark:text-red-400">{disc.campo}:</span> 
                    {disc.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            status === "GREEN" && (
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-md text-sm text-green-900 dark:text-green-400 font-medium flex items-center gap-2">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                Todos los valores concuerdan al 100% con la Glosa SAT (Data Stage).
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
