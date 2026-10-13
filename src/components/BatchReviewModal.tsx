import React, { useState } from 'react';
import type { Book } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { Layers, Trash2, Check, BookOpen } from 'lucide-react';

interface BatchReviewModalProps {
  isOpen: boolean;
  books: Book[];
  libraryName?: string;
  onRemoveBook: (isbn: string) => void;
  onSaveAll: () => void;
  onDiscardAll: () => void;
  t: Translations;
  currentTheme?: ThemeId;
}

const BookCover: React.FC<{ coverUrl?: string; title: string; noCoverText: string; activeThemeConfig: typeof themes['default'] }> = ({
  coverUrl,
  title,
  noCoverText,
  activeThemeConfig,
}) => {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setHasError(true)}
        className={`w-14 h-20 object-cover rounded-lg border ${activeThemeConfig.borderClass} shadow-sm flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`w-14 h-20 ${activeThemeConfig.bgClass} rounded-lg border ${activeThemeConfig.borderClass} flex flex-col items-center justify-center ${activeThemeConfig.textSecondaryClass} flex-shrink-0 p-1 text-center`}>
      <BookOpen className={`w-5 h-5 mb-1 opacity-40 ${activeThemeConfig.textSecondaryClass}`} />
      <span className={`text-[8px] ${activeThemeConfig.textSecondaryClass} font-medium`}>{noCoverText}</span>
    </div>
  );
};

export const BatchReviewModal: React.FC<BatchReviewModalProps> = ({
  isOpen,
  books,
  libraryName,
  onRemoveBook,
  onSaveAll,
  onDiscardAll,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeThemeConfig.bgClass}/80 backdrop-blur-sm p-4`}>
      <div className={`w-full max-w-xl ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl shadow-2xl overflow-hidden p-6 relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}>
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${activeThemeConfig.borderClass} flex-shrink-0`}>
          <div className={`p-2.5 ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} rounded-xl`}>
            <Layers className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>
              {t.scannedBooksCount} ({books.length})
            </h2>
            <p className={`text-xs ${activeThemeConfig.textSecondaryClass}`}>
              {t.batchReviewSub} {libraryName ? `(${libraryName})` : ''}
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
            <BookOpen className={`w-12 h-12 ${activeThemeConfig.textSecondaryClass} mb-3`} />
            <p className={`${activeThemeConfig.textSecondaryClass} text-sm font-medium`}>
              {t.noBooksInBatch}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
            {books.map((book) => (
              <div
                key={book.isbn}
                className={`${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-3 sm:p-4 flex items-start gap-3 transition`}
              >
                <BookCover coverUrl={book.coverUrl} title={book.title} noCoverText={t.noCover} activeThemeConfig={activeThemeConfig} />

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-bold ${activeThemeConfig.textPrimaryClass} leading-snug break-words`}>
                    {book.title}
                  </h3>
                  <div className={`text-xs ${activeThemeConfig.textSecondaryClass} space-y-0.5 mt-1`}>
                    {book.authors && <p>{t.authorLabel} {book.authors}</p>}
                    <div className={`flex flex-wrap gap-x-3 text-[11px] ${activeThemeConfig.textSecondaryClass}`}>
                      {book.publishedYear && <span>{t.yearLabel} {book.publishedYear}</span>}
                      {book.publisher && <span>{t.publisherLabel} {book.publisher}</span>}
                      <span className="font-mono">ISBN: {book.isbn}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveBook(book.isbn)}
                  title={t.delete}
                  className={`${activeThemeConfig.textSecondaryClass} hover:text-rose-400 p-2 hover:bg-black/10 rounded-xl transition flex-shrink-0`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`flex gap-3 pt-4 border-t ${activeThemeConfig.borderClass} flex-shrink-0 mt-2`}>
          <button
            onClick={onDiscardAll}
            className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonSecondaryClass} font-semibold transition text-sm flex items-center justify-center gap-2`}
          >
            {t.discardAll}
          </button>

          <button
            onClick={onSaveAll}
            disabled={books.length === 0}
            className={`flex-1 py-3 px-4 rounded-xl ${activeThemeConfig.buttonPrimaryClass} disabled:opacity-50 font-semibold transition text-sm flex items-center justify-center gap-2 shadow-lg`}
          >
            <Check className="w-4 h-4" />
            {t.saveAll} ({books.length})
          </button>
        </div>
      </div>
    </div>
  );
};
