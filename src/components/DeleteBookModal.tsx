import React from 'react';
import { AlertTriangle, Trash2, Minus } from 'lucide-react';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';

interface DeleteBookModalProps {
  isOpen: boolean;
  bookTitle: string;
  quantity: number;
  onClose: () => void;
  onDecrement: () => void;
  onDeleteAll: () => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  isOpen,
  bookTitle,
  quantity,
  onClose,
  onDecrement,
  onDeleteAll,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeThemeConfig.bgClass}/80 backdrop-blur-sm p-4`}>
      <div className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass}`}>{t.deleteBookTitle}</h3>
        </div>

        <p className={`text-sm ${activeThemeConfig.textPrimaryClass} mb-2 font-medium`}>
          &quot;{bookTitle}&quot;
        </p>
        <p className={`text-xs ${activeThemeConfig.textSecondaryClass} mb-6`}>
          {t.deleteBookQuantityMessage} {quantity} {t.pcs}. {t.deleteBookActionPrompt}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onDecrement();
              onClose();
            }}
            className={`w-full py-3 px-4 ${activeThemeConfig.buttonSecondaryClass} font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm`}
          >
            <Minus className={`w-4 h-4 ${activeThemeConfig.accentClass}`} />
            {t.deleteBookConfirmOne}
          </button>

          <button
            onClick={() => {
              onDeleteAll();
              onClose();
            }}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-rose-600/20"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteBookConfirmAll} ({quantity} {t.pcs})
          </button>

          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} font-medium text-xs transition`}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
