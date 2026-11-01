import React, { useState, useMemo } from 'react';
import type { Book, Library, ReadingStatus } from '../types/book';
import type { Translations, Language } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';
import { DeleteBookModal } from './DeleteBookModal';
import { ExportModal } from './ExportModal';
import { BookDetailModal } from './BookDetailModal';
import {
  ArrowLeft,
  Trash2,
  Search,
  Library as LibraryIcon,
  BookOpen,
  Download,
  Plus,
  Scan,
  Filter,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  libraries: Library[];
  activeLibraryId: string;
  onSelectLibrary: (id: string) => void;
  onOpenAddLibraryModal: () => void;
  onDeleteLibrary: (id: string) => void;
  onBackToMenu: () => void;
  onNavigateToScanner: () => void;
  onDeleteBook: (isbn: string, libraryId: string, removeAll: boolean) => void;
  onUpdateBook?: (updatedBook: Book) => void;
  onUpdateReadingStatus?: (book: Book, status: ReadingStatus) => void;
  t: Translations;
  currentLanguage?: Language;
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
        className={`w-full aspect-[2/3] object-cover rounded-xl border ${activeThemeConfig.borderClass} shadow-md`}
      />
    );
  }

  return (
    <div className={`w-full aspect-[2/3] ${activeThemeConfig.cardBgClass} rounded-xl border ${activeThemeConfig.borderClass} flex flex-col items-center justify-center ${activeThemeConfig.textSecondaryClass} p-2 text-center shadow-inner`}>
      <BookOpen className={`w-8 h-8 mb-1.5 opacity-40 ${activeThemeConfig.textSecondaryClass}`} />
      <span className={`text-[10px] ${activeThemeConfig.textSecondaryClass} font-medium line-clamp-2`}>{noCoverText}</span>
    </div>
  );
};

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  libraries,
  activeLibraryId,
  onSelectLibrary,
  onOpenAddLibraryModal,
  onDeleteLibrary,
  onBackToMenu,
  onNavigateToScanner,
  onDeleteBook,
  onUpdateBook,
  onUpdateReadingStatus,
  t,
  currentLanguage = 'cs',
  currentTheme = 'default',
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const activeLibrary = libraries.find((l) => l.id === activeLibraryId) || libraries[0];

  // Filter books for the active library and search query
  const libraryBooks = useMemo(() => {
    return books.filter((b) => b.libraryId === activeLibraryId);
  }, [books, activeLibraryId]);

  // Unique genres for filter
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    libraryBooks.forEach((b) => {
      if (b.genre) {
        b.genre.split(',').forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [libraryBooks]);

  // Unique authors for filter
  const availableAuthors = useMemo(() => {
    const set = new Set<string>();
    libraryBooks.forEach((b) => {
      if (b.authors) {
        b.authors.split(',').forEach((a) => {
          const trimmed = a.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [libraryBooks]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGenre !== 'all') count++;
    if (selectedAuthor !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    return count;
  }, [selectedGenre, selectedAuthor, selectedStatus]);

  const handleResetFilters = () => {
    setSelectedGenre('all');
    setSelectedAuthor('all');
    setSelectedStatus('all');
  };

  const filteredBooks = useMemo(() => {
    return libraryBooks.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.authors && b.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.isbn.includes(searchTerm);

      const matchesGenre =
        selectedGenre === 'all' ||
        (b.genre && b.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

      const matchesAuthor =
        selectedAuthor === 'all' ||
        (b.authors && b.authors.toLowerCase().includes(selectedAuthor.toLowerCase()));

      const status = b.readingStatus || 'unread';
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

      return matchesSearch && matchesGenre && matchesAuthor && matchesStatus;
    });
  }, [libraryBooks, searchTerm, selectedGenre, selectedAuthor, selectedStatus]);

  // Alphabet sidebar letters
  const alphabetLetters = useMemo(() => {
    return [
      'A', 'B', 'C', 'Č', 'D', 'E', 'F', 'G', 'H', 'CH', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ž', '#'
    ];
  }, []);

  // Normalize titles for grouping
  const normalizeForAlpha = (str: string) => {
    const s = str.trim().toUpperCase();
    if (s.startsWith('CH')) return 'CH';
    const firstChar = s.charAt(0);
    return firstChar;
  };

  // Group filtered books by letter
  const groupedBooks = useMemo(() => {
    const groups: { [letter: string]: Book[] } = {};
    filteredBooks.forEach((book) => {
      let letter = normalizeForAlpha(book.title);
      if (!alphabetLetters.includes(letter) && letter !== 'CH') {
        letter = '#';
      }
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(book);
    });

    // Sort books within each group alphabetically
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.title.localeCompare(b.title, currentLanguage));
    });

    return groups;
  }, [filteredBooks, alphabetLetters, currentLanguage]);

  const scrollToSection = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookDeleteClick = (book: Book) => {
    if ((book.quantity || 1) > 1) {
      setDeletingBook(book);
    } else {
      onDeleteBook(book.isbn, book.libraryId, true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToMenu}
          className={`flex items-center gap-2 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} font-medium px-3 py-2 rounded-xl transition self-start`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.mainMenu}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToScanner}
            className={`px-4 py-2 ${activeThemeConfig.buttonPrimaryClass} font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg`}
          >
            <Scan className="w-4 h-4" />
            <span>{t.addBooksToLibrary}</span>
          </button>
          <button
            onClick={onOpenAddLibraryModal}
            className={`px-4 py-2 ${activeThemeConfig.buttonSecondaryClass} font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-md`}
          >
            <Plus className="w-4 h-4" />
            <span>{t.addLibrary}</span>
          </button>
        </div>
      </div>

      {/* Library Tabs & Selector */}
      <div className={`mb-6 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-3 shadow-md`}>
        <div className={`flex items-center justify-between gap-2 mb-3 pb-3 border-b ${activeThemeConfig.borderClass} flex-wrap`}>
          <div className="flex items-center gap-2">
            <LibraryIcon className={`w-5 h-5 ${activeThemeConfig.accentClass}`} />
            <h2 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>{activeLibrary?.name}</h2>
            <span className={`text-xs ${activeThemeConfig.bgClass} ${activeThemeConfig.accentClass} px-2.5 py-0.5 rounded-full border ${activeThemeConfig.borderClass} font-semibold ml-1`}>
              {libraryBooks.reduce((sum, b) => sum + (b.quantity || 1), 0)} {t.pcs} ({libraryBooks.length} {t.titlesCount})
            </span>
          </div>

          {libraries.length > 1 && (
            <button
              onClick={() => onDeleteLibrary(activeLibraryId)}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 py-1 rounded transition"
              title={t.deleteLibrary}
            >
              {t.deleteLibrary}
            </button>
          )}
        </div>

        {activeLibrary?.description && (
          <p className={`text-xs ${activeThemeConfig.textSecondaryClass} mb-3 px-1`}>{activeLibrary.description}</p>
        )}

        {/* Library Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {libraries.map((lib) => {
            const count = books.filter((b) => b.libraryId === lib.id).length;
            const isActive = lib.id === activeLibraryId;
            return (
              <button
                key={lib.id}
                onClick={() => onSelectLibrary(lib.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  isActive
                    ? `${activeThemeConfig.buttonPrimaryClass} shadow-md`
                    : `${activeThemeConfig.bgClass} ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} border ${activeThemeConfig.borderClass}`
                }`}
              >
                <span>{lib.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/20 text-white' : `${activeThemeConfig.cardBgClass} ${activeThemeConfig.textSecondaryClass}`}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {books.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className={`w-5 h-5 ${activeThemeConfig.textSecondaryClass} absolute left-3.5 top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchBookPlaceholder}
              className={`w-full ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} placeholder:${activeThemeConfig.textSecondaryClass} rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 text-sm transition`}
            />
          </div>

          {/* Action Row: Single Filter Button & Export Button */}
          <div className="flex items-center justify-between gap-3 pt-1 relative">
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-label={t.filters}
                data-testid="library-filter-button"
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm border ${
                  activeFiltersCount > 0
                    ? `${activeThemeConfig.buttonPrimaryClass} border-transparent`
                    : `${activeThemeConfig.cardBgClass} ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} hover:${activeThemeConfig.accentClass}`
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{t.filters}</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-black/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Single Filter Dropdown Menu */}
              {isFilterOpen && (
                <div
                  className={`absolute left-0 mt-2 w-72 sm:w-80 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-4 shadow-2xl z-30 space-y-3.5 animate-in fade-in duration-150`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className={`text-xs font-bold ${activeThemeConfig.textPrimaryClass} flex items-center gap-1.5`}>
                      <Filter className="w-3.5 h-3.5" />
                      {t.filters}
                    </span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className={`text-[11px] ${activeThemeConfig.accentClass} hover:underline flex items-center gap-1 font-semibold`}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t.resetFilters}</span>
                      </button>
                    )}
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className={`text-[11px] font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                      {t.genreLabel.replace(':', '')}
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium`}
                    >
                      <option value="all">{t.allGenres}</option>
                      {availableGenres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author Filter */}
                  <div>
                    <label className={`text-[11px] font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                      {t.authorLabel.replace(':', '')}
                    </label>
                    <select
                      value={selectedAuthor}
                      onChange={(e) => setSelectedAuthor(e.target.value)}
                      className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium`}
                    >
                      <option value="all">{t.allAuthors}</option>
                      {availableAuthors.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className={`text-[11px] font-bold ${activeThemeConfig.textSecondaryClass} mb-1 block`}>
                      {t.readingStatusFilter}
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={`w-full ${activeThemeConfig.bgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.textPrimaryClass} rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium`}
                    >
                      <option value="all">{t.allReadingStatuses}</option>
                      <option value="unread">{t.statusUnread}</option>
                      <option value="reading">{t.statusReading}</option>
                      <option value="read">{t.statusRead}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className={`px-4 py-2 ${activeThemeConfig.buttonSecondaryClass} text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-md`}
              title={t.exportLibrary}
            >
              <Download className={`w-4 h-4 ${activeThemeConfig.accentClass}`} />
              <span>{t.exportBooks}</span>
            </button>
          </div>
        </div>
      )}

      {libraryBooks.length === 0 ? (
        <div className={`text-center py-16 ${activeThemeConfig.cardBgClass}/40 border ${activeThemeConfig.borderClass} rounded-3xl p-8`}>
          <BookOpen className={`w-12 h-12 ${activeThemeConfig.textSecondaryClass} mx-auto mb-3`} />
          <h3 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass} mb-1`}>{t.emptyLibraryTitle}</h3>
          <p className={`${activeThemeConfig.textSecondaryClass} text-sm`}>
            {t.emptyLibraryDesc}
          </p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className={`text-center py-12 ${activeThemeConfig.textSecondaryClass} text-sm`}>
          {t.noMatchingBooksFound} &quot;{searchTerm}&quot;.
        </div>
      ) : (
        <div className="flex gap-4 items-start relative">
          {/* Main Book List with Alphabet Group Headers */}
          <div className="flex-1 min-w-0 space-y-6">
            {alphabetLetters.map((letter) => {
              const booksInLetter = groupedBooks[letter];
              if (!booksInLetter || booksInLetter.length === 0) return null;

              return (
                <div key={letter} id={`section-${letter}`} className="scroll-mt-4">
                  <div className={`sticky top-2 z-10 ${activeThemeConfig.bgClass}/90 backdrop-blur-md py-1 px-3 mb-3 border-b ${activeThemeConfig.borderClass} flex items-center gap-2`}>
                    <span className={`text-sm font-black ${activeThemeConfig.accentClass}`}>{letter}</span>
                    <span className={`text-[10px] ${activeThemeConfig.textSecondaryClass} font-semibold`}>({booksInLetter.length})</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {booksInLetter.map((book) => (
                      <div
                        key={book.id || `${book.isbn}_${book.addedAt}`}
                        onClick={() => setSelectedBookForDetail(book)}
                        className={`${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} hover:border-blue-500/50 cursor-pointer rounded-2xl p-3 flex flex-col justify-between transition shadow-md group relative`}
                      >
                        <div>
                          <div className="relative mb-2.5">
                            <BookCover coverUrl={book.coverUrl} title={book.title} noCoverText={t.noCover} activeThemeConfig={activeThemeConfig} />

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookDeleteClick(book);
                              }}
                              title={t.deleteFromLibrary}
                              className={`absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-slate-300 hover:text-rose-400 hover:bg-black/80 transition opacity-80 group-hover:opacity-100 shadow-sm`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h3
                            title={book.title}
                            className={`text-sm sm:text-base font-bold ${activeThemeConfig.textPrimaryClass} leading-tight line-clamp-2 group-hover:text-blue-400 transition mb-1`}
                          >
                            {book.title}
                          </h3>

                          {book.authors && (
                            <p
                              title={book.authors}
                              className={`text-xs ${activeThemeConfig.textSecondaryClass} line-clamp-1 font-medium`}
                            >
                              {book.authors}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alphabet Sidebar Index */}
          <div className={`sticky top-4 flex flex-col items-center ${activeThemeConfig.cardBgClass}/80 border ${activeThemeConfig.borderClass} rounded-xl p-1 shadow-lg text-[10px] font-bold ${activeThemeConfig.textSecondaryClass} select-none max-h-[80vh] overflow-y-auto w-7 flex-shrink-0`}>
            {alphabetLetters.map((letter) => {
              const hasBooks = !!groupedBooks[letter];
              return (
                <button
                  key={letter}
                  onClick={() => scrollToSection(letter)}
                  disabled={!hasBooks}
                  className={`w-5 h-5 flex items-center justify-center rounded transition ${
                    hasBooks
                      ? `${activeThemeConfig.accentClass} hover:bg-blue-600 hover:text-white cursor-pointer font-extrabold`
                      : 'opacity-30 cursor-default'
                  }`}
                  title={hasBooks ? `${t.goToSection} ${letter}` : `${t.noBooksStartingWith} ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        books={filteredBooks}
        t={t}
        currentTheme={currentTheme}
      />

      {/* Detail Modal */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          isOpen={!!selectedBookForDetail}
          onClose={() => setSelectedBookForDetail(null)}
          onUpdateReadingStatus={(book, status) => {
            if (onUpdateReadingStatus) {
              onUpdateReadingStatus(book, status);
            }
            setSelectedBookForDetail((prev) => (prev ? { ...prev, readingStatus: status } : null));
          }}
          onUpdateBook={(updatedBook) => {
            if (onUpdateBook) {
              onUpdateBook(updatedBook);
            }
            setSelectedBookForDetail(updatedBook);
          }}
          onDeleteBook={(book) => {
            handleBookDeleteClick(book);
            setSelectedBookForDetail(null);
          }}
          t={t}
          currentTheme={currentTheme}
        />
      )}

      {/* Delete Book Modal */}
      {deletingBook && (
        <DeleteBookModal
          isOpen={!!deletingBook}
          bookTitle={deletingBook.title}
          quantity={deletingBook.quantity || 1}
          onClose={() => setDeletingBook(null)}
          onDecrement={() => onDeleteBook(deletingBook.isbn, deletingBook.libraryId, false)}
          onDeleteAll={() => onDeleteBook(deletingBook.isbn, deletingBook.libraryId, true)}
          t={t}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};
