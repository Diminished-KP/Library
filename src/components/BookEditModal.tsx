import React, { useState } from 'react';
import type { Book } from '../types/book';
import type { Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { X, Edit, Save } from 'lucide-react';
import { isValidIsbn } from '../services/isbnExtractor';
import { normalizeIsbn } from '../services/bookService';

interface BookEditModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBook: Book) => void;
  t: Translations;
  currentTheme?: ThemeId;
}

export const BookEditModal: React.FC<BookEditModalProps> = ({
  book,
  isOpen,
  onClose,
  onSave,
  t,
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;

  const [title, setTitle] = useState(book.title);
  const [authors, setAuthors] = useState(book.authors || '');
  const [publishedYear, setPublishedYear] = useState(book.publishedYear || '');
  const [publisher, setPublisher] = useState(book.publisher || '');
  const [description, setDescription] = useState(book.description || '');
  const [genre, setGenre] = useState(book.genre || '');
  const [isbn, setIsbn] = useState(book.isbn || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vyplňte prosím název knihy.');
      return;
    }

    const cleanIsbn = isbn.trim() ? normalizeIsbn(isbn.trim()) : undefined;
    if (cleanIsbn && !isValidIsbn(cleanIsbn)) {
      setError(t.isbnInvalidError);
      return;
    }

    const updated: Book = {
      ...book,
      title: title.trim(),
      authors: authors.trim() || undefined,
      publishedYear: publishedYear.trim() || undefined,
      publisher: publisher.trim() || undefined,
      description: description.trim() || undefined,
      genre: genre.trim() || undefined,
      isbn: cleanIsbn,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Edit className={`w-5 h-5 ${activeThemeConfig.accentClass}`} />
            <h3 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>
              {t.editBook}
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
                className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} text-sm rounded-xl p-3 outline-none focus:border-blue-500`}
              />
            </div>
            <div>
              <label htmlFor="edit-book-isbn" className={`text-xs font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                {t.bookIsbnOptionalLabel}
              </label>
              <input
                id="edit-book-isbn"
                type="text"
                value={isbn}
                onChange={(e) => {
                  setIsbn(e.target.value);
                  if (error) setError('');
                }}
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
              className={`flex-1 py-3 ${activeThemeConfig.buttonPrimaryClass} font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-1.5`}
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
