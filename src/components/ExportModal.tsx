import React from 'react';
import { X, Download, FileText, FileSpreadsheet, Table } from 'lucide-react';
import type { Book } from '../types/book';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, books }) => {
  if (!isOpen) return null;

  const handleExportPdf = () => {
    exportToPdf(books);
    onClose();
  };

  const handleExportExcel = () => {
    exportToExcel(books);
    onClose();
  };

  const handleExportCsv = () => {
    exportToCsv(books);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Download className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Exportovat knihovnu</h3>
            <p className="text-xs text-slate-400">
              Vyberte formát pro export ({books.length} {books.length === 1 ? 'položka' : books.length >= 2 && books.length <= 4 ? 'položky' : 'položek'})
            </p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          <button
            onClick={handleExportPdf}
            className="w-full p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition flex items-center gap-4 group"
          >
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">PDF Dokument</div>
              <div className="text-xs text-slate-400">Přehledný dokument vhodný pro tisk</div>
            </div>
          </button>

          <button
            onClick={handleExportExcel}
            className="w-full p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition flex items-center gap-4 group"
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">Excel (.xlsx)</div>
              <div className="text-xs text-slate-400">Tabulkový soubor s formátováním</div>
            </div>
          </button>

          <button
            onClick={handleExportCsv}
            className="w-full p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition flex items-center gap-4 group"
          >
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 group-hover:scale-110 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">CSV / Google Sheets</div>
              <div className="text-xs text-slate-400">Univerzální textový formát (UTF-8 s BOM)</div>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 transition text-sm"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
