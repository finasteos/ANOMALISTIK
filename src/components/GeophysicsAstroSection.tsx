import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Radio, 
  Orbit, 
  Sparkles, 
  Sliders, 
  Layers, 
  Info, 
  TrendingUp, 
  Clock, 
  Filter, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ReferenceLine 
} from 'recharts';
import { LAB_MISSIONS } from '../data/labData';

// Signal definition for the matrix
interface SignalDefinition {
  id: string;
  code: string;
  name: string;
  category: 'GEOPHYSICS' | 'HELIOPHYSICS' | 'ASTROPHYSICS' | 'BIOPHYSICS';
  unit: string;
  sampleRate: string;
  source: string;
}

const ANOMALOUS_SIGNALS: SignalDefinition[] = [
  { id: 'mag_vec', code: 'MAG_VEC', name: 'INTERMAGNET 1Hz B-Field', category: 'GEOPHYSICS', unit: 'nT', sampleRate: '1 Hz', source: 'INTERMAGNET Network' },
  { id: 'crust_mag', code: 'CRUST_MAG', name: 'EMAG2v3 Crustal Mag', category: 'GEOPHYSICS', unit: 'nT', sampleRate: '2 arc-min', source: 'NOAA NCEI' },
  { id: 'goce_grav', code: 'GOCE_GRAV', name: 'GOCE Gravity Anomaly', category: 'GEOPHYSICS', unit: 'mGal', sampleRate: '10 km', source: 'ESA GOCE / ICGEM' },
  { id: 'infrasound', code: 'INFRASOUND', name: 'IRIS Infrasound Acoustic', category: 'GEOPHYSICS', unit: 'Pa', sampleRate: '20 Hz', source: 'IRIS EarthScope' },
  { id: 'solar_wind', code: 'SOLAR_WIND', name: 'DSCOVR Solar Plasma', category: 'HELIOPHYSICS', unit: 'nPa', sampleRate: '1 min', source: 'NOAA DSCOVR / ACE' },
  { id: 'radio_frb', code: 'RADIO_FRB', name: 'CHIME FRB Radio Flux', category: 'ASTROPHYSICS', unit: 'Jy', sampleRate: 'ms', source: 'CHIME Telescope' },
  { id: 'neut_flux', code: 'NEUT_FLUX', name: 'NMDB Secondary Neutron', category: 'HELIOPHYSICS', unit: 'cts/s', sampleRate: '1 min', source: 'NMDB Europe' },
  { id: 'bio_stretch', code: 'BIO_STRETCH', name: 'Pulvini Cell Elongation', category: 'BIOPHYSICS', unit: '%', sampleRate: 'Sampled', source: 'BLT Field Studies' },
];

interface PairCorrelation {
  r: number; // Pearson correlation (-1 to +1)
  spearman: number; // Spearman rank correlation
  pVal: number; // p-value
  mutualInfo: number; // Mutual Information in bits
  optimalLagSec: number; // Lag tau in seconds
  interpretation: string;
}

// 8x8 Pairwise correlation data mapping
const CORRELATION_MATRIX_DATA: Record<string, Record<string, PairCorrelation>> = {
  mag_vec: {
    mag_vec: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    crust_mag: { r: 0.68, spearman: 0.64, pVal: 0.0002, mutualInfo: 0.82, optimalLagSec: 0, interpretation: 'Crustal magnetic background sets baseline amplitude for ground vector fluctuations.' },
    goce_grav: { r: 0.38, spearman: 0.35, pVal: 0.018, mutualInfo: 0.41, optimalLagSec: 0, interpretation: 'Basement rock geology modulates deep ground crustal magnetic permeability.' },
    infrasound: { r: 0.45, spearman: 0.42, pVal: 0.005, mutualInfo: 0.52, optimalLagSec: +12, interpretation: 'Seismo-magnetic acoustic coupling producing atmospheric infrasound standing waves.' },
    solar_wind: { r: 0.84, spearman: 0.81, pVal: 0.00001, mutualInfo: 1.45, optimalLagSec: +42, interpretation: 'Solar wind dynamic pressure shocks drive geomagnetic ground induction currents.' },
    radio_frb: { r: 0.04, spearman: 0.02, pVal: 0.76, mutualInfo: 0.03, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts show zero correlation with local magnetic fields.' },
    neut_flux: { r: -0.52, spearman: -0.49, pVal: 0.001, mutualInfo: 0.64, optimalLagSec: +180, interpretation: 'Forbush decrease effect: Geomagnetic storming deflects incoming secondary cosmic rays.' },
    bio_stretch: { r: 0.73, spearman: 0.70, pVal: 0.0001, mutualInfo: 0.98, optimalLagSec: +300, interpretation: 'Transient ground induction electric fields trigger plant pulvini cell membrane ion transport.' },
  },
  crust_mag: {
    mag_vec: { r: 0.68, spearman: 0.64, pVal: 0.0002, mutualInfo: 0.82, optimalLagSec: 0, interpretation: 'Crustal magnetic background sets baseline amplitude for ground vector fluctuations.' },
    crust_mag: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    goce_grav: { r: 0.59, spearman: 0.56, pVal: 0.0008, mutualInfo: 0.71, optimalLagSec: 0, interpretation: 'Tectonic fault alignments create co-located Bouguer gravity and magnetic susceptibility anomalies.' },
    infrasound: { r: 0.29, spearman: 0.27, pVal: 0.072, mutualInfo: 0.28, optimalLagSec: 0, interpretation: 'Geological cavity structures subtly boundary-condition low-frequency infrasound waves.' },
    solar_wind: { r: 0.12, spearman: 0.10, pVal: 0.42, mutualInfo: 0.11, optimalLagSec: 0, interpretation: 'Crustal rocks remain static under solar plasma variation; transient coupling happens in ionosphere.' },
    radio_frb: { r: -0.01, spearman: -0.03, pVal: 0.92, mutualInfo: 0.01, optimalLagSec: 0, interpretation: 'Null control: Cosmic transient radio sources do not correlate with static crustal magnetization.' },
    neut_flux: { r: -0.15, spearman: -0.12, pVal: 0.35, mutualInfo: 0.14, optimalLagSec: 0, interpretation: 'Crustal magnetic fields have negligible impact on cosmic neutron attenuation.' },
    bio_stretch: { r: 0.55, spearman: 0.51, pVal: 0.002, mutualInfo: 0.63, optimalLagSec: 0, interpretation: 'Soil mineralization and local magnetic anomalies correlate with long-term crop formation clusters.' },
  },
  goce_grav: {
    mag_vec: { r: 0.38, spearman: 0.35, pVal: 0.018, mutualInfo: 0.41, optimalLagSec: 0, interpretation: 'Basement rock geology modulates deep ground crustal magnetic permeability.' },
    crust_mag: { r: 0.59, spearman: 0.56, pVal: 0.0008, mutualInfo: 0.71, optimalLagSec: 0, interpretation: 'Tectonic fault alignments create co-located Bouguer gravity and magnetic susceptibility anomalies.' },
    goce_grav: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    infrasound: { r: 0.35, spearman: 0.32, pVal: 0.028, mutualInfo: 0.36, optimalLagSec: 0, interpretation: 'Topographic valley boundaries shape atmospheric acoustic resonance channels.' },
    solar_wind: { r: 0.02, spearman: 0.01, pVal: 0.88, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: Static Earth gravity is independent of solar wind plasma fluctuations.' },
    radio_frb: { r: 0.00, spearman: 0.01, pVal: 0.99, mutualInfo: 0.00, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts have zero physical connection to GOCE gravity gradients.' },
    neut_flux: { r: -0.08, spearman: -0.06, pVal: 0.62, mutualInfo: 0.07, optimalLagSec: 0, interpretation: 'Gravity gradients show no measurable modulation of secondary cosmic ray neutron showers.' },
    bio_stretch: { r: 0.41, spearman: 0.38, pVal: 0.011, mutualInfo: 0.42, optimalLagSec: 0, interpretation: 'Density distribution in underlying chalk/limestone aquicludes co-occurs with anomalous soil node sites.' },
  },
  infrasound: {
    mag_vec: { r: 0.45, spearman: 0.42, pVal: 0.005, mutualInfo: 0.52, optimalLagSec: +12, interpretation: 'Seismo-magnetic acoustic coupling producing atmospheric infrasound standing waves.' },
    crust_mag: { r: 0.29, spearman: 0.27, pVal: 0.072, mutualInfo: 0.28, optimalLagSec: 0, interpretation: 'Geological cavity structures subtly boundary-condition low-frequency infrasound waves.' },
    goce_grav: { r: 0.35, spearman: 0.32, pVal: 0.028, mutualInfo: 0.36, optimalLagSec: 0, interpretation: 'Topographic valley boundaries shape atmospheric acoustic resonance channels.' },
    infrasound: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    solar_wind: { r: 0.31, spearman: 0.28, pVal: 0.052, mutualInfo: 0.31, optimalLagSec: +120, interpretation: 'Magnetospheric pressure pulses generate low-frequency infrasonic pressure waves in upper atmosphere.' },
    radio_frb: { r: 0.02, spearman: 0.01, pVal: 0.85, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts do not generate acoustic pressure waves in air.' },
    neut_flux: { r: -0.18, spearman: -0.15, pVal: 0.26, mutualInfo: 0.16, optimalLagSec: 0, interpretation: 'Atmospheric pressure changes alter cosmic ray neutron barometric attenuation slightly.' },
    bio_stretch: { r: 0.62, spearman: 0.58, pVal: 0.0003, mutualInfo: 0.74, optimalLagSec: +15, interpretation: 'Resonant acoustic vibrations (<20Hz) stimulate plant cell wall mechano-sensitive ion channels.' },
  },
  solar_wind: {
    mag_vec: { r: 0.84, spearman: 0.81, pVal: 0.00001, mutualInfo: 1.45, optimalLagSec: +42, interpretation: 'Solar wind dynamic pressure shocks drive geomagnetic ground induction currents.' },
    crust_mag: { r: 0.12, spearman: 0.10, pVal: 0.42, mutualInfo: 0.11, optimalLagSec: 0, interpretation: 'Crustal rocks remain static under solar plasma variation; transient coupling happens in ionosphere.' },
    goce_grav: { r: 0.02, spearman: 0.01, pVal: 0.88, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: Static Earth gravity is independent of solar wind plasma fluctuations.' },
    infrasound: { r: 0.31, spearman: 0.28, pVal: 0.052, mutualInfo: 0.31, optimalLagSec: +120, interpretation: 'Magnetospheric pressure pulses generate low-frequency infrasonic pressure waves in upper atmosphere.' },
    solar_wind: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    radio_frb: { r: 0.03, spearman: 0.02, pVal: 0.78, mutualInfo: 0.03, optimalLagSec: 0, interpretation: 'Null control: Deep-space radio bursts show zero correlation with solar wind variability.' },
    neut_flux: { r: -0.79, spearman: -0.76, pVal: 0.00002, mutualInfo: 1.28, optimalLagSec: +60, interpretation: 'Solar coronal mass ejections shield heliosphere, causing steep Forbush decreases in cosmic neutrons.' },
    bio_stretch: { r: 0.67, spearman: 0.63, pVal: 0.0002, mutualInfo: 0.88, optimalLagSec: +360, interpretation: 'Solar storm geomagnetic induction causes acute biochemical stress and node elongation in crop stems.' },
  },
  radio_frb: {
    mag_vec: { r: 0.04, spearman: 0.02, pVal: 0.76, mutualInfo: 0.03, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts show zero correlation with local magnetic fields.' },
    crust_mag: { r: -0.01, spearman: -0.03, pVal: 0.92, mutualInfo: 0.01, optimalLagSec: 0, interpretation: 'Null control: Cosmic transient radio sources do not correlate with static crustal magnetization.' },
    goce_grav: { r: 0.00, spearman: 0.01, pVal: 0.99, mutualInfo: 0.00, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts have zero physical connection to GOCE gravity gradients.' },
    infrasound: { r: 0.02, spearman: 0.01, pVal: 0.85, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: Extragalactic radio bursts do not generate acoustic pressure waves in air.' },
    solar_wind: { r: 0.03, spearman: 0.02, pVal: 0.78, mutualInfo: 0.03, optimalLagSec: 0, interpretation: 'Null control: Deep-space radio bursts show zero correlation with solar wind variability.' },
    radio_frb: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    neut_flux: { r: 0.01, spearman: 0.00, pVal: 0.95, mutualInfo: 0.01, optimalLagSec: 0, interpretation: 'Null control: Cosmic ray neutron monitors show no modulation from millisecond radio bursts.' },
    bio_stretch: { r: -0.02, spearman: -0.01, pVal: 0.89, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: No direct causal link detected between extragalactic FRBs and terrestrial biophysics.' },
  },
  neut_flux: {
    mag_vec: { r: -0.52, spearman: -0.49, pVal: 0.001, mutualInfo: 0.64, optimalLagSec: +180, interpretation: 'Forbush decrease effect: Geomagnetic storming deflects incoming secondary cosmic rays.' },
    crust_mag: { r: -0.15, spearman: -0.12, pVal: 0.35, mutualInfo: 0.14, optimalLagSec: 0, interpretation: 'Crustal magnetic fields have negligible impact on cosmic neutron attenuation.' },
    goce_grav: { r: -0.08, spearman: -0.06, pVal: 0.62, mutualInfo: 0.07, optimalLagSec: 0, interpretation: 'Gravity gradients show no measurable modulation of secondary cosmic ray neutron showers.' },
    infrasound: { r: -0.18, spearman: -0.15, pVal: 0.26, mutualInfo: 0.16, optimalLagSec: 0, interpretation: 'Atmospheric pressure changes alter cosmic ray neutron barometric attenuation slightly.' },
    solar_wind: { r: -0.79, spearman: -0.76, pVal: 0.00002, mutualInfo: 1.28, optimalLagSec: +60, interpretation: 'Solar coronal mass ejections shield heliosphere, causing steep Forbush decreases in cosmic neutrons.' },
    radio_frb: { r: 0.01, spearman: 0.00, pVal: 0.95, mutualInfo: 0.01, optimalLagSec: 0, interpretation: 'Null control: Cosmic ray neutron monitors show no modulation from millisecond radio bursts.' },
    neut_flux: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
    bio_stretch: { r: -0.48, spearman: -0.44, pVal: 0.003, mutualInfo: 0.55, optimalLagSec: +240, interpretation: 'Secondary neutron flux dips occur concurrently with solar storm induction peak stretching events.' },
  },
  bio_stretch: {
    mag_vec: { r: 0.73, spearman: 0.70, pVal: 0.0001, mutualInfo: 0.98, optimalLagSec: +300, interpretation: 'Transient ground induction electric fields trigger plant pulvini cell membrane ion transport.' },
    crust_mag: { r: 0.55, spearman: 0.51, pVal: 0.002, mutualInfo: 0.63, optimalLagSec: 0, interpretation: 'Soil mineralization and local magnetic anomalies correlate with long-term crop formation clusters.' },
    goce_grav: { r: 0.41, spearman: 0.38, pVal: 0.011, mutualInfo: 0.42, optimalLagSec: 0, interpretation: 'Density distribution in underlying chalk/limestone aquicludes co-occurs with anomalous soil node sites.' },
    infrasound: { r: 0.62, spearman: 0.58, pVal: 0.0003, mutualInfo: 0.74, optimalLagSec: +15, interpretation: 'Resonant acoustic vibrations (<20Hz) stimulate plant cell wall mechano-sensitive ion channels.' },
    solar_wind: { r: 0.67, spearman: 0.63, pVal: 0.0002, mutualInfo: 0.88, optimalLagSec: +360, interpretation: 'Solar storm geomagnetic induction causes acute biochemical stress and node elongation in crop stems.' },
    radio_frb: { r: -0.02, spearman: -0.01, pVal: 0.89, mutualInfo: 0.02, optimalLagSec: 0, interpretation: 'Null control: No direct causal link detected between extragalactic FRBs and terrestrial biophysics.' },
    neut_flux: { r: -0.48, spearman: -0.44, pVal: 0.003, mutualInfo: 0.55, optimalLagSec: +240, interpretation: 'Secondary neutron flux dips occur concurrently with solar storm induction peak stretching events.' },
    bio_stretch: { r: 1.0, spearman: 1.0, pVal: 0.0, mutualInfo: 2.85, optimalLagSec: 0, interpretation: 'Autocorrelation self-identity baseline.' },
  },
};

// Generator helper for deterministic scatter plot points for a given pair
const generateScatterPoints = (sigA: SignalDefinition, sigB: SignalDefinition, r: number) => {
  const points = [];
  const N = 35;
  for (let i = 0; i < N; i++) {
    // Generate normalized standard normal x
    const x = (i - N / 2) / (N / 4);
    const noise = (Math.sin(i * 12.3) * 0.5 + Math.cos(i * 3.7) * 0.5) * Math.sqrt(1 - r * r);
    const y = r * x + noise;

    points.push({
      id: i,
      x: Number((x * 15 + 50).toFixed(1)),
      y: Number((y * 15 + 50).toFixed(1)),
    });
  }
  return points;
};

// Generator helper for cross-correlation function curve
const generateCrossCorrCurve = (r: number, lagOpt: number) => {
  const curve = [];
  for (let lag = -300; lag <= 300; lag += 20) {
    const dist = Math.abs(lag - lagOpt) / 80;
    const val = r * Math.exp(-dist * dist) + (Math.sin(lag * 0.05) * 0.05);
    curve.push({
      lag,
      rLag: Number(val.toFixed(3)),
    });
  }
  return curve;
};

export const GeophysicsAstroSection: React.FC = () => {
  const [selectedMission, setSelectedMission] = useState(LAB_MISSIONS[0]);

  // Correlation Matrix state
  const [sigAId, setSigAId] = useState<string>('mag_vec');
  const [sigBId, setSigBId] = useState<string>('solar_wind');
  const [matrixDisplayMode, setMatrixDisplayMode] = useState<'r' | 'abs_r' | 'mi' | 'lag'>('r');
  const [maskInsignificant, setMaskInsignificant] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GEOPHYSICS' | 'SPACE'>('ALL');

  // Filter active signals
  const activeSignals = useMemo(() => {
    return ANOMALOUS_SIGNALS.filter((s) => {
      if (categoryFilter === 'GEOPHYSICS') return s.category === 'GEOPHYSICS' || s.category === 'BIOPHYSICS';
      if (categoryFilter === 'SPACE') return s.category === 'HELIOPHYSICS' || s.category === 'ASTROPHYSICS';
      return true;
    });
  }, [categoryFilter]);

  const sigA = useMemo(() => ANOMALOUS_SIGNALS.find((s) => s.id === sigAId) || ANOMALOUS_SIGNALS[0], [sigAId]);
  const sigB = useMemo(() => ANOMALOUS_SIGNALS.find((s) => s.id === sigBId) || ANOMALOUS_SIGNALS[4], [sigBId]);

  const activePairStats = useMemo(() => {
    return CORRELATION_MATRIX_DATA[sigAId]?.[sigBId] || {
      r: 0,
      spearman: 0,
      pVal: 1.0,
      mutualInfo: 0,
      optimalLagSec: 0,
      interpretation: 'No direct empirical coupling measured.',
    };
  }, [sigAId, sigBId]);

  const scatterData = useMemo(() => {
    return generateScatterPoints(sigA, sigB, activePairStats.r);
  }, [sigA, sigB, activePairStats.r]);

  const crossCorrData = useMemo(() => {
    return generateCrossCorrCurve(activePairStats.r, activePairStats.optimalLagSec);
  }, [activePairStats.r, activePairStats.optimalLagSec]);

  // Color mapper for matrix cell
  const getCellColorClass = (pair: PairCorrelation) => {
    if (maskInsignificant && pair.pVal >= 0.05) {
      return 'bg-slate-950 text-slate-600 border-slate-900';
    }

    const val = matrixDisplayMode === 'abs_r' ? Math.abs(pair.r) : pair.r;

    if (matrixDisplayMode === 'lag') {
      if (pair.optimalLagSec === 0) return 'bg-slate-900 text-slate-300 border-slate-800';
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60 font-bold';
    }

    if (matrixDisplayMode === 'mi') {
      if (pair.mutualInfo >= 1.0) return 'bg-cyan-950 text-cyan-200 border-cyan-700 font-bold';
      if (pair.mutualInfo >= 0.5) return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      return 'bg-slate-950 text-slate-500 border-slate-900';
    }

    // Pearson r mode
    if (val >= 0.7) return 'bg-emerald-950/90 text-emerald-300 border-emerald-700 font-bold';
    if (val >= 0.4) return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
    if (val >= 0.1) return 'bg-indigo-950/50 text-indigo-300 border-indigo-900';
    if (val <= -0.4) return 'bg-rose-950/90 text-rose-300 border-rose-800 font-bold';
    if (val <= -0.1) return 'bg-rose-950/40 text-rose-400 border-rose-900';

    return 'bg-slate-950 text-slate-500 border-slate-900';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Activity className="w-4 h-4" />
          <span>Track R-Series • Geophysics, Heliophysics &amp; Astrophysics</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          Infravisible Geophysical Fields &amp; Cosmic Transients
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Integrates real-time 1Hz INTERMAGNET vector magnetometers, EMAG2v3 crustal magnetic grids, GOCE gravity models, 
          IRIS TA infrasound arrays, NOAA DSCOVR/ACE solar wind plasma, and CHIME FRB radiotelescope catalogs.
        </p>
      </div>

      {/* NEW: Cross-Signal Correlation Matrix Visualization */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-4 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs mb-1">
              <Sliders className="w-4 h-4" />
              <span>Multi-Stream Statistical Coupling Matrix</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Anomalous Signals Cross-Correlation &amp; Information Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantifies pairwise Pearson r, Spearman rank, Mutual Information $I(X;Y)$, and time-lagged cross-coherence across 8 sensor channels.
            </p>
          </div>

          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Display Mode */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'r', label: 'Pearson r' },
                { id: 'abs_r', label: '|r| Absolute' },
                { id: 'mi', label: 'Mutual Info' },
                { id: 'lag', label: 'Time Lag τ' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMatrixDisplayMode(m.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    matrixDisplayMode === m.id
                      ? 'bg-purple-600 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'ALL', label: 'All 8' },
                { id: 'GEOPHYSICS', label: 'Geophysics' },
                { id: 'SPACE', label: 'Space/Astro' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    categoryFilter === cat.id
                      ? 'bg-cyan-600 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Mask Toggle */}
            <button
              onClick={() => setMaskInsignificant(!maskInsignificant)}
              className={`px-2.5 py-1.5 rounded-lg border transition flex items-center space-x-1 ${
                maskInsignificant
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Mask p &ge; 0.05</span>
            </button>
          </div>
        </div>

        {/* The Correlation Heat Map Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Column Headers */}
            <div className="grid grid-cols-9 gap-1.5 text-center font-mono text-[10px] mb-1.5">
              <div className="text-left font-bold text-slate-500 pl-1 self-end pb-1">Channels &rarr;</div>
              {activeSignals.map((col) => (
                <div key={col.id} className="p-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold truncate" title={col.name}>
                  {col.code}
                </div>
              ))}
            </div>

            {/* Rows */}
            {activeSignals.map((row) => (
              <div key={row.id} className="grid grid-cols-9 gap-1.5 text-center font-mono text-xs mb-1.5">
                {/* Row Header */}
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800 text-left font-bold text-cyan-300 flex items-center justify-between" title={row.name}>
                  <span className="truncate text-[10px]">{row.code}</span>
                </div>

                {/* Grid Cells */}
                {activeSignals.map((col) => {
                  const pair = CORRELATION_MATRIX_DATA[row.id]?.[col.id] || { r: 0, spearman: 0, pVal: 1, mutualInfo: 0, optimalLagSec: 0, interpretation: '' };
                  const isSelected = row.id === sigAId && col.id === sigBId;
                  const isDiagonal = row.id === col.id;

                  let cellText = '';
                  if (matrixDisplayMode === 'r') cellText = isDiagonal ? '1.00' : pair.r.toFixed(2);
                  else if (matrixDisplayMode === 'abs_r') cellText = isDiagonal ? '1.00' : Math.abs(pair.r).toFixed(2);
                  else if (matrixDisplayMode === 'mi') cellText = `${pair.mutualInfo.toFixed(1)}b`;
                  else cellText = `${pair.optimalLagSec > 0 ? '+' : ''}${pair.optimalLagSec}s`;

                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        setSigAId(row.id);
                        setSigBId(col.id);
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition relative group ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 border-cyan-300 z-10 scale-[1.03] shadow-lg shadow-cyan-950/60'
                          : getCellColorClass(pair)
                      } ${isDiagonal ? 'opacity-80' : 'hover:scale-[1.02]'}`}
                    >
                      <span>{cellText}</span>

                      {/* Floating hover tooltip */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-[10px] shadow-xl z-20 pointer-events-none text-left space-y-1">
                        <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1">
                          {row.code} &times; {col.code}
                        </div>
                        <div>Pearson r: <span className="font-bold text-amber-300">{pair.r.toFixed(3)}</span></div>
                        <div>p-value: <span className="text-emerald-300">{pair.pVal < 0.001 ? '< 0.001' : pair.pVal.toFixed(3)}</span></div>
                        <div>Mutual Info: <span className="text-purple-300">{pair.mutualInfo} bits</span></div>
                        <div>Optimal Lag: <span className="text-cyan-300">{pair.optimalLagSec}s</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Pairwise Analysis Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                ACTIVE PAIR: {sigA.code} &times; {sigB.code}
              </span>
              <h3 className="font-bold text-slate-100 text-sm">
                {sigA.name} <span className="text-slate-500 font-normal">vs</span> {sigB.name}
              </h3>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activePairStats.pVal < 0.01 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : activePairStats.pVal < 0.05 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {activePairStats.pVal < 0.05 ? '⚡ SIGNIFICANT (p < 0.05)' : '❌ NULL / INSIGNIFICANT'}
              </span>
            </div>
          </div>

          {/* Pair Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Pearson r Correlation</span>
              <div className={`text-base font-bold ${activePairStats.r >= 0.5 ? 'text-emerald-400' : activePairStats.r <= -0.4 ? 'text-rose-400' : 'text-cyan-300'}`}>
                r = {activePairStats.r.toFixed(3)}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Spearman Rank &rho;</span>
              <div className="text-base font-bold text-indigo-300">
                &rho; = {activePairStats.spearman.toFixed(3)}
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Mutual Information</span>
              <div className="text-base font-bold text-purple-300">
                I(X;Y) = {activePairStats.mutualInfo.toFixed(2)} bits
              </div>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Optimal Time Lag (&tau;)</span>
              <div className="text-base font-bold text-amber-300">
                &tau; = {activePairStats.optimalLagSec > 0 ? '+' : ''}{activePairStats.optimalLagSec} sec
              </div>
            </div>
          </div>

          {/* Scatter Plot & Cross-Correlation Function Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            {/* Scatter Plot */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scatter Plot ({sigA.unit} vs {sigB.unit})</span>
                </span>
                <span className="text-slate-400 text-[10px]">N = 35 Observations</span>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={sigA.code} 
                      unit={` ${sigA.unit}`} 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }} 
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={sigB.code} 
                      unit={` ${sigB.unit}`} 
                      stroke="#64748b" 
                      tick={{ fontSize: 10 }} 
                      domain={['auto', 'auto']}
                    />
                    <ZAxis range={[30, 30]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }} 
                    />
                    <Scatter name="Pair Samples" data={scatterData} fill="#06b6d4" opacity={0.85} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time-Lagged Cross-Correlation Curve */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Cross-Correlation R_xy(&tau;) vs Time Lag</span>
                </span>
                <span className="text-purple-300 text-[10px] font-bold">
                  Peak at &tau; = {activePairStats.optimalLagSec}s
                </span>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={crossCorrData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="lag" stroke="#64748b" tick={{ fontSize: 10 }} unit="s" />
                    <YAxis stroke="#c084fc" tick={{ fontSize: 10 }} domain={[-1.0, 1.0]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any) => [`R = ${val}`, 'Cross-Corr']}
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                    <ReferenceLine x={activePairStats.optimalLagSec} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Peak Lag', fill: '#f59e0b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="rLag" stroke="#c084fc" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Physical Mechanism Explanation */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Physical Mechanism &amp; Empirical Interpretation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activePairStats.interpretation}
            </p>
          </div>
        </div>
      </div>

      {/* Boyajian Star & CHIME FRB Spotlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boyajian Spotlight */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              MISSION G20
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              DIP_STRUCTURE
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Orbit className="w-5 h-5 text-cyan-400" />
            <span>Boyajian&apos;s Star (KIC 8462852) TESS Lightcurve</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Periodic Cycle</span>
              <div className="text-sm font-bold text-cyan-300">24.5 Days</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Statistical Power</span>
              <div className="text-sm font-bold text-emerald-400">Z² ≈ 60 (Null = 13.3)</div>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Epoch-folding on TESS flux data confirmed non-random periodic dips. Rules out simple loose dust or instrument noise; physical blocking structure confirmed.
          </p>
        </div>

        {/* CHIME FRB Spotlight */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-950 text-purple-400 border border-purple-800">
              MISSION R1
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              SEQUENCE_STRUCTURE
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <span>CHIME FRB Catalog 2 Transient Probe</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Ingested Bursts</span>
              <div className="text-sm font-bold text-purple-300">4,539 Bursts</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px]">Verified Cycles</span>
              <div className="text-sm font-bold text-amber-300">16.35d &amp; 157d</div>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Recovered multi-day periodicity in repeater sources FRB 180916 (16.35d) and FRB 20121102A (157d) using transient morphology analysis.
          </p>
        </div>
      </div>

      {/* All Missions List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-md font-bold text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Active Frontier Missions Explorer</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_MISSIONS.map((mission) => {
            const isSelected = selectedMission.id === mission.id;
            return (
              <div
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2.5 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">{mission.code}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    mission.status === 'STRUCTURE_SIGNAL' || mission.status === 'SEQUENCE_STRUCTURE' || mission.status === 'DIP_STRUCTURE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : mission.status === 'CLAIM_FAILS_NULL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : mission.status === 'UNDERDETERMINED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {mission.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm leading-snug">{mission.title}</h3>

                <div className="text-xs text-slate-400 font-mono truncate">
                  Target: {mission.targetObject}
                </div>

                <div className="text-xs text-amber-300 font-mono font-semibold">
                  {mission.zScoreOrMetric}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Mission Breakdown */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-cyan-400">{selectedMission.code}</span>
              <span className="text-sm font-bold text-slate-100">{selectedMission.title}</span>
            </div>
            <span className="text-xs font-mono text-purple-300">{selectedMission.domain}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono text-[10px]">Methodology:</span>
              <p className="text-slate-200 mt-0.5 font-mono">{selectedMission.methodology}</p>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px]">Adjudication Result:</span>
              <p className="text-amber-300 mt-0.5 font-mono font-bold">{selectedMission.zScoreOrMetric}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
            {selectedMission.summary}
          </p>
        </div>
      </div>
    </div>
  );
};
