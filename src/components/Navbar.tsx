import React, { useState } from 'react';
import { Cpu, Database, Activity, Sparkles, Binary, Layers, Compass, Palette, Check, X, Github, ExternalLink, FolderKanban } from 'lucide-react';
import { COLOR_THEMES } from '../theme';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  currentThemeId,
  onSelectTheme
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  const navItems = [
    { id: 'overview', label: 'Atlas & Projects Overview', icon: Compass },
    { id: 'epigraphy', label: 'G-Series (Epigraphy)', icon: Binary },
    { id: 'mengines', label: 'M-Engines (Correlations)', icon: Cpu },
    { id: 'biophysics', label: 'Track A/B (Biophysics)', icon: Database },
    { id: 'geophysics', label: 'Track R (Geo & Astro)', icon: Activity },
    { id: 'simulator', label: 'Signal Adjudicator', icon: Layers },
    { id: 'ai-assistant', label: 'AI Research Assistant', icon: Sparkles },
  ];

  const currentTheme = COLOR_THEMES[currentThemeId] || COLOR_THEMES.IVORY_MONOCHROME;
  const isLight = currentThemeId === 'IVORY_MONOCHROME';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur border-b shadow-sm ${currentTheme.navbarBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Brand Header Bar */}
        <div className={`flex items-center justify-between py-2.5 border-b ${isLight ? 'border-stone-300/80' : 'border-slate-800/80'} gap-3`}>
          {/* Brand & Lab Title & GitHub Badge */}
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center space-x-2.5 cursor-pointer group" 
              onClick={() => setActiveTab('overview')}
            >
              <div className={`w-9 h-9 rounded-lg bg-stone-900 p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition`}>
                <div className="w-full h-full bg-stone-900 rounded-[7px] flex items-center justify-center font-mono font-black text-xs text-stone-100">
                  <span>AN</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`font-black text-lg tracking-wider ${isLight ? 'text-stone-900' : 'text-slate-100'} uppercase font-mono`}>
                    ANOMALISTICS
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${currentTheme.badgeBg} font-mono font-bold shadow-sm`}>
                    v2026.7
                  </span>
                </div>
                <p className={`text-[11px] font-mono hidden sm:block ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                  Multimodal Structure & Universal Entropy Engine
                </p>
              </div>
            </div>

            {/* GitHub Repository Badge */}
            <a
              href="https://github.com/wawawee/ANOMALISTICS"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition shadow-sm ${
                isLight 
                  ? 'bg-stone-200/80 hover:bg-stone-300/80 border-stone-300 text-stone-800' 
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Open GitHub Repository: wawawee/ANOMALISTICS"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="font-semibold">ANOMALISTICS</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          {/* Right Controls: Engine Status & Theme Selector */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            {/* Engine Status */}
            <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
              isLight 
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800' 
                : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Status: ACTIVE</span>
            </div>

            {/* Theme Selector Button */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border font-bold transition shadow-sm text-xs ${
                  isLight
                    ? 'bg-stone-200/90 hover:bg-stone-300/90 border-stone-300 text-stone-900'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
                title="Select Color Theme"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{currentTheme.nameSv}</span>
                <div className="flex items-center -space-x-1 pl-0.5">
                  {currentTheme.previewColors.slice(0, 3).map((c, idx) => (
                    <span 
                      key={idx} 
                      className="w-2.5 h-2.5 rounded-full border border-stone-400/50" 
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>

              {/* Theme Selector Popover Menu */}
              {showThemeMenu && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl p-3 shadow-2xl z-50 space-y-2 font-mono text-xs border ${
                  isLight
                    ? 'bg-white border-stone-300 text-stone-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-stone-200' : 'border-slate-800'}`}>
                    <span className="font-bold flex items-center space-x-1.5 uppercase tracking-wider">
                      <Palette className="w-4 h-4" />
                      <span>Färgskala &amp; Canvas Theme</span>
                    </span>
                    <button 
                      onClick={() => setShowThemeMenu(false)}
                      className="p-1 opacity-60 hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {Object.values(COLOR_THEMES).map((themeItem) => {
                      const isSelected = themeItem.id === currentThemeId;

                      return (
                        <button
                          key={themeItem.id}
                          onClick={() => {
                            onSelectTheme(themeItem.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex items-start justify-between gap-2 ${
                            isSelected
                              ? isLight 
                                ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-md'
                                : 'bg-slate-800 text-slate-100 border-purple-500 shadow-md'
                              : isLight
                                ? 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-900'
                                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-bold flex items-center space-x-2">
                              <span>{themeItem.nameSv}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <p className={`text-[10px] leading-normal ${isSelected ? 'opacity-80' : isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                              {themeItem.description}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 flex-shrink-0 pt-0.5">
                            {themeItem.previewColors.map((col, i) => (
                              <span 
                                key={i} 
                                className="w-3 h-3 rounded-full border border-stone-400/50" 
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Direct GitHub Link Button for Mobile/Tablet */}
            <a
              href="https://github.com/wawawee/ANOMALISTICS"
              target="_blank"
              rel="noopener noreferrer"
              className={`lg:hidden p-1.5 rounded-lg border transition ${
                isLight
                  ? 'bg-stone-200/80 hover:bg-stone-300/80 border-stone-300 text-stone-900'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
              title="GitHub: wawawee/ANOMALISTICS"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Tier 2: Responsive Tab Navigation Bar */}
        <nav className="flex items-center overflow-x-auto py-2 space-x-1.5 scrollbar-none text-xs font-mono">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-stone-900 text-stone-50 border border-stone-900 shadow-sm'
                      : `${currentTheme.activeTab} shadow-sm border`
                    : isLight
                      ? 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 border border-transparent'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? (isLight ? 'text-stone-50' : currentTheme.primaryTextColor) : 'opacity-60'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
