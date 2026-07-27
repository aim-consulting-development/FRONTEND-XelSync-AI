import { useState } from "react";
import { FaFileInvoice, FaListUl, FaHashtag, FaBuilding, FaBox, FaCaretDown, FaCaretRight } from "react-icons/fa";

export default function TabsRevision({ pedimentoData, onChange }) {
  const [activeTab, setActiveTab] = useState("encabezado");

  const tabs = [
    { id: "encabezado", label: "Encabezado", icon: <FaListUl /> },
    { id: "facturas", label: "Facturas", icon: <FaFileInvoice /> },
    { id: "partidas", label: "Partidas", icon: <FaBox /> },
    { id: "identificadores", label: "Identificadores", icon: <FaHashtag /> },
    { id: "proveedores", label: "Proveedores", icon: <FaBuilding /> },
    { id: "materiales", label: "Materiales", icon: <FaBox /> },
  ];

  // Helper to safely render inputs
  const renderInput = (key, label, value) => {
    return (
      <div key={key} className="flex flex-col">
        <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 truncate" title={label}>{label}</label>
        <input 
          type="text"
          value={value || ""}
          onChange={(e) => onChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    );
  };

  const renderEncabezado = () => {
    if (!pedimentoData) return <p className="text-gray-500 p-4">No hay datos</p>;
    
    // Filtramos las llaves que no son arrays u objetos complejos (las que empiezan con A_, B_, etc.)
    const camposPrincipales = Object.keys(pedimentoData).filter(
      k => !Array.isArray(pedimentoData[k]) && typeof pedimentoData[k] !== 'object'
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 animate-in fade-in">
        {camposPrincipales.map(key => renderInput(key, key.replace(/^[A-Z]+_/, '').replace(/_/g, ' '), pedimentoData[key]))}
      </div>
    );
  };

  const renderFacturas = () => {
    const facturas = pedimentoData?.facturas || pedimentoData?.json_extraccion?.facturas || [];
    if (facturas.length === 0) return <p className="text-gray-500 p-4">No se detectaron facturas.</p>;

    return (
      <div className="p-4 space-y-4 animate-in fade-in">
        {facturas.map((fac, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
              <span>Factura: {fac.AC_factura || fac.S_factura || `Factura ${idx + 1}`}</span>
              <span className="text-blue-500 font-mono text-sm">{fac.BA_valor_mon_fact || fac.AM_valor_mon_fact || "$0.00"} USD</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900">
              {Object.keys(fac).filter(k => k !== "partidas").map(key => renderInput(`factura_${idx}_${key}`, key.replace(/^[A-Z]+_/, ''), fac[key]))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPartidas = () => {
    const facturas = pedimentoData?.facturas || pedimentoData?.json_extraccion?.facturas || [];
    const partidas = facturas.flatMap(f => f.partidas || []);
    
    if (partidas.length === 0) return <p className="text-gray-500 p-4">No se detectaron partidas.</p>;

    return (
      <div className="p-4 overflow-x-auto animate-in fade-in">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500">
              <th className="p-2">Material</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Valor USD</th>
              <th className="p-2">Fracción</th>
              <th className="p-2">País</th>
              <th className="p-2">Forma Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {partidas.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                <td className="p-2 font-mono text-xs">{p.AV_material || p.AH_material || "-"}</td>
                <td className="p-2">{p.AY_cantidad_um_base || p.AK_cantidad_um_base || "0"}</td>
                <td className="p-2 font-mono text-blue-600 dark:text-blue-400">${p.BB_valor_usd || p.AN_valor_usd || "0.00"}</td>
                <td className="p-2 font-mono">{p.BD_fraccion || p.AO_fraccion || "-"}</td>
                <td className="p-2">{p.BE_pais_origen || p.AP_pais_destino || "-"}</td>
                <td className="p-2">
                  {p.BK_forma_pago === 21 || p.BK_forma_pago === "21" ? (
                    <span className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-2 py-0.5 rounded text-xs font-bold">21 - Crédito IVA</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">{p.BK_forma_pago || "-"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = (dataKey, emptyMessage = "No hay datos detectados en esta sección.") => {
    const data = pedimentoData?.[dataKey] || pedimentoData?.json_extraccion?.[dataKey] || [];
    if (!Array.isArray(data) || data.length === 0) return <p className="text-gray-500 p-4">{emptyMessage}</p>;

    // Obtener todas las columnas únicas de todos los objetos para evitar faltantes
    const columns = Array.from(new Set(data.flatMap(item => Object.keys(item).filter(k => k !== "null" && k !== "_tipo_registro"))));

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
              {columns.map(col => (
                <th key={col} className="p-3 border-b dark:border-slate-700 font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                {columns.map(col => (
                  <td key={col} className="p-3 text-gray-800 dark:text-gray-300">
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : (row[col] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderJsonRaw = (dataKey) => {
    const data = pedimentoData?.[dataKey] || pedimentoData?.json_extraccion?.[dataKey] || [];
    if (data.length === 0) return <p className="text-gray-500 p-4">No hay datos detectados en esta sección.</p>;
    return (
      <div className="p-4">
        <pre className="text-xs font-mono bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 overflow-x-auto text-gray-800 dark:text-gray-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-auto bg-gray-50/30 dark:bg-slate-900/30">
        {activeTab === "encabezado" && renderEncabezado()}
        {activeTab === "facturas" && renderFacturas()}
        {activeTab === "partidas" && renderPartidas()}
        {activeTab === "identificadores" && renderTable("hoja_identificadores_impo")}
        {activeTab === "proveedores" && renderTable("hoja_proveedores_nuevos")}
        {activeTab === "materiales" && renderTable("hoja_materiales_nuevos")}
      </div>
    </div>
  );
}
