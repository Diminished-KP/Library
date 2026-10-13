import React from 'react';
import { ArrowLeft, Languages, Palette, Check } from 'lucide-react';
import type { Language, Translations } from '../services/i18n';
import type { ThemeId } from '../types/theme';
import { themes } from '../types/theme';

interface SettingsViewProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  onBackToMenu: () => void;
  t: Translations;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLanguage,
  onSelectLanguage,
  currentTheme,
  onSelectTheme,
  onBackToMenu,
  t,
}) => {
  const languageOptions: { id: Language; labelKey: keyof Translations; flag: string }[] = [
    { id: 'cs', labelKey: 'langCzech', flag: '🇨🇿' },
    { id: 'en', labelKey: 'langEnglish', flag: '🇬🇧' },
    { id: 'es', labelKey: 'langSpanish', flag: '🇪🇸' },
  ];

  const themeKeys = Object.keys(themes) as ThemeId[];
  const activeThemeConfig = themes[currentTheme] || themes.default;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className={`flex items-center gap-2 ${activeThemeConfig.textSecondaryClass} hover:${activeThemeConfig.textPrimaryClass} font-medium px-3 py-2 rounded-xl transition`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.backToMenu}</span>
        </button>
        <h2 className={`text-xl font-bold ${activeThemeConfig.textPrimaryClass}`}>
          {t.settingsTitle}
        </h2>
      </div>

      <div className="w-full max-w-2xl space-y-8">
        {/* Language Selection Section */}
        <section className={`${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${activeThemeConfig.bgClass} ${activeThemeConfig.accentClass}`}>
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>
                {t.languageSectionTitle}
              </h3>
              <p className={`text-xs sm:text-sm ${activeThemeConfig.textSecondaryClass}`}>
                {t.languageSectionDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {languageOptions.map((option) => {
              const isSelected = currentLanguage === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => onSelectLanguage(option.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left font-medium ${
                    isSelected
                      ? `${activeThemeConfig.buttonPrimaryClass} border-transparent shadow-lg`
                      : `${activeThemeConfig.buttonSecondaryClass}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.flag}</span>
                    <span>{t[option.labelKey]}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Theme Selection Section */}
        <section className={`${activeThemeConfig.cardBgClass} border ${activeThemeConfig.borderClass} rounded-2xl p-6 shadow-xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${activeThemeConfig.bgClass} ${activeThemeConfig.accentClass}`}>
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${activeThemeConfig.textPrimaryClass}`}>
                {t.themeSectionTitle}
              </h3>
              <p className={`text-xs sm:text-sm ${activeThemeConfig.textSecondaryClass}`}>
                {t.themeSectionDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {themeKeys.map((themeId) => {
              const theme = themes[themeId];
              const isSelected = currentTheme === themeId;
              const themeName = t[theme.nameKey as keyof Translations] || theme.nameKey;

              return (
                <button
                  key={themeId}
                  onClick={() => onSelectTheme(themeId)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? `border-blue-500 ring-2 ring-blue-500/30 ${activeThemeConfig.cardBgClass}`
                      : `${activeThemeConfig.buttonSecondaryClass}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Color Dots Preview */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-700/40 bg-black/20">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.previewColors.bg }}
                        title="Background"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.previewColors.card }}
                        title="Card"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.previewColors.accent }}
                        title="Accent"
                      />
                    </div>
                    <span className="font-medium text-sm">{themeName}</span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
