import React from 'react';
import type { Book } from '../types/book';
import { Plus, Trash2, Book as BookIcon } from 'lucide-react';

interface BookPreviewModalProps {
  book: Book | null;
  onAdd: () => void;
  onDiscard: () => void;
}

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  book,
  onAdd,
  onDiscard,
}) => {
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
            <p className="text-xs text-slate-500 font-mono">ISBN: {book.isbn}</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mb-6 space-y-3">
          <h2 className="text-xl font-bold text-slate-100 leading-snug">
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
