"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import ConfirmModal from "@/components/shared/ConfirmModal";
import InfoModal from "@/components/shared/InfoModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [confirmState, setConfirmState] = useState({ isOpen: false });
  const [infoState, setInfoState] = useState({ isOpen: false });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || "Confirmación",
        message,
        confirmText: options.confirmText || "Aceptar",
        cancelText: options.cancelText || "Cancelar",
        isDestructive: options.isDestructive || false,
        showCheckbox: options.showCheckbox || false,
        checkboxLabel: options.checkboxLabel || "",
        initialCheckboxState: options.initialCheckboxState || false,
        onConfirm: (checkboxState) => {
          setConfirmState({ isOpen: false });
          resolve(options.showCheckbox ? checkboxState : true);
        },
        onClose: () => {
          setConfirmState({ isOpen: false });
          resolve(false);
        },
      });
    });
  }, []);

  const alert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setInfoState({
        isOpen: true,
        title: options.title || "Información",
        message,
        type: options.type || "info",
        onClose: () => {
          setInfoState({ isOpen: false });
          resolve(true);
        },
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDestructive={confirmState.isDestructive}
        showCheckbox={confirmState.showCheckbox}
        checkboxLabel={confirmState.checkboxLabel}
        initialCheckboxState={confirmState.initialCheckboxState}
        onConfirm={confirmState.onConfirm}
        onClose={confirmState.onClose}
      />
      {infoState.isOpen && (
        <InfoModal
          isOpen={infoState.isOpen}
          title={infoState.title}
          message={infoState.message}
          type={infoState.type}
          onClose={infoState.onClose}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
