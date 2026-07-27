import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Binary, Sparkles, CheckCircle2, ShieldCheck, FileSpreadsheet, Eye } from 'lucide-react';
import { EPIGRAPHIC_CORPORA } from '../data/labData';
import { EpigraphicCorpus } from '../types';
import { useTheme } from '../ThemeContext';

export const EpigraphySection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [selectedCorpus, setSelectedCorpus] = useState<EpigraphicCorpus>(EPIGRAPHIC_CORPORA[0]);

  // Transform data for bar chart
  const chartData = EPIGRAPHIC_CORPORA.map((c) => ({
    name: c.name,
    zScore: Math.abs(c.zScore), // use absolute value for log scale or display
    rawZScore: c.zScore,
    code: c.code,
    ic: c.ic,
    condEntropy: c.condEntropy,
  })).sort((a, b) => b.zScore - a.zScore);

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <Binary className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
          <span>Track G-Series • Epigraphy &amp; Information Theory</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
          Universal Entropy Atlas: Undeciphered Scripts &amp; Bitstreams
        </h1>
        <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          By treating undeciphered historical scripts as formal information-theoretic bitstreams, the lab establishes 
          mathematical baselines for what constitutes functional, intentional human language versus simple ciphers or random noise. 
          All metrics are calculated against Fisher-Yates <span className="font-mono font-bold text-emerald-600">shuffle nulls</span>.
        </p>
      </div>

      {/* Z-Score Comparison Chart */}
      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Statistical Deviation from Random Noise (|Z-Score| vs Shuffle Nulls)</span>
            </h2>
            <p className={`text-xs font-sans ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Higher magnitude |Z-score| indicates deeper non-random structural ordering and formulaic rules.
            </p>
          </div>
          <div className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
            isLight ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            Significance Threshold: |Z| ≥ 3.5
          </div>
        </div>

        {/* Recharts Bar Visualization */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" stroke={isLight ? '#44403c' : '#64748b'} tick={{ fontSize: 11 }} />
              <YAxis stroke={isLight ? '#44403c' : '#64748b'} tick={{ fontSize: 11 }} scale="log" domain={[1, 20000]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                  borderColor: isLight ? '#d6d3d1' : '#334155', 
                  color: isLight ? '#1c1917' : '#f8fafc', 
                  borderRadius: '12px' 
                }}
                formatter={(value: any, name: any, props: any) => [
                  `z = ${props.payload.rawZScore}`,
                  `Corpus: ${props.payload.name}`
                ]}
              />
              <ReferenceLine y={3.5} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Z = -3.5 Threshold', fill: '#d97706', fontSize: 10 }} />
              <Bar dataKey="zScore" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.code === 'G-MER' ? '#059669' :
                      entry.code === 'G-LINA' ? '#0891b2' :
                      entry.code === 'G-RONG' ? '#7c3aed' :
                      entry.code === 'G-INDUS' ? '#d97706' : '#2563eb'
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Epigraphic Corpus Cards & Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Script Selection List */}
        <div className="space-y-3">
          <h2 className={`text-xs font-black uppercase tracking-wider font-mono ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
            Cataloged Epigraphic Corpora
          </h2>
          <div className="space-y-2">
            {EPIGRAPHIC_CORPORA.map((corpus) => {
              const isSelected = selectedCorpus.id === corpus.id;
              return (
                <div
                  key={corpus.id}
                  onClick={() => setSelectedCorpus(corpus)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-sm ${
                    isSelected
                      ? isLight
                        ? 'bg-stone-900 text-stone-50 border-stone-900'
                        : 'bg-cyan-950/40 border-cyan-500/60 text-slate-100'
                      : isLight
                        ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-900'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-xs font-black ${isSelected && isLight ? 'text-amber-400' : 'text-cyan-600'}`}>{corpus.code}</span>
                      <span className="font-bold text-sm">{corpus.name}</span>
                    </div>
                    <div className={`text-xs ${isSelected && isLight ? 'text-stone-300' : isLight ? 'text-stone-600' : 'text-slate-400'}`}>{corpus.origin}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-600">z = {corpus.zScore}</div>
                    <div className={`text-[10px] ${isSelected && isLight ? 'text-stone-300' : isLight ? 'text-stone-500' : 'text-slate-500'}`}>IC: {corpus.ic}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Inspector for Selected Script */}
        <div className={`lg:col-span-2 rounded-2xl border p-6 space-y-6 shadow-sm ${
          isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-start justify-between border-b pb-4 border-stone-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isLight ? 'bg-stone-900 text-stone-50' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {selectedCorpus.code}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                  selectedCorpus.verdict === 'STRUCTURE_SIGNAL' 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                }`}>
                  {selectedCorpus.verdict}
                </span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-wide mt-2">{selectedCorpus.name}</h2>
              <p className={`text-xs font-mono ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{selectedCorpus.origin} • Sample: {selectedCorpus.sampleSize}</p>
            </div>
            <Eye className="w-5 h-5 text-stone-900" />
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className={`p-3 rounded-xl border space-y-0.5 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Z-Score vs Null</span>
              <div className="text-base font-black text-emerald-600">{selectedCorpus.zScore}</div>
            </div>
            <div className={`p-3 rounded-xl border space-y-0.5 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Conditional H(Y|X)</span>
              <div className="text-base font-black text-cyan-700">{selectedCorpus.condEntropy} bits</div>
            </div>
            <div className={`p-3 rounded-xl border space-y-0.5 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Shuffle Null H</span>
              <div className={`text-base font-black ${isLight ? 'text-stone-900' : 'text-slate-300'}`}>{selectedCorpus.shuffleNullEntropy} bits</div>
            </div>
            <div className={`p-3 rounded-xl border space-y-0.5 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
              <span className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Index of Coincidence</span>
              <div className="text-base font-black text-purple-700">{selectedCorpus.ic}</div>
            </div>
          </div>

          {/* Key Refrains & Formulas */}
          {selectedCorpus.refrains && selectedCorpus.refrains.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                Detected Recurring Refrains &amp; Formulas
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCorpus.refrains.map((rf, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      isLight ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200'
                    }`}
                  >
                    ⚡ {rf}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Findings Breakdown */}
          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950/80 border-slate-800'}`}>
            <div className="text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Adjudicated Key Findings</span>
            </div>
            <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-stone-800' : 'text-slate-300'}`}>
              {selectedCorpus.keyFindings}
            </p>
          </div>

          {/* Accounting Invariants & Spreadsheet Logic Rule */}
          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
            isLight ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-cyan-950/20 border-cyan-800/40 text-slate-300'
          }`}>
            <div className="font-black flex items-center space-x-2 font-mono uppercase tracking-wide">
              <FileSpreadsheet className="w-4 h-4 text-stone-900" />
              <span>Cross-Cultural &quot;Spreadsheet Logic&quot; Invariant</span>
            </div>
            <p className="font-sans leading-relaxed">
              ANOMALISTICS analysis shows that early administrative record-keeping systems (Proto-Elamite, Uruk, Indus seals, Linear A inventory lists)
              pass identical accounting-invariant tests regardless of language family. Different ancient civilizations repeatedly converged on the same structural templates for record management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

