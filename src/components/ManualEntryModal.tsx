import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { Library } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (isbn: string) => void;
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
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [isbn, setIsbn] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = isbn.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setIsbn('');
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
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 9788000058825"
              autoFocus
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} focus:border-blue-500 ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} rounded-xl px-4 py-3 outline-none transition font-mono`}
            />
          </div>

          <div className="flex gap-3 pt-2">
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
        </form>
      </div>
    </div>
  );
};
