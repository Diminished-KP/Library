import React, { useState } from 'react';
import type { Book } from '../types/book';
import { Plus, Trash2, Book as BookIcon } from 'lucide-react';

interface BookPreviewModalProps {
  book: Book | null;
  libraryName?: string;
  onAdd: () => void;
  onDiscard: () => void;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  book,
  libraryName,
  onAdd,
  onDiscard,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <BookIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Nalezená kniha ({book.source || 'Vyhledávač'})
            </span>
            {libraryName && (
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                Přidat do: {libraryName}
              </p>
            )}
            <p className="text-xs text-slate-500 font-mono">ISBN: {book.isbn}</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-6 flex gap-4 items-start">
          {book.coverUrl && !imgError ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className="w-24 h-36 object-cover rounded-xl shadow-md border border-slate-700/80 flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-36 bg-slate-800/80 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-slate-600 flex-shrink-0 p-2 text-center">
              <BookIcon className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] text-slate-500 font-medium">Bez obálky</span>
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <h2 className="text-lg font-bold text-slate-100 leading-snug break-words">
              {book.title}
            </h2>

            <div className="text-xs text-slate-400 space-y-1.5 pt-1 border-t border-slate-800/60">
              {book.authors && (
                <p>
                  <strong className="text-slate-300">Autor:</strong> {book.authors}
                </p>
              )}
              {book.publishedYear && (
                <p>
                  <strong className="text-slate-300">Rok vydání:</strong> {book.publishedYear}
                </p>
              )}
              {book.publisher && (
                <p>
                  <strong className="text-slate-300">Nakladatelství:</strong> {book.publisher}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            Zahodit
          </button>

          <button
            onClick={onAdd}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Přidat do knihovny
          </button>
        </div>
      </div>
    </div>
  );
};
