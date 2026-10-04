import React from 'react';
import { Scan, BookOpen, Library } from 'lucide-react';

interface MainMenuProps {
  onNavigateToScanner: () => void;
  onNavigateToLibrary: () => void;
  bookCount: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigateToScanner,
  onNavigateToLibrary,
  bookCount,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-900/10">
        <BookOpen className="w-10 h-10 text-blue-500" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-3 tracking-tight">
        Knihovnický Skener
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-sm mb-10 leading-relaxed">
        Rychlé skenování čárových kódů a ISBN čísel pro okamžité ukládání knih do osobní knihovny.
      </p>

      <div className="w-full space-y-4">
        <button
          onClick={onNavigateToScanner}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-3 text-lg"
        >
          <Scan className="w-6 h-6" />
          Spustit skener
        </button>

        <button
          onClick={onNavigateToLibrary}
          className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center justify-between text-lg"
        >
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6 text-blue-400" />
            <span>Moje knihovna</span>
          </div>
          <span className="bg-slate-800 border border-slate-700 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
            {bookCount} {bookCount === 1 ? 'kniha' : bookCount >= 2 && bookCount <= 4 ? 'knihy' : 'knih'}
          </span>
        </button>
      </div>
    </div>
  );
};
