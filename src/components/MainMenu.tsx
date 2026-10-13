import React from 'react';
import { Scan, BookOpen, Library, Settings } from 'lucide-react';
import type { Translations, Language } from '../services/i18n';
import { formatBookCount } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';

interface MainMenuProps {
  onNavigateToScanner: () => void;
  onNavigateToLibrary: () => void;
  onNavigateToSettings: () => void;
  bookCount: number;
  t: Translations;
  currentLanguage: Language;
  currentTheme: ThemeId;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigateToScanner,
  onNavigateToLibrary,
  onNavigateToSettings,
  bookCount,
  t,
  currentLanguage,
  currentTheme,
}) => {
  const activeThemeConfig = themes[currentTheme] || themes.default;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center max-w-lg mx-auto">
      <div className={`w-20 h-20 ${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-3xl flex items-center justify-center mb-6 shadow-xl`}>
        <BookOpen className={`w-10 h-10 ${activeThemeConfig.accentClass}`} />
      </div>

      <h1 className={`text-3xl sm:text-4xl font-extrabold ${activeThemeConfig.textPrimaryClass} mb-3 tracking-tight`}>
        {t.appTitle}
      </h1>
      <p className={`${activeThemeConfig.textSecondaryClass} text-sm sm:text-base max-w-sm mb-10 leading-relaxed`}>
        {t.appSubtitle}
      </p>

      <div className="w-full space-y-4">
        {/* Scanner Button */}
        <button
          onClick={onNavigateToScanner}
          className={`w-full py-4 px-6 ${activeThemeConfig.buttonPrimaryClass} font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg`}
        >
          <Scan className="w-6 h-6" />
          {t.startScanner}
        </button>

        {/* My Library Button */}
        <button
          onClick={onNavigateToLibrary}
          className={`w-full py-4 px-6 ${activeThemeConfig.buttonSecondaryClass} font-bold rounded-2xl shadow-md transition-all flex items-center justify-between text-lg`}
        >
          <div className="flex items-center gap-3">
            <Library className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
            <span>{t.myLibrary}</span>
          </div>
          <span className={`${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} ${activeThemeConfig.accentClass} text-xs font-bold px-3 py-1 rounded-full`}>
            {formatBookCount(bookCount, currentLanguage, t)}
          </span>
        </button>

        {/* Settings Button - Directly below My Library button */}
        <button
          onClick={onNavigateToSettings}
          className={`w-full py-4 px-6 ${activeThemeConfig.buttonSecondaryClass} font-bold rounded-2xl shadow-md transition-all flex items-center justify-between text-lg`}
        >
          <div className="flex items-center gap-3">
            <Settings className={`w-6 h-6 ${activeThemeConfig.accentClass}`} />
            <span>{t.settings}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
