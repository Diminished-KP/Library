export type ThemeId =
  | 'default'
  | 'light'
  | 'gray'
  | 'green'
  | 'brown'
  | 'orange'
  | 'purple'
  | 'black';

export interface ThemeConfig {
  id: ThemeId;
  nameKey: string;
  bgClass: string;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  borderClass: string;
  buttonPrimaryClass: string;
  buttonSecondaryClass: string;
  accentClass: string;
  previewColors: {
    bg: string;
    card: string;
    accent: string;
  };
}

export const themes: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    nameKey: 'themeDefault',
    bgClass: 'bg-slate-950',
    cardBgClass: 'bg-slate-900',
    textPrimaryClass: 'text-slate-100',
    textSecondaryClass: 'text-slate-400',
    borderClass: 'border-slate-800',
    buttonPrimaryClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    buttonSecondaryClass: 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200',
    accentClass: 'text-blue-500',
    previewColors: {
      bg: '#020617',
      card: '#0f172a',
      accent: '#2563eb',
    },
  },
  light: {
    id: 'light',
    nameKey: 'themeLight',
    bgClass: 'bg-slate-100',
    cardBgClass: 'bg-white',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    borderClass: 'border-slate-300',
    buttonPrimaryClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    buttonSecondaryClass: 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-800',
    accentClass: 'text-blue-600',
    previewColors: {
      bg: '#f1f5f9',
      card: '#ffffff',
      accent: '#2563eb',
    },
  },
  gray: {
    id: 'gray',
    nameKey: 'themeGray',
    bgClass: 'bg-neutral-900',
    cardBgClass: 'bg-neutral-800',
    textPrimaryClass: 'text-neutral-100',
    textSecondaryClass: 'text-neutral-400',
    borderClass: 'border-neutral-700',
    buttonPrimaryClass: 'bg-sky-600 hover:bg-sky-500 text-white',
    buttonSecondaryClass: 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200',
    accentClass: 'text-sky-400',
    previewColors: {
      bg: '#171717',
      card: '#262626',
      accent: '#0284c7',
    },
  },
  green: {
    id: 'green',
    nameKey: 'themeGreen',
    bgClass: 'bg-emerald-950',
    cardBgClass: 'bg-emerald-900/80',
    textPrimaryClass: 'text-emerald-50',
    textSecondaryClass: 'text-emerald-300',
    borderClass: 'border-emerald-800',
    buttonPrimaryClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    buttonSecondaryClass: 'bg-emerald-900 hover:bg-emerald-800 border border-emerald-800 text-emerald-100',
    accentClass: 'text-emerald-400',
    previewColors: {
      bg: '#022c22',
      card: '#064e3b',
      accent: '#059669',
    },
  },
  brown: {
    id: 'brown',
    nameKey: 'themeBrown',
    bgClass: 'bg-stone-950',
    cardBgClass: 'bg-stone-900',
    textPrimaryClass: 'text-stone-100',
    textSecondaryClass: 'text-stone-400',
    borderClass: 'border-stone-800',
    buttonPrimaryClass: 'bg-amber-700 hover:bg-amber-600 text-white',
    buttonSecondaryClass: 'bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200',
    accentClass: 'text-amber-500',
    previewColors: {
      bg: '#0c0a09',
      card: '#1c1917',
      accent: '#b45309',
    },
  },
  orange: {
    id: 'orange',
    nameKey: 'themeOrange',
    bgClass: 'bg-zinc-950',
    cardBgClass: 'bg-zinc-900',
    textPrimaryClass: 'text-zinc-100',
    textSecondaryClass: 'text-zinc-400',
    borderClass: 'border-zinc-800',
    buttonPrimaryClass: 'bg-orange-600 hover:bg-orange-500 text-white',
    buttonSecondaryClass: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200',
    accentClass: 'text-orange-500',
    previewColors: {
      bg: '#09090b',
      card: '#18181b',
      accent: '#ea580c',
    },
  },
  purple: {
    id: 'purple',
    nameKey: 'themePurple',
    bgClass: 'bg-slate-950',
    cardBgClass: 'bg-purple-950/70',
    textPrimaryClass: 'text-purple-100',
    textSecondaryClass: 'text-purple-300',
    borderClass: 'border-purple-800/60',
    buttonPrimaryClass: 'bg-violet-600 hover:bg-violet-500 text-white',
    buttonSecondaryClass: 'bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200',
    accentClass: 'text-violet-400',
    previewColors: {
      bg: '#020617',
      card: '#3b0764',
      accent: '#7c3aed',
    },
  },
  black: {
    id: 'black',
    nameKey: 'themeBlack',
    bgClass: 'bg-black',
    cardBgClass: 'bg-zinc-950',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-zinc-400',
    borderClass: 'border-zinc-800',
    buttonPrimaryClass: 'bg-zinc-100 hover:bg-white text-zinc-950 font-bold',
    buttonSecondaryClass: 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200',
    accentClass: 'text-zinc-200',
    previewColors: {
      bg: '#000000',
      card: '#09090b',
      accent: '#f4f4f5',
    },
  },
};
