import React, { useState, useMemo } from 'react';
import type { Book, Library } from '../types/book';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import { DeleteBookModal } from './DeleteBookModal';
import {
  ArrowLeft,
  Trash2,
  Search,
  Library as LibraryIcon,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Table,
  Plus,
} from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  libraries: Library[];
  activeLibraryId: string;
  onSelectLibrary: (id: string) => void;
  onOpenAddLibraryModal: () => void;
  onDeleteLibrary: (id: string) => void;
  onBackToMenu: () => void;
  onDeleteBook: (isbn: string, libraryId: string, removeAll: boolean) => void;
}

const BookCover: React.FC<{ coverUrl?: string; title: string }> = ({ coverUrl, title }) => {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setHasError(true)}
        className="w-16 h-24 object-cover rounded-lg border border-slate-700/60 shadow-sm flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-16 h-24 bg-slate-800/80 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-slate-600 flex-shrink-0 p-1 text-center">
      <BookOpen className="w-6 h-6 mb-1 opacity-40 text-slate-400" />
      <span className="text-[9px] text-slate-500 font-medium">Bez obálky</span>
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
  onDeleteBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const activeLibrary = libraries.find((l) => l.id === activeLibraryId) || libraries[0];

  // Filter books for the active library and search query
  const libraryBooks = useMemo(() => {
    return books.filter((b) => b.libraryId === activeLibraryId);
  }, [books, activeLibraryId]);

  const filteredBooks = useMemo(() => {
    return libraryBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.authors && b.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.isbn.includes(searchTerm)
    );
  }, [libraryBooks, searchTerm]);

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
      groups[key].sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    });

    return groups;
  }, [filteredBooks, alphabetLetters]);

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
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 font-medium px-3 py-2 rounded-xl hover:bg-slate-900 transition self-start"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Hlavní menu</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddLibraryModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat knihovnu</span>
          </button>
        </div>
      </div>

      {/* Library Tabs & Selector */}
      <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800 flex-wrap">
          <div className="flex items-center gap-2">
            <LibraryIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-100">{activeLibrary?.name}</h2>
            <span className="text-xs bg-slate-950 text-blue-400 px-2.5 py-0.5 rounded-full border border-slate-800 font-semibold ml-1">
              {libraryBooks.reduce((sum, b) => sum + (b.quantity || 1), 0)} ks ({libraryBooks.length} titulů)
            </span>
          </div>

          {libraries.length > 1 && (
            <button
              onClick={() => onDeleteLibrary(activeLibraryId)}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 py-1 rounded transition"
              title="Smazat tuto knihovnu"
            >
              Smazat knihovnu
            </button>
          )}
        </div>

        {activeLibrary?.description && (
          <p className="text-xs text-slate-400 mb-3 px-1">{activeLibrary.description}</p>
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
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{lib.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
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
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hledat v knihovně podle názvu, autora nebo ISBN..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 text-sm transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">Exportovat:</span>
            <button
              onClick={() => exportToPdf(filteredBooks)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
              title="Exportovat seznam jako PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              PDF
            </button>
            <button
              onClick={() => exportToExcel(filteredBooks)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
              title="Exportovat seznam do Excelu (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => exportToCsv(filteredBooks)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
              title="Exportovat seznam do CSV (Google Sheets)"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              CSV / Google Sheets
            </button>
          </div>
        </div>
      )}

      {libraryBooks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">Knihovna je prázdná</h3>
          <p className="text-slate-500 text-sm">
            V této knihovně zatím nejsou žádné knihy. Naskenujte čárový kód nebo zadejte ISBN v aplikaci.
          </p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nenalezeny žádné knihy odpovídající &quot;{searchTerm}&quot;.
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
                  <div className="sticky top-2 z-10 bg-slate-950/90 backdrop-blur-md py-1 px-3 mb-3 border-b border-blue-500/30 flex items-center gap-2">
                    <span className="text-sm font-black text-blue-400">{letter}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">({booksInLetter.length})</span>
                  </div>

                  <div className="space-y-3">
                    {booksInLetter.map((book) => (
                      <div
                        key={book.isbn}
                        className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition shadow-md"
                      >
                        <BookCover coverUrl={book.coverUrl} title={book.title} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug break-words">
                              {book.title}
                            </h3>
                            <span className="bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                              {book.quantity || 1} ks
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 space-y-1 font-medium">
                            {book.authors && (
                              <p className="text-slate-300">
                                <strong>Autor:</strong> {book.authors}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
                              {book.publishedYear && <p>Rok: {book.publishedYear}</p>}
                              {book.publisher && <p>Nakladatelství: {book.publisher}</p>}
                              <p className="font-mono text-slate-500">ISBN: {book.isbn}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBookDeleteClick(book)}
                          title="Smazat z knihovny"
                          className="text-slate-500 hover:text-rose-400 p-2 hover:bg-slate-800/50 rounded-xl transition flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alphabet Sidebar Index */}
          <div className="sticky top-4 flex flex-col items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 shadow-lg text-[10px] font-bold text-slate-400 select-none max-h-[80vh] overflow-y-auto w-7 flex-shrink-0">
            {alphabetLetters.map((letter) => {
              const hasBooks = !!groupedBooks[letter];
              return (
                <button
                  key={letter}
                  onClick={() => scrollToSection(letter)}
                  disabled={!hasBooks}
                  className={`w-5 h-5 flex items-center justify-center rounded transition ${
                    hasBooks
                      ? 'text-blue-400 hover:bg-blue-600 hover:text-white cursor-pointer font-extrabold'
                      : 'text-slate-700 cursor-default opacity-40'
                  }`}
                  title={hasBooks ? `Přejít na ${letter}` : `Žádné knihy od ${letter}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
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
        />
      )}
    </div>
  );
};
