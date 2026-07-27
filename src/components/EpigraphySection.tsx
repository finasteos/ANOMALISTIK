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

export const EpigraphySection: React.FC = () => {
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
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Binary className="w-4 h-4" />
          <span>Track G-Series • Epigraphy & Information Theory</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          Universal Entropy Atlas: Undeciphered Scripts & Bitstreams
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          By treating undeciphered historical scripts as formal information-theoretic bitstreams, the lab establishes 
          mathematical baselines for what constitutes functional, intentional human language versus simple ciphers or random noise. 
          All metrics are calculated against Fisher-Yates <span className="text-cyan-300 font-mono">shuffle nulls</span>.
        </p>
      </div>

      {/* Z-Score Comparison Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Statistical Deviation from Random Noise (|Z-Score| vs Shuffle Nulls)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Higher magnitude |Z-score| indicates deeper non-random structural ordering and formulaic rules.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Significance Threshold: |Z| ≥ 3.5
          </div>
        </div>

        {/* Recharts Bar Visualization */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} scale="log" domain={[1, 20000]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                formatter={(value: any, name: any, props: any) => [
                  `z = ${props.payload.rawZScore}`,
                  `Corpus: ${props.payload.name}`
                ]}
              />
              <ReferenceLine y={3.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Z = -3.5 Threshold', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="zScore" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.code === 'G-MER' ? '#10b981' :
                      entry.code === 'G-LINA' ? '#06b6d4' :
                      entry.code === 'G-RONG' ? '#8b5cf6' :
                      entry.code === 'G-INDUS' ? '#f59e0b' : '#3b82f6'
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
          <h2 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">
            Cataloged Epigraphic Corpora
          </h2>
          <div className="space-y-2">
            {EPIGRAPHIC_CORPORA.map((corpus) => {
              const isSelected = selectedCorpus.id === corpus.id;
              return (
                <div
                  key={corpus.id}
                  onClick={() => setSelectedCorpus(corpus)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{corpus.code}</span>
                      <span className="font-bold text-slate-100 text-sm">{corpus.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">{corpus.origin}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">z = {corpus.zScore}</div>
                    <div className="text-[10px] text-slate-500">IC: {corpus.ic}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Inspector for Selected Script */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {selectedCorpus.code}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  selectedCorpus.verdict === 'STRUCTURE_SIGNAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {selectedCorpus.verdict}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedCorpus.name}</h2>
              <p className="text-xs text-slate-400">{selectedCorpus.origin} • Sample: {selectedCorpus.sampleSize}</p>
            </div>
            <Eye className="w-5 h-5 text-cyan-400" />
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Z-Score vs Null</span>
              <div className="text-base font-bold text-emerald-400">{selectedCorpus.zScore}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Conditional H(Y|X)</span>
              <div className="text-base font-bold text-cyan-400">{selectedCorpus.condEntropy} bits</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Shuffle Null H</span>
              <div className="text-base font-bold text-slate-300">{selectedCorpus.shuffleNullEntropy} bits</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Index of Coincidence</span>
              <div className="text-base font-bold text-purple-400">{selectedCorpus.ic}</div>
            </div>
          </div>

          {/* Key Refrains & Formulas */}
          {selectedCorpus.refrains && selectedCorpus.refrains.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase">
                Detected Recurring Refrains & Formulas
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCorpus.refrains.map((rf, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs font-mono font-medium"
                  >
                    ⚡ {rf}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Primary Findings Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Adjudicated Key Findings</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedCorpus.keyFindings}
            </p>
          </div>

          {/* Accounting Invariants & Spreadsheet Logic Rule */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2 text-xs">
            <div className="font-bold text-cyan-300 flex items-center space-x-2 font-mono">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Cross-Cultural &quot;Spreadsheet Logic&quot; Invariant</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              ANOMALISTICS analysis shows that early administrative record-keeping systems (Proto-Elamite, Uruk, Indus seals, Linear A inventory lists)
              pass identical accounting-invariant tests regardless of language family. Different ancient civilizations repeatedly converged on the same structural templates for record management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
