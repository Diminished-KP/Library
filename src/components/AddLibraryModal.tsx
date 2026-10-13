import React, { useState } from 'react';
import { X, Plus, Library as LibraryIcon } from 'lucide-react';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';

interface AddLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLibrary: (name: string, description: string) => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const AddLibraryModal: React.FC<AddLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddLibrary,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddLibrary(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    }
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
            <LibraryIcon className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
          </div>
          <h3 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.addLibraryTitle}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lib-name-input" className={`block text-xs font-semibold ${activeThemeConfig.textSecondaryClass} uppercase tracking-wider mb-1.5`}>
              {t.libraryNameLabel} *
            </label>
            <input
              id="lib-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Home Library, Sci-Fi..."
              required
              autoFocus
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} focus:border-blue-500 ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} rounded-xl px-4 py-3 outline-none transition text-sm`}
            />
          </div>

          <div>
            <label htmlFor="lib-desc-input" className={`block text-xs font-semibold ${activeThemeConfig.textSecondaryClass} uppercase tracking-wider mb-1.5`}>
              {t.libraryDescLabel}
            </label>
            <textarea
              id="lib-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="..."
              rows={3}
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} focus:border-blue-500 ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} rounded-xl px-4 py-3 outline-none transition text-sm resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonSecondaryClass} font-medium transition text-sm`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonPrimaryClass} disabled:opacity-50 font-semibold transition flex items-center justify-center gap-2 text-sm shadow-lg`}
            >
              <Plus className="w-4 h-4" />
              {t.addLibrary}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
