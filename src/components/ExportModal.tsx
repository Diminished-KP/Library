import React from 'react';
import { X, Download, FileText, FileSpreadsheet, Table } from 'lucide-react';
import type { Book } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  t: Translations;
  currentTheme?: ThemeId;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, books, t, currentTheme = 'default' }) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeThemeConfig.bgClass}/80 backdrop-blur-sm p-4`}>
      <div className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} p-2 rounded-full hover:bg-black/10 transition`}
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} rounded-xl`}>
            <Download className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.exportLibrary}</h3>
            <p className={`text-xs ${activeThemeConfig.textSecondaryClass}`}>
              {t.chooseExportFormat} ({books.length} {t.titlesCount})
            </p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          <button
            onClick={handleExportPdf}
            className={`w-full p-4 ${activeThemeConfig.bgClass} hover:bg-black/20 border ${activeThemeConfig.borderClass} rounded-xl text-left transition flex items-center gap-4 group`}
          >
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-sm font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.exportPdf}</div>
              <div className={`text-xs ${activeThemeConfig.textSecondaryClass}`}>{t.exportPdfDesc}</div>
            </div>
          </button>

          <button
            onClick={handleExportExcel}
            className={`w-full p-4 ${activeThemeConfig.bgClass} hover:bg-black/20 border ${activeThemeConfig.borderClass} rounded-xl text-left transition flex items-center gap-4 group`}
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-sm font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.exportExcel}</div>
              <div className={`text-xs ${activeThemeConfig.textSecondaryClass}`}>{t.exportExcelDesc}</div>
            </div>
          </button>

          <button
            onClick={handleExportCsv}
            className={`w-full p-4 ${activeThemeConfig.bgClass} hover:bg-black/20 border ${activeThemeConfig.borderClass} rounded-xl text-left transition flex items-center gap-4 group`}
          >
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 group-hover:scale-110 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-sm font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.exportCsv}</div>
              <div className={`text-xs ${activeThemeConfig.textSecondaryClass}`}>{t.exportCsvDesc}</div>
            </div>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`py-2.5 px-5 rounded-xl ${activeThemeConfig.buttonSecondaryClass} font-medium transition text-sm`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
