import React, { useState } from 'react';
import { Layers, Play, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface AdjudicationResult {
  sampleName: string;
  sequenceLength: number;
  uniqueChars: number;
  shannonEntropy: number;
  conditionalEntropy: number;
  indexCoincidence: number;
  nullMeanCondEntropy: number;
  nullStdDev: number;
  zScore: number;
  verdict: string;
  layer1NegativeControlPassed: boolean;
  timestamp: string;
}

const PRESET_SAMPLES = [
  {
    name: 'Phaistos Disc Stamped Token Sequence',
    seq: '021231260212312602123126021231260519330212312624451202123126180212312612312602123126',
  },
  {
    name: 'Linear A Libation Formula Fragment',
    seq: 'ASASARAMEASASARAMEASASARAMEASASARAMETA301TA301ASASARAMETA301ASASARAME',
  },
  {
    name: 'Rongorongo Tablet C Parallel Passage (Glyphs)',
    seq: '380001022f380001022f380001022f380001022f380001022f380001022f380001022f',
  },
  {
    name: 'Crabwood Web-Resolution ASCII Noise',
    seq: '101010010101010010101001010101001010100101010100101010010101010010101001',
  },
  {
    name: 'Genomic Junk DNA Exon Fragment',
    seq: 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC',
  },
];

export const AdjudicationSimulator: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';

  const [sampleName, setSampleName] = useState(PRESET_SAMPLES[0].name);
  const [sequence, setSequence] = useState(PRESET_SAMPLES[0].seq);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdjudicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAdjudication = async () => {
    if (!sequence || sequence.length < 10) {
      setError('Sequence must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence, sampleName }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Adjudication failed');
      }

      const data: AdjudicationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing adjudication');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset: { name: string; seq: string }) => {
    setSampleName(preset.name);
    setSequence(preset.seq);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <Layers className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-indigo-400'}`} />
          <span>Interactive Metrology Bench • Layer 1 &amp; Layer 2 Simulator</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
          Live Signal Adjudication Bench
        </h1>
        <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          Test any custom string, bitstream, or epigraphic token sequence. The engine runs 50 Fisher-Yates 
          Monte Carlo permutations to establish the <span className="font-mono font-bold text-emerald-600">shuffle null</span>, 
          computes Shannon Entropy H(X), Conditional Entropy H(Y|X), Index of Coincidence (IC), and calculates the exact Z-score distance.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
          Load Reference Sample
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SAMPLES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                sampleName === p.name
                  ? 'bg-cyan-600 text-slate-950 font-bold border border-cyan-400 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300">Sample Name</label>
          <input
            type="text"
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-slate-300">
              Sequence String / Bitstream (Length: {sequence.length})
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              Min 10 characters required
            </span>
          </div>
          <textarea
            rows={4}
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            placeholder="Type or paste sequence..."
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleRunAdjudication}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Running 50 Monte Carlo Permutations...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Fisher-Yates Layer 1 Adjudication</span>
            </>
          )}
        </button>
      </div>

      {/* Adjudication Results Output */}
      {result && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">ADJUDICATION REPORT</span>
              <h2 className="text-lg font-bold text-slate-100">{result.sampleName}</h2>
            </div>
            <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
              result.verdict === 'STRUCTURE_SIGNAL' || result.verdict === 'SEQUENCE_STRUCTURE'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              VERDICT: {result.verdict}
            </span>
          </div>

          {/* Key Metrics Output */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Calculated Z-Score</span>
              <div className={`text-xl font-bold ${Math.abs(result.zScore) >= 3.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                z = {result.zScore}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Shannon Entropy H(X)</span>
              <div className="text-xl font-bold text-cyan-300">
                {result.shannonEntropy} bits
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Conditional H(Y|X)</span>
              <div className="text-xl font-bold text-purple-300">
                {result.conditionalEntropy} bits
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Index of Coincidence (IC)</span>
              <div className="text-xl font-bold text-indigo-300">
                {result.indexCoincidence}
              </div>
            </div>
          </div>

          {/* Monte Carlo Null Details */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-300 font-bold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Layer 1 Negative Control Details (50 Fisher-Yates Permutations)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div>Null Mean Cond-Entropy: <strong className="text-slate-200">{result.nullMeanCondEntropy} bits</strong></div>
              <div>Null Standard Deviation: <strong className="text-slate-200">{result.nullStdDev}</strong></div>
              <div>Layer 1 Status: <strong className={result.layer1NegativeControlPassed ? 'text-emerald-400' : 'text-rose-400'}>
                {result.layer1NegativeControlPassed ? 'PASSED (Distinguishable from noise)' : 'FAILED (Indistinguishable from noise)'}
              </strong></div>
              <div>Unique Symbols: <strong className="text-slate-200">{result.uniqueChars} symbols</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
