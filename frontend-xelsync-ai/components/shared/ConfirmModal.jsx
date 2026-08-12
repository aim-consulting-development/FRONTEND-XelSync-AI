"use client";

import React, { useEffect, useState } from "react";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  showCheckbox = false,
  checkboxLabel = "",
  initialCheckboxState = false,
}) {
  const [isChecked, setIsChecked] = useState(initialCheckboxState);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(initialCheckboxState);
    }
  }, [isOpen, initialCheckboxState]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(showCheckbox ? isChecked : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
            {isDestructive ? <FaExclamationTriangle size={24} /> : <FaInfoCircle size={24} />}
          </div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>

        {showCheckbox && (
          <div className="mt-4 flex items-start">
            <div className="flex items-center h-5">
              <input
                id="confirm-checkbox"
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <label htmlFor="confirm-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {checkboxLabel}
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`inline-flex justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${
              isDestructive 
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500' 
                : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500'
            }`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
