"use client";

import { useEffect, useState, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import InfoModal from "@/components/shared/InfoModal";
import api from "@/lib/api";
import {
  FaDownload,
  FaSpinner,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaChevronDown
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";

export default function Reportes() {
  const [kpis, setKpis] = useState(null);
  const [reportData, setReportData] = useState({ trend_data: [], sla_data: [], tipo_operacion_data: [], cliente_data: [] });
  const [loading, setLoading] = useState(true);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const dashboardRef = useRef(null);

  // Filtros
  const [dateRange, setDateRange] = useState("mes"); // semana, mes, año

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpisRes, reportRes] = await Promise.all([
        api.get("/dashboard/kpis"),
        api.get(`/dashboard/reportes?rango=${dateRange}`)
      ]);
      setKpis(kpisRes.data);
      setReportData(reportRes.data);
    } catch (error) {
      console.error("Error cargando datos de reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const trendData = reportData.trend_data || [];
  const slaData = reportData.sla_data || [];
  const tipoData = reportData.tipo_operacion_data || [];
  const clienteData = reportData.cliente_data || [];

  const handleExportPDF = async () => {
    setExportMenuOpen(false);
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("reporte-operativo.pdf");
  };

  const handleExportExcel = () => {
    setExportMenuOpen(false);
    const wb = XLSX.utils.book_new();
    const trendWs = XLSX.utils.json_to_sheet(trendData);
    XLSX.utils.book_append_sheet(wb, trendWs, "Tendencias");
    const slaWs = XLSX.utils.json_to_sheet(slaData);
    XLSX.utils.book_append_sheet(wb, slaWs, "SLA");
    if (tipoData.length > 0) {
      const tipoWs = XLSX.utils.json_to_sheet(tipoData);
      XLSX.utils.book_append_sheet(wb, tipoWs, "Operaciones");
    }
    if (clienteData.length > 0) {
      const cliWs = XLSX.utils.json_to_sheet(clienteData);
      XLSX.utils.book_append_sheet(wb, cliWs, "Clientes");
    }
    XLSX.writeFile(wb, "reporte-datos.xlsx");
  };

  const handleExportDOCX = async () => {
    setExportMenuOpen(false);
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png").split(",")[1];
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Reporte Operativo y de Métricas", bold: true, size: 32 }),
            ],
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: Uint8Array.from(atob(imgData), c => c.charCodeAt(0)),
                transformation: { width: 600, height: 600 * (canvas.height / canvas.width) }
              })
            ]
          })
        ]
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte-ejecutivo.docx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes y Métricas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visualiza el rendimiento operativo, valor en aduana y cumplimiento de SLAs.
            </p>
          </div>
          <InfoModal title="Módulo de Reportes">
            <p>
              Genera reportes detallados y gráficas sobre la operación aduanera.
              Puedes descargar la información en formato PDF, Excel o Word.
            </p>
          </InfoModal>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700 p-1 flex">
            {["Semana", "Mes", "Año"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r.toLowerCase())}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === r.toLowerCase()
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all shadow-sm"
            >
              <FaDownload /> Exportar <FaChevronDown className="text-xs" />
            </button>
            
            {exportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FaFilePdf className="text-red-500" /> Exportar a PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700"
                >
                  <FaFileExcel className="text-green-500" /> Exportar a Excel
                </button>
                <button
                  onClick={handleExportDOCX}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700"
                >
                  <FaFileWord className="text-blue-500" /> Exportar a Word
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6" ref={dashboardRef}>
          {/* Tarjetas Superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Valor Total en Aduana</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(kpis?.total_importado_usd || 0).toLocaleString()} USD
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Impuestos Pagados</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${(kpis?.impuestos_pagados_mxn || 0).toLocaleString()} MXN
              </p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-2">Operaciones Registradas</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {kpis?.pedimentos_hoy || 0}
              </p>
            </div>
          </div>

          {/* Gráficas Principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de Valor en Aduana */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Tendencia de Importaciones (USD)</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rendimiento SLA */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Cumplimiento de SLAs</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                      {slaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Dentro de SLA' ? '#10b981' : entry.name === 'En Riesgo' ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gráficas Secundarias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipo Operación */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Tipo de Operación</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tipoData.length > 0 ? tipoData : [{ name: "Sin datos", cantidad: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="cantidad"
                    >
                      {(tipoData.length > 0 ? tipoData : [{ name: "Sin datos", cantidad: 1 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Clientes */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Operaciones por Cliente/Empresa</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clienteData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}