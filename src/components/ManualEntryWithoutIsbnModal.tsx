import React, { useState } from 'react';
import type { Book, Library } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { X, BookPlus, Library as LibraryIcon } from 'lucide-react';

interface ManualEntryWithoutIsbnModalProps {
  isOpen: boolean;
  initialIsbn?: string;
  onClose: () => void;
  onSubmit: (book: Book) => void;
  libraries: Library[];
  selectedLibraryId: string;
  onSelectLibrary: (id: string) => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const ManualEntryWithoutIsbnModal: React.FC<ManualEntryWithoutIsbnModalProps> = ({
  isOpen,
  initialIsbn = '',
  onClose,
  onSubmit,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;

  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState(initialIsbn);
  const [prevInitialIsbn, setPrevInitialIsbn] = useState(initialIsbn);
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');

  // Synchronize initialIsbn when modal is re-opened with a new initial ISBN
  if (initialIsbn !== prevInitialIsbn) {
    setPrevInitialIsbn(initialIsbn);
    setIsbn(initialIsbn);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vyplňte prosím název knihy.');
      return;
    }

    const timestamp = Date.now();
    const cleanIsbn = isbn.trim() || undefined;

    const newBook: Book = {
      id: `book_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
      isbn: cleanIsbn,
      title: title.trim(),
      authors: authors.trim() || undefined,
      description: description.trim() || undefined,
      genre: genre.trim() || undefined,
      readingStatus: 'unread',
      publishedYear: publishedYear.trim() || undefined,
      publisher: publisher.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      source: 'Ruční vložení',
      addedAt: timestamp,
      libraryId: selectedLibraryId,
      quantity: 1,
    };

    onSubmit(newBook);
    // Reset form
    setTitle('');
    setAuthors('');
    setPublishedYear('');
    setPublisher('');
    setDescription('');
    setGenre('');
    setIsbn('');
    setCoverUrl('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <BookPlus className={`w-5 h-5 ${activeThemeConfig.accentClass}`} />
            <h3 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>
              {t.manualEntryNoIsbnTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} hover:bg-white/10 rounded-full transition`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {libraries.length > 1 && (
            <div>
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1.5 flex items-center gap-1.5`}>
                <LibraryIcon className="w-3.5 h-3.5" />
                <span>{t.targetLibraryLabel}</span>
              </label>
              <select
                value={selectedLibraryId}
                onChange={(e) => onSelectLibrary(e.target.value)}
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} text-xs rounded-xl p-3 outline-none focus:border-blue-500 font-semibold`}
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
            <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
              {t.bookTitleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Válka s Mloky"
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
            />
          </div>

          <div>
            <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
              {t.bookAuthorLabel.replace('*', '').trim()} (volitelné)
            </label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="Karel Čapek"
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                {t.bookYearLabel}
              </label>
              <input
                type="text"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                placeholder="1936"
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
              />
            </div>
            <div>
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                {t.bookPublisherLabel}
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Fr. Borový"
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                {t.bookGenreLabel}
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Sci-Fi, Román"
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
              />
            </div>
            <div>
              <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                {t.bookIsbnOptionalLabel}
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Nepovinné ISBN"
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500 font-mono`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
              {t.bookDescriptionLabel}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stručný obsah knihy, stav vazby, poznámky..."
              className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500 resize-none`}
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

          <div className="flex gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 ${activeThemeConfig.buttonSecondaryClass} font-bold text-xs rounded-xl transition`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 ${activeThemeConfig.buttonPrimaryClass} font-bold text-xs rounded-xl transition shadow-lg`}
            >
              {t.addCustomBookSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
