import React, { useState } from 'react';
import type { Book } from '../types/book';
import { ArrowLeft, Trash2, Search, Library as LibraryIcon, BookOpen } from 'lucide-react';

interface LibraryViewProps {
  books: Book[];
  onBackToMenu: () => void;
  onDeleteBook: (isbn: string) => void;
}

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
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hledat v knihovně podle názvu, autora nebo ISBN..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 text-sm transition"
          />
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
