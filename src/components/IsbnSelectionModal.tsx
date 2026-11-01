import React, { useState } from 'react';
import { Check, X, AlertCircle, RefreshCw, Edit3, BookOpen } from 'lucide-react';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { isValidIsbn } from '../services/isbnExtractor';

interface IsbnSelectionModalProps {
  isOpen: boolean;
  isbns: string[];
  onConfirm: (isbn: string) => void;
  onCancel: () => void;
  onRetake: () => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const IsbnSelectionModal: React.FC<IsbnSelectionModalProps> = ({
  isOpen,
  isbns,
  onConfirm,
  onCancel,
  onRetake,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [prevIsbns, setPrevIsbns] = useState(isbns);
  const [selectedIsbn, setSelectedIsbn] = useState<string>(isbns[0] || '');
  const [editedIsbn, setEditedIsbn] = useState<string>(isbns[0] || '');
  const [inputError, setInputError] = useState<string | null>(null);

  if (prevIsbns !== isbns) {
    setPrevIsbns(isbns);
    const initial = isbns[0] || '';
    setSelectedIsbn(initial);
    setEditedIsbn(initial);
    setInputError(null);
  }

  if (!isOpen) return null;

  const handleSelect = (candidate: string) => {
    setSelectedIsbn(candidate);
    setEditedIsbn(candidate);
    setInputError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editedIsbn.replace(/[-_\s]/g, '').trim();
    if (!clean) {
      setInputError(t.manualEntryPlaceholder);
      return;
    }
    if (clean.length !== 10 && clean.length !== 13) {
      setInputError(t.manualEntryPlaceholder);
      return;
    }
    onConfirm(clean);
  };

  const hasCandidates = isbns.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl p-6 shadow-2xl flex flex-col relative`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-blue-500/10 ${activeThemeConfig.accentClass}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-bold ${activeThemeConfig.textPrimaryClass}`}>
              {t.isbnSelectionTitle}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className={`p-1.5 rounded-lg ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} hover:bg-white/10 transition`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Message */}
        {hasCandidates ? (
          <p className={`text-xs ${activeThemeConfig.textSecondaryClass} mb-4 leading-relaxed`}>
            {isbns.length > 1 ? t.multipleIsbnsFound : t.singleIsbnFound}
          </p>
        ) : (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <p className="font-semibold mb-1">{t.noIsbnFoundInImage}</p>
              <p className="opacity-90">{t.manualIsbnCorrection}</p>
            </div>
          </div>
        )}

        {/* Candidate list if multiple ISBNs found */}
        {isbns.length > 1 && (
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
            {isbns.map((cand, idx) => {
              const isSelected = cand === selectedIsbn;
              const validChecksum = isValidIsbn(cand);
              return (
                <button
                  key={`${cand}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(cand)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                    isSelected
                      ? `${activeThemeConfig.buttonPrimaryClass} border-transparent shadow-md`
                      : `${activeThemeConfig.bgClass} ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} hover:border-blue-500`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono tracking-wider font-semibold">{cand}</span>
                    {validChecksum && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-sans">
                        ISBN-{cand.length}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Input field for manual review or correction */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="isbn-input"
              className={`block text-xs font-semibold ${activeThemeConfig.textSecondaryClass} mb-1.5 flex items-center justify-between`}
            >
              <span>{t.confirmIsbnPrompt}</span>
              <span className="flex items-center gap-1 text-[11px] opacity-75 font-normal">
                <Edit3 className="w-3 h-3" />
                {t.edit}
              </span>
            </label>
            <input
              id="isbn-input"
              type="text"
              value={editedIsbn}
              onChange={(e) => {
                setEditedIsbn(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={t.manualEntryPlaceholder}
              autoFocus
              className={`w-full ${activeThemeConfig.bgClass} border ${
                inputError ? 'border-rose-500' : activeThemeConfig.borderClass
              } ${activeThemeConfig.textPrimaryClass} font-mono text-sm font-semibold rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 transition`}
            />
            {inputError && <p className="text-rose-400 text-xs mt-1">{inputError}</p>}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              type="button"
              onClick={onRetake}
              className={`flex-1 py-2.5 px-3 rounded-xl border ${activeThemeConfig.borderClass} ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} text-xs font-semibold flex items-center justify-center gap-2 transition`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.retakePhoto}</span>
            </button>

            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 rounded-xl ${activeThemeConfig.buttonPrimaryClass} text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition`}
            >
              <Check className="w-4 h-4" />
              <span>{t.confirmAndSearch}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
