import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AtlasOverview } from './components/AtlasOverview';
import { EpigraphySection } from './components/EpigraphySection';
import { MEnginesSection } from './components/MEnginesSection';
import { BiophysicsSection } from './components/BiophysicsSection';
import { GeophysicsAstroSection } from './components/GeophysicsAstroSection';
import { AdjudicationSimulator } from './components/AdjudicationSimulator';
import { AiSearchAssistant } from './components/AiSearchAssistant';
import { COLOR_THEMES } from './theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [themeId, setThemeId] = useState<string>('CYAN_OBSIDIAN');

  const currentTheme = COLOR_THEMES[themeId] || COLOR_THEMES.CYAN_OBSIDIAN;

  return (
    <div className={`min-h-screen ${currentTheme.mainBg} flex flex-col font-sans transition-colors duration-500`}>
      {/* Top Navbar with Theme Selector */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentThemeId={themeId}
        onSelectTheme={setThemeId}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <AtlasOverview onNavigate={setActiveTab} />}
        {activeTab === 'epigraphy' && <EpigraphySection />}
        {activeTab === 'mengines' && <MEnginesSection />}
        {activeTab === 'biophysics' && <BiophysicsSection />}
        {activeTab === 'geophysics' && <GeophysicsAstroSection />}
        {activeTab === 'simulator' && <AdjudicationSimulator />}
        {activeTab === 'ai-assistant' && <AiSearchAssistant />}
      </main>

      {/* Footer */}
      <footer className={`border-t ${currentTheme.cardBorder} bg-slate-950/90 py-6 text-center text-xs text-slate-500 font-mono`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className={`font-bold ${currentTheme.primaryTextColor}`}>ANOMALISTICS</span>
            <span>• Multimodal Empirical Structure &amp; Universal Entropy Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className={currentTheme.primaryTextColor}>Färgskala: {currentTheme.nameSv}</span>
            <span>•</span>
            <span>Structure ≠ Message</span>
            <span>•</span>
            <span>Layer 1 Negative Control</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
