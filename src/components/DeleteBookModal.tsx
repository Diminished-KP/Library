import React from 'react';
import { AlertTriangle, Trash2, Minus } from 'lucide-react';

interface DeleteBookModalProps {
  isOpen: boolean;
  bookTitle: string;
  quantity: number;
  onClose: () => void;
  onDecrement: () => void;
  onDeleteAll: () => void;
}

export const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  isOpen,
  bookTitle,
  quantity,
  onClose,
  onDecrement,
  onDeleteAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Odebrat knihu</h3>
        </div>

        <p className="text-sm text-slate-300 mb-2 font-medium">
          &quot;{bookTitle}&quot;
        </p>
        <p className="text-xs text-slate-400 mb-6">
          V knihovně máte {quantity} {quantity === 1 ? 'kus' : quantity >= 2 && quantity <= 4 ? 'kusy' : 'kusů'}. Jak si přejete postupovat?
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onDecrement();
              onClose();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-700"
          >
            <Minus className="w-4 h-4 text-blue-400" />
            Snížit počet o 1 (zbyde {quantity - 1})
          </button>

          <button
            onClick={() => {
              onDeleteAll();
              onClose();
            }}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-rose-600/20"
          >
            <Trash2 className="w-4 h-4" />
            Smazat všechny ({quantity} {quantity === 1 ? 'kus' : quantity >= 2 && quantity <= 4 ? 'kusy' : 'kusů'})
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-slate-400 hover:text-slate-200 font-medium text-xs transition"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
};
