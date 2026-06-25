"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  FaSave,
  FaUndo,
  FaRobot,
  FaShieldAlt,
  FaChartLine,
  FaBell,
  FaDatabase,
  FaCloudUploadAlt,
  FaKey,
  FaGlobe,
  FaBuilding,
  FaCertificate,
  FaCheckCircle,
} from "react-icons/fa";

export default function Configuracion() {
  const [config, setConfig] = useState({
    // Parámetros Generales
    slaPedimentos: 48,
    maxIntentosLogin: 5,
    sessionTimeout: 30,
    twoFactorAuth: true,
    
    // Inteligencia Artificial
    proveedorIA: "Anthropic Claude",
    modeloIA: "claude-3-5-sonnet-20241022",
    apiKeyIA: "",
    temperaturaIA: 0.7,
    
    // Certificación IVA/IEPS (Anexo 30)
    empresaCertificada: "AIM S.A. de C.V.",
    nivelCertificacion: "AAA",
    rfc: "AIM123456789",
    fechaCertificacion: "2024-01-15",
    
    // Notificaciones
    notificacionesEmail: true,
    notificacionesPush: true,
    alertasSLA: true,
    
    // Base de datos
    autoBackup: true,
    backupHour: "02:00",
    retencionDatos: 12,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const proveedoresIA = [
    "Anthropic Claude",
    "OpenAI GPT-4",
    "Google Gemini",
    "Cohere",
    "Mistral AI",
    "Local LLM",
  ];

  const modelosIA = {
    "Anthropic Claude": ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    "OpenAI GPT-4": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    "Google Gemini": ["gemini-1.5-pro", "gemini-1.5-flash"],
    "Cohere": ["command-r-plus", "command-r"],
    "Mistral AI": ["mistral-large", "mixtral-8x7b"],
    "Local LLM": ["llama-3", "phi-3"],
  };

  const nivelesCertificacion = ["AAA", "AA", "A", "B", "C"];

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // Aquí iría la llamada a la API para guardar la configuración
    console.log("Configuración guardada:", config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de que deseas restaurar la configuración por defecto?")) {
      // Resetear a valores por defecto
      setConfig({
        slaPedimentos: 48,
        maxIntentosLogin: 5,
        sessionTimeout: 30,
        twoFactorAuth: true,
        proveedorIA: "Anthropic Claude",
        modeloIA: "claude-3-5-sonnet-20241022",
        apiKeyIA: "",
        temperaturaIA: 0.7,
        empresaCertificada: "AIM S.A. de C.V.",
        nivelCertificacion: "AAA",
        rfc: "AIM123456789",
        fechaCertificacion: "2024-01-15",
        notificacionesEmail: true,
        notificacionesPush: true,
        alertasSLA: true,
        autoBackup: true,
        backupHour: "02:00",
        retencionDatos: 12,
      });
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Parámetros globales de XelSync AI
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200"
        >
          <FaUndo />
          Restaurar
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
        >
          <FaSave />
          Guardar Cambios
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
          <FaCheckCircle />
          Configuración guardada exitosamente
        </div>
      )}

      <div className="space-y-6">
        {/* Parámetros Generales */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaShieldAlt className="text-blue-500" />
              Parámetros Generales
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SLA de Pedimentos (horas)
                </label>
                <input
                  type="number"
                  value={config.slaPedimentos}
                  onChange={(e) => handleChange("slaPedimentos", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tiempo máximo para atención de pedimentos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intentos máximos de login
                </label>
                <input
                  type="number"
                  value={config.maxIntentosLogin}
                  onChange={(e) => handleChange("maxIntentosLogin", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número de intentos antes de bloquear la cuenta
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tiempo de sesión (minutos)
                </label>
                <input
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tiempo de inactividad para cierre automático
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Autenticación de dos factores
                </label>
                <select
                  value={config.twoFactorAuth ? "si" : "no"}
                  onChange={(e) => handleChange("twoFactorAuth", e.target.value === "si")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="si">Activado</option>
                  <option value="no">Desactivado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inteligencia Artificial */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaRobot className="text-purple-500" />
              Inteligencia Artificial
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proveedor IA Primario
                </label>
                <select
                  value={config.proveedorIA}
                  onChange={(e) => handleChange("proveedorIA", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {proveedoresIA.map((proveedor) => (
                    <option key={proveedor} value={proveedor}>
                      {proveedor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo IA
                </label>
                <select
                  value={config.modeloIA}
                  onChange={(e) => handleChange("modeloIA", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {modelosIA[config.proveedorIA]?.map((modelo) => (
                    <option key={modelo} value={modelo}>
                      {modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKeyIA}
                    onChange={(e) => handleChange("apiKeyIA", e.target.value)}
                    placeholder="Ingresa tu API Key"
                    className="w-full px-4 py-2 pr-20 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-sm text-blue-600 dark:text-blue-400"
                  >
                    {showApiKey ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperatura / Creatividad
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperaturaIA}
                    onChange={(e) => handleChange("temperaturaIA", parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-12">
                    {config.temperaturaIA}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Valores bajos = más preciso, altos = más creativo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificación IVA/IEPS (Anexo 30) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaCertificate className="text-green-500" />
              Certificación IVA/IEPS (Anexo 30)
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa certificada
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={config.empresaCertificada}
                    onChange={(e) => handleChange("empresaCertificada", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RFC
                </label>
                <input
                  type="text"
                  value={config.rfc}
                  onChange={(e) => handleChange("rfc", e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel de certificación
                </label>
                <select
                  value={config.nivelCertificacion}
                  onChange={(e) => handleChange("nivelCertificacion", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {nivelesCertificacion.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de certificación
                </label>
                <input
                  type="date"
                  value={config.fechaCertificacion}
                  onChange={(e) => handleChange("fechaCertificacion", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones (Opcional) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBell className="text-yellow-500" />
              Notificaciones
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Notificaciones por Email</span>
                <input
                  type="checkbox"
                  checked={config.notificacionesEmail}
                  onChange={(e) => handleChange("notificacionesEmail", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Notificaciones Push</span>
                <input
                  type="checkbox"
                  checked={config.notificacionesPush}
                  onChange={(e) => handleChange("notificacionesPush", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Alertas de SLA</span>
                <input
                  type="checkbox"
                  checked={config.alertasSLA}
                  onChange={(e) => handleChange("alertasSLA", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Backup y Retención */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaDatabase className="text-cyan-500" />
              Base de Datos y Backup
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer">
                <span className="text-gray-700 dark:text-gray-300">Backup Automático</span>
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => handleChange("autoBackup", e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hora de Backup
                </label>
                <input
                  type="time"
                  value={config.backupHour}
                  onChange={(e) => handleChange("backupHour", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retención de datos (meses)
                </label>
                <input
                  type="number"
                  value={config.retencionDatos}
                  onChange={(e) => handleChange("retencionDatos", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200">
                  <FaCloudUploadAlt />
                  Realizar Backup Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}