import { useState } from "react";
import { FaFileInvoice, FaListUl, FaHashtag, FaBuilding, FaBox, FaUser, FaCheck, FaExclamationTriangle } from "react-icons/fa";

export default function TabsRevision({ pedimentoData, formData = {}, onChange, errores = [], validatedFields = {}, onValidateField }) {
  const [activeTab, setActiveTab] = useState("encabezado");

  const tabs = [
    { id: "encabezado", label: "Encabezado", icon: <FaListUl /> },
    { id: "cliente", label: "Importador/Exportador", icon: <FaUser /> },
    { id: "facturas", label: "Facturas", icon: <FaFileInvoice /> },
    { id: "partidas", label: "Partidas", icon: <FaBox /> },
    { id: "identificadores", label: "Identificadores", icon: <FaHashtag /> },
    { id: "proveedores", label: "Proveedores", icon: <FaBuilding /> },
    { id: "materiales", label: "Materiales", icon: <FaBox /> },
  ];

  const renderInput = (key, label, originalValue) => {
    const error = errores.find(e => e.campo === key);
    const isValidated = validatedFields[key];
    const isError = !!error;
    
    // Override with local state if it exists
    const currentValue = formData[key] !== undefined ? formData[key] : (originalValue || "");
    
    let inputClasses = "w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none transition-all ";
    if (isError) {
      inputClasses += "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500";
    } else if (isValidated) {
      inputClasses += "border-green-500 bg-green-50 dark:bg-green-900/20 focus:ring-2 focus:ring-green-500";
    } else {
      inputClasses += "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 focus:ring-2 focus:ring-yellow-500";
    }

    return (
      <div key={key} className="flex flex-col relative group">
        <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 truncate flex justify-between items-center" title={label}>
          <span>{label}</span>
          {!isValidated && !isError && onValidateField && (
            <button 
              onClick={() => onValidateField(key)}
              className="text-green-600 hover:text-green-700 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Marcar como validado"
            >
              <FaCheck size={12} />
            </button>
          )}
        </label>
        <input 
          type="text"
          value={currentValue}
          onChange={(e) => onChange(key, e.target.value)}
          className={inputClasses}
        />
        {isError && (
          <span className="text-[10px] text-red-500 mt-1 truncate" title={error.mensaje}>
            {error.mensaje}
          </span>
        )}
      </div>
    );
  };

  const renderEncabezado = () => {
    if (!pedimentoData) return <p className="text-gray-500 p-4">No hay datos</p>;
    
    // Extraer campos principales (a nivel raíz)
    const rawKeys = Object.keys(pedimentoData).filter(
      k => !Array.isArray(pedimentoData[k]) && typeof pedimentoData[k] !== 'object'
        && !["importador_rfc","importador_nombre","exportador_rfc","exportador_nombre","importador_curp"].includes(k)
    );
    
    // Extraer campos del encabezado anidado de M3
    const encM3 = pedimentoData.encabezado_pedimento || {};
    const encM3Expo = pedimentoData.encabezado_pedimento_expo || {};
    
    const combinedData = { ...pedimentoData };
    
    // Agregar las llaves anidadas al combinedData
    Object.keys(encM3).forEach(k => {
      if (!["importador_rfc","importador_nombre","exportador_rfc","exportador_nombre","importador_curp"].includes(k)) {
        if (!combinedData[k]) combinedData[k] = encM3[k];
        if (!rawKeys.includes(k)) rawKeys.push(k);
      }
    });
    
    Object.keys(encM3Expo).forEach(k => {
      if (!["importador_rfc","importador_nombre","exportador_rfc","exportador_nombre","importador_curp"].includes(k)) {
        if (!combinedData[k]) combinedData[k] = encM3Expo[k];
        if (!rawKeys.includes(k)) rawKeys.push(k);
      }
    });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 animate-in fade-in">
        {rawKeys.map(key => renderInput(key, key.replace(/^[A-Z]+_/, '').replace(/_/g, ' '), combinedData[key]))}
      </div>
    );
  };

  // C2: Pestaña dedicada para Importador/Exportador
  const renderClienteImportador = () => {
    const enc = pedimentoData || {};
    
    // Buscar en encabezado_pedimento o directamente
    const encObj = enc.encabezado_pedimento || enc;
    
    const importadorNombre = encObj.importador_nombre || enc.importador_nombre || "";
    const importadorRfc = encObj.importador_rfc || enc.importador_rfc || encObj.rfc || "";
    const importadorCurp = encObj.importador_curp || enc.importador_curp || encObj.curp || "";
    const exportadorNombre = encObj.exportador_nombre || enc.exportador_nombre || "";
    const exportadorRfc = encObj.exportador_rfc || enc.exportador_rfc || "";
    
    const tieneImportador = importadorNombre || importadorRfc;
    const tieneExportador = exportadorNombre || exportadorRfc;
    
    if (!tieneImportador && !tieneExportador) {
      return (
        <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
          <FaExclamationTriangle className="text-amber-400 text-3xl" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No se detectaron datos de importador/exportador en este pedimento.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Los archivos M3 extraen estos datos de los índices 19-23 del registro tipo 501.
          </p>
        </div>
      );
    }
    
    return (
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
        {/* Importador */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaUser /> Importador
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Nombre / Razón Social</label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600">
                {importadorNombre || <span className="text-gray-400 italic">No disponible</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">RFC</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600">
                  {importadorRfc || <span className="text-gray-400 italic">—</span>}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">CURP</label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600">
                  {importadorCurp || <span className="text-gray-400 italic">—</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Exportador */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaBuilding /> Exportador / Proveedor Principal
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Nombre / Razón Social</label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600">
                {exportadorNombre || <span className="text-gray-400 italic">No disponible</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">RFC / Tax ID</label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-mono text-gray-900 dark:text-white border border-gray-200 dark:border-slate-600">
                {exportadorRfc || <span className="text-gray-400 italic">—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFacturas = () => {
    const facturas = pedimentoData?.facturas || pedimentoData?.json_extraccion?.facturas || [];
    const identificadores = pedimentoData?.hoja_identificadores_impo || pedimentoData?.json_extraccion?.hoja_identificadores_impo || [];
    const edocuments = identificadores.filter(id => id.B_identificador === "ED" || id.B_identificador === "CV");
    
    // C3: Cuando hay más de un e-documento o COVE pedir la factura o realizar una validación
    const multipleDocs = facturas.length > 1 || edocuments.length > 1;

    if (facturas.length === 0) return <p className="text-gray-500 p-4">No se detectaron facturas.</p>;

    return (
      <div className="p-4 space-y-4 animate-in fade-in">
        {multipleDocs && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <FaExclamationTriangle className="text-amber-500 mt-0.5 text-lg flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-amber-800 dark:text-amber-400 font-semibold text-sm">Validación Requerida: Múltiples Documentos</h4>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                Se han detectado {facturas.length} facturas y {edocuments.length} e-documentos/COVE. Por favor, <strong>solicita las facturas anexas</strong> correspondientes o valida que los importes cuadren correctamente.
              </p>
              {onValidateField && (
                <button
                  onClick={() => onValidateField("multiples_facturas_cove")}
                  className={`mt-3 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    validatedFields["multiples_facturas_cove"]
                      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-300 dark:border-green-700"
                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  }`}
                >
                  {validatedFields["multiples_facturas_cove"] ? "Validación Completada" : "Confirmar Validación"}
                </button>
              )}
            </div>
          </div>
        )}

        {facturas.map((fac, idx) => (
          <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-800/50 p-3 font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
              <span>Factura: {fac.AC_factura || fac.S_factura || fac.numero_factura || `Factura ${idx + 1}`}</span>
              <span className="text-blue-500 font-mono text-sm">{fac.BA_valor_mon_fact || fac.AM_valor_mon_fact || fac.valor_dolares || "0.00"} USD</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900">
              {Object.keys(fac).filter(k => k !== "partidas").map(key => renderInput(`factura_${idx}_${key}`, key.replace(/^[A-Z]+_/, ''), fac[key]))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // C4: renderPartidas ahora muestra "Número de Parte" como columna prominente
  const renderPartidas = () => {
    const facturas = pedimentoData?.facturas || pedimentoData?.json_extraccion?.facturas || [];
    const partidas = facturas.flatMap(f => f.partidas || []);
    
    if (partidas.length === 0) return <p className="text-gray-500 p-4">No se detectaron partidas.</p>;

    return (
      <div className="p-4 max-h-[60vh] overflow-y-auto overflow-x-auto animate-in fade-in">
        <table className="w-full text-left border-collapse min-w-[900px] relative">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-800">
            <tr className="border-b border-gray-200 dark:border-slate-700 text-xs uppercase text-gray-500">
              <th className="p-2">#</th>
              {/* C4: Número de Parte del Material — columna prominente */}
              <th className="p-2 text-indigo-600 dark:text-indigo-400">Nº de Parte</th>
              <th className="p-2">Material SAP</th>
              <th className="p-2">Descripción</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Valor USD</th>
              <th className="p-2">Fracción</th>
              <th className="p-2">País</th>
              <th className="p-2">Forma Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {partidas.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-2 text-gray-400 text-xs">{idx + 1}</td>
                {/* C4: Número de parte real del material (del proveedor) */}
                <td className="p-2 font-mono text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
                  {p.AV_material || p.AH_material || p.numero_parte || p.AW_numero_parte || p.numero_parte_proveedor || 
                   <span className="text-gray-300 dark:text-gray-600 italic">Sin Nº Parte</span>}
                </td>
                <td className="p-2 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {p.material_sap || p.codigo_producto || p.clave || "—"}
                </td>
                <td className="p-2 text-xs max-w-[180px] truncate" title={p.BW_descripcion_ped || p.AU_descripcion_ped || p.descripcion || p.AX_descripcion || ""}>
                  {p.BW_descripcion_ped || p.AU_descripcion_ped || p.descripcion || p.AX_descripcion || "—"}
                </td>
                <td className="p-2">
                  {p.AY_cantidad_um_base || p.AK_cantidad_um_base || p.cantidad_umt || "0"}
                  <span className="text-gray-400 text-xs ml-1">{p.unidad_medida_tarifa || p.unidad_medida || ""}</span>
                </td>
                <td className="p-2 font-mono text-blue-600 dark:text-blue-400">${p.BB_valor_usd || p.AN_valor_usd || p.valor_dolares || "0.00"}</td>
                <td className="p-2 font-mono">{p.BD_fraccion || p.AO_fraccion || p.fraccion_arancelaria || "—"}</td>
                <td className="p-2">{p.BE_pais_origen || p.AP_pais_destino || p.pais_origen_destino || "—"}</td>
                <td className="p-2">
                  {p.BK_forma_pago === 21 || p.BK_forma_pago === "21" ? (
                    <span className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-2 py-0.5 rounded text-xs font-bold">21 - Crédito IVA</span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">{p.BK_forma_pago || "—"}</span>
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
                    {typeof row[col] === 'object' ? JSON.stringify(row[col]) : (row[col] || "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // C5: Pestaña de identificadores completa — impo + expo + partidas
  const renderIdentificadores = () => {
    const impo = pedimentoData?.hoja_identificadores_impo || pedimentoData?.json_extraccion?.hoja_identificadores_impo || [];
    const expo = pedimentoData?.hoja_identificadores_expo || pedimentoData?.json_extraccion?.hoja_identificadores_expo || [];
    const partidas_impo = pedimentoData?.hoja_identificadores_partidas_impo || pedimentoData?.json_extraccion?.hoja_identificadores_partidas_impo || [];
    const partidas_expo = pedimentoData?.hoja_identificadores_partidas_expo || pedimentoData?.json_extraccion?.hoja_identificadores_partidas_expo || [];
    const identificadoresImpo = pedimentoData?.hoja_identificadores_impo || pedimentoData?.json_extraccion?.hoja_identificadores_impo || [];
    const identificadoresExpo = pedimentoData?.hoja_identificadores_expo || pedimentoData?.json_extraccion?.hoja_identificadores_expo || [];
    const legacy = pedimentoData?.identificadores || pedimentoData?.json_extraccion?.identificadores || [];
    const hayDatos = identificadoresImpo.length > 0 || identificadoresExpo.length > 0 || legacy.length > 0 || partidas_impo.length > 0 || partidas_expo.length > 0;

    if (!hayDatos) {
      return (
        <div className="p-6 text-center">
          <FaHashtag className="text-gray-300 text-3xl mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No se detectaron identificadores en este pedimento.</p>
          <p className="text-xs text-gray-400 mt-1">Los identificadores se extraen de los registros tipo 507 (pedimento) y 554 (partidas).</p>
        </div>
      );
    }
    
    const Section = ({ title, data, color = "blue" }) => {
      if (!data || data.length === 0) return null;
      const colorClass = {
        blue: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
        green: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
        purple: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10",
      }[color] || "";
      const cols = Array.from(new Set(data.flatMap(r => Object.keys(r))));
      return (
        <div className="mb-5">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 px-3 py-1.5 rounded-lg border w-max ${colorClass}`}>{title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {cols.map(c => <th key={c} className="p-2 border-b dark:border-slate-700">{c}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                    {cols.map(c => <td key={c} className="p-2 text-gray-800 dark:text-gray-300">{row[c] ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
    
    return (
      <div className="p-4 animate-in fade-in space-y-2">
        <Section title="Identificadores Importación (Pedimento)" data={impo} color="blue" />
        <Section title="Identificadores Exportación (Pedimento)" data={expo} color="green" />
        <Section title="Identificadores por Partida — Importación" data={partidas_impo} color="purple" />
        <Section title="Identificadores por Partida — Exportación" data={partidas_expo} color="green" />
        {legacy.length > 0 && <Section title="Identificadores Glosa SAT" data={legacy} color="blue" />}
      </div>
    );
  };

  // C6: Materiales con tipo_relacion PADRE/HIJO
  const renderMateriales = () => {
    const data = pedimentoData?.hoja_materiales_nuevos || pedimentoData?.json_extraccion?.hoja_materiales_nuevos || [];
    if (!Array.isArray(data) || data.length === 0) {
      return <p className="text-gray-500 p-4">No se detectaron materiales nuevos en cuarentena.</p>;
    }
    
    const columns = Array.from(new Set(data.flatMap(item => Object.keys(item).filter(k => k !== "null" && k !== "_tipo_registro"))));
    
    return (
      <div className="overflow-x-auto p-1 animate-in fade-in">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
              {/* C6: Tipo padre/hijo primero */}
              <th className="p-3 border-b dark:border-slate-700 font-semibold">Tipo</th>
              {columns.filter(c => !["tipo_relacion","numero_parte_padre"].includes(c)).map(col => (
                <th key={col} className="p-3 border-b dark:border-slate-700 font-semibold">{col}</th>
              ))}
              <th className="p-3 border-b dark:border-slate-700 font-semibold">Parte Padre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {data.map((row, idx) => {
              const tipo = row.tipo_relacion || "PADRE";
              const esHijo = tipo === "HIJO";
              return (
                <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-slate-800/30 ${esHijo ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}`}>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${esHijo 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                      {tipo}
                    </span>
                  </td>
                  {columns.filter(c => !["tipo_relacion","numero_parte_padre"].includes(c)).map(col => (
                    <td key={col} className="p-3 text-gray-800 dark:text-gray-300">
                      {typeof row[col] === 'object' ? JSON.stringify(row[col]) : (row[col] ?? "—")}
                    </td>
                  ))}
                  <td className="p-3 font-mono text-xs text-gray-500">{row.numero_parte_padre || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
        {activeTab === "cliente" && renderClienteImportador()}
        {activeTab === "facturas" && renderFacturas()}
        {activeTab === "partidas" && renderPartidas()}
        {activeTab === "identificadores" && renderIdentificadores()}
        {activeTab === "proveedores" && renderTable("hoja_proveedores_nuevos")}
        {activeTab === "materiales" && renderMateriales()}
      </div>
    </div>
  );
}
