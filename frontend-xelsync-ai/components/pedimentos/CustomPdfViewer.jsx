"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSearchPlus, FaSearchMinus, FaSpinner } from "react-icons/fa";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

export default function CustomPdfViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0); 
  const [containerWidth, setContainerWidth] = useState(null);

  useEffect(() => {
    const container = document.getElementById("pdf-container-wrapper");
    let debounceId = null;
    
    if (container) {
      // Configurar ancho inicial
      setContainerWidth(container.clientWidth);
      
      const handleResize = () => {
        if (debounceId) clearTimeout(debounceId);
        debounceId = setTimeout(() => {
          const newContainer = document.getElementById("pdf-container-wrapper");
          if (newContainer) {
            setContainerWidth(newContainer.clientWidth);
          }
        }, 250);
      };
      
      // Escuchar solo redimensiones de la ventana (seguro contra bucles de layout)
      window.addEventListener('resize', handleResize);
      
      return () => {
        if (debounceId) clearTimeout(debounceId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden relative">
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 shadow-lg rounded-full px-3 py-2 border border-gray-200 dark:border-slate-700 backdrop-blur-sm">
        <button
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
          title="Alejar"
        >
          <FaSearchMinus />
        </button>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={scale >= 3.0}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
          title="Acercar"
        >
          <FaSearchPlus />
        </button>
      </div>

      <div 
        id="pdf-container-wrapper"
        className="flex-1 w-full overflow-auto flex justify-center bg-gray-100 dark:bg-slate-900 p-4"
      >
        <Document
          file={pdfUrl}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center mt-10 w-full">
              <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
              <p className="text-gray-500 text-sm">Cargando PDF...</p>
            </div>
          }
          error={
            <div className="text-red-500 p-4 mt-10 bg-red-50 rounded-lg text-sm w-full text-center">
              Error al cargar el PDF. Intente usar el botón de descarga.
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-4 shadow-md bg-white">
              <Page
                pageNumber={index + 1}
                scale={scale}
                width={containerWidth && scale === 1.0 ? containerWidth - 40 : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={<div className="h-20" />}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
}
