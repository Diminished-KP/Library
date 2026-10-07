import React, { useState } from 'react';
import { X, Plus, Library as LibraryIcon } from 'lucide-react';

interface AddLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLibrary: (name: string, description: string) => void;
}

export const AddLibraryModal: React.FC<AddLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddLibrary,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddLibrary(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-800 transition"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
            <LibraryIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Přidat knihovnu</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lib-name-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Název knihovny *
            </label>
            <input
              id="lib-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. Domácí knihovna, Obývák, Sci-Fi..."
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition text-sm"
            />
          </div>

          <div>
            <label htmlFor="lib-desc-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Krátký popis (volitelné)
            </label>
            <textarea
              id="lib-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Např. Knihy v horní polici v pracovně..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 transition text-sm"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              Vytvořit knihovnu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
