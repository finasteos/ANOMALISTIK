import React, { useState, useMemo } from 'react';
import { Database, ShieldAlert, CheckCircle2, XCircle, Flame, Layers, Award, Radio, Activity, Zap, Brain, Sliders, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BIOPHYSICAL_MARKERS } from '../data/labData';
import { useTheme } from '../ThemeContext';

export const BiophysicsSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [activeTab, setActiveTab] = useState<'BLT_MARKERS' | 'RF_BIO_EXPOSURE' | 'QUANTUM_ORCH_OR' | 'EVOLUTIONARY_PROBABILITY_EPE'>('BLT_MARKERS');
  const [selectedMarker, setSelectedMarker] = useState(BIOPHYSICAL_MARKERS[0]);

  // Tab 2: 1.6 GHz RF Bio-Thermal & Bio-Impact State (#16)
  const [rfPowermWcm2, setRfPowermWcm2] = useState<number>(12.5); // 0.1 to 50 mW/cm2
  const [pulseWidthUs, setPulseWidthUs] = useState<number>(100); // 1 to 500 us
  const [pulseRepHz, setPulseRepHz] = useState<number>(500); // 10 to 1000 Hz
  const [exposureDurationSec, setExposureDurationSec] = useState<number>(30); // 1 to 120 sec

  // Tab 3: Microtubule Orch-OR Quantum Coherence State (#9)
  const [dmtConcuM, setDmtConcuM] = useState<number>(25.0); // 0 to 100 uM
  const [tubulinPolarization, setTubulinPolarization] = useState<number>(0.85); // 0.1 to 1.0
  const [neuralTempC, setNeuralTempC] = useState<number>(37.0); // 36.5 to 39.5 C

  // Tab 4: Evolutionary Probability Equation (EPE) & Search Space Mechanics (#2)
  const [proteinLength, setProteinLength] = useState<number>(300); // 50 to 500 amino acids
  const [guidedAttractorPct, setGuidedAttractorPct] = useState<number>(55); // 0 to 100% constraint
  const [foldViabilityDecades, setFoldViabilityDecades] = useState<number>(-77); // 10^-77 Axe baseline
  const [mutationAdvantagePct, setMutationAdvantagePct] = useState<number>(0.1); // 0.01% to 5.0%

  // Calculation for Evolutionary Probability Equation (EPE)
  const epeResults = useMemo(() => {
    // Sequence space S = 20^N = 10^(N * log10(20)) = 10^(N * 1.30103)
    const sequenceSpaceDecades = Number((proteinLength * 1.30103).toFixed(1));
    
    // Max physical universe trials: 10^80 baryons * 4.35e17 s (13.8 Gyr) * 10^15 interactions/s = 10^112.64
    const maxUniversalTrialsDecades = 112.64;

    // Unguided Probability deficit (log10)
    const unguidedLogDeficit = Number((maxUniversalTrialsDecades - sequenceSpaceDecades + foldViabilityDecades).toFixed(1));
    
    // Guided search reduction factor
    const guidedReductionDecades = Number(((sequenceSpaceDecades - Math.abs(foldViabilityDecades) * 0.5) * (guidedAttractorPct / 100)).toFixed(1));
    const guidedNetLogProb = Number(Math.min(0, unguidedLogDeficit + guidedReductionDecades).toFixed(1));

    // Emergence Time required
    let emergenceTimeYears = '> 10^300 Universe Lifespans';
    if (guidedNetLogProb >= -20) {
      emergenceTimeYears = '~ 3.8 x 10^8 Years (Prebiotic Window PASS)';
    } else if (guidedNetLogProb >= -50) {
      emergenceTimeYears = '~ 4.2 x 10^9 Years (Borderline Planetary Age)';
    }

    // Sequence length sweep (50 to 450 amino acids)
    const spaceCurve = [];
    for (let len = 50; len <= 450; len += 25) {
      const spaceDec = len * 1.30103;
      const unguidedDef = 112.64 - spaceDec + foldViabilityDecades;
      const guidedDef = Math.min(0, unguidedDef + (spaceDec * (guidedAttractorPct / 100)));

      spaceCurve.push({
        proteinLength: len,
        searchSpaceDecades: Number(spaceDec.toFixed(0)),
        unguidedLogDeficit: Number(unguidedDef.toFixed(0)),
        guidedLogProb: Number(guidedDef.toFixed(0)),
      });
    }

    return {
      sequenceSpaceDecades,
      maxUniversalTrialsDecades,
      unguidedLogDeficit,
      guidedNetLogProb,
      emergenceTimeYears,
      isUnguidedImpossible: unguidedLogDeficit < -100,
      spaceCurve
    };
  }, [proteinLength, guidedAttractorPct, foldViabilityDecades, mutationAdvantagePct]);

  // Calculation for 1.6 GHz RF Bio-Thermal Depth Profile
  const rfResults = useMemo(() => {
    // 1.610 GHz SAR attenuation constants in tissue (skin, muscle, brain)
    const sarSkinPeak = rfPowermWcm2 * 2.8 * (pulseWidthUs / 100);
    const sarMusclePeak = sarSkinPeak * 0.65;
    const sarBrainPeak = sarSkinPeak * 0.35;

    // Frey Effect thermoelastic acoustic pressure (Pa) = Gruneisen * absorption * energy_density
    const acousticPressurePa = Number((rfPowermWcm2 * 0.12 * pulseWidthUs).toFixed(1));
    const isFreyAudible = acousticPressurePa > 20.0; // 20 Pa threshold

    // Temperature rise Delta T (C) = (SAR * t) / C_p
    const deltaTSkin = Number(((sarSkinPeak * exposureDurationSec) / 3800).toFixed(2));
    const isCellularDamage = deltaTSkin > 2.5;

    // SAR Depth Profile Data Points (0 to 50 mm)
    const sarDepthProfile = [];
    for (let depthMm = 0; depthMm <= 50; depthMm += 2) {
      let tissueType = 'Skin';
      let attenFactor = Math.exp(-depthMm / 8.0);
      if (depthMm > 5 && depthMm <= 20) {
        tissueType = 'Muscle';
        attenFactor = Math.exp(-depthMm / 12.0) * 0.8;
      } else if (depthMm > 20) {
        tissueType = 'Brain';
        attenFactor = Math.exp(-depthMm / 16.0) * 0.5;
      }

      const sarVal = Number((sarSkinPeak * attenFactor).toFixed(2));
      const dTVal = Number(((sarVal * exposureDurationSec) / 3800).toFixed(2));

      sarDepthProfile.push({
        depthMm,
        sarVal,
        dTVal,
        tissueType
      });
    }

    return {
      sarSkinPeak: Number(sarSkinPeak.toFixed(1)),
      sarBrainPeak: Number(sarBrainPeak.toFixed(1)),
      acousticPressurePa,
      isFreyAudible,
      deltaTSkin,
      isCellularDamage,
      sarDepthProfile
    };
  }, [rfPowermWcm2, pulseWidthUs, exposureDurationSec]);

  // Calculation for Microtubule Orch-OR Quantum Coherence
  const orchOrResults = useMemo(() => {
    // Baseline tau_0 = 25 ns at 37C
    const tempFactor = Math.exp(-(neuralTempC - 37.0) / 2.0);
    const tauCoherenceUs = Number((0.025 * (1 + 0.18 * dmtConcuM) * tubulinPolarization * tempFactor).toFixed(3));
    
    // Non-Local RV SNR (dB) = 20 * log10(tau_coherence / tau_baseline)
    const rvSnrDb = Number((20 * Math.log10(Math.max(1, tauCoherenceUs / 0.025))).toFixed(1));
    const stateSpaceAccess = rvSnrDb > 15.0 ? 'HIGH NON-LOCAL ACCESSIBILITY' : rvSnrDb > 6.0 ? 'MODERATE COHERENCE' : 'BASELINE CLASSICAL';

    // Concentration Curve (0 to 100 uM)
    const concCurve = [];
    for (let c = 0; c <= 100; c += 5) {
      const tau = Number((0.025 * (1 + 0.18 * c) * tubulinPolarization * tempFactor).toFixed(3));
      const snr = Number((20 * Math.log10(Math.max(1, tau / 0.025))).toFixed(1));

      concCurve.push({
        dmtuM: c,
        tauCoherenceUs: tau,
        rvSnrDb: snr
      });
    }

    return {
      tauCoherenceUs,
      rvSnrDb,
      stateSpaceAccess,
      concCurve
    };
  }, [dmtConcuM, tubulinPolarization, neuralTempC]);

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Top Module Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('BLT_MARKERS')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'BLT_MARKERS'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>BLT Cellular Plant &amp; Soil</span>
        </button>

        <button
          onClick={() => setActiveTab('RF_BIO_EXPOSURE')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'RF_BIO_EXPOSURE'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>1.6 GHz Bio-Thermal &amp; Frey (#16)</span>
        </button>

        <button
          onClick={() => setActiveTab('QUANTUM_ORCH_OR')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'QUANTUM_ORCH_OR'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Microtubule Orch-OR (#9)</span>
        </button>

        <button
          onClick={() => setActiveTab('EVOLUTIONARY_PROBABILITY_EPE')}
          className={`flex-1 min-w-[170px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'EVOLUTIONARY_PROBABILITY_EPE'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Evolutionary Probability EPE (#2)</span>
        </button>
      </div>

      {activeTab === 'EVOLUTIONARY_PROBABILITY_EPE' ? (
        /* TAB 4: EVOLUTIONARY PROBABILITY EQUATION (EPE) & TELEOLOGICAL SEARCH ENGINE (#2) */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Biophysics &amp; Information Theory • Evolutionary Probability Equation (EPE / #2)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">
              Evolutionary Probability Equation &amp; Combinatorial Search Space Solver
            </h1>
            <p className="text-slate-300 text-xs font-sans leading-relaxed max-w-4xl">
              Adapted from the Drake Equation structure (<code className="font-mono text-amber-300">P_evolution = C_r × P_v × E_s × M_s × G_m × T_max</code>). 
              Evaluates the chronological probability deficit between unguided molecular random walks ($20^N$ sequence space) vs. guided target attractor matrices across deep time.
            </p>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Sequence Space</span>
              <div className="text-lg font-black text-purple-400">
                10^{epeResults.sequenceSpaceDecades}
              </div>
              <div className="text-[10px] text-slate-500">20^{proteinLength} Combinations</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Universal Particle Trials</span>
              <div className="text-lg font-black text-cyan-400">
                10^{epeResults.maxUniversalTrialsDecades}
              </div>
              <div className="text-[10px] text-slate-500">10^80 Baryons × 13.8 Gyr</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Unguided Probability Deficit</span>
              <div className="text-lg font-black text-rose-400">
                10^{epeResults.unguidedLogDeficit}
              </div>
              <div className="text-[10px] text-rose-300 font-bold">
                {epeResults.isUnguidedImpossible ? '● CHRONOLOGICAL IMPOSSIBILITY' : 'BORDERLINE DEFICIT'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Guided Net Probability</span>
              <div className="text-lg font-black text-emerald-400">
                10^{epeResults.guidedNetLogProb}
              </div>
              <div className="text-[10px] text-emerald-300 font-bold">{epeResults.emergenceTimeYears}</div>
            </div>
          </div>

          {/* Interactive Parameters Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-amber-400">Sequence &amp; Constraint Inputs</span>
                <span className="text-[10px] text-slate-400">EPE Parameters</span>
              </div>

              {/* Protein Chain Length */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Protein Length (N Amino Acids)</span>
                  <span className="text-purple-300 font-bold">{proteinLength} aa</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="450"
                  step="10"
                  value={proteinLength}
                  onChange={(e) => setProteinLength(parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Standard enzyme/protein: 300 aa (20^300 = 10^390)</span>
              </div>

              {/* Guided Search Constraint */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Guided Intent Constraint (f_target)</span>
                  <span className="text-emerald-300 font-bold">{guidedAttractorPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={guidedAttractorPct}
                  onChange={(e) => setGuidedAttractorPct(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Topological sequence pruning &amp; teleological guide</span>
              </div>

              {/* Functional Fold Viability */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Functional Fold Viability (P_v)</span>
                  <span className="text-amber-300 font-bold">10^{foldViabilityDecades}</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="-20"
                  step="1"
                  value={foldViabilityDecades}
                  onChange={(e) => setFoldViabilityDecades(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Axe 2004 empirical fold baseline: 10^-77</span>
              </div>
            </div>

            {/* Log Probability Chart: Unguided Deficit vs Guided Attractor */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-slate-100">Log10 Probability Deficit across Protein Length</span>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="flex items-center space-x-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Unguided Deficit</span>
                  </span>
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Guided Intent</span>
                  </span>
                </div>
              </div>

              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={epeResults.spaceCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="proteinLength" stroke="#64748b" label={{ value: 'Protein Chain Length (Amino Acids)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" domain={[-500, 10]} tick={{ fontSize: 10 }} label={{ value: 'Log10 Probability (Decades)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                    <ReferenceLine y={0} stroke="#10b981" strokeDasharray="2 2" label={{ value: 'Certainty (P=1.0)', fill: '#10b981', fontSize: 9 }} />
                    <ReferenceLine y={-100} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Universal Particle Limit', fill: '#f43f5e', fontSize: 9 }} />
                    <Area type="monotone" dataKey="unguidedLogDeficit" name="Unguided Deficit (log10)" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="guidedLogProb" name="Guided Intent (log10)" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                <strong>Combinatorial Explosion Verdict:</strong> An unguided search for a 300-aa functional protein requires navigating a <code className="font-mono text-purple-300">10^390</code> sequence space. 
                Even if every particle in the observable universe (<code className="font-mono text-cyan-300">10^80</code>) conducted a chemical trial every femtosecond (<code className="font-mono text-amber-300">10^15 s^-1</code>) for 13.8 billion years, 
                fewer than <code className="font-mono text-cyan-300">10^113</code> trials could ever occur, leaving a probability deficit exceeding <code className="font-mono text-rose-400">10^-350</code>. Introducing guided structural constraints collapses the sequence space to physically viable timescales.
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'RF_BIO_EXPOSURE' ? (
        /* TAB 2: 1.6 GHz RF BIO-THERMAL & FREY EFFECT ANALYZER (#16) */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Biophysics Module • 1.6 GHz Narrowband Bio-Exposure Engine (#16)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              1.6 GHz Microwave Bio-Thermal Depth &amp; Frey Effect Analyzer
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Modeling Specific Absorption Rate (SAR) depth profiles, acoustic thermoelastic pressure wave generation (Frey Effect), 
              and micro-vascular cellular thermal damage resulting from pulsed 1.610–1.625 GHz electromagnetic exposure observed at Skinwalker Ranch.
            </p>
          </div>

          {/* Interactive Controls & Live Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Input Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">1.6 GHz Pulse Inputs</h2>
              </div>

              {/* RF Power Density Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">RF Power Density (S)</span>
                  <span className="text-amber-300 font-bold">{rfPowermWcm2.toFixed(1)} mW/cm²</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="50.0"
                  step="0.5"
                  value={rfPowermWcm2}
                  onChange={(e) => setRfPowermWcm2(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Safety limit: 1.0 mW/cm²</span>
              </div>

              {/* Pulse Width Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Pulse Width (t_p)</span>
                  <span className="text-cyan-300 font-bold">{pulseWidthUs} µs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  step="10"
                  value={pulseWidthUs}
                  onChange={(e) => setPulseWidthUs(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Exposure Duration Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Exposure Duration</span>
                  <span className="text-emerald-300 font-bold">{exposureDurationSec} sec</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="5"
                  value={exposureDurationSec}
                  onChange={(e) => setExposureDurationSec(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Outputs */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Tissue Impact &amp; Auditory Frey Thresholds</h2>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  rfResults.isFreyAudible ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {rfResults.isFreyAudible ? '🔊 FREY EFFECT AUDIBLE' : 'SUB-AUDIBLE'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Peak Skin SAR</span>
                  <div className="text-lg font-bold text-amber-300">{rfResults.sarSkinPeak} W/kg</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Brain SAR (20mm)</span>
                  <div className="text-lg font-bold text-cyan-300">{rfResults.sarBrainPeak} W/kg</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Thermoelastic Pressure</span>
                  <div className="text-lg font-bold text-emerald-400">{rfResults.acousticPressurePa} Pa</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Skin Temp Rise ΔT</span>
                  <div className={`text-lg font-bold ${rfResults.isCellularDamage ? 'text-rose-400' : 'text-slate-200'}`}>
                    +{rfResults.deltaTSkin} °C
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase">Tissue Depth vs SAR Absorption Profile</h3>
                <div className="h-64 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rfResults.sarDepthProfile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="depthMm" stroke="#64748b" label={{ value: 'Tissue Depth (mm)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#f59e0b" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <ReferenceLine x={5} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Skin/Muscle', fill: '#38bdf8', fontSize: 10 }} />
                      <ReferenceLine x={20} stroke="#c084fc" strokeDasharray="3 3" label={{ value: 'Muscle/Brain', fill: '#c084fc', fontSize: 10 }} />
                      <Area type="monotone" dataKey="sarVal" name="SAR (W/kg)" stroke="#f59e0b" fill="url(#colorSar)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'QUANTUM_ORCH_OR' ? (
        /* TAB 3: MICROTUBULE ORCH-OR QUANTUM COHERENCE & RV ENGINE (#9) */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Biophysics Module • Neuronal Microtubule Quantum Coherence Engine (#9)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Penrose-Hameroff Orch-OR &amp; Endogenous Tryptamine Coherence Solver
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Simulating quantum dipole superposition coherence times (τ_coherence) inside neuronal tubulin pockets as a function of 
              endogenous tryptamines (DMT / Tryptophan) to calculate non-local state space access and Remote Viewing SNR.
            </p>
          </div>

          {/* Interactive Controls & Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Input Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">Quantum Biophysics Inputs</h2>
              </div>

              {/* DMT Conc Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Endogenous DMT / Tryptamine ([C])</span>
                  <span className="text-purple-300 font-bold">{dmtConcuM.toFixed(1)} µM</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="100.0"
                  step="2.5"
                  value={dmtConcuM}
                  onChange={(e) => setDmtConcuM(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Baseline pineal cortex: ~1.0 µM</span>
              </div>

              {/* Tubulin Polarization Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Tubulin Dipole Order (P)</span>
                  <span className="text-cyan-300 font-bold">{tubulinPolarization.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={tubulinPolarization}
                  onChange={(e) => setTubulinPolarization(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Neural Temp Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Neural Temperature</span>
                  <span className="text-emerald-300 font-bold">{neuralTempC.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min="36.5"
                  max="39.5"
                  step="0.1"
                  value={neuralTempC}
                  onChange={(e) => setNeuralTempC(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Live Outputs */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Non-Local Coherence &amp; Remote Viewing State</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {orchOrResults.stateSpaceAccess}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Coherence Time τ</span>
                  <div className="text-lg font-bold text-purple-300">{orchOrResults.tauCoherenceUs} µs</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Non-Local RV SNR</span>
                  <div className="text-lg font-bold text-emerald-400">+{orchOrResults.rvSnrDb} dB</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 sm:col-span-1 col-span-2">
                  <span className="text-slate-400 text-[10px]">Decoherence Protection</span>
                  <div className="text-sm font-bold text-cyan-300">
                    {(tubulinPolarization * (1 + 0.18 * dmtConcuM)).toFixed(1)}x Baseline
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase">DMT Concentration vs Quantum Coherence Time (µs)</h3>
                <div className="h-64 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orchOrResults.concCurve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTau" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="dmtuM" stroke="#64748b" label={{ value: 'Tryptamine / DMT Concentration (µM)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#c084fc" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="tauCoherenceUs" name="Coherence Time (µs)" stroke="#c084fc" fill="url(#colorTau)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 1: ORIGINAL BLT CELLULAR PLANT & SOIL MARKERS */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
            isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
              <Database className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-amber-400'}`} />
              <span>Track A/B • Classical Anomalistics (BLT Fingerprint Suite)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              Biophysical &amp; Mineralogical Cellular Markers
            </h1>
            <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
              Cellular and morphological plant anomalies function as the lab&apos;s empirical &quot;first line of defense&quot;. 
              Cellular node stretching up to 214%, internal steam explosion cavities, and clay mineral XRD shifts cannot be 
              replicated by mechanical tools like planks and ropes.
            </p>
          </div>

          {/* Comparison Banner: Hoax vs Authentic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
              isLight ? 'bg-rose-50 border-rose-200 text-stone-900' : 'bg-rose-950/20 border-rose-900/50 text-slate-300'
            }`}>
              <div className="flex items-center space-x-2 text-rose-700 font-mono font-black text-sm uppercase tracking-wide">
                <XCircle className="w-5 h-5" />
                <span>Human Hoaxes (Planks &amp; Ropes)</span>
              </div>
              <ul className="space-y-1.5 text-xs font-sans">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>Bruised, broken, or crushed plant stems at ground contact</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>0% pulvini node elongation beyond natural gravitropism (&lt;20%)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>No expulsion cavities, no seed germination energy alteration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>No soil XRD clay crystal shifts or fused meteoric iron glaze</span>
                </li>
              </ul>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-stone-900' : 'bg-emerald-950/20 border-emerald-900/50 text-slate-300'
            }`}>
              <div className="flex items-center space-x-2 text-emerald-800 font-mono font-black text-sm uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5" />
                <span>Authentic Biophysical Anomalies</span>
              </div>
              <ul className="space-y-1.5 text-xs font-sans">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>100%–214% pulvini node elongation with intact vascular tissues</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Expulsion cavities driven by high-intensity microwave pulse heating</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Clay mineral crystallization changes (illite/smectite XRD order)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Magnetometer micro-bead deposits along plant nodes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Marker Catalogue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h2 className={`text-xs font-black uppercase tracking-wider font-mono ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                BLT Lab Marker Catalogue
              </h2>
              <div className="space-y-2">
                {BIOPHYSICAL_MARKERS.map((marker) => {
                  const isSelected = selectedMarker.id === marker.id;
                  return (
                    <div
                      key={marker.id}
                      onClick={() => setSelectedMarker(marker)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-sm ${
                        isSelected
                          ? isLight
                            ? 'bg-stone-900 text-stone-50 border-stone-900'
                            : 'bg-amber-950/40 border-amber-500/60 text-slate-100'
                          : isLight
                            ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-900'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected && isLight ? 'bg-stone-800 text-amber-400' : 'bg-stone-200 text-stone-800 dark:bg-slate-800 dark:text-amber-400'
                        }`}>
                          {marker.category}
                        </span>
                        <h3 className="font-bold text-sm">{marker.name}</h3>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <span className={isLight ? 'text-stone-600' : 'text-slate-400'}>
                          {marker.hoaxReplicationDifficulty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Marker Details */}
            <div className={`lg:col-span-2 rounded-2xl border p-6 space-y-6 shadow-sm ${
              isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}>
              <div className="flex items-start justify-between border-b pb-4 border-stone-200">
                <div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    isLight ? 'bg-stone-900 text-stone-50' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {selectedMarker.category.toUpperCase()} MARKER
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-wide mt-2">{selectedMarker.name}</h2>
                  <p className={`text-xs font-mono ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                    Replication Status: {selectedMarker.hoaxReplicationDifficulty}
                  </p>
                </div>
                <Award className="w-5 h-5 text-stone-900" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className={`p-3.5 rounded-xl border space-y-1 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
                  <span className="text-stone-500 text-[10px] uppercase font-bold">Anomalous Recorded Baseline</span>
                  <div className="text-sm font-bold text-emerald-600">{selectedMarker.anomalousBaseline}</div>
                </div>
                <div className={`p-3.5 rounded-xl border space-y-1 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'}`}>
                  <span className="text-stone-500 text-[10px] uppercase font-bold">Natural Control Baseline</span>
                  <div className="text-sm font-bold text-stone-600">{selectedMarker.naturalBaseline}</div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950/80 border-slate-800'}`}>
                <div className="text-xs font-bold uppercase tracking-wide">Physicochemical Mechanism</div>
                <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-stone-800' : 'text-slate-300'}`}>
                  {selectedMarker.mechanism}
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                isLight ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="font-black uppercase tracking-wide flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Key Field Studies &amp; Ingestion Records</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedMarker.caseStudies.map((cs, idx) => (
                    <span key={idx} className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      isLight ? 'bg-stone-200 text-stone-900 border border-stone-300' : 'bg-amber-950/60 border border-amber-800/60 text-amber-200'
                    }`}>
                      📍 {cs}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
