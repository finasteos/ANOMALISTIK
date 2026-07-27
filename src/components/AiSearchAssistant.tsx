import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, Sparkles, ExternalLink, RefreshCw, Send, Brain, ShieldAlert } from 'lucide-react';
import { SearchGroundedResponse, HighThinkingResponse } from '../types';
import { useTheme } from '../ThemeContext';

export const AiSearchAssistant: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'thinking'>('search');

  // Search Grounded state
  const [searchQuery, setSearchQuery] = useState(
    'What are the latest findings regarding the 303 new Nazca geoglyphs discovered in PNAS by Sakai et al?'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchGroundedResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // High Thinking state
  const [thinkingPrompt, setThinkingPrompt] = useState(
    'Compare the entropy signatures of Linear A, Phaistos Disc, and Rongorongo. Adjudicate whether their recurring refrains indicate accounting templates or liturgical chants, and explain how the Layer 1 Negative Control Engine prevents false positives.'
  );
  const [thinkingDomain, setThinkingDomain] = useState('Epigraphy & Information Theory');
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [thinkingResponse, setThinkingResponse] = useState<HighThinkingResponse | null>(null);
  const [thinkingError, setThinkingError] = useState<string | null>(null);

  // Execute Search Grounded
  const handleRunSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch('/api/ai/search-grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Search Grounded query failed');
      }

      const data: SearchGroundedResponse = await res.json();
      setSearchResponse(data);
    } catch (err: any) {
      setSearchError(err.message || 'Error executing search');
    } finally {
      setSearchLoading(false);
    }
  };

  // Execute High Thinking
  const handleRunThinking = async () => {
    if (!thinkingPrompt.trim()) return;
    setThinkingLoading(true);
    setThinkingError(null);

    try {
      const res = await fetch('/api/ai/high-thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: thinkingPrompt, domainContext: thinkingDomain }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'High Thinking query failed');
      }

      const data: HighThinkingResponse = await res.json();
      setThinkingResponse(data);
    } catch (err: any) {
      setThinkingError(err.message || 'Error executing high thinking');
    } finally {
      setThinkingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <Sparkles className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
          <span>Server-Side Gemini AI Engine Integration</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
          AI Research Grounding &amp; High Thinking Adjudicator
        </h1>
        <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          Powered by Gemini API server routes. Toggle between real-time Google Search Grounding with <code className="font-mono font-bold text-cyan-700">gemini-3.5-flash</code> 
          and Deep Adjudication Reasoning with <code className="font-mono font-bold text-purple-700">gemini-3.1-pro-preview</code> (ThinkingLevel.HIGH).
        </p>

        {/* Subtab Toggle */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 shadow-sm ${
              activeSubTab === 'search'
                ? 'bg-stone-900 text-stone-50 border border-stone-900'
                : isLight
                  ? 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Grounded (gemini-3.5-flash)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('thinking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-2 shadow-sm ${
              activeSubTab === 'thinking'
                ? 'bg-stone-900 text-stone-50 border border-stone-900'
                : isLight
                  ? 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>High Thinking Reasoner (gemini-3.1-pro)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SEARCH GROUNDED */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Google Search Grounded Query</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="Ask any research query..."
                />
                <button
                  onClick={handleRunSearch}
                  disabled={searchLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 shrink-0"
                >
                  {searchLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Search Web</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {searchError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
                ⚠️ {searchError}
              </div>
            )}
          </div>

          {searchResponse && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">GROUNDED RESEARCH RESPONSE</span>
                <span className="text-[10px] font-mono text-slate-500">{searchResponse.queryTime}</span>
              </div>

              {/* Response Markdown Body */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200">
                <ReactMarkdown>{searchResponse.answer}</ReactMarkdown>
              </div>

              {/* Grounding Citations */}
              {searchResponse.groundingChunks && searchResponse.groundingChunks.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    Google Search Citation Sources ({searchResponse.groundingChunks.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResponse.groundingChunks.map((chunk, idx) => {
                      if (!chunk.web) return null;
                      return (
                        <a
                          key={idx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-800/80 text-xs text-slate-300 flex items-center justify-between transition group"
                        >
                          <span className="truncate pr-2 group-hover:text-cyan-300">{chunk.web.title || chunk.web.uri}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HIGH THINKING MODE */}
      {activeSubTab === 'thinking' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>High Thinking Reasoning Prompt</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300">Domain Context</label>
                <select
                  value={thinkingDomain}
                  onChange={(e) => setThinkingDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
                >
                  <option value="Epigraphy & Information Theory">Epigraphy &amp; Information Theory</option>
                  <option value="Geophysics & Space Weather">Geophysics &amp; Space Weather</option>
                  <option value="Biophysics & Mineralogy">Biophysics &amp; Mineralogy</option>
                  <option value="Astrophysics & Transients">Astrophysics &amp; Transients</option>
                </select>
              </div>
            </div>

            <textarea
              rows={4}
              value={thinkingPrompt}
              onChange={(e) => setThinkingPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
              placeholder="Ask a deep analytical or multi-variable reasoning question..."
            />

            {thinkingError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
                ⚠️ {thinkingError}
              </div>
            )}

            <button
              onClick={handleRunThinking}
              disabled={thinkingLoading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {thinkingLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Reasoning with gemini-3.1-pro-preview (ThinkingLevel.HIGH)...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Execute High Thinking Adjudication</span>
                </>
              )}
            </button>
          </div>

          {thinkingResponse && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between font-mono text-xs">
                <span className="text-purple-300 font-bold">HIGH THINKING ADJUDICATION REPORT</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Model: gemini-3.1-pro-preview
                </span>
              </div>

              {/* Answer Markdown Body */}
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200">
                <ReactMarkdown>{thinkingResponse.answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
