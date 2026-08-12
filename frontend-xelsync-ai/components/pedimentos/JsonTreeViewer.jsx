import { useState } from "react";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";

const JsonNode = ({ label, value, isLast, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth < 2);

  if (typeof value === "object" && value !== null) {
    const isArray = Array.isArray(value);
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;

    return (
      <div className="ml-4 font-mono text-sm leading-6">
        <div 
          className={`flex items-center group ${!isEmpty ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 rounded px-1 -ml-1 transition-colors" : ""}`}
          onClick={() => !isEmpty && setExpanded(!expanded)}
        >
          {!isEmpty ? (
            <span className="text-gray-400 mr-1 opacity-50 group-hover:opacity-100 transition-opacity">
              {expanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
            </span>
          ) : (
            <span className="w-3" />
          )}
          {label && (
            <span className="text-blue-600 dark:text-blue-400 font-semibold mr-1">
              "{label}":
            </span>
          )}
          <span className="text-gray-500 dark:text-gray-400">
            {isArray ? "[" : "{"}
            {!expanded && !isEmpty && (
              <span className="text-xs ml-1 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                {isArray ? `${keys.length} items` : `${keys.length} keys`}
              </span>
            )}
            {isEmpty && (isArray ? "]" : "}")}
          </span>
        </div>

        {expanded && !isEmpty && (
          <div className="border-l border-gray-200 dark:border-slate-700 ml-1.5 pl-2">
            {keys.map((key, index) => (
              <JsonNode
                key={key}
                label={isArray ? null : key}
                value={value[key]}
                isLast={index === keys.length - 1}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
        
        {(!isEmpty || expanded) && (
          <div className="flex items-center pl-[2px]">
            <span className="text-gray-500 dark:text-gray-400">
              {isArray ? "]" : "}"}
              {!isLast && ","}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Primitive values
  let valueSpan;
  if (typeof value === "string") {
    valueSpan = <span className="text-green-600 dark:text-green-400">"{value}"</span>;
  } else if (typeof value === "number") {
    valueSpan = <span className="text-orange-600 dark:text-orange-400">{value}</span>;
  } else if (typeof value === "boolean") {
    valueSpan = <span className="text-purple-600 dark:text-purple-400">{value ? "true" : "false"}</span>;
  } else if (value === null) {
    valueSpan = <span className="text-gray-400 italic">null</span>;
  } else {
    valueSpan = <span>{String(value)}</span>;
  }

  return (
    <div className="ml-4 font-mono text-sm leading-6 flex">
      <span className="w-3" />
      {label && (
        <span className="text-blue-600 dark:text-blue-400 font-semibold mr-1">
          "{label}":
        </span>
      )}
      <span>
        {valueSpan}
        {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </span>
    </div>
  );
};

export default function JsonTreeViewer({ data }) {
  if (!data) return <div className="text-gray-500 p-4">No data to display</div>;
  
  let parsedData = data;
  if (typeof data === "string") {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      // If it's not valid JSON (e.g. M3 plain text), render as a structured table
      const lines = data.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 0 && lines[0].includes('|')) {
        const maxCols = Math.max(...lines.map(l => l.split('|').length));
        return (
          <div className="w-full max-w-full overflow-x-auto overflow-y-auto max-h-[60vh] bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 shadow-inner">
            <table className="w-full min-w-max text-xs text-left border-collapse font-mono whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-slate-800">
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="p-2 border-b border-r dark:border-slate-700 w-10 text-center font-bold">#</th>
                  {Array.from({ length: maxCols }).map((_, i) => (
                    <th key={i} className="p-2 border-b border-r dark:border-slate-700 font-semibold">Col {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {lines.map((line, rowIdx) => {
                  const cols = line.split('|');
                  return (
                    <tr key={rowIdx} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <td className="p-2 border-r dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 font-bold text-center">
                        {rowIdx + 1}
                      </td>
                      {Array.from({ length: maxCols }).map((_, colIdx) => (
                        <td key={colIdx} className="p-2 border-r dark:border-slate-700 text-gray-800 dark:text-gray-200">
                          {cols[colIdx] || ""}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      
      // Fallback for regular text
      return (
        <pre className="p-4 w-full bg-gray-50 dark:bg-slate-900 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-gray-200 dark:border-slate-700">
          {data}
        </pre>
      );
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-x-auto shadow-inner">
      <JsonNode label={null} value={parsedData} isLast={true} />
    </div>
  );
}
