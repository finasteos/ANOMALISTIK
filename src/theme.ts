export interface ColorTheme {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  accentBg: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  badgeBg: string;
  navbarBg: string;
  mainBg: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  accentGlow: string;
  headingGradient: string;
  buttonPrimary: string;
  activeTab: string;
  highlightText: string;
  highlightBg: string;
  previewColors: string[];
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  IVORY_MONOCHROME: {
    id: 'IVORY_MONOCHROME',
    name: 'Suparays Ivory (Grayscale + Color Accents)',
    nameSv: 'Elfenbensvit & Grafit Grayscale',
    description: 'High-contrast warm off-white canvas with sharp graphite typography & selective signal accents',
    accentBg: 'from-stone-900 via-zinc-800 to-stone-950',
    primaryTextColor: 'text-stone-900',
    primaryBorderColor: 'border-stone-400/60',
    badgeBg: 'bg-stone-900 text-stone-100 border-stone-800',
    navbarBg: 'bg-[#f4f1e8]/95 border-stone-300',
    mainBg: 'bg-[#faf8f2] text-stone-900',
    cardBg: 'bg-white/90',
    cardBorder: 'border-stone-200/90',
    cardHoverBorder: 'hover:border-stone-400',
    accentGlow: 'bg-stone-900/5',
    headingGradient: 'from-stone-900 via-zinc-800 to-stone-950',
    buttonPrimary: 'bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold shadow-stone-900/10',
    activeTab: 'bg-stone-900 text-stone-100 border-stone-900',
    highlightText: 'text-stone-900',
    highlightBg: 'bg-stone-200/80 border-stone-300/80',
    previewColors: ['#1c1917', '#faf8f2', '#059669', '#d97706'],
  },
  CYAN_OBSIDIAN: {
    id: 'CYAN_OBSIDIAN',
    name: 'Obsidian Cyan (Dark)',
    nameSv: 'Obsidian & Elektrisk Cyan',
    description: 'Deep cosmic slate with electric cyan & indigo signals',
    accentBg: 'from-cyan-500 via-indigo-600 to-purple-600',
    primaryTextColor: 'text-cyan-400',
    primaryBorderColor: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-950/90 border-cyan-800/80 text-cyan-300',
    navbarBg: 'bg-slate-900/95 border-slate-800',
    mainBg: 'bg-slate-950 text-slate-100',
    cardBg: 'bg-slate-900/90',
    cardBorder: 'border-slate-800',
    cardHoverBorder: 'hover:border-cyan-500/50',
    accentGlow: 'bg-cyan-500/10',
    headingGradient: 'from-slate-100 via-cyan-200 to-indigo-300',
    buttonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-500/20',
    activeTab: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    highlightText: 'text-cyan-300',
    highlightBg: 'bg-cyan-950/80 border-cyan-800/80',
    previewColors: ['#06b6d4', '#6366f1', '#a855f7', '#020617'],
  },
  EMERALD_AURORA: {
    id: 'EMERALD_AURORA',
    name: 'Emerald Aurora (Bioluminescent)',
    nameSv: 'Bioluminescent Aurora (Smaragd)',
    description: 'Deep forest night with mint, emerald & amber signal aura',
    accentBg: 'from-emerald-500 via-teal-600 to-amber-500',
    primaryTextColor: 'text-emerald-400',
    primaryBorderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/90 border-emerald-800/80 text-emerald-300',
    navbarBg: 'bg-zinc-900/95 border-zinc-800',
    mainBg: 'bg-zinc-950 text-zinc-100',
    cardBg: 'bg-zinc-900/90',
    cardBorder: 'border-zinc-800',
    cardHoverBorder: 'hover:border-emerald-500/50',
    accentGlow: 'bg-emerald-500/10',
    headingGradient: 'from-zinc-100 via-emerald-200 to-teal-300',
    buttonPrimary: 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-emerald-500/20',
    activeTab: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    highlightText: 'text-emerald-300',
    highlightBg: 'bg-emerald-950/80 border-emerald-800/80',
    previewColors: ['#10b981', '#14b8a6', '#f59e0b', '#052e16'],
  },
  COSMIC_AMBER: {
    id: 'COSMIC_AMBER',
    name: 'Solar Plasma (Amber & Crimson)',
    nameSv: 'Solplasma & Bärnsten',
    description: 'High-energy solar storm spectrum with amber gold & crimson flare',
    accentBg: 'from-amber-500 via-orange-600 to-rose-600',
    primaryTextColor: 'text-amber-400',
    primaryBorderColor: 'border-amber-500/40',
    badgeBg: 'bg-amber-950/90 border-amber-800/80 text-amber-300',
    navbarBg: 'bg-stone-900/95 border-stone-800',
    mainBg: 'bg-stone-950 text-stone-100',
    cardBg: 'bg-stone-900/90',
    cardBorder: 'border-stone-800',
    cardHoverBorder: 'hover:border-amber-500/50',
    accentGlow: 'bg-amber-500/10',
    headingGradient: 'from-stone-100 via-amber-200 to-orange-300',
    buttonPrimary: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-amber-500/20',
    activeTab: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    highlightText: 'text-amber-300',
    highlightBg: 'bg-amber-950/80 border-amber-800/80',
    previewColors: ['#f59e0b', '#ea580c', '#f43f5e', '#0c0a09'],
  },
  NEON_VIOLET: {
    id: 'NEON_VIOLET',
    name: 'Cosmic Violet (Observatory)',
    nameSv: 'Kosmisk Lila & Deep Violet',
    description: 'Deep ultraviolet void with glowing fuchsia & gold resonance',
    accentBg: 'from-purple-500 via-fuchsia-600 to-amber-400',
    primaryTextColor: 'text-purple-400',
    primaryBorderColor: 'border-purple-500/40',
    badgeBg: 'bg-purple-950/90 border-purple-800/80 text-purple-300',
    navbarBg: 'bg-neutral-900/95 border-neutral-800',
    mainBg: 'bg-neutral-950 text-neutral-100',
    cardBg: 'bg-neutral-900/90',
    cardBorder: 'border-neutral-800',
    cardHoverBorder: 'hover:border-purple-500/50',
    accentGlow: 'bg-purple-500/10',
    headingGradient: 'from-neutral-100 via-purple-200 to-fuchsia-300',
    buttonPrimary: 'bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold shadow-purple-500/20',
    activeTab: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    highlightText: 'text-purple-300',
    highlightBg: 'bg-purple-950/80 border-purple-800/80',
    previewColors: ['#a855f7', '#d946ef', '#eab308', '#0d0b14'],
  },
};
