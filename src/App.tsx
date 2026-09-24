import React, { useState, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { AtlasOverview } from './components/AtlasOverview';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Menu } from 'lucide-react';

// Heavy tab sections are code-split (TASKLIST F5) — landing stays eager so
// first paint keeps recharts/canvas out of the initial bundle.
const PatternExplorerSection = lazy(() =>
  import('./components/PatternExplorerSection').then((m) => ({ default: m.PatternExplorerSection })));
const QuantumRngSection = lazy(() =>
  import('./components/QuantumRngSection').then((m) => ({ default: m.QuantumRngSection })));
const EpigraphySection = lazy(() =>
  import('./components/EpigraphySection').then((m) => ({ default: m.EpigraphySection })));
const MEnginesSection = lazy(() =>
  import('./components/MEnginesSection').then((m) => ({ default: m.MEnginesSection })));
const BiophysicsSection = lazy(() =>
  import('./components/BiophysicsSection').then((m) => ({ default: m.BiophysicsSection })));
const GeophysicsAstroSection = lazy(() =>
  import('./components/GeophysicsAstroSection').then((m) => ({ default: m.GeophysicsAstroSection })));
const AdjudicationSimulator = lazy(() =>
  import('./components/AdjudicationSimulator').then((m) => ({ default: m.AdjudicationSimulator })));
const AiSearchAssistant = lazy(() =>
  import('./components/AiSearchAssistant').then((m) => ({ default: m.AiSearchAssistant })));
const DataVerificationSection = lazy(() =>
  import('./components/DataVerificationSection').then((m) => ({ default: m.DataVerificationSection })));
const DeclassifiedArchiveSection = lazy(() =>
  import('./components/DeclassifiedArchiveSection').then((m) => ({ default: m.DeclassifiedArchiveSection })));

const SectionFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24 font-mono text-sm opacity-60 animate-pulse">
    Loading section…
  </div>
);

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { theme, themeId, setThemeId } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme.mainBg} font-sans transition-colors duration-300 overflow-x-hidden`}>
      {/* Mobile Top Header */}
      <div className={`lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b backdrop-blur-md ${theme.navbarBg} ${themeId === 'IVORY_MONOCHROME' ? 'border-stone-300' : 'border-slate-800'}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg font-mono shadow-md ${
            themeId === 'IVORY_MONOCHROME' ? 'bg-stone-900 text-stone-50' : 'bg-cyan-500 text-slate-950'
          }`}>
            A
          </div>
          <span className={`font-black tracking-wider uppercase font-mono ${theme.primaryTextColor}`}>ANOMALISTICS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className={`p-1.5 rounded-lg ${theme.primaryTextColor}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay & Drawer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentThemeId={themeId}
        onSelectTheme={setThemeId}
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
      />

      {/* Main View Container (Padded left on desktop for Sidebar) */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && <AtlasOverview onNavigate={setActiveTab} />}
          {activeTab !== 'overview' && (
            <Suspense fallback={<SectionFallback />}>
              {activeTab === 'pattern-explorer' && <PatternExplorerSection />}
              {activeTab === 'rng-lab' && <QuantumRngSection />}
              {activeTab === 'epigraphy' && <EpigraphySection />}
              {activeTab === 'mengines' && <MEnginesSection />}
              {activeTab === 'biophysics' && <BiophysicsSection />}
              {activeTab === 'geophysics' && <GeophysicsAstroSection />}
              {activeTab === 'declassified-archives' && <DeclassifiedArchiveSection onNavigate={setActiveTab} />}
              {activeTab === 'simulator' && <AdjudicationSimulator />}
              {activeTab === 'data-verification' && <DataVerificationSection />}
              {activeTab === 'ai-assistant' && <AiSearchAssistant />}
            </Suspense>
          )}
        </main>

        {/* Footer */}
        <footer className={`border-t ${theme.cardBorder} ${themeId === 'IVORY_MONOCHROME' ? 'bg-[#f4f1e8]/90 text-stone-600' : 'bg-slate-950/90 text-slate-500'} py-6 text-center text-xs font-mono shrink-0 mt-auto`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className={`font-bold ${theme.primaryTextColor}`}>ANOMALISTICS</span>
              <span>• Multimodal Empirical Structure &amp; Universal Entropy Engine</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={theme.primaryTextColor}>Färgskala: {theme.nameSv}</span>
              <span>•</span>
              <span>Structure ≠ Message</span>
              <span>•</span>
              <span>Layer 1 Negative Control</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

