import React, { useState } from 'react';
import type { Book, ReadingStatus } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { X, BookOpen, Bookmark, CheckCircle2, Clock, Edit2, Save, Trash2 } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateReadingStatus: (book: Book, status: ReadingStatus) => void;
  onUpdateBook: (updatedBook: Book) => void;
  onDeleteBook?: (book: Book) => void;
  t: Translations;
  currentTheme?: ThemeId;
}

const BookCover: React.FC<{ coverUrl?: string; title: string; activeThemeConfig: typeof themes['default'] }> = ({
  coverUrl,
  title,
  activeThemeConfig,
}) => {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setHasError(true)}
        className={`w-32 h-48 sm:w-40 sm:h-56 object-cover rounded-xl border ${activeThemeConfig.borderClass} shadow-lg mx-auto flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`w-32 h-48 sm:w-40 sm:h-56 ${activeThemeConfig.cardBgClass} rounded-xl border ${activeThemeConfig.borderClass} flex flex-col items-center justify-center ${activeThemeConfig.textSecondaryClass} mx-auto flex-shrink-0 p-3 text-center shadow-md`}
    >
      <BookOpen className={`w-12 h-12 mb-2 opacity-40 ${activeThemeConfig.textSecondaryClass}`} />
      <span className={`text-xs ${activeThemeConfig.textSecondaryClass} font-medium`}>{title}</span>
    </div>
  );
};

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onUpdateReadingStatus,
  onUpdateBook,
  onDeleteBook,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;

  const [isEditingGenre, setIsEditingGenre] = useState(false);
  const [genreInput, setGenreInput] = useState(book?.genre || '');

  const [prevBook, setPrevBook] = useState<Book | null>(null);
  if (book !== prevBook) {
    setPrevBook(book);
    setGenreInput(book?.genre || '');
    setIsEditingGenre(false);
  }

  if (!isOpen || !book) return null;

  const currentStatus: ReadingStatus = book.readingStatus || 'unread';

  const handleSaveGenre = () => {
    onUpdateBook({
      ...book,
      genre: genreInput.trim() || undefined,
    });
    setIsEditingGenre(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass} flex items-center gap-2`}>
            <Bookmark className={`w-5 h-5 ${activeThemeConfig.accentClass}`} />
            <span>{t.bookDetails}</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-2 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} hover:bg-white/10 rounded-full transition`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <BookCover coverUrl={book.coverUrl} title={book.title} activeThemeConfig={activeThemeConfig} />

          <div className="flex-1 space-y-3">
            <h3 className={`text-xl font-extrabold ${activeThemeConfig.textPrimaryClass} leading-snug`}>
              {book.title}
            </h3>

            {book.authors && (
              <p className={`text-sm ${activeThemeConfig.textPrimaryClass} font-semibold`}>
                <span className={activeThemeConfig.textSecondaryClass}>{t.authorLabel} </span>
                {book.authors}
              </p>
            )}

            {/* Reading status controls */}
            <div className="pt-2 pb-1">
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} block mb-2`}>
                Stav čtení:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    onUpdateReadingStatus(book, currentStatus === 'reading' ? 'unread' : 'reading')
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    currentStatus === 'reading'
                      ? 'bg-amber-500 text-white shadow-md'
                      : `${activeThemeConfig.bgClass} ${activeThemeConfig.textSecondaryClass} border ${activeThemeConfig.borderClass} hover:${activeThemeConfig.textPrimaryClass}`
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.statusReading}</span>
                </button>

                <button
                  onClick={() =>
                    onUpdateReadingStatus(book, currentStatus === 'read' ? 'unread' : 'read')
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    currentStatus === 'read'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : `${activeThemeConfig.bgClass} ${activeThemeConfig.textSecondaryClass} border ${activeThemeConfig.borderClass} hover:${activeThemeConfig.textPrimaryClass}`
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.statusRead}</span>
                </button>
              </div>
            </div>

            {/* Genre section */}
            <div className="pt-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass}`}>{t.genreLabel}</span>
                {!isEditingGenre && (
                  <button
                    onClick={() => setIsEditingGenre(true)}
                    className={`text-[11px] ${activeThemeConfig.accentClass} hover:underline flex items-center gap-1 font-semibold`}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{book.genre ? t.edit : 'Přidat žánr'}</span>
                  </button>
                )}
              </div>

              {isEditingGenre ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="např. Detektivka, Sci-Fi..."
                    className={`flex-1 ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} text-xs rounded-xl px-3 py-1.5 outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={handleSaveGenre}
                    className={`p-2 ${activeThemeConfig.buttonPrimaryClass} rounded-xl text-xs`}
                    title={t.save}
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className={`text-xs ${activeThemeConfig.textPrimaryClass} font-medium`}>
                  {book.genre || <span className="italic opacity-60">Neuvedeno</span>}
                </p>
              )}
            </div>

            {/* Other Metadata */}
            <div className={`text-xs space-y-1 ${activeThemeConfig.textSecondaryClass} pt-2 border-t border-white/10`}>
              {book.publishedYear && (
                <p>
                  <strong>{t.yearLabel}</strong> {book.publishedYear}
                </p>
              )}
              {book.publisher && (
                <p>
                  <strong>{t.publisherLabel}</strong> {book.publisher}
                </p>
              )}
              {book.isbn && (
                <p className="font-mono">
                  <strong>{t.isbn}:</strong> {book.isbn}
                </p>
              )}
              <p>
                <strong>{t.quantity}:</strong> {book.quantity || 1} {t.pcs}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
          {onDeleteBook ? (
            <button
              onClick={() => {
                onDeleteBook(book);
                onClose();
              }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.deleteFromLibrary}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className={`px-5 py-2.5 ${activeThemeConfig.buttonSecondaryClass} text-xs font-bold rounded-xl transition`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
