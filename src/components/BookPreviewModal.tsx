import React, { useState } from 'react';
import type { Book } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { Plus, Trash2, Book as BookIcon } from 'lucide-react';

interface BookPreviewModalProps {
  book: Book | null;
  libraryName?: string;
  onAdd: () => void;
  onDiscard: () => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  book,
  libraryName,
  onAdd,
  onDiscard,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [imgError, setImgError] = useState(false);

  if (!book) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeThemeConfig.bgClass}/80 backdrop-blur-sm p-4`}>
      <div role="dialog" aria-modal="true" aria-labelledby="book-preview-title" className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl shadow-2xl overflow-y-auto p-6 relative max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} rounded-xl`}>
            <BookIcon className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
          </div>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${activeThemeConfig.accentClass}`}>
              {t.addBookTitle} ({book.source || 'Online'})
            </span>
            {libraryName && (
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                {t.targetLibraryLabel} {libraryName}
              </p>
            )}
            <p className={`text-xs ${activeThemeConfig.textSecondaryClass} font-mono`}>ISBN: {book.isbn}</p>
          </div>
        </div>

        <div className={`${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-5 mb-6 flex gap-4 items-start`}>
          {book.coverUrl && !imgError ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className={`w-24 h-36 object-cover rounded-xl shadow-md border ${activeThemeConfig.borderClass} flex-shrink-0`}
            />
          ) : (
            <div className={`w-24 h-36 ${activeThemeConfig.cardBgClass} rounded-xl border ${activeThemeConfig.borderClass} flex flex-col items-center justify-center ${activeThemeConfig.textSecondaryClass} flex-shrink-0 p-2 text-center`}>
              <BookIcon className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] font-medium">{t.noCover}</span>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <h2 id="book-preview-title" className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass} leading-snug break-words`}>
              {book.title}
            </h2>

            <div className={`text-xs ${activeThemeConfig.textSecondaryClass} space-y-1.5 pt-1 border-t ${activeThemeConfig.borderClass}`}>
              {book.authors && (
                <p>
                  <strong className={activeThemeConfig.textPrimaryClass}>{t.authorLabel}</strong> {book.authors}
                </p>
              )}
              {book.publishedYear && (
                <p>
                  <strong className={activeThemeConfig.textPrimaryClass}>{t.yearLabel}</strong> {book.publishedYear}
                </p>
              )}
              {book.publisher && (
                <p>
                  <strong className={activeThemeConfig.textPrimaryClass}>{t.publisherLabel}</strong> {book.publisher}
                </p>
              )}
            </div>
          </div>
        </div>

        {book.quantity > 1 && (
          <div
            role="status"
            className={`mb-4 rounded-xl border ${activeThemeConfig.borderClass} ${activeThemeConfig.bgClass} px-4 py-3 text-xs ${activeThemeConfig.textSecondaryClass}`}
          >
            <p>{t.bookAlreadyInLibrary}</p>
            <p className={`mt-1 font-semibold ${activeThemeConfig.textPrimaryClass}`}>
              {t.quantityAfterAdding} {book.quantity} {t.pcs}
            </p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onDiscard}
            className={`min-h-11 flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonSecondaryClass} font-semibold transition flex items-center justify-center gap-2`}
          >
            <Trash2 className="w-4 h-4 opacity-70" />
            {t.discardButton}
          </button>

          <button
            onClick={onAdd}
            className={`min-h-11 flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonPrimaryClass} font-semibold transition flex items-center justify-center gap-2 shadow-lg`}
          >
            <Plus className="w-5 h-5" />
            {t.addToLibraryButton}
          </button>
        </div>
      </div>
    </div>
  );
};
