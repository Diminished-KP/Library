import React, { useState } from 'react';
import type { Book } from '../types/book';
import { Layers, Trash2, Check, BookOpen } from 'lucide-react';

interface BatchReviewModalProps {
  isOpen: boolean;
  books: Book[];
  libraryName?: string;
  onRemoveBook: (isbn: string) => void;
  onSaveAll: () => void;
  onDiscardAll: () => void;
}

const BookCover: React.FC<{ coverUrl?: string; title: string }> = ({ coverUrl, title }) => {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setHasError(true)}
        className="w-14 h-20 object-cover rounded-lg border border-slate-700/60 shadow-sm flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-14 h-20 bg-slate-800/80 rounded-lg border border-slate-700/50 flex flex-col items-center justify-center text-slate-600 flex-shrink-0 p-1 text-center">
      <BookOpen className="w-5 h-5 mb-1 opacity-40 text-slate-400" />
      <span className="text-[8px] text-slate-500 font-medium">Bez obálky</span>
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <Layers className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Naskenované knihy ({books.length})
            </h2>
            <p className="text-xs text-slate-400">
              Zkontrolovat a uložit hromadně naskenované knihy {libraryName ? `do: ${libraryName}` : ''}
            </p>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm font-medium">
              Žádné nové knihy k uložení.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
            {books.map((book) => (
              <div
                key={book.isbn}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 sm:p-4 flex items-start gap-3 transition"
              >
                <BookCover coverUrl={book.coverUrl} title={book.title} />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-100 leading-snug break-words">
                    {book.title}
                  </h3>
                  <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                    {book.authors && <p>Autor: {book.authors}</p>}
                    <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                      {book.publishedYear && <span>Rok: {book.publishedYear}</span>}
                      {book.publisher && <span>Nakladatelství: {book.publisher}</span>}
                      <span className="font-mono">ISBN: {book.isbn}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveBook(book.isbn)}
                  title="Odebrat ze seznamu"
                  className="text-slate-500 hover:text-rose-400 p-2 hover:bg-slate-800 rounded-xl transition flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-800 flex-shrink-0 mt-2">
          <button
            onClick={onDiscardAll}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition text-sm flex items-center justify-center gap-2"
          >
            Zrušit
          </button>

          <button
            onClick={onSaveAll}
            disabled={books.length === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Check className="w-4 h-4" />
            Uložit do knihovny ({books.length})
          </button>
        </div>
      </div>
    </div>
  );
};
