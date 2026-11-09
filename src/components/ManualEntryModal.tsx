import React, { useState } from 'react';
import { X, Search, AlertCircle, Edit3 } from 'lucide-react';
import type { Library } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { isValidIsbn } from '../services/isbnExtractor';
import { normalizeIsbn } from '../services/bookService';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (isbn: string) => void;
  onSwitchToManualDetails?: (isbn: string) => void;
  libraries?: Library[];
  selectedLibraryId?: string;
  onSelectLibrary?: (id: string) => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSwitchToManualDetails,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [isbn, setIsbn] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeIsbn(isbn);
    if (!clean) return;

    if (!isValidIsbn(clean)) {
      setValidationError(t.isbnInvalidError);
      return;
    }

    setValidationError('');
    onSubmit(clean);
    setIsbn('');
  };

  const handleManualFallback = () => {
    const raw = isbn.trim();
    if (onSwitchToManualDetails) {
      onSwitchToManualDetails(raw);
      setIsbn('');
      setValidationError('');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeThemeConfig.bgClass}/80 backdrop-blur-sm p-4`}>
      <div className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl shadow-2xl overflow-hidden p-6 relative`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} p-2 rounded-full hover:bg-black/10 transition`}
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass} mb-2`}>{t.manualEntryTitle}</h3>
        <p className={`text-sm ${activeThemeConfig.textSecondaryClass} mb-6`}>
          {t.manualEntryPlaceholder}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {libraries && selectedLibraryId && onSelectLibrary && (
            <div>
              <label htmlFor="manual-library-select" className={`block text-xs font-semibold ${activeThemeConfig.textSecondaryClass} uppercase tracking-wider mb-2`}>
                {t.selectLibrary}
              </label>
              <select
                id="manual-library-select"
                value={selectedLibraryId}
                onChange={(e) => onSelectLibrary(e.target.value)}
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.accentClass} font-semibold text-xs rounded-xl px-4 py-3 outline-none focus:border-blue-500 cursor-pointer mb-2`}
              >
                {libraries.map((lib) => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="isbn-input" className={`block text-xs font-semibold ${activeThemeConfig.textSecondaryClass} uppercase tracking-wider mb-2`}>
              {t.isbn}
            </label>
            <input
              id="isbn-input"
              type="text"
              value={isbn}
              onChange={(e) => {
                setIsbn(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. 9788000058825 nebo 8000058825"
              autoFocus
              className={`w-full ${activeThemeConfig.bgClass} border ${validationError ? 'border-rose-500' : activeThemeConfig.borderClass} focus:border-blue-500 ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} rounded-xl px-4 py-3 outline-none transition font-mono`}
            />
            {validationError && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonSecondaryClass} font-medium transition`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!isbn.trim()}
                className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonPrimaryClass} disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2`}
              >
                <Search className="w-4 h-4" />
                {t.manualEntrySubmit}
              </button>
            </div>

            {onSwitchToManualDetails && (
              <button
                type="button"
                onClick={handleManualFallback}
                className={`w-full py-2.5 px-3 text-xs font-semibold ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.accentClass} flex items-center justify-center gap-1.5 hover:underline transition mt-1`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.addManuallyWithIsbn}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
