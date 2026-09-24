import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Atom, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Binary, 
  Layers, 
  Info, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  Server, 
  Sliders, 
  Gauge, 
  Compass, 
  FileCode,
  Terminal,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Flame,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { useTheme } from '../ThemeContext';
import { apiGet, apiPost } from '../lib/api';

interface RngBlock {
  blockIndex: number;
  condition: 'INTENTION' | 'CONTROL';
  target: 0 | 1;
  targetVisible: boolean;
  nBits?: number;
  ones?: number;
  zeros?: number;
  rawSha256?: string;
  targetScoreZ?: number;
  timestamp?: string;
}

interface AnalysisResult {
  observedD: number;
  meanIntentionZ: number;
  meanControlZ: number;
  overallRawZ: number;
  sigmaD?: number;
  pValue: number;
  bf01: number;
  bf10?: number;
  bayesFactorType?: string;
  nPermutations: number;
  totalBits: number;
  totalOnes: number;
  layer1NegativeControlPassed: boolean;
  verdict: 'STRUCTURE_SIGNAL' | 'SEQUENCE_STRUCTURE' | 'DIP_STRUCTURE' | 'CLAIM_FAILS_NULL' | 'UNDERDETERMINED' | 'INSTRUMENT_SYSTEMATICS';
  histogram: Array<{ bin: number; count: number }>;
  timestamp: string;
}

interface ClusterNode {
  id: string;
  name: string;
  ip: string;
  tailscale: string;
  arch: string;
  status: string;
  role: string;
  availableEngines: string[];
}

interface RngClusterStatus {
  localNode?: { arch?: string; hostname?: string; [k: string]: unknown };
  clusterNodes?: ClusterNode[];
  [k: string]: unknown;
}

export const QuantumRngSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = !theme.isDark;

  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'session' | 'analysis' | 'cluster' | 'power' | 'prereg'>('session');

  // Node & Backend status
  const [clusterInfo, setClusterInfo] = useState<RngClusterStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Session configuration state
  const [participantId, setParticipantId] = useState('OPERATOR_IMAC_01');
  const [mindsetScore, setMindsetScore] = useState<number>(75);
  const [sourceType, setSourceType] = useState<string>('APPLE_CSPRNG');
  const [nBlocksEach, setNBlocksEach] = useState<number>(4); // 4 intention + 4 control = 8 blocks
  const [blockDurationS, setBlockDurationS] = useState<number>(5);

  // Active session runner state
  const [sessionState, setSessionState] = useState<'IDLE' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'ANALYZING' | 'FINISHED'>('IDLE');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [prngCommitment, setPrngCommitment] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<RngBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [completedBlocks, setCompletedBlocks] = useState<RngBlock[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copied toast state
  const [copiedPrereg, setCopiedPrereg] = useState(false);
  const [copiedCommitment, setCopiedCommitment] = useState(false);

  // Interactive Power analysis slider state
  const [effectDelta, setEffectDelta] = useState<number>(0.0001); // 1e-4

  // Timer reference
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch cluster node status on mount
  useEffect(() => {
    fetchClusterStatus();
  }, []);

  const fetchClusterStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await apiGet<RngClusterStatus>('/api/rng/status');
      setClusterInfo(data);
    } catch (err) {
      console.warn('Could not fetch RNG status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Start experiment session
  const handleStartSession = async () => {
    setErrorMsg(null);
    setSessionState('STARTING');
    setAnalysis(null);
    setCompletedBlocks([]);

    try {
      const data = await apiPost<any>('/api/rng/session/start', {
        participantId,
        mindsetScore,
        sourceType,
        nBlocksEach,
        blockDurationS,
        isPilot: true,
      });
      setSessionId(data.sessionId);
      setPrngCommitment(data.prngCommitment);
      setSchedule(data.schedule);
      setCurrentBlockIndex(0);
      setCountdown(blockDurationS);
      setSessionState('RUNNING');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start session');
      setSessionState('IDLE');
    }
  };

  // Run block execution loop
  useEffect(() => {
    if (sessionState !== 'RUNNING') return;

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timerRef.current);
    }

    // Countdown reached 0 -> Complete current block
    executeCurrentBlock();
  }, [sessionState, countdown]);

  const executeCurrentBlock = async () => {
    if (currentBlockIndex >= schedule.length) {
      finishAndAnalyze();
      return;
    }

    const currentBlock = schedule[currentBlockIndex];

    try {
      const blockResult = await apiPost<any>('/api/rng/session/block', {
        sessionId,
        blockIndex: currentBlock.blockIndex,
        condition: currentBlock.condition,
        target: currentBlock.target,
        sourceType,
        bytesToRead: 2048, // 16,384 bits per block
      });

      const updated = [...completedBlocks, { ...currentBlock, ...blockResult }];
      setCompletedBlocks(updated);

      if (currentBlockIndex + 1 < schedule.length) {
        setCurrentBlockIndex((idx) => idx + 1);
        setCountdown(blockDurationS);
      } else {
        // All blocks completed
        finishAndAnalyze(updated);
      }
    } catch (err: any) {
      setErrorMsg(`Error during block ${currentBlockIndex + 1}: ${err.message}`);
      setSessionState('IDLE');
    }
  };

  const finishAndAnalyze = async (finalBlocks?: RngBlock[]) => {
    setSessionState('ANALYZING');
    const blocksToAnalyze = finalBlocks || completedBlocks;

    try {
      const analysisData = await apiPost<any>('/api/rng/session/analyze', {
        sessionConfig: {
          sessionId,
          participantId,
          mindsetScore,
          sourceType,
          blockDurationS,
          totalBlocks: blocksToAnalyze.length,
        },
        blocks: blocksToAnalyze,
      }, 120000); // 20k-perm null burns CPU; allow 120s
      setAnalysis(analysisData);
      setSessionState('FINISHED');
      setActiveSubTab('analysis');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze session data');
      setSessionState('FINISHED');
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSessionState('IDLE');
    setCountdown(0);
    setCompletedBlocks([]);
    setAnalysis(null);
    setCurrentBlockIndex(0);
  };

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  // Power analysis calculation: N = (z_alpha + z_beta)^2 / delta^2
  // z_0.999 = 3.0902, z_0.90 = 1.2816 -> sum^2 = 19.1125
  const calculateRequiredBits = (delta: number) => {
    if (delta <= 0) return 0;
    return Math.round(19.1125 / (delta * delta));
  };

  const powerBits = calculateRequiredBits(effectDelta);
  const powerMegabytes = (powerBits / 8 / 1024 / 1024).toFixed(1);
  const powerTime1Mbit = (powerBits / 1_000_000).toFixed(1);
  const powerTime4Mbit = (powerBits / 4_000_000).toFixed(1);

  // Power chart curve data
  const powerCurveData = [
    { delta: '1e-2 (0.01)', bits: calculateRequiredBits(0.01) / 1e6, label: '191k bitar' },
    { delta: '3e-3 (0.003)', bits: calculateRequiredBits(0.003) / 1e6, label: '2.1M bitar' },
    { delta: '1e-3 (0.001)', bits: calculateRequiredBits(0.001) / 1e6, label: '19.1M bitar' },
    { delta: '3e-4 (0.0003)', bits: calculateRequiredBits(0.0003) / 1e6, label: '212M bitar' },
    { delta: '1e-4 (0.0001)', bits: calculateRequiredBits(0.0001) / 1e6, label: '1.91 Giga-bitar' },
  ];

  // Current active block in runner
  const activeBlock = schedule[currentBlockIndex];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-xl relative overflow-hidden shadow-2xl`}>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-mono font-black uppercase tracking-widest rounded-md border ${
                isLight ? 'bg-stone-900 text-stone-50 border-stone-800' : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
              }`}>
                MISSION Q01 • UNIVERSAL ENTROPY
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 4-Arm Blinded Protocol
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Atom className="w-3.5 h-3.5" /> Gold-Standard Adjudication
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${theme.primaryTextColor} font-mono`}>
              Quantum RNG &amp; Micro-PK Studio
            </h1>
            
            <p className={`text-sm sm:text-base max-w-4xl leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
              Ett förregistrerat, falsifierbart micro-PK-experiment med rigorös blindning. 
              <strong className="font-semibold"> Radikal öppenhet</strong> i vad vi undersöker, 
              men <strong className="font-semibold">extrem vetenskaplig konservatism</strong> i vad som bevisas.
              Kompenserar för hårdvarubias via exakt målbalansering ($E[Z]_{'\text{bias}'} \approx 0$) och eliminerar realtidspeeking.
            </p>
          </div>

          {/* Machine Identifier Badge */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-stone-100/80 border-stone-300' : 'bg-slate-950/80 border-slate-800'} flex flex-col gap-2 min-w-[240px]`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={isLight ? 'text-stone-500' : 'text-slate-400'}>Lokal Värd</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-400">
                {clusterInfo?.localNode?.arch === 'arm64' ? 'APPLE SILICON M4' : 'INTEL IMAC PRO'}
              </span>
            </div>
            <div className="text-xs font-mono font-semibold truncate text-slate-200">
              {clusterInfo?.localNode?.hostname || 'iMac-Pro.local'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Tailscale:</span>
              <span className="text-cyan-400 font-mono">100.76.38.1</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
          {[
            { id: 'session', label: 'Experiment Runner', icon: Play },
            { id: 'analysis', label: 'Adjudication & Permutation', icon: Activity },
            { id: 'cluster', label: 'Hardware & Tailscale Cluster', icon: Server },
            { id: 'power', label: 'Power & Bit-Kalkylator', icon: Gauge },
            { id: 'prereg', label: 'OSF Preregistration Mall', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-stone-900 text-stone-50 shadow-md'
                      : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : isLight
                    ? 'text-stone-600 hover:bg-stone-200/70'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="underline hover:text-white">
            Avfärda
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: EXPERIMENT RUNNER                                                  */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'session' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls & Configuration Column (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-md space-y-6`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-mono font-bold uppercase tracking-wider ${theme.primaryTextColor} flex items-center gap-2`}>
                  <Sliders className="w-4 h-4 text-cyan-400" /> Sessionskonfiguration
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PILOT / TEST
                </span>
              </div>

              {/* Participant Identifier */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-400">
                  Deltagare / Pseudonym
                </label>
                <input
                  type="text"
                  disabled={sessionState === 'RUNNING'}
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 ${
                    isLight ? 'bg-white border-stone-300 text-stone-900 focus:ring-stone-900' : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-cyan-500'
                  }`}
                />
              </div>

              {/* Belief / Certainty Rating (0-100) */}
              <div className="space-y-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Subjektiv Förväntan (0–100)
                  </label>
                  <span className="text-sm font-mono font-black text-cyan-400">
                    {mindsetScore}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  ”Hur självklart känns det just nu att du kan få målutfallet att inträffa?”
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={sessionState === 'RUNNING'}
                  value={mindsetScore}
                  onChange={(e) => setMindsetScore(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Tvivel / Slump (0)</span>
                  <span>Neutral (50)</span>
                  <span>Helt Självklart (100)</span>
                </div>
              </div>

              {/* Entropy Source Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-slate-400">
                  Entropikälla (Blindad under test)
                </label>
                <select
                  disabled={sessionState === 'RUNNING'}
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 ${
                    isLight ? 'bg-white border-stone-300 text-stone-900 focus:ring-stone-900' : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-cyan-500'
                  }`}
                >
                  <option value="APPLE_CSPRNG">macOS Kernel CSPRNG (/dev/random)</option>
                  <option value="DETERMINISTIC_PRNG_PLACEBO">Deterministisk PRNG (Placebo-kontroll)</option>
                  <option value="EXTERNAL_PHYSICAL_QRNG">Extern USB-QRNG (Crypta Labs / Quantis)</option>
                  <option value="SIMULATION">Vektoriserad Benchmark Simulator</option>
                </select>
                <p className="text-[10px] font-mono text-slate-500">
                  *I ett konfirmatoriskt experiment känner deltagaren inte till om källan är kvant eller deterministisk PRNG.
                </p>
              </div>

              {/* Block duration & counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Block per villkor</label>
                  <select
                    disabled={sessionState === 'RUNNING'}
                    value={nBlocksEach}
                    onChange={(e) => setNBlocksEach(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono border ${
                      isLight ? 'bg-white border-stone-300' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value={2}>2+2 (4 block snabbtest)</option>
                    <option value={4}>4+4 (8 block pilot)</option>
                    <option value={6}>6+6 (12 block standard)</option>
                    <option value={12}>12+12 (24 block full)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Sekunder / block</label>
                  <select
                    disabled={sessionState === 'RUNNING'}
                    value={blockDurationS}
                    onChange={(e) => setBlockDurationS(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono border ${
                      isLight ? 'bg-white border-stone-300' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value={3}>3 sekunder</option>
                    <option value={5}>5 sekunder</option>
                    <option value={10}>10 sekunder</option>
                    <option value={30}>30 sekunder (standard)</option>
                  </select>
                </div>
              </div>

              {/* Start / Reset Actions */}
              <div className="pt-2 flex items-center gap-3">
                {sessionState === 'IDLE' && (
                  <button
                    onClick={handleStartSession}
                    className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Starta Experiment</span>
                  </button>
                )}

                {sessionState === 'RUNNING' && (
                  <button
                    onClick={handleReset}
                    className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Avbryt Session</span>
                  </button>
                )}

                {sessionState === 'FINISHED' && (
                  <button
                    onClick={handleReset}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ny Session</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scientific Rigor Checklist */}
            <div className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-3 text-xs font-mono text-slate-400`}>
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rigorösa Metodgarantier
              </div>
              <ul className="space-y-2 text-[11px] leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Ingen realtids-peeking:</strong> Förhindrar operant stopping och falsk-positiv selektion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Målbalansering 50/50:</strong> Slår ut hårdvarubias ($E[Z] \approx 0$).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Placebo-PRNG:</strong> Förseglad SHA-256 seed avslöjas efteråt för att bevisa om effekten är rent kvantfysisk.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Active Visual Runner Column (Right) */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className={`p-8 sm:p-12 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} backdrop-blur-xl relative flex flex-col items-center justify-center min-h-[500px] text-center shadow-2xl overflow-hidden`}>
              
              {/* IDLE STATE */}
              {sessionState === 'IDLE' && (
                <div className="space-y-6 max-w-md animate-fadeIn">
                  <div className="w-24 h-24 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center mx-auto shadow-inner">
                    <Radio className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className={`text-xl font-bold font-mono ${theme.primaryTextColor}`}>
                      Redo för micro-PK session
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'} leading-relaxed`}>
                      Ställ in ditt subjektiva tillstånd, välj blocklängd och klicka på ”Starta Experiment”. 
                      Under passet visas tydliga instruktioner för varje block tillsammans med en avkopplande pulsring.
                    </p>
                  </div>
                </div>
              )}

              {/* RUNNING STATE */}
              {sessionState === 'RUNNING' && activeBlock && (
                <div className="w-full max-w-lg space-y-8 animate-fadeIn">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-4">
                    <span>BLOCK {currentBlockIndex + 1} AV {schedule.length}</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                      {countdown}s ÅTERSTÅR
                    </span>
                  </div>

                  {/* Pulsating Visual Focus Ring (Pure pacer, NO outcome feedback!) */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="w-48 h-48 rounded-full border-2 border-cyan-500/20 flex items-center justify-center animate-ping opacity-20" />
                    <div className="w-36 h-36 rounded-full border-2 border-cyan-400/40 flex items-center justify-center animate-pulse">
                      <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        {activeBlock.condition === 'INTENTION' ? (
                          activeBlock.target === 1 ? (
                            <span className="text-4xl font-black font-mono text-cyan-400">↑ 1</span>
                          ) : (
                            <span className="text-4xl font-black font-mono text-amber-400">↓ 0</span>
                          )
                        ) : (
                          <span className="text-xl font-mono font-bold text-slate-400">NEUTRAL</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calibrated Instructions from the Paper */}
                  <div className={`p-6 rounded-xl border ${
                    activeBlock.condition === 'INTENTION' ? 'border-cyan-500/40 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/40'
                  }`}>
                    {activeBlock.condition === 'INTENTION' ? (
                      <div className="space-y-3">
                        <div className="text-base font-black font-mono uppercase tracking-wider text-cyan-400">
                          {activeBlock.target === 1 ? 'Mål: ↑ / Ettor (1)' : 'Mål: ↓ / Nollor (0)'}
                        </div>
                        <p className={`text-xs sm:text-sm font-sans leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-200'}`}>
                          Slappna av i kroppen. Försök inte tvinga fram resultatet. Föreställ dig i stället att ett överskott av målutfallet redan är det naturliga resultatet. Låt det kännas väntat och självklart. Behåll uppmärksamheten på målet tills blocket är slut.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-base font-black font-mono uppercase tracking-wider text-slate-300">
                          Neutral Observation (Kontroll)
                        </div>
                        <p className={`text-xs sm:text-sm font-sans leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                          Fokusera på andningen och cirkeln på skärmen. Observera utan att försöka ändra eller påverka någon slumpgenerator. Det finns inget resultat du behöver åstadkomma.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Ingen feedback visas under pågående block (Blindad insamling)
                  </div>
                </div>
              )}

              {/* ANALYZING STATE */}
              {sessionState === 'ANALYZING' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-mono font-bold text-cyan-400">
                      Kör 20 000 Monte Carlo Permutationer...
                    </h3>
                    <p className="text-xs font-mono text-slate-400 max-w-sm">
                      Beräknar exakt permutationsnollfördelning, target-realigned Z-scores och Layer 1 Negative Control verifiering.
                    </p>
                  </div>
                </div>
              )}

              {/* FINISHED STATE */}
              {sessionState === 'FINISHED' && analysis && (
                <div className="space-y-6 max-w-md animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-mono font-black ${theme.primaryTextColor}`}>
                      Session Slutförd &amp; Adjudikerad
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Resultatet har krypterats med SHA-256 och lagts till i audit-loggen.
                    </p>
                  </div>

                  {/* Summary metric card */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Observerat D_i:</span>
                      <div className={`text-lg font-mono font-black ${analysis.observedD > 0 ? 'text-cyan-400' : 'text-slate-300'}`}>
                        {analysis.observedD > 0 ? `+${analysis.observedD}` : analysis.observedD}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Permutations p-värde:</span>
                      <div className="text-lg font-mono font-black text-slate-200">
                        p = {analysis.pValue}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSubTab('analysis')}
                    className="w-full py-3 px-4 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <span>Visa Fullständig Statistisk Analys</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: ADJUDICATION & STATISTICAL ANALYSIS                                */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-8 animate-fadeIn">
          {analysis ? (
            <>
              {/* Verdict Banner */}
              <div className={`p-6 rounded-2xl border ${
                analysis.verdict === 'STRUCTURE_SIGNAL' 
                  ? 'border-cyan-500/50 bg-cyan-950/30' 
                  : analysis.verdict === 'CLAIM_FAILS_NULL'
                  ? 'border-slate-800 bg-slate-900/50'
                  : 'border-amber-500/40 bg-amber-950/20'
              } flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">ANOMALISTIK Layer 3 Adjudication:</span>
                    <span className={`px-3 py-1 rounded-md text-xs font-mono font-black uppercase tracking-wider ${
                      analysis.verdict === 'STRUCTURE_SIGNAL'
                        ? 'bg-cyan-500 text-slate-950'
                        : analysis.verdict === 'CLAIM_FAILS_NULL'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      {analysis.verdict}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 max-w-2xl">
                    {analysis.verdict === 'STRUCTURE_SIGNAL' && 'Signifikant avvikelse detekterad med p < 0.001 under målinriktad intention. Layer 1 negativ kontroll passerad.'}
                    {analysis.verdict === 'CLAIM_FAILS_NULL' && 'Data är fullt förenliga med nollhypotesen (H0). Ingen målinriktad intentionseffekt påvisad.'}
                    {analysis.verdict === 'UNDERDETERMINED' && 'Svag tendens (p < 0.05) men når ej den förregistrerade konfirmatoriska tröskeln (α = 0.001).'}
                    {analysis.verdict === 'INSTRUMENT_SYSTEMATICS' && 'Varning: Negativ kontroll eller placebo-PRNG uppvisade oväntad avvikelse; misstänkt hårdvarudrift.'}
                  </p>
                </div>

                {/* Layer 1 Negative Control Badge */}
                <div className={`px-4 py-3 rounded-xl border flex items-center space-x-3 text-xs font-mono ${
                  analysis.layer1NegativeControlPassed 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}>
                  {analysis.layer1NegativeControlPassed ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <div className="font-bold">Layer 1 Negativ Kontroll</div>
                    <div className="text-[10px] text-slate-400">
                      {analysis.layer1NegativeControlPassed ? 'GODKÄND (Ingen placebo-artefakt)' : 'MISSLYCKADES'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                  <span className="text-[11px] font-mono text-slate-400">Inompersons-differens (D_i)</span>
                  <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
                    {analysis.observedD > 0 ? `+${analysis.observedD}` : analysis.observedD}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Z_intention − Z_kontroll</span>
                </div>

                <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                  <span className="text-[11px] font-mono text-slate-400">Permutations p-värde</span>
                  <div className="text-2xl font-mono font-black text-slate-200 mt-1">
                    {analysis.pValue}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Tröskel α = 0.001</span>
                </div>

                <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Normal-Normal BF₀₁</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">τ = 0.20</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-slate-200 mt-1">
                    {analysis.bf01}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Stöd för H₀ (BF₁₀ = {analysis.bf10 ?? (1 / analysis.bf01).toFixed(2)})
                  </span>
                </div>

                <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                  <span className="text-[11px] font-mono text-slate-400">Totalt genererade bitar</span>
                  <div className="text-2xl font-mono font-black text-slate-200 mt-1">
                    {analysis.totalBits.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{analysis.totalOnes} ettor</span>
                </div>
              </div>

              {/* Permutation Null Histogram */}
              <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className={`text-base font-mono font-bold ${theme.primaryTextColor}`}>
                      Empirisk Permutations-Nollfördelning (20 000 iterationer)
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Fördelning av D_i under H0 via randomiserade målpermutationer mot det observerade utfallet.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Observerad D_i ({analysis.observedD})
                    </span>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.histogram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: '#334155', 
                          fontSize: '11px', 
                          fontFamily: 'monospace' 
                        }} 
                      />
                      <Bar dataKey="count" fill="#38bdf8" opacity={0.6} radius={[2, 2, 0, 0]} />
                      <ReferenceLine x={analysis.observedD} stroke="#22d3ee" strokeWidth={2} strokeDasharray="4 4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Block Audit Trail Table */}
              <div className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-mono font-bold uppercase tracking-wider ${theme.primaryTextColor} flex items-center gap-2`}>
                    <Binary className="w-4 h-4 text-cyan-400" /> Råblocks-logg &amp; SHA-256 Checksummor
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    Append-only audit trail
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Villkor</th>
                        <th className="py-2.5 px-3">Mål</th>
                        <th className="py-2.5 px-3">Bitar</th>
                        <th className="py-2.5 px-3">Ettor</th>
                        <th className="py-2.5 px-3">Z-Score</th>
                        <th className="py-2.5 px-3">SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {completedBlocks.map((b) => (
                        <tr key={b.blockIndex} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">{b.blockIndex + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.condition === 'INTENTION' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {b.condition}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {b.target === 1 ? '↑ 1' : '↓ 0'}
                          </td>
                          <td className="py-2.5 px-3">{b.nBits?.toLocaleString()}</td>
                          <td className="py-2.5 px-3">{b.ones?.toLocaleString()}</td>
                          <td className={`py-2.5 px-3 font-bold ${(b.targetScoreZ || 0) > 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {(b.targetScoreZ || 0) > 0 ? `+${b.targetScoreZ}` : b.targetScoreZ}
                          </td>
                          <td className="py-2.5 px-3 text-[10px] text-slate-500 truncate max-w-[140px]" title={b.rawSha256}>
                            {b.rawSha256 ? `${b.rawSha256.slice(0, 16)}...` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-12 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} text-center space-y-4`}>
              <Activity className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-mono font-bold text-slate-300">Ingen aktiv analysdata tillgänglig</h3>
                <p className="text-xs font-mono text-slate-500">
                  Kör en session i fliken ”Experiment Runner” för att generera och visa den statistiska analysen.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('session')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs"
              >
                Gå till Experiment Runner
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: CLUSTER & TAILSCALE HARDWARE NODES                                 */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'cluster' && (
        <div className="space-y-8 animate-fadeIn">
          <div className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className={`text-base font-mono font-bold ${theme.primaryTextColor} flex items-center gap-2`}>
                  <Server className="w-4 h-4 text-cyan-400" /> Distribuerat ANOMALISTIK Tailscale-Kluster
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Kontrollstation på Intel iMac Pro kombinerad med snabba Apple Silicon M4/M2-noder för Monte Carlo och fysisk QRNG.
                </p>
              </div>
              <button
                onClick={fetchClusterStatus}
                disabled={loadingStatus}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                <span>Uppdatera Noder</span>
              </button>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clusterInfo?.clusterNodes?.map((node: ClusterNode) => (
                <div key={node.id} className={`p-5 rounded-xl border ${
                  node.status === 'ONLINE_ACTIVE_HOST' 
                    ? 'border-cyan-500/40 bg-cyan-950/20 shadow-lg shadow-cyan-500/10' 
                    : 'border-slate-800 bg-slate-950/60'
                } space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {node.arch}
                    </span>
                    <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                      node.status === 'ONLINE_ACTIVE_HOST' ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {node.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-mono font-bold text-slate-100">{node.name}</h4>
                    <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{node.tailscale}</p>
                    <p className="text-[10px] font-mono text-slate-500">{node.ip}</p>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {node.role}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
                    <span className="font-semibold text-slate-300">Stödda Entropimotorer:</span>
                    <div className="flex flex-wrap gap-1">
                      {node.availableEngines.map((e) => (
                        <span key={e} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Arm Design Reference Matrix */}
          <div className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
            <h3 className={`text-sm font-mono font-bold uppercase tracking-wider ${theme.primaryTextColor}`}>
              Blindad 4-Arms Designmatris
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Källa / Tillstånd</th>
                    <th className="py-2.5 px-3">Intention (Mål 1/0)</th>
                    <th className="py-2.5 px-3">Neutral Kontroll</th>
                    <th className="py-2.5 px-3">Vetenskaplig Roll</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">Lokal Fysisk QRNG (USB)</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">Primär Hypotes (H1)</td>
                    <td className="py-2.5 px-3 text-slate-400">Primär Kontroll (D_i bas)</td>
                    <td className="py-2.5 px-3 text-slate-400">Fysisk kvantslump från optiska fluktuationer</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-300">Deterministisk Seeded PRNG</td>
                    <td className="py-2.5 px-3 text-amber-400">Placebo-kontroll</td>
                    <td className="py-2.5 px-3 text-slate-400">Negativ Kontroll</td>
                    <td className="py-2.5 px-3 text-slate-400">Matematiskt låst bitström (SHA-256) före test</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-300">macOS Kernel CSPRNG</td>
                    <td className="py-2.5 px-3 text-blue-400">Sekundär Kontroll</td>
                    <td className="py-2.5 px-3 text-slate-400">Sekundär Kontroll</td>
                    <td className="py-2.5 px-3 text-slate-400">macOS kernel CSPRNG / system entropy source</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-300">Lokal QRNG utan Människa</td>
                    <td className="py-2.5 px-3 text-slate-500">—</td>
                    <td className="py-2.5 px-3 text-purple-400">Maskinbaseline</td>
                    <td className="py-2.5 px-3 text-slate-400">Avslöjar systematiska artefakter och temperaturdrift</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: POWER & BIT-BUDGET CALCULATOR                                      */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'power' && (
        <div className="space-y-8 animate-fadeIn">
          <div className={`p-6 sm:p-8 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-6`}>
            <div>
              <h3 className={`text-base font-mono font-bold ${theme.primaryTextColor}`}>
                Power-Analys &amp; Bit-Budget Kalkylator ($N \approx 19.1125 / \delta^2$)
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Beräknar nödvändig bitmängd för 90% power vid ensidigt $\alpha = 0.001$.
                Visar varför pseudoreplikation är studiens största statistiska fälla.
              </p>
            </div>

            {/* Slider Input */}
            <div className="p-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Antagen Standardiserad Bit-Effekt ($\delta$):
                </span>
                <span className="text-base font-mono font-black text-cyan-400">
                  δ = {effectDelta} ({effectDelta === 0.0001 ? 'PEAR benchmark ~ 1e-4' : ''})
                </span>
              </div>
              <input
                type="range"
                min="0.00003"
                max="0.01"
                step="0.00001"
                value={effectDelta}
                onChange={(e) => setEffectDelta(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>3×10⁻⁵ (Subtil)</span>
                <span>1×10⁻⁴ (PEAR typisk)</span>
                <span>1×10⁻² (Stark)</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                <span className="text-[11px] font-mono text-slate-400">Nödvändiga Bitar</span>
                <div className="text-xl font-mono font-black text-cyan-400 mt-1">
                  {powerBits > 1e9 
                    ? `${(powerBits / 1e9).toFixed(2)} Miljarder` 
                    : `${(powerBits / 1e6).toFixed(1)} Miljoner`}
                </div>
                <span className="text-[10px] font-mono text-slate-500">{powerMegabytes} MB rådata</span>
              </div>

              <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                <span className="text-[11px] font-mono text-slate-400">Tid vid 1 Mbit/s</span>
                <div className="text-xl font-mono font-black text-slate-200 mt-1">
                  {Number(powerTime1Mbit) > 3600
                    ? `${(Number(powerTime1Mbit) / 3600).toFixed(1)} timmar`
                    : `${(Number(powerTime1Mbit) / 60).toFixed(1)} minuter`}
                </div>
                <span className="text-[10px] font-mono text-slate-500">Normal USB QRNG</span>
              </div>

              <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                <span className="text-[11px] font-mono text-slate-400">Tid vid 4 Mbit/s</span>
                <div className="text-xl font-mono font-black text-slate-200 mt-1">
                  {Number(powerTime4Mbit) > 3600
                    ? `${(Number(powerTime4Mbit) / 3600).toFixed(1)} timmar`
                    : `${(Number(powerTime4Mbit) / 60).toFixed(1)} minuter`}
                </div>
                <span className="text-[10px] font-mono text-slate-500">M4 optimerad ström</span>
              </div>

              <div className={`p-5 rounded-xl border ${theme.cardBorder} ${theme.cardBg}`}>
                <span className="text-[11px] font-mono text-slate-400">Deltagare ($d_z = 0.20$)</span>
                <div className="text-xl font-mono font-black text-amber-400 mt-1">
                  ~ 478 Personer
                </div>
                <span className="text-[10px] font-mono text-slate-500">Förhindrar pseudoreplikation</span>
              </div>
            </div>

            {/* Power Curve Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="delta" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="M" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      fontSize: '11px', 
                      fontFamily: 'monospace' 
                    }} 
                  />
                  <Line type="monotone" dataKey="bits" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: OSF PREREGISTRATION TEMPLATE EXPORT                                */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'prereg' && (
        <div className="space-y-6 animate-fadeIn">
          <div className={`p-6 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className={`text-base font-mono font-bold ${theme.primaryTextColor}`}>
                  Färdig OSF.io Preregistreringsmall
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Lås hypotes, stoppregel, exclusions och analysplan innan insamlingen påbörjas.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(OSF_PREREGISTRATION_MARKDOWN, setCopiedPrereg)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                {copiedPrereg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrereg ? 'Kopierad till Urklipp!' : 'Kopiera OSF Markdown'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
              {OSF_PREREGISTRATION_MARKDOWN}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};

const OSF_PREREGISTRATION_MARKDOWN = `# ANOMALISTIK: Preregistered Micro-PK Quantum Random Number Generator Study

## 1. Research Question
Kan explicit mänsklig intention orsaka en statistiskt påvisbar förändring i output från en lokal fysisk quantum random number generator (QRNG) jämfört med randomiserade neutral-attention-kontrollblock?

## 2. Hypotheses
- Primary Hypothesis (H1): För vuxna deltagare är det genomsnittliga target-realigned QRNG-blocket signifikant högre under explicit intention än under neutral attention-control:
  H0: mu_D <= 0
  H1: mu_D > 0
  där D_i = mean(Z_QRNG,intention,i) - mean(Z_QRNG,control,i).
- Secondary Hypothesis (H2): QRNG visar högre målinriktad differens än den seedade deterministiska PRNG-placebokontrollen: (QRNG_I-C) - (PRNG_I-C) > 0.
- Moderator Hypothesis: Subjektiv förväntan (0-100 score) korrelerar positivt med D_i.

## 3. Design & Blinding
- Fyrarmsdesign: Lokal fysisk QRNG, macOS CSPRNG, Deterministisk PRNG (placebo) och Maskinbaseline utan människa.
- Deltagaren är blind för aktuell slumpkälla.
- Testledare ser ingen realtidspeeking eller rullande Z-score under testet.
- Strikt målbalansering: Exakt 50% Target 1 och 50% Target 0 i både intentions- och kontrollblock för att neutralisera stationär hårdvarubias (E[Z]_bias = 0).

## 4. Primary Statistical Analysis
- Ensidigt preregistrerat permutations-/randomiseringstest (100 000 iterationer) på deltagardifferensen D_i vid alfa = 0.001.
- Normal-Normal Bayes Factor BF01 med fördefinierad prior-skala τ = 0.20 för H0 gentemot H1.
- Append-only kryptografisk loggning med SHA-256 för varje råbitström.
`;
