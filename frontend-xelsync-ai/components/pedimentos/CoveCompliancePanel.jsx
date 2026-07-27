import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaFileInvoice, FaBoxes } from "react-icons/fa";

export default function CoveCompliancePanel({ validacion }) {
  if (!validacion) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case "GREEN": return "bg-green-100 text-green-800 border-green-200";
      case "YELLOW": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "GREEN": return <FaCheckCircle className="text-green-600 text-2xl" />;
      case "YELLOW": return <FaExclamationTriangle className="text-yellow-600 text-2xl" />;
      case "RED": return <FaTimesCircle className="text-red-600 text-2xl" />;
      default: return null;
    }
  };

  const { status, facturas_pedimento, xmls_encontrados, discrepancias } = validacion;

  return (
    <div className={`mt-6 mb-6 p-4 rounded-lg border ${getStatusColor(status)} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="font-semibold text-lg">Cruce Inteligente (Compliance)</h3>
            <p className="text-sm opacity-80">
              Validación de valores del Pedimento vs. Documentos XML (COVE / CFDI)
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
            <FaFileInvoice className="opacity-70" />
            <span>Facturas en Pedimento: {facturas_pedimento}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
            <FaBoxes className="opacity-70" />
            <span>XMLs cruzados en Lote: {xmls_encontrados}</span>
          </div>
        </div>
      </div>

      {discrepancias && discrepancias.length > 0 ? (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Discrepancias Detectadas:</h4>
          <ul className="space-y-2">
            {discrepancias.map((disc, idx) => (
              <li key={idx} className="bg-white/60 p-3 rounded-md text-sm flex gap-2">
                <span className="font-semibold text-red-900">{disc.factura}:</span> 
                {disc.mensaje}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        status === "GREEN" && (
          <div className="mt-4 bg-white/60 p-3 rounded-md text-sm text-green-900 font-medium flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Todos los valores y cantidades cuadran al 100% entre el Pedimento y los Acuses COVE.
          </div>
        )
      )}
    </div>
  );
}
