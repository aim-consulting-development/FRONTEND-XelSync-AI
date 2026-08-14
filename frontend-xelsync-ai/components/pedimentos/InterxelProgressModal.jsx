import { FaFileExcel, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function InterxelProgressModal({ isOpen, status, error, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FaFileExcel className="text-3xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Generando Archivo InterXel
          </h3>
          
          {status === 'loading' && (
            <>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                Construyendo y mapeando datos en la plantilla. Por favor espera...
              </p>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-blue-500 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
              <div className="mt-4 flex justify-center">
                <span className="text-blue-500 flex items-center gap-2 text-sm font-medium">
                  <FaSpinner className="animate-spin" /> Procesando...
                </span>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="text-center animate-in slide-in-from-bottom-2">
              <div className="text-emerald-500 flex justify-center mb-3">
                <FaCheckCircle className="text-5xl" />
              </div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-6">
                ¡Archivo generado y descargado con éxito!
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center animate-in slide-in-from-bottom-2">
              <div className="text-red-500 flex justify-center mb-3">
                <FaTimesCircle className="text-5xl" />
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                Ocurrió un error en la generación
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {error || "Se agotó el tiempo de espera o el servidor falló."}
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
