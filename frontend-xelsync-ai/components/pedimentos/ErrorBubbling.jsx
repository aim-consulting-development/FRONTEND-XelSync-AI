import { FaExclamationTriangle, FaCheckCircle, FaMagic, FaTimes } from "react-icons/fa";

export default function ErrorBubbling({ errores = [], onApplySugerencia, onDismiss }) {
  if (!errores || errores.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-6 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
        <FaCheckCircle className="text-emerald-500 text-xl" />
        <p className="text-emerald-800 dark:text-emerald-300 font-medium">Sin observaciones pendientes. Listo para aprobar.</p>
      </div>
    );
  }

  const hasErrors = errores.some(e => e.severidad === "ERROR");

  return (
    <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
      hasErrors 
        ? "bg-red-50 dark:bg-red-900/10 border-red-500 shadow-red-100 dark:shadow-none" 
        : "bg-amber-50 dark:bg-amber-900/10 border-amber-500 shadow-amber-100 dark:shadow-none"
    }`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
        <FaExclamationTriangle className={hasErrors ? "text-red-500" : "text-amber-500"} />
        <h3 className={`font-semibold ${hasErrors ? "text-red-800 dark:text-red-400" : "text-amber-800 dark:text-amber-400"}`}>
          Campos que requieren atención inmediata ({errores.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {errores.map((err, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Campo: <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">{err.campo}</span></span>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                err.severidad === "ERROR" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
              }`}>
                {err.severidad}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded border border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Valor actual en documento:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{err.valor || "(Vacío)"}</span>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded border border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Motivo:</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{err.mensaje}</span>
              </div>
            </div>

            {err.sugerencia_ia && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div className="flex items-start sm:items-center gap-2">
                  <FaMagic className="text-emerald-500 mt-1 sm:mt-0" />
                  <div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase block">Sugerencia Inteligente IA</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{err.sugerencia_ia.valor_sugerido || err.sugerencia_ia}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onApplySugerencia(err)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/50 dark:text-emerald-300 text-xs font-bold rounded transition-colors whitespace-nowrap"
                  >
                    Aceptar sugerencia
                  </button>
                  <button 
                    onClick={() => onDismiss(err)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                    title="Ignorar"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}
            
            {!err.sugerencia_ia && (
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={() => onDismiss(err)}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-medium rounded transition-colors"
                >
                  Marcar como revisado
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
