"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaSearchPlus, FaSearchMinus, FaSpinner, FaRedo } from "react-icons/fa";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

export default function CustomPdfViewer({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [baseWidth, setBaseWidth] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let debounceId = null;

    const measure = () => {
      if (containerRef.current) {
        setBaseWidth(containerRef.current.clientWidth - 32); // padding 16px each side
      }
    };

    measure();

    const handleResize = () => {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(measure, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (debounceId) clearTimeout(debounceId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1.0);

  // The actual rendered width of each page (at current scale)
  const pageWidth = baseWidth ? baseWidth * scale : undefined;

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 shadow-lg rounded-full px-3 py-2 border border-gray-200 dark:border-slate-700 backdrop-blur-sm">
        <button
          onClick={zoomOut}
          disabled={scale <= 0.5}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
          title="Alejar"
        >
          <FaSearchMinus />
        </button>
        <button
          onClick={resetZoom}
          className="px-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Restablecer zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={zoomIn}
          disabled={scale >= 3.0}
          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
          title="Acercar"
        >
          <FaSearchPlus />
        </button>
      </div>

      {/* Scrollable PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-auto bg-gray-100 dark:bg-slate-900 p-4"
      >
        <div
          className="flex flex-col items-center"
          style={{ minWidth: pageWidth ? `${pageWidth}px` : "auto" }}
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
              <div key={`page_${index + 1}`} className="mb-4 shadow-md bg-white mx-auto">
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={<div className="h-20" />}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
