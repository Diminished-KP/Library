import React, { useState } from 'react';
import type { Book } from '../types/book';
import { exportToPdf, exportToExcel, exportToCsv } from '../services/exportService';
import { ArrowLeft, Trash2, Search, Library as LibraryIcon, BookOpen, FileText, FileSpreadsheet, Table } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  onBackToMenu: () => void;
  onDeleteBook: (isbn: string) => void;
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
  onBackToMenu,
  onDeleteBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.authors && b.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.isbn.includes(searchTerm)
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-100 font-medium px-3 py-2 rounded-xl hover:bg-slate-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Hlavní menu</span>
        </button>

        <div className="flex items-center gap-2">
          <LibraryIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-100">Moje knihovna</h2>
          <span className="text-xs bg-slate-900 text-blue-400 px-2.5 py-0.5 rounded-full border border-slate-800 font-semibold ml-1">
            {books.length}
          </span>
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

      {books.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">Knihovna je prázdná</h3>
          <p className="text-slate-500 text-sm">
            Zatím jste nepřidali žádné knihy. Naskenujte čárový kód nebo zadejte ISBN v aplikaci.
          </p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nenalezeny žádné knihy odpovídající &quot;{searchTerm}&quot;.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBooks.map((book) => (
            <div
              key={book.isbn}
              className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition shadow-md"
            >
              <BookCover coverUrl={book.coverUrl} title={book.title} />

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-100 leading-snug mb-2 break-words">
                  {book.title}
                </h3>

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
                onClick={() => onDeleteBook(book.isbn)}
                title="Smazat z knihovny"
                className="text-slate-500 hover:text-rose-400 p-2 hover bg-slate-800/50 rounded-xl transition flex-shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
