import { useState } from "react";
import { FaQuestionCircle, FaTimes, FaInfoCircle } from "react-icons/fa";

export default function InfoModal({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-full transition-colors border border-blue-200 dark:border-blue-800"
        title="Información del módulo"
      >
        <FaQuestionCircle />
        Ayuda
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FaInfoCircle className="text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-600 dark:text-gray-300 space-y-4">
              {children}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-end bg-gray-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/25"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
