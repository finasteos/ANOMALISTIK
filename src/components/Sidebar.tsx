import React, { useState } from 'react';
import { Cpu, Database, Activity, Sparkles, Binary, Layers, Compass, Palette, Check, X, Github, ExternalLink, Menu, ShieldCheck, FolderArchive } from 'lucide-react';
import { COLOR_THEMES } from '../theme';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  currentThemeId,
  onSelectTheme,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  const navItems = [
    { id: 'overview', label: 'Atlas Overview', icon: Compass },
    { id: 'pattern-explorer', label: 'Pattern Explorer', icon: Sparkles },
    { id: 'epigraphy', label: 'G-Series (Epigraphy)', icon: Binary },
    { id: 'mengines', label: 'M-Engines', icon: Cpu },
    { id: 'biophysics', label: 'Track A/B (Bio)', icon: Database },
    { id: 'geophysics', label: 'Track R (Geo/Astro)', icon: Activity },
    { id: 'declassified-archives', label: 'Declassified UAP (375)', icon: FolderArchive },
    { id: 'simulator', label: 'Adjudicator', icon: Layers },
    { id: 'data-verification', label: 'Data Verification', icon: ShieldCheck },
    { id: 'ai-assistant', label: 'AI Research Grounding', icon: Sparkles },
  ];

  const currentTheme = COLOR_THEMES[currentThemeId] || COLOR_THEMES.IVORY_MONOCHROME;
  const isLight = currentThemeId === 'IVORY_MONOCHROME';

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300
    ${currentTheme.navbarBg} ${isLight ? 'border-stone-300' : 'border-slate-800'}
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={sidebarClasses}>
        <div className="p-5 flex-1 flex flex-col space-y-8 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg font-mono shadow-md ${
                isLight ? 'bg-stone-900 text-stone-50' : 'bg-cyan-500 text-slate-950'
              }`}>
                A
              </div>
              <div>
                <h1 className={`text-lg font-black tracking-widest uppercase font-mono leading-none ${currentTheme.primaryTextColor}`}>
                  ANOMALISTICS
                </h1>
                <span className={`text-[9px] font-mono uppercase tracking-widest ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                  Lab Engine
                </span>
              </div>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <div className={`px-3 py-2 text-[10px] font-mono tracking-widest uppercase mb-2 font-bold ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
              Modules
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? (isLight 
                          ? 'bg-stone-900 text-stone-50 shadow-md' 
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800 shadow-sm shadow-cyan-900/20')
                      : (isLight 
                          ? 'text-stone-700 hover:bg-stone-200' 
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200')
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive && !isLight ? 'text-cyan-400' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-slate-800">
            
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isLight 
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Theme: {currentTheme.nameSv}</span>
                </div>
              </button>
              
              {showThemeMenu && (
                <div className={`absolute bottom-full left-0 mb-2 w-full p-2 rounded-xl border shadow-xl z-50 ${
                  isLight ? 'bg-white border-stone-300' : 'bg-slate-900 border-slate-700'
                }`}>
                  <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 px-2 pt-1 font-bold ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                    Select Vibe
                  </div>
                  {Object.values(COLOR_THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition ${
                        currentThemeId === t.id
                          ? (isLight ? 'bg-stone-100 font-bold text-stone-900' : 'bg-slate-800 font-bold text-slate-100')
                          : (isLight ? 'text-stone-700 hover:bg-stone-50' : 'text-slate-400 hover:bg-slate-800/50')
                      }`}
                    >
                      <span>{t.nameSv}</span>
                      {currentThemeId === t.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wiki Export */}
            <button
              onClick={() => {
                import('../utils/exportWiki').then(m => m.exportToMarkdownWiki());
              }}
              className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition shadow-sm ${
                isLight 
                  ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900' 
                  : 'bg-purple-950/60 hover:bg-purple-900 border-purple-800 text-purple-300'
              }`}
              title="Export Database to Markdown Wiki"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="font-semibold">Export Wiki MD</span>
            </button>
            
            {/* Github Link */}
            <a
              href="https://github.com/wawawee/ANOMALISTICS"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition ${
                isLight ? 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
