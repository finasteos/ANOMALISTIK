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
import { Cpu, Activity, ArrowRightLeft, ShieldCheck, Sparkles, Layers, Zap, Play, Pause, RefreshCw, BarChart2, Filter, Calendar, Sliders, GitCompare, Split, Compass, Microscope, Atom, Compass as CompassIcon } from 'lucide-react';
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

// 3D Isometric / 2D Phase Velocity & Refraction HTML5 Canvas Visualizer
interface THzCanvasProps {
  bismuthThickness: number;
  zincThickness: number;
  nReal: number;
  isNegative: boolean;
  pumpFreq: number;
}

const THzWaveCanvas: React.FC<THzCanvasProps> = ({
  bismuthThickness,
  zincThickness,
  nReal,
  isNegative,
  pumpFreq
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05 * (pumpFreq / 2.0);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw Air / Incident Medium (Top half)
      const midY = h * 0.45;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, midY);

      // Draw Layered Metamaterial Stack (Bottom half)
      const stackHeight = h - midY;
      const totalThick = bismuthThickness + zincThickness;
      const biRatio = bismuthThickness / totalThick;

      const numLayers = 12;
      const layerH = stackHeight / numLayers;

      for (let i = 0; i < numLayers; i++) {
        const y = midY + i * layerH;
        const isBi = i % 2 === 0;
        
        ctx.fillStyle = isBi ? '#3b0764' : '#083344'; // Bismuth (purple) vs Zinc (cyan)
        ctx.fillRect(0, y, w, layerH * (isBi ? biRatio * 1.8 : (1 - biRatio * 0.8)));

        // Layer boundaries
        ctx.strokeStyle = isBi ? '#a855f7' : '#06b6d4';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Interface line (Mid Y)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Surface normal line
      const normalX = w * 0.4;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(normalX, 20);
      ctx.lineTo(normalX, h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('VACUUM / INCIDENT MEDIUM (n = 1.0)', 15, 25);
      ctx.fillText(`METAMATERIAL STACK (Bi: ${bismuthThickness}µm / Zn: ${zincThickness}µm)`, 15, midY + 20);

      // Incident Ray (From top left to normal at interface)
      const incStartX = normalX - 110;
      const incStartY = midY - 110;

      ctx.strokeStyle = '#f59e0b'; // Amber incident ray
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(incStartX, incStartY);
      ctx.lineTo(normalX, midY);
      ctx.stroke();

      // Refracted Ray (Inside Metamaterial)
      // Snell's Law: sin(theta_t) = sin(theta_i) / n
      const thetaI = Math.PI / 4; // 45 deg incident
      const sinThetaT = Math.sin(thetaI) / (Math.abs(nReal) || 1.0);
      const thetaT = Math.asin(Math.min(0.95, Math.max(-0.95, sinThetaT)));

      // If n is negative, wave bends to SAME side of normal line (-thetaT)
      const refractionAngle = isNegative ? -thetaT : thetaT;
      const refrLen = 140;
      const refrEndX = normalX + Math.sin(refractionAngle) * refrLen;
      const refrEndY = midY + Math.cos(refractionAngle) * refrLen;

      ctx.strokeStyle = isNegative ? '#10b981' : '#f59e0b'; // Green for negative refraction
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(normalX, midY);
      ctx.lineTo(refrEndX, refrEndY);
      ctx.stroke();

      // Draw Animated Wavefronts along rays
      const wavefrontSpacing = 16;
      ctx.lineWidth = 1.5;

      // Incident wavefronts
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      for (let d = (time * 15) % wavefrontSpacing; d < 140; d += wavefrontSpacing) {
        const wx = normalX - Math.sin(thetaI) * d;
        const wy = midY - Math.cos(thetaI) * d;
        const perpX = Math.cos(thetaI) * 12;
        const perpY = -Math.sin(thetaI) * 12;

        ctx.beginPath();
        ctx.moveTo(wx - perpX, wy - perpY);
        ctx.lineTo(wx + perpX, wy + perpY);
        ctx.stroke();
      }

      // Refracted wavefronts (Reverse phase velocity if n < 0)
      const waveSpeed = isNegative ? -15 : 15;
      ctx.strokeStyle = isNegative ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.6)';
      for (let d = Math.abs((time * waveSpeed) % wavefrontSpacing); d < 130; d += wavefrontSpacing) {
        const wx = normalX + Math.sin(refractionAngle) * d;
        const wy = midY + Math.cos(refractionAngle) * d;
        const perpX = Math.cos(refractionAngle) * 12;
        const perpY = -Math.sin(refractionAngle) * 12;

        ctx.beginPath();
        ctx.moveTo(wx - perpX, wy - perpY);
        ctx.lineTo(wx + perpX, wy + perpY);
        ctx.stroke();
      }

      // Refraction Arrow Indicator
      ctx.fillStyle = isNegative ? '#10b981' : '#f59e0b';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        isNegative ? `n(ω) = ${nReal} < 0 (Phase Reversed)` : `n(ω) = ${nReal} > 0`,
        refrEndX - 40,
        refrEndY + 15
      );

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [bismuthThickness, zincThickness, nReal, isNegative, pumpFreq]);

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={650} 
        height={240} 
        className="w-full h-[240px] rounded-lg block"
      />
    </div>
  );
};

export const MEnginesSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [activeTab, setActiveTab] = useState<'CORRELATION_ENGINES' | 'METAMATERIAL_SOLVER'>('CORRELATION_ENGINES');
  const [selectedEngine, setSelectedEngine] = useState<MEngine>(M_ENGINES[0]);
  const [eventPreset, setEventPreset] = useState<string>('LIVE'); // 'LIVE' | 'MAY_2024_SOLAR' | 'DEC_2023_FRB' | 'HISTORICAL_1H'
  const [fluxData, setFluxData] = useState<EntropyPoint[]>(() => generateInitialFluxData(M_ENGINES[0].id, 'LIVE'));
  const [isLive, setIsLive] = useState<boolean>(true);

  // Metamaterial THz Waveguide State Parameters (Skinwalker Mesa / Art's Parts)
  const [bismuthThickness, setBismuthThickness] = useState<number>(2.0); // 1-4 um
  const [zincThickness, setZincThickness] = useState<number>(150.0); // 100-200 um
  const [pumpFreqTHz, setPumpFreqTHz] = useState<number>(1.6); // THz pump
  const [temperatureK, setTemperatureK] = useState<number>(293); // Kelvin
  const [magneticBField, setMagneticBField] = useState<number>(3.5); // Tesla


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

  // Metamaterial THz Solver physics calculations (Effective Medium Theory & Hyperbolic Dispersion)
  const metamaterialResults = useMemo(() => {
    const f = bismuthThickness / (bismuthThickness + zincThickness);
    
    // Drude-Lorentz model parameters for Bi and Zn in THz regime
    const omegaP_Bi = 1.9; // THz plasma frequency
    const gammaBi = 0.15; // THz damping
    const omegaP_Zn = 12.0; // THz plasma frequency
    const gammaZn = 1.2; // THz damping

    // Dielectric functions
    const epsBi = 1.0 - Math.pow(omegaP_Bi, 2) / (Math.pow(pumpFreqTHz, 2) + Math.pow(gammaBi, 2)) - (temperatureK / 300) * 1.2;
    const epsZn = 1.0 - Math.pow(omegaP_Zn, 2) / (Math.pow(pumpFreqTHz, 2) + Math.pow(gammaZn, 2));

    // Parallel and Perpendicular effective medium permittivity
    const epsParallel = f * epsBi + (1 - f) * epsZn;
    const epsPerp = (epsBi * epsZn) / (f * epsZn + (1 - f) * epsBi);

    const muEff = 1.0 - 0.05 * magneticBField * (bismuthThickness / 2.0);
    const nReal = epsParallel < 0 ? -Math.sqrt(Math.abs(epsParallel) * Math.abs(muEff)) : Math.sqrt(Math.abs(epsParallel) * Math.abs(muEff));
    const isHyperbolic = (epsParallel * epsPerp) < 0;
    const isNegativeRefraction = nReal < 0;

    let hyperbolicType = 'ISOTROPIC / ELLIPTIC (ε_∥ > 0, ε_⊥ > 0)';
    if (epsParallel > 0 && epsPerp < 0) {
      hyperbolicType = 'TYPE I HYPERBOLIC (ε_∥ > 0, ε_⊥ < 0) • Extreme Spatial Confinement';
    } else if (epsParallel < 0 && epsPerp > 0) {
      hyperbolicType = 'TYPE II HYPERBOLIC (ε_∥ < 0, ε_⊥ > 0) • Broadband Negative Refraction';
    } else if (epsParallel < 0 && epsPerp < 0) {
      hyperbolicType = 'METALLIC REFLECTIVE (ε_∥ < 0, ε_⊥ < 0)';
    }

    const levitationPressureKPa = (Math.pow(magneticBField, 2) / (2 * 4 * Math.PI * 1e-7)) * Math.abs(epsParallel / (epsPerp || 0.001)) * 1e-6;
    const evanescentGainDb = Number((Math.min(45, 8.68 * (2 * Math.PI * pumpFreqTHz / 0.3) * (bismuthThickness * 1e-3))).toFixed(1));

    const dispersionCurve = [];
    for (let freq = 0.1; freq <= 10.0; freq += 0.25) {
      const eBi = 1.0 - Math.pow(omegaP_Bi, 2) / (Math.pow(freq, 2) + Math.pow(gammaBi, 2)) - (temperatureK / 300) * 1.2;
      const eZn = 1.0 - Math.pow(omegaP_Zn, 2) / (Math.pow(freq, 2) + Math.pow(gammaZn, 2));
      const ePar = f * eBi + (1 - f) * eZn;
      const ePrp = (eBi * eZn) / (f * eZn + (1 - f) * eBi);
      const nVal = ePar < 0 ? -Math.sqrt(Math.abs(ePar) * Math.abs(muEff)) : Math.sqrt(Math.abs(ePar) * Math.abs(muEff));

      dispersionCurve.push({
        freqTHz: Number(freq.toFixed(2)),
        epsParallel: Number(ePar.toFixed(2)),
        epsPerp: Number(Math.max(-50, Math.min(50, ePrp)).toFixed(2)),
        nReal: Number(nVal.toFixed(2)),
        transmittance: Number(Math.max(0, Math.min(100, 100 - Math.abs(nVal) * 12)).toFixed(1))
      });
    }

    return {
      fFraction: Number((f * 100).toFixed(2)),
      epsParallel: Number(epsParallel.toFixed(2)),
      epsPerp: Number(epsPerp.toFixed(2)),
      nReal: Number(nReal.toFixed(2)),
      isHyperbolic,
      isNegativeRefraction,
      hyperbolicType,
      levitationPressureKPa: Number(levitationPressureKPa.toFixed(2)),
      evanescentGainDb,
      dispersionCurve
    };
  }, [bismuthThickness, zincThickness, pumpFreqTHz, temperatureK, magneticBField]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Module Sub-Navigation Bar */}
      <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('CORRELATION_ENGINES')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'CORRELATION_ENGINES'
              ? 'bg-purple-600 text-slate-950 shadow-lg shadow-purple-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Cross-Domain Correlation Engines (M1–M4)</span>
        </button>

        <button
          onClick={() => setActiveTab('METAMATERIAL_SOLVER')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'METAMATERIAL_SOLVER'
              ? 'bg-purple-600 text-slate-950 shadow-lg shadow-purple-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hyperbolic Metamaterial THz Solver (Mesa &amp; Art&apos;s Parts)</span>
        </button>
      </div>

      {activeTab === 'METAMATERIAL_SOLVER' ? (
        /* METAMATERIAL THZ SOLVER PANEL */
        <div className="space-y-8 animate-fade-in">
          {/* Metamaterial Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 font-mono">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
              <Microscope className="w-4 h-4 text-purple-400" />
              <span>Anomalistics Physics Module • Layered Metamaterial Engine (#8 &amp; #4)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Bismuth-Zinc Hyperbolic Waveguide &amp; THz Refraction Solver
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Simulating the electromagnetic and plasmonic dispersion properties of alternating Bismuth (1–4 µm) 
              and Zinc (100–200 µm) micro-layers, matching core sample fragments recovered from the Skinwalker Ranch mesa 
              and Art Bell&apos;s mystery metal samples (&quot;Art&apos;s Parts&quot;).
            </p>
          </div>

          {/* Interactive Parameters Controls & Real-Time Output Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
            {/* Input Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">Layer Geometry &amp; Pump Inputs</h2>
              </div>

              {/* Bismuth Thickness Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Bismuth (Bi) Layer Thickness</span>
                  <span className="text-purple-300 font-bold">{bismuthThickness.toFixed(1)} µm</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={bismuthThickness}
                  onChange={(e) => setBismuthThickness(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Typical mesa core sample: 1.0–4.0 µm</span>
              </div>

              {/* Zinc Thickness Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Zinc (Zn) Matrix Thickness</span>
                  <span className="text-cyan-300 font-bold">{zincThickness.toFixed(0)} µm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={zincThickness}
                  onChange={(e) => setZincThickness(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Typical matrix width: 100–200 µm</span>
              </div>

              {/* Pump Frequency Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">THz Pump Frequency (f)</span>
                  <span className="text-amber-300 font-bold">{pumpFreqTHz.toFixed(1)} THz</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={pumpFreqTHz}
                  onChange={(e) => setPumpFreqTHz(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Resonant band: 1.6 THz / 1.6 GHz coupling</span>
              </div>

              {/* Magnetic B-Field Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">External B-Field Pulse</span>
                  <span className="text-emerald-300 font-bold">{magneticBField.toFixed(1)} Tesla</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="10.0"
                  step="0.5"
                  value={magneticBField}
                  onChange={(e) => setMagneticBField(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Outputs & Waveguide Status */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <Atom className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Plasmonic Dispersion &amp; Refraction Results</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {metamaterialResults.hyperbolicType}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    metamaterialResults.isNegativeRefraction ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {metamaterialResults.isNegativeRefraction ? '⚡ NEGATIVE REFRACTION (n < 0)' : 'POSITIVE REFRACTION'}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Permittivity ε_∥</span>
                  <div className={`text-base font-bold ${metamaterialResults.epsParallel < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {metamaterialResults.epsParallel}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Permittivity ε_⊥</span>
                  <div className={`text-base font-bold ${metamaterialResults.epsPerp < 0 ? 'text-cyan-400' : 'text-slate-200'}`}>{metamaterialResults.epsPerp}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Refractive Index n(ω)</span>
                  <div className={`text-base font-bold ${metamaterialResults.nReal < 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {metamaterialResults.nReal}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Levitation Pressure</span>
                  <div className="text-base font-bold text-purple-300">{metamaterialResults.levitationPressureKPa} kPa</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Evanescent Gain</span>
                  <div className="text-base font-bold text-emerald-400">+{metamaterialResults.evanescentGainDb} dB</div>
                </div>
              </div>

              {/* Dispersion Curve Chart */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase">THz Dispersion Curve: n(ω) vs Transmittance</h3>
                <div className="h-56 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metamaterialResults.dispersionCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="freqTHz" stroke="#64748b" label={{ value: 'Frequency (THz)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#f59e0b" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                      <Area type="monotone" dataKey="nReal" name="Refractive Index n(ω)" stroke="#f59e0b" fill="url(#colorNReal)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3D Wave Propagation & Layered Waveguide Canvas Visualizer */}
              <div className="space-y-2 pt-4 border-t border-slate-800 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase">3D Real-Time Phase Velocity &amp; Refraction Visualizer</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Layer Stack: Bi ({bismuthThickness} µm) / Zn ({zincThickness} µm)</span>
                </div>
                
                <THzWaveCanvas 
                  bismuthThickness={bismuthThickness}
                  zincThickness={zincThickness}
                  nReal={metamaterialResults.nReal}
                  isNegative={metamaterialResults.isNegativeRefraction}
                  pumpFreq={pumpFreqTHz}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ORIGINAL CORRELATION ENGINES PANEL */
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
        </div>
      )}
    </div>
  );
};


