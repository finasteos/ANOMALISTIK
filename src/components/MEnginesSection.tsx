import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Cpu, Activity, ArrowRightLeft, ShieldCheck, Sparkles, Layers, Zap, Play, Pause, RefreshCw, BarChart2, Filter, Calendar, Sliders, GitCompare, Split } from 'lucide-react';
import { M_ENGINES } from '../data/labData';
import { MEngine } from '../types';
import { useTheme } from '../ThemeContext';

interface EntropyPoint {
  time: string;
  streamAVal: number;
  streamBVal: number;
  couplingZScore: number;
  nullThreshold: number;
  eventEpoch?: string;
}

const EPOCH_PRESETS = [
  { id: 'LIVE', label: '🔴 Live Real-Time Stream', shortLabel: 'Live' },
  { id: 'MAY_2024_SOLAR', label: '☀️ May 2024 G5 Solar Storm Event', shortLabel: 'May 2024' },
  { id: 'DEC_2023_FRB', label: '📻 Dec 2023 CHIME FRB Burst Epoch', shortLabel: 'Dec 2023' },
  { id: 'HISTORICAL_1H', label: '⏱️ Extended 1-Hour Time Horizon', shortLabel: '1H Horizon' },
];

// Generator function for simulated time-series data for each M-Engine & Event Preset
const generateInitialFluxData = (engineId: string, eventPreset: string = 'LIVE'): EntropyPoint[] => {
  const points: EntropyPoint[] = [];
  const now = new Date();

  const count = eventPreset === 'HISTORICAL_1H' ? 60 : 20;

  for (let i = count; i >= 0; i--) {
    let t = new Date(now.getTime() - i * 60 * 1000);
    let epochLabel = 'Live';

    if (eventPreset === 'MAY_2024_SOLAR') {
      t = new Date(1715385600000 - i * 60 * 1000); // May 11 2024
      epochLabel = 'May 2024 Event';
    } else if (eventPreset === 'DEC_2023_FRB') {
      t = new Date(1702684800000 - i * 60 * 1000); // Dec 16 2023
      epochLabel = 'Dec 2023 Outburst';
    }

    const timeStr = t.toTimeString().substring(0, 5);

    let streamAVal = 0;
    let streamBVal = 0;
    let couplingZScore = 0;

    const mult = eventPreset === 'MAY_2024_SOLAR' ? 1.8 : eventPreset === 'DEC_2023_FRB' ? 1.5 : 1.0;

    if (engineId === 'm1') {
      // M1: Field vs Geometry (EMAG2v3 ΔT vs Spatial Ripley K)
      streamAVal = Number((120 + Math.sin(i * 0.4) * 45 * mult + Math.random() * 15).toFixed(1));
      streamBVal = Number((0.45 + Math.cos(i * 0.4) * 0.3 * mult + Math.random() * 0.08).toFixed(2));
      couplingZScore = Number((3.2 + Math.sin(i * 0.4) * 4.8 * mult + Math.random() * 0.5).toFixed(2));
    } else if (engineId === 'm2') {
      // M2: Flux vs Biophysics (GOES X-Ray vs Pulvini Node Elongation)
      streamAVal = Number((1.2 + Math.pow(Math.sin(i * 0.3), 2) * 8.5 * mult + Math.random() * 0.4).toFixed(2));
      streamBVal = Number((25 + Math.pow(Math.sin(i * 0.3), 2) * 165 * mult + Math.random() * 10).toFixed(1));
      couplingZScore = Number((2.1 + Math.pow(Math.sin(i * 0.3), 2) * 12.4 * mult + Math.random() * 0.4).toFixed(2));
    } else if (engineId === 'm3') {
      // M3: Spectral vs Shape (Sentinel-2 CRSWIR vs Geometric Outline)
      streamAVal = Number((0.15 + Math.sin(i * 0.5) * 0.35 * mult + Math.random() * 0.05).toFixed(3));
      streamBVal = Number((0.82 - Math.sin(i * 0.5) * 0.28 * mult + Math.random() * 0.04).toFixed(3));
      couplingZScore = Number((1.8 + Math.abs(Math.sin(i * 0.5)) * 6.2 * mult + Math.random() * 0.3).toFixed(2));
    } else {
      // M4: Info-Theoretic Linguistics (Cond-H vs D_KL Divergence)
      streamAVal = Number((2.8 - Math.cos(i * 0.35) * 0.95 + Math.random() * 0.08).toFixed(3));
      streamBVal = Number((0.12 + Math.sin(i * 0.35) * 0.65 * mult + Math.random() * 0.05).toFixed(3));
      couplingZScore = Number((4.5 + Math.sin(i * 0.35) * 11.2 * mult + Math.random() * 0.6).toFixed(2));
    }

    points.push({
      time: timeStr,
      streamAVal,
      streamBVal,
      couplingZScore,
      nullThreshold: 3.5,
      eventEpoch: epochLabel
    });
  }

  return points;
};

export const MEnginesSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [selectedEngine, setSelectedEngine] = useState<MEngine>(M_ENGINES[0]);
  const [eventPreset, setEventPreset] = useState<string>('LIVE'); // 'LIVE' | 'MAY_2024_SOLAR' | 'DEC_2023_FRB' | 'HISTORICAL_1H'
  const [fluxData, setFluxData] = useState<EntropyPoint[]>(() => generateInitialFluxData(M_ENGINES[0].id, 'LIVE'));
  const [isLive, setIsLive] = useState<boolean>(true);

  // Overlay Comparison Mode States
  const [isOverlayMode, setIsOverlayMode] = useState<boolean>(false);
  const [overlayEpoch1, setOverlayEpoch1] = useState<string>('MAY_2024_SOLAR');
  const [overlayEpoch2, setOverlayEpoch2] = useState<string>('DEC_2023_FRB');
  const [overlayMetricFocus, setOverlayMetricFocus] = useState<'ALL_STREAMS' | 'ZSCORE_ONLY'>('ALL_STREAMS');

  // Severity / Z-score Cutoff State
  const [zCutoffThreshold, setZCutoffThreshold] = useState<number>(3.5);
  const [signalFilterMode, setSignalFilterMode] = useState<string>('ALL'); // 'ALL' | 'PEAKS_ONLY' | 'NULL_ONLY'

  // Datasets for Overlay Mode
  const fluxDataP1 = useMemo(() => {
    return generateInitialFluxData(selectedEngine.id, overlayEpoch1);
  }, [selectedEngine.id, overlayEpoch1]);

  const fluxDataP2 = useMemo(() => {
    return generateInitialFluxData(selectedEngine.id, overlayEpoch2);
  }, [selectedEngine.id, overlayEpoch2]);

  const overlayMergedData = useMemo(() => {
    const maxLen = Math.min(fluxDataP1.length, fluxDataP2.length);
    const merged = [];

    for (let i = 0; i < maxLen; i++) {
      const p1 = fluxDataP1[i];
      const p2 = fluxDataP2[i];

      merged.push({
        stepIndex: i,
        stepLabel: `T + ${i}m`,
        time1: p1.time,
        streamA_p1: p1.streamAVal,
        streamB_p1: p1.streamBVal,
        zScore_p1: p1.couplingZScore,

        time2: p2.time,
        streamA_p2: p2.streamAVal,
        streamB_p2: p2.streamBVal,
        zScore_p2: p2.couplingZScore,

        zDelta: Number((p1.couplingZScore - p2.couplingZScore).toFixed(2))
      });
    }
    return merged;
  }, [fluxDataP1, fluxDataP2]);

  // Comparative Statistics for Overlay Mode
  const overlayStats = useMemo(() => {
    if (overlayMergedData.length === 0) return null;

    const z1List = overlayMergedData.map(d => d.zScore_p1);
    const z2List = overlayMergedData.map(d => d.zScore_p2);

    const peakZ1 = Math.max(...z1List, 0);
    const peakZ2 = Math.max(...z2List, 0);

    const avgZ1 = z1List.reduce((a, b) => a + b, 0) / z1List.length;
    const avgZ2 = z2List.reduce((a, b) => a + b, 0) / z2List.length;

    const maxDivergenceStep = overlayMergedData.reduce((prev, curr) => 
      Math.abs(curr.zDelta) > Math.abs(prev.zDelta) ? curr : prev, overlayMergedData[0]
    );

    const p1Label = EPOCH_PRESETS.find(p => p.id === overlayEpoch1)?.shortLabel || overlayEpoch1;
    const p2Label = EPOCH_PRESETS.find(p => p.id === overlayEpoch2)?.shortLabel || overlayEpoch2;

    return {
      peakZ1,
      peakZ2,
      avgZ1: Number(avgZ1.toFixed(2)),
      avgZ2: Number(avgZ2.toFixed(2)),
      peakRatio: peakZ2 > 0 ? Number((peakZ1 / peakZ2).toFixed(2)) : 1.0,
      maxDivergenceStep,
      p1Label,
      p2Label
    };
  }, [overlayMergedData, overlayEpoch1, overlayEpoch2]);

  // Re-generate baseline flux data when selected engine or event preset changes
  useEffect(() => {
    setFluxData(generateInitialFluxData(selectedEngine.id, eventPreset));
    if (eventPreset !== 'LIVE') {
      setIsLive(false);
    }
  }, [selectedEngine, eventPreset]);

  // Real-time tick simulator
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setFluxData((prevData) => {
        const last = prevData[prevData.length - 1];
        const nextTime = new Date().toTimeString().substring(0, 5);

        let streamAVal = last.streamAVal;
        let streamBVal = last.streamBVal;
        let couplingZScore = last.couplingZScore;

        const noise = (Math.random() - 0.5) * 0.6;

        if (selectedEngine.id === 'm1') {
          streamAVal = Number(Math.max(50, streamAVal + (Math.random() - 0.48) * 8).toFixed(1));
          streamBVal = Number(Math.max(0.1, Math.min(1.0, streamBVal + noise * 0.05)).toFixed(2));
          couplingZScore = Number(Math.max(0, streamAVal / 25 + streamBVal * 2).toFixed(2));
        } else if (selectedEngine.id === 'm2') {
          streamAVal = Number(Math.max(0.5, streamAVal + (Math.random() - 0.48) * 1.2).toFixed(2));
          streamBVal = Number(Math.max(10, streamAVal * 18 + Math.random() * 8).toFixed(1));
          couplingZScore = Number(Math.max(0, (streamBVal / 18) + (Math.random() - 0.3)).toFixed(2));
        } else if (selectedEngine.id === 'm3') {
          streamAVal = Number(Math.max(0.05, Math.min(0.9, streamAVal + noise * 0.04)).toFixed(3));
          streamBVal = Number(Math.max(0.1, Math.min(1.0, streamBVal - noise * 0.04)).toFixed(3));
          couplingZScore = Number(Math.max(0, (streamAVal * 8.5) + Math.random() * 0.5).toFixed(2));
        } else {
          streamAVal = Number(Math.max(1.2, Math.min(3.5, streamAVal + noise * 0.08)).toFixed(3));
          streamBVal = Number(Math.max(0.05, Math.min(1.2, streamBVal + noise * 0.06)).toFixed(3));
          couplingZScore = Number(Math.max(0, 14.5 - streamAVal * 3 + streamBVal * 4).toFixed(2));
        }

        const newPoint: EntropyPoint = {
          time: nextTime,
          streamAVal,
          streamBVal,
          couplingZScore,
          nullThreshold: zCutoffThreshold,
          eventEpoch: 'Live'
        };

        return [...prevData.slice(1), newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, selectedEngine, zCutoffThreshold]);

  const handleResetSeries = () => {
    setFluxData(generateInitialFluxData(selectedEngine.id, eventPreset));
  };

  // Filter timepoints based on signal filter mode
  const displayedFluxData = useMemo(() => {
    return fluxData.filter((pt) => {
      if (signalFilterMode === 'PEAKS_ONLY') {
        return pt.couplingZScore >= zCutoffThreshold;
      } else if (signalFilterMode === 'NULL_ONLY') {
        return pt.couplingZScore < zCutoffThreshold;
      }
      return true;
    });
  }, [fluxData, signalFilterMode, zCutoffThreshold]);

  // Statistics
  const peakZ = useMemo(() => {
    return Math.max(...fluxData.map((p) => p.couplingZScore), 0);
  }, [fluxData]);

  const anomalyPointsCount = useMemo(() => {
    return fluxData.filter((p) => p.couplingZScore >= zCutoffThreshold).length;
  }, [fluxData, zCutoffThreshold]);

  // Get dynamic unit labels based on active engine
  const getStreamLabels = () => {
    switch (selectedEngine.id) {
      case 'm1':
        return { aLabel: 'Crustal Magnetic Delta ΔT (nT)', bLabel: 'Spatial Ripley K Density' };
      case 'm2':
        return { aLabel: 'Solar X-Ray Flux (μW/m²)', bLabel: 'Pulvini Node Elongation (%)' };
      case 'm3':
        return { aLabel: 'CRSWIR Water Content Index', bLabel: 'Outline Divergence Score' };
      case 'm4':
      default:
        return { aLabel: 'Conditional Bigram H(Y|X)', bLabel: 'Kullback-Leibler Distance D_KL' };
    }
  };

  const { aLabel, bLabel } = getStreamLabels();
  const latestPoint = fluxData[fluxData.length - 1] || fluxData[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs">
          <Cpu className="w-4 h-4" />
          <span>Cross-Domain Correlation Matrix • The M-Engines</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          The 4 Correlation Engines (M1–M4 Pipelines)
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          In the UB-Labb framework, correlation engines run biophysical, geophysical, spectral, and epigraphic modules 
          against each other in closed statistical processes to evaluate <strong className="text-purple-300">structural coupling</strong>. 
          A confirmed correlation proves physical co-variance between streams, satisfying Layer 1 Negative Controls.
        </p>
      </div>

      {/* Grid of the 4 Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {M_ENGINES.map((engine) => {
          const isSelected = selectedEngine.id === engine.id;
          return (
            <div
              key={engine.id}
              onClick={() => setSelectedEngine(engine)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'bg-purple-950/30 border-purple-500/60 shadow-xl shadow-purple-950/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  {engine.code}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {engine.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-base">{engine.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{engine.subtitle}</p>
              </div>

              <div className="text-xs text-slate-300 line-clamp-2">
                {engine.description}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-purple-300 flex items-center justify-between">
                <span>View Engine Matrix</span>
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Date Event & Severity Range Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
              Time-Series Epoch &amp; Severity Cutoff Filters ({selectedEngine.code})
            </h2>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Anomalous Points: <strong className="text-emerald-400">{anomalyPointsCount}</strong> / {fluxData.length} | Peak z = <strong className="text-purple-300">{peakZ.toFixed(2)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Historical Date / Event Selector */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <label className="text-slate-300 font-bold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historical Date Epoch / Event Feed</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {[
                { id: 'LIVE', label: '🔴 Live Real-Time Stream' },
                { id: 'MAY_2024_SOLAR', label: '☀️ May 2024 G5 Solar Storm Event' },
                { id: 'DEC_2023_FRB', label: '📻 Dec 2023 CHIME FRB Burst Epoch' },
                { id: 'HISTORICAL_1H', label: '⏱️ Extended 1-Hour Time Horizon' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setEventPreset(preset.id)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition text-left ${
                    eventPreset === preset.id
                      ? 'bg-purple-600 text-slate-950 border border-purple-400'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Z-Score Threshold Slider */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Z-Score Null Cutoff (|Z|)</span>
              </label>
              <span className="text-amber-300 font-bold">z = {zCutoffThreshold.toFixed(1)}</span>
            </div>

            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={zCutoffThreshold}
              onChange={(e) => setZCutoffThreshold(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>z = 1.0 (Low)</span>
              <span>z = 3.5 (Standard)</span>
              <span>z = 8.0 (Extreme)</span>
            </div>

            <div className="flex gap-1.5 pt-1">
              {[2.0, 3.5, 5.0, 7.0].map((val) => (
                <button
                  key={val}
                  onClick={() => setZCutoffThreshold(val)}
                  className={`flex-1 py-1 rounded text-[10px] transition ${
                    zCutoffThreshold === val
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  z = {val}
                </button>
              ))}
            </div>
          </div>

          {/* Point Display Filter Mode */}
          <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 sm:col-span-2 lg:col-span-1">
            <label className="text-slate-300 font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chart Point Filtering Display</span>
            </label>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'Show All Data Points' },
                { id: 'PEAKS_ONLY', label: `Filter: Only Anomalies (z ≥ ${zCutoffThreshold.toFixed(1)})` },
                { id: 'NULL_ONLY', label: `Filter: Only Noise / Nulls (z < ${zCutoffThreshold.toFixed(1)})` },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSignalFilterMode(m.id)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition text-left ${
                    signalFilterMode === m.id
                      ? 'bg-emerald-600 text-slate-950 border border-emerald-400'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Recharts Entropy Flux Visualization & Dual-Epoch Overlay Mode */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Entropy Flux &amp; Z-Score Correlation Chart ({selectedEngine.code})</span>
                {isOverlayMode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700 text-xs font-mono font-bold uppercase animate-pulse">
                    Overlay Mode Active
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOverlayMode 
                ? `Comparing two distinct time periods on normalized time axes (${overlayStats?.p1Label || 'P1'} vs ${overlayStats?.p2Label || 'P2'}).`
                : `Visualizing live stream cross-correlation between Stream A and Stream B.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Overlay Mode Toggle Button */}
            <button
              onClick={() => setIsOverlayMode(!isOverlayMode)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-2 border ${
                isOverlayMode
                  ? 'bg-purple-600 text-slate-950 border-purple-400 shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-800/80'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{isOverlayMode ? 'Disable Overlay Mode' : 'Enable Overlay Mode'}</span>
            </button>

            {!isOverlayMode && (
              <>
                <button
                  onClick={() => setIsLive(!isLive)}
                  disabled={eventPreset !== 'LIVE'}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                    isLive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800 opacity-80'
                  }`}
                >
                  {isLive ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isLive ? 'STREAMING LIVE' : 'STREAM PAUSED'}</span>
                </button>

                <button
                  onClick={handleResetSeries}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Reset Time-Series"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* DUAL-EPOCH OVERLAY MODE CONTROL TOOLBAR */}
        {isOverlayMode && (
          <div className="bg-slate-950 border border-purple-900/60 rounded-xl p-4 space-y-4 font-mono text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-purple-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Select Time Periods / Epochs To Compare</span>
              </span>

              {/* Metric View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setOverlayMetricFocus('ALL_STREAMS')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    overlayMetricFocus === 'ALL_STREAMS'
                      ? 'bg-purple-600 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Input Streams &amp; Z-Scores
                </button>
                <button
                  onClick={() => setOverlayMetricFocus('ZSCORE_ONLY')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    overlayMetricFocus === 'ZSCORE_ONLY'
                      ? 'bg-purple-600 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Coupling Z-Scores Only
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Period 1 Selector */}
              <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-purple-900/40">
                <label className="text-purple-300 font-bold flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Period 1 (Primary Epoch)</span>
                </label>
                <select
                  value={overlayEpoch1}
                  onChange={(e) => setOverlayEpoch1(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-700 text-slate-100 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-purple-500"
                >
                  {EPOCH_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period 2 Selector */}
              <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-rose-900/40">
                <label className="text-rose-300 font-bold flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Period 2 (Overlay Baseline Epoch)</span>
                </label>
                <select
                  value={overlayEpoch2}
                  onChange={(e) => setOverlayEpoch2(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-700 text-slate-100 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-rose-500"
                >
                  {EPOCH_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Pair Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-bold">Quick Comparison Presets:</span>
              <button
                onClick={() => {
                  setOverlayEpoch1('MAY_2024_SOLAR');
                  setOverlayEpoch2('DEC_2023_FRB');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-[11px] transition"
              >
                ☀️ May 2024 Solar Storm vs 📻 Dec 2023 FRB
              </button>
              <button
                onClick={() => {
                  setOverlayEpoch1('LIVE');
                  setOverlayEpoch2('MAY_2024_SOLAR');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-[11px] transition"
              >
                🔴 Live Stream vs ☀️ May 2024 Solar Storm
              </button>
              <button
                onClick={() => {
                  setOverlayEpoch1('LIVE');
                  setOverlayEpoch2('HISTORICAL_1H');
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 text-[11px] transition"
              >
                🔴 Live Stream vs ⏱️ 1H Quiet Horizon
              </button>
            </div>
          </div>
        )}

        {/* Current Values Ribbon (Single Mode or Overlay Comparative Mode) */}
        {!isOverlayMode ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-indigo-900/50 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase">{aLabel}</span>
              <div className="text-lg font-bold text-indigo-300">{latestPoint.streamAVal}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/50 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase">{bLabel}</span>
              <div className="text-lg font-bold text-cyan-300">{latestPoint.streamBVal}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/50 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase">Coupling Z-Score</span>
              <div className={`text-lg font-bold ${latestPoint.couplingZScore >= zCutoffThreshold ? 'text-emerald-400' : 'text-amber-400'}`}>
                z = {latestPoint.couplingZScore}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-400 text-[10px] uppercase">Layer 1 Status</span>
              <div className={`text-sm font-bold ${latestPoint.couplingZScore >= zCutoffThreshold ? 'text-emerald-400' : 'text-slate-400'}`}>
                {latestPoint.couplingZScore >= zCutoffThreshold ? '⚡ PASSED (Signal)' : 'NOISE / NULL'}
              </div>
            </div>
          </div>
        ) : (
          overlayStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs animate-fade-in">
              <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/50 space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase">P1 ({overlayStats.p1Label}) Peak Z</span>
                <div className="text-lg font-bold text-purple-300">z = {overlayStats.peakZ1.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/50 space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase">P2 ({overlayStats.p2Label}) Peak Z</span>
                <div className="text-lg font-bold text-rose-300">z = {overlayStats.peakZ2.toFixed(2)}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/50 space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase">Peak Ratio (P1 / P2)</span>
                <div className="text-lg font-bold text-amber-300">{overlayStats.peakRatio}x</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/50 space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase">Max Divergence Step</span>
                <div className="text-sm font-bold text-cyan-300">
                  {overlayStats.maxDivergenceStep.stepLabel} (Δz = {overlayStats.maxDivergenceStep.zDelta > 0 ? `+${overlayStats.maxDivergenceStep.zDelta}` : overlayStats.maxDivergenceStep.zDelta})
                </div>
              </div>
            </div>
          )
        )}

        {/* Recharts Multi-Epoch Overlay Chart Plot */}
        <div className="h-80 w-full pt-2">
          {isOverlayMode ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overlayMergedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorZScoreP1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorZScoreP2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="stepLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#c084fc" tick={{ fontSize: 11 }} domain={[0, 20]} />
                {overlayMetricFocus === 'ALL_STREAMS' && (
                  <YAxis yAxisId="right" orientation="right" stroke="#818cf8" tick={{ fontSize: 11 }} />
                )}
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any, name: any) => {
                    const p1Name = overlayStats?.p1Label || 'Period 1';
                    const p2Name = overlayStats?.p2Label || 'Period 2';

                    if (name === 'zScore_p1') return [`z = ${value}`, `Coupling Z-Score (${p1Name})`];
                    if (name === 'zScore_p2') return [`z = ${value}`, `Coupling Z-Score (${p2Name})`];
                    if (name === 'streamA_p1') return [value, `Stream A (${p1Name})`];
                    if (name === 'streamA_p2') return [value, `Stream A (${p2Name})`];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Normalized Time: ${label}`}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <ReferenceLine 
                  yAxisId="left" 
                  y={zCutoffThreshold} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ value: `|Z| = ${zCutoffThreshold.toFixed(1)} Cutoff`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} 
                />

                {/* Period 1 Coupling Z-Score (Solid Purple) */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="zScore_p1"
                  name={`Z-Score (${overlayStats?.p1Label || 'Period 1'})`}
                  stroke="#c084fc"
                  fillOpacity={1}
                  fill="url(#colorZScoreP1)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#c084fc' }}
                />

                {/* Period 2 Coupling Z-Score (Dashed Rose) */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="zScore_p2"
                  name={`Z-Score (${overlayStats?.p2Label || 'Period 2'})`}
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorZScoreP2)"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#f43f5e' }}
                />

                {/* Optional Stream A Overlays */}
                {overlayMetricFocus === 'ALL_STREAMS' && (
                  <>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="streamA_p1"
                      name={`Stream A (${overlayStats?.p1Label || 'Period 1'})`}
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="streamA_p2"
                      name={`Stream A (${overlayStats?.p2Label || 'Period 2'})`}
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : displayedFluxData.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs font-mono">
              No timepoints match the current signal filter cutoff (z = {zCutoffThreshold.toFixed(1)}).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedFluxData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStreamA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorStreamB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#818cf8" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#c084fc" tick={{ fontSize: 11 }} domain={[0, 20]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'streamAVal') return [value, aLabel];
                    if (name === 'streamBVal') return [value, bLabel];
                    if (name === 'couplingZScore') return [`z = ${value}`, 'Coupling Z-Score'];
                    return [value, name];
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <ReferenceLine 
                  yAxisId="right" 
                  y={zCutoffThreshold} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ value: `|Z| = ${zCutoffThreshold.toFixed(1)} Null Threshold`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} 
                />
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="streamAVal"
                  name="Stream A Input"
                  stroke="#818cf8"
                  fillOpacity={1}
                  fill="url(#colorStreamA)"
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="streamBVal"
                  name="Stream B Input"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorStreamB)"
                  strokeWidth={2}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="couplingZScore"
                  name="Coupling Z-Score"
                  stroke="#c084fc"
                  fill="transparent"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#c084fc' }}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Pipeline Flow Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                PIPELINE {selectedEngine.code}
              </span>
              <span className="text-xs font-mono text-slate-400">{selectedEngine.subtitle}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedEngine.title} Matrix</h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Status: {selectedEngine.status}
          </span>
        </div>

        {/* Stream Coupling Interactive Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950/80 p-5 rounded-xl border border-slate-800">
          {/* Stream A */}
          <div className="p-4 rounded-lg bg-slate-900 border border-indigo-900/60 space-y-2">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              INPUT STREAM A
            </span>
            <div className="text-xs font-bold text-slate-100">{selectedEngine.streamA}</div>
          </div>

          {/* Intersecting Analytical Tool */}
          <div className="p-4 rounded-lg bg-purple-950/60 border border-purple-700/60 space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2 text-purple-300">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">ANALYTICAL MODULE</span>
            </div>
            <div className="text-xs font-mono text-purple-200 font-semibold">{selectedEngine.analyticalTool}</div>
          </div>

          {/* Stream B */}
          <div className="p-4 rounded-lg bg-slate-900 border border-cyan-900/60 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              INPUT STREAM B
            </span>
            <div className="text-xs font-bold text-slate-100">{selectedEngine.streamB}</div>
          </div>
        </div>

        {/* Primary Hypothesis & Theoretical Model */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
            Primary Physical / Mathematical Hypothesis
          </h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {selectedEngine.primaryHypothesis}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
            Engine Output Metrics & Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedEngine.keyMetrics.map((km, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{km}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

