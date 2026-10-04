import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (isbn: string) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isbn, setIsbn] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = isbn.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setIsbn('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-100 mb-2">Zadání ISBN ručně</h3>
        <p className="text-sm text-slate-400 mb-6">
          Zadejte ISBN číslo knížky (10 nebo 13 číslic, např. 9788000058825).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="isbn-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ISBN Číslo
            </label>
            <input
              id="isbn-input"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Např. 9788000058825"
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 transition"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!isbn.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Vyhledat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
