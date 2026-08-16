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
  AlertTriangle,
  Globe,
  Compass,
  ShieldAlert,
  Cpu,
  Camera,
  Flame,
  Atom,
  HardHat,
  History,
  FileText,
  Binary,
  Zap,
  ShieldCheck,
  Eye
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
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { useTheme } from '../ThemeContext';
import { LAB_MISSIONS } from '../data/labData';


// 3D Spatial Dome & Subsurface Mesa Anomaly Canvas Visualizer
interface SpatialCanvasProps {
  droneAltM: number;
  lidarBubbleActive: boolean;
  gpsJumpM: number;
  fröhlichCoherence: number;
}

const SpatialDomeMesaCanvas: React.FC<SpatialCanvasProps> = ({
  droneAltM,
  lidarBubbleActive,
  gpsJumpM,
  fröhlichCoherence
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.65);

      // Subsurface geology (Bottom 35%)
      const groundY = h * 0.65;
      const subGrad = ctx.createLinearGradient(0, groundY, 0, h);
      subGrad.addColorStop(0, '#1c1917');
      subGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = subGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Draw Mesa topography plateau
      const mesaLeftX = w * 0.25;
      const mesaRightX = w * 0.75;
      const mesaTopY = groundY - 55;

      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(mesaLeftX - 30, groundY);
      ctx.lineTo(mesaLeftX, mesaTopY);
      ctx.lineTo(mesaRightX, mesaTopY);
      ctx.lineTo(mesaRightX + 30, groundY);
      ctx.lineTo(w, groundY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mesa plateau label
      ctx.fillStyle = '#a8a29e';
      ctx.font = '10px monospace';
      ctx.fillText('SKINWALKER MESA TOPOGRAPHY', mesaLeftX + 20, mesaTopY - 10);

      // Subsurface 50m Anomaly Object (Cigar / Dome metal body at 43-53 ft depth)
      const anomalyX = w * 0.5;
      const anomalyY = groundY + 35;
      
      const glowGrad = ctx.createRadialGradient(anomalyX, anomalyY, 5, anomalyX, anomalyY, 45);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
      glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(anomalyX, anomalyY, 45, 0, Math.PI * 2);
      ctx.fill();

      // Core metallic dome body (50/50 Fe-Al 0% Ni)
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.ellipse(anomalyX, anomalyY, 35, 14, Math.PI / 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#e9d5ff';
      ctx.fillText('50m GPR ANOMALY (50/50 Fe-Al, 0% Ni)', anomalyX - 95, anomalyY + 28);

      // Vertical Drilling Shaft (496–500 ft void) & 1964 Coin Marker
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(anomalyX - 40, mesaTopY);
      ctx.lineTo(anomalyX - 40, groundY + 70);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f87171';
      ctx.fillText('Vertical Shaft (496-500ft: 1964 Coin)', anomalyX - 165, groundY + 68);

      // 2,000 ft LiDAR Suppression Bubble (Floating sphere above mesa)
      if (lidarBubbleActive) {
        const bubbleY = mesaTopY - 70;
        const bubbleR = 85;

        const bubbleGrad = ctx.createRadialGradient(anomalyX, bubbleY, 10, anomalyX, bubbleY, bubbleR);
        bubbleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        bubbleGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.35)');
        bubbleGrad.addColorStop(1, 'rgba(56, 189, 248, 0.7)');

        ctx.fillStyle = bubbleGrad;
        ctx.beginPath();
        ctx.arc(anomalyX, bubbleY, bubbleR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing LiDAR Ray reflections
        const rayAngle = time % (Math.PI * 2);
        const rayX = anomalyX + Math.cos(rayAngle) * bubbleR;
        const rayY = bubbleY + Math.sin(rayAngle) * bubbleR;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(anomalyX, bubbleY);
        ctx.lineTo(rayX, rayY);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.fillText('2,000 ft LiDAR Bubble Boundary', anomalyX - 75, bubbleY - bubbleR - 8);
      }

      // 3,271 ft Altitude Kill Line
      const killY = 35;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(30, killY);
      ctx.lineTo(w - 30, killY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f43f5e';
      ctx.fillText('3,271 ft AGL DRONE SOFTWARE KILL ALTITUDE', 35, killY - 6);

      // Active Drone Indicator
      const droneY = Math.max(killY, Math.min(mesaTopY - 10, killY + (1 - (droneAltM / 1250)) * (mesaTopY - 10 - killY)));
      const isKilled = droneAltM >= 997; // ~3271 ft

      ctx.fillStyle = isKilled ? '#ef4444' : '#34d399';
      ctx.beginPath();
      ctx.arc(w * 0.78, droneY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 10px monospace';
      ctx.fillText(
        isKilled ? `DRONE KILLED @ ${droneAltM * 3.28} ft (3271 ft Cutoff)` : `Drone Altitude: ${(droneAltM * 3.28).toFixed(0)} ft`,
        w * 0.78 - 70,
        droneY - 12
      );

      // GPS Jump displacement arrow
      if (gpsJumpM > 0) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.22, mesaTopY - 20);
        ctx.lineTo(w * 0.22, mesaTopY - 20 - gpsJumpM * 0.6);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`GPS Jump: +${gpsJumpM} ft Vertical`, w * 0.22 - 40, mesaTopY - 25 - gpsJumpM * 0.6);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [droneAltM, lidarBubbleActive, gpsJumpM, fröhlichCoherence]);

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={720} 
        height={310} 
        className="w-full h-[310px] rounded-lg block"
      />
    </div>
  );
};

// 3D Radiometric Infrared Portal & Navajo Geometry Canvas Visualizer (Mission G31)
interface InfraredPortalCanvasProps {
  portalDiameterFt: number;
  thermalDepressionC: number;
  infraredWavelengthUm: number;
  navajoAlignmentPct: number;
}

const InfraredPortalCanvas: React.FC<InfraredPortalCanvasProps> = ({
  portalDiameterFt,
  thermalDepressionC,
  infraredWavelengthUm,
  navajoAlignmentPct
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // FLIR Night Sky Background (Dark Indigo / Ironbow thermal)
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.6);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.7, '#090d16');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid coordinate lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 30; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const centerX = w * 0.5;
      const centerY = h * 0.5;
      const radiusPx = (portalDiameterFt / 50) * (h * 0.38);

      // 1. Concentric FLIR Thermal Radiometric Contours (Cold Negative Depression Core)
      for (let r = radiusPx; r > 10; r -= 12) {
        const norm = r / radiusPx;
        const alpha = 0.15 + (1 - norm) * 0.6;
        const pulseOffset = Math.sin(phase * 2 + norm * 5) * 4;

        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // Thermal Purple/Magenta
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, r + pulseOffset, (r + pulseOffset) * 0.88, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Negative Thermal Core Fill (Cold Vortex: Cyan / Deep Violet)
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radiusPx);
      coreGrad.addColorStop(0, 'rgba(6, 182, 212, 0.85)'); // -22C Cold Core (Cyan)
      coreGrad.addColorStop(0.4, 'rgba(147, 51, 234, 0.45)'); // Violet Transition
      coreGrad.addColorStop(0.8, 'rgba(236, 72, 153, 0.2)'); // Pink Fringe
      coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      // 3. Navajo Sand-Painting Threshold Geometry Overlays
      if (navajoAlignmentPct > 0) {
        const geomAlpha = navajoAlignmentPct / 100;
        ctx.strokeStyle = `rgba(245, 158, 11, ${geomAlpha * 0.9})`; // Sacred Amber/Ochre
        ctx.lineWidth = 1.5;

        // Four Sacred Cardinal Crosshairs (North, South, East, West Peaks)
        const crossExtent = radiusPx * 1.35;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX - crossExtent, centerY);
        ctx.lineTo(centerX + crossExtent, centerY);
        ctx.moveTo(centerX, centerY - crossExtent);
        ctx.lineTo(centerX, centerY + crossExtent);
        ctx.stroke();
        ctx.setLineDash([]);

        // Navajo Dual Yei Guardian Brackets
        const bracketAngle = Math.PI / 4;
        for (let i = 0; i < 4; i++) {
          const ang = phase * 0.2 + i * (Math.PI / 2);
          const bx = centerX + Math.cos(ang) * (radiusPx * 1.15);
          const by = centerY + Math.sin(ang) * (radiusPx * 1.15);

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeRect(bx - 6, by - 6, 12, 12);
        }

        // Center Sacred Spiraling Vortex glyph
        ctx.strokeStyle = `rgba(52, 211, 153, ${geomAlpha})`;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += 0.1) {
          const spiralR = (a / (Math.PI * 4)) * (radiusPx * 0.5);
          const sx = centerX + Math.cos(a + phase) * spiralR;
          const sy = centerY + Math.sin(a + phase) * spiralR;
          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      // 4. Real-Time Telemetry Annotations on Canvas
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`FLIR THERMAL RADIOMETRY • LWIR ${infraredWavelengthUm.toFixed(1)} µm`, 20, 25);
      
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`COLD CORE DEPRESSION: ${thermalDepressionC.toFixed(1)}°C (ΔT)`, 20, 42);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`NAVAJO ICONOGRAPHY CONCORDANCE: ${navajoAlignmentPct}% (Z = -9.2)`, 20, 59);

      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`PORTAL SPAN: ${portalDiameterFt.toFixed(1)} ft (${(portalDiameterFt * 0.3048).toFixed(1)} m)`, w - 240, 25);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [portalDiameterFt, thermalDepressionC, infraredWavelengthUm, navajoAlignmentPct]);

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={720} 
        height={320} 
        className="w-full h-[320px] rounded-lg block"
      />
    </div>
  );
};

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
  r: number;
  spearman: number;
  pVal: number;
  mutualInfo: number;
  optimalLagSec: number;
  interpretation: string;
}

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

const generateScatterPoints = (sigA: SignalDefinition, sigB: SignalDefinition, r: number) => {
  const points = [];
  const N = 35;
  for (let i = 0; i < N; i++) {
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
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [activeTab, setActiveTab] = useState<'CORRELATION_MATRIX' | 'SPATIAL_DOME_3271' | 'BLACK_HOLE_COSMOLOGY' | 'APOLLO_17_LUNAR' | 'SETI_ELLIPSOID_SN1987A' | 'INFRARED_PORTAL_NAVAJO'>('CORRELATION_MATRIX');
  const [selectedMission, setSelectedMission] = useState(LAB_MISSIONS[0]);

  // Tab 1: Correlation Matrix state
  const [sigAId, setSigAId] = useState<string>('mag_vec');
  const [sigBId, setSigBId] = useState<string>('solar_wind');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GEOPHYSICS' | 'SPACE'>('ALL');

  // Tab 5: SETI Ellipsoid (SN 1987A / Mission G30) State
  const [selectedSetiTargetId, setSelectedSetiTargetId] = useState<string>('tic_261136679');
  const [parallaxToleranceLy, setParallaxToleranceLy] = useState<number>(0.018); // ly (< 0.02 ly target)
  const [foldingPeriodDays, setFoldingPeriodDays] = useState<number>(2.45); // days
  const [dipDepthPct, setDipDepthPct] = useState<number>(1.85); // % optical flux drop
  const [astroJitterNoisePct, setAstroJitterNoisePct] = useState<number>(0.25); // % stellar baseline noise

  // Tab 6: 31-Foot Infrared Portal & Navajo Iconography (Mission G31) State
  const [portalDiameterFt, setPortalDiameterFt] = useState<number>(31.0);
  const [thermalDepressionC, setThermalDepressionC] = useState<number>(-22.5);
  const [infraredWavelengthUm, setInfraredWavelengthUm] = useState<number>(10.6); // 8-14 um LWIR band
  const [navajoAlignmentPct, setNavajoAlignmentPct] = useState<number>(94);
  const [flirGainDb, setFlirGainDb] = useState<number>(18.5);

  // Tab 2: 3,271 ft Spatial Dome & Skinwalker Mesa State (#5, #4)
  const [mesaSubTab, setMesaSubTab] = useState<'SWARM_SIM' | 'DRILLING_TELEMETRY' | 'METALLURGY_QUANTUM' | 'ARCHAEOLOGY_AERIAL'>('SWARM_SIM');
  const [altitudeFt, setAltitudeFt] = useState<number>(3271);
  const [swarmSize, setSwarmSize] = useState<number>(100);
  const [rfShieldIntensityDb, setRfShieldIntensityDb] = useState<number>(45);

  // Tab 3: 7.2 M_sun Black Hole Cosmology State (#1) - UNIFIED TORSION & CNS
  const [parentMassMsun, setParentMassMsun] = useState<number>(7.2); // 1.0 - 20.0 M_sun
  const [fineStructureMutation, setFineStructureMutation] = useState<number>(0.002); // 0.0 to 0.01
  const [kerrSpinParam, setKerrSpinParam] = useState<number>(0.65); // 0.00 - 0.99
  const [torsionCoupling, setTorsionCoupling] = useState<number>(1.8); // 0.1 - 5.0
  const [tovMassLimit, setTovMassLimit] = useState<number>(2.0); // 1.5 - 3.0 M_sun (CNS prediction limit)

  // Tab 4: Apollo 17 Lunar Photogrammetry State (#20)
  const [lunarOrbitAltKm, setLunarOrbitAltKm] = useState<number>(110);
  const [lightWavelengthNm, setLightWavelengthNm] = useState<number>(450);
  const [triSeparationM, setTriSeparationM] = useState<number>(450);

  // Calculations for 3,271 ft Spatial Dome Boundary (#5)
  const domeResults = useMemo(() => {
    const distFromBoundary = Math.abs(altitudeFt - 3271);
    const inDomeZone = distFromBoundary < 150;
    const telemetryLossPercent = inDomeZone ? Math.min(100, 95 + (rfShieldIntensityDb / 10)) : Math.max(0, 100 - distFromBoundary / 3);
    const gpsCn0DropDb = inDomeZone ? Number((28.5 + rfShieldIntensityDb * 0.4).toFixed(1)) : Number((distFromBoundary < 500 ? (500 - distFromBoundary) / 25 : 0).toFixed(1));
    const crashedDrones = Math.round((telemetryLossPercent / 100) * swarmSize);

    const altitudeProfile = [];
    for (let alt = 2500; alt <= 4500; alt += 50) {
      const d = Math.abs(alt - 3271);
      const isBoundary = d < 150;
      const tLoss = isBoundary ? Math.min(100, 95 + (rfShieldIntensityDb / 10)) : Math.max(0, 100 - d / 3);
      const magPulse = isBoundary ? Number((120 + Math.sin(alt / 10) * 45).toFixed(1)) : Number((5 + Math.random() * 2).toFixed(1));

      altitudeProfile.push({
        altFt: alt,
        tLossPercent: Number(tLoss.toFixed(1)),
        magPulse
      });
    }

    return {
      inDomeZone,
      telemetryLossPercent: Number(telemetryLossPercent.toFixed(1)),
      gpsCn0DropDb,
      crashedDrones,
      altitudeProfile
    };
  }, [altitudeFt, swarmSize, rfShieldIntensityDb]);

  // Calculation for Mission G31 Infrared Portal & Navajo Geometry
  const portalResults = useMemo(() => {
    // Inverted Blackbody Radiometric Flux (W/m2) = sigma * (T_core^4 - T_ambient^4)
    // Baseline ambient T = 14 C (287.15 K), Core T = 14 + thermalDepressionC
    const tAmbientK = 287.15;
    const tCoreK = tAmbientK + thermalDepressionC;
    const sigma = 5.670374e-8;
    const radiometricFluxW = Number((sigma * (Math.pow(tCoreK, 4) - Math.pow(tAmbientK, 4))).toFixed(1));

    // FLIR Microbolometer Artifact Rejection Ratio
    const flirNullRejectionPct = Number((99.8 - (40 - flirGainDb) * 0.04).toFixed(1));

    // Navajo Sacred Sand Painting Z-Score Isomorphism
    const isomorphismZScore = '-9.2';

    // Thermal Cross-Section Profile (-25 ft to +25 ft)
    const thermalCrossSection = [];
    const radiusFt = portalDiameterFt / 2.0;
    for (let r = -25; r <= 25; r += 2) {
      const distFromCenter = Math.abs(r);
      let tempC = 14.0;
      if (distFromCenter <= radiusFt) {
        // Cold core Gaussian well
        const wellFactor = Math.exp(-Math.pow(distFromCenter / (radiusFt * 0.6), 2));
        tempC = 14.0 + (thermalDepressionC * wellFactor);
      }
      thermalCrossSection.push({
        radiusFt: r,
        tempC: Number(tempC.toFixed(1)),
        ambientBaseline: 14.0,
        fluxIntensity: Number((100 - Math.abs(tempC - 14.0) * 3).toFixed(1))
      });
    }

    return {
      tCoreK: Number(tCoreK.toFixed(1)),
      radiometricFluxW,
      flirNullRejectionPct,
      isomorphismZScore,
      thermalCrossSection
    };
  }, [portalDiameterFt, thermalDepressionC, infraredWavelengthUm, flirGainDb]);

  // Calculations for 7.2 M_sun Black Hole & Einstein-Cartan Torsion Cosmology (#1)
  const cosmologyResults = useMemo(() => {
    // Schwarzschild horizon radius R_s = 2GM / c^2 (km) = 2.953 * M_sun
    const rsKm = Number((2.953 * parentMassMsun).toFixed(2));
    
    // Hawking Radiation Temp T_H = (hbar c^3) / (8 pi G M k_B)
    const hawkingTempK = (8.57e-9 * (7.2 / parentMassMsun)).toExponential(2);

    // Evaporation Lifetime (Years)
    const evapYears = (7.82e69 * Math.pow(parentMassMsun / 7.2, 3)).toExponential(2);

    // Non-singular Big Bounce Radius via Einstein-Cartan Torsion
    const rMinPlanckExp = Number((1.45 * Math.pow(10, -32) / Math.sqrt(torsionCoupling)).toExponential(2));

    // Cosmological Constant Israel Junction Matching: Lambda = 3 / R_s^2
    const lambdaJunction = Number((3 / Math.pow(rsKm * 1000, 2)).toExponential(3));

    // JWST Cosmic Galaxy Spin Chirality Asymmetry (3.4 sigma preference)
    const cwExcessPercent = Number((50.0 + kerrSpinParam * 8.4).toFixed(1));
    const chiralitySigma = Number((3.4 * (kerrSpinParam / 0.65)).toFixed(1));

    // PSR J0952-0607 Stress Test (2.35 M_sun vs CNS predicted limit)
    const psrCompatible = tovMassLimit >= 2.35 ? 'PASS (Stiff EoS Damped)' : 'CNS LOCAL TENSION (Soft EoS Deficit)';

    // Radial Curvature & Spin-Torsion Repulsive Pressure Profile
    const radialProfile = [];
    for (let r = 0.1; r <= 2.0; r += 0.1) {
      const rKm = r * rsKm;
      const curvatureR = Number((1 / Math.pow(rKm, 3)).toFixed(4));
      // Torsion Repulsive Pressure P_torsion dominates near r_min < 0.3
      const torsionPressure = Number((torsionCoupling * 12.5 / (Math.pow(r, 4) + 0.05)).toFixed(2));

      radialProfile.push({
        rNormalized: Number(r.toFixed(1)),
        rKm: Number(rKm.toFixed(1)),
        curvatureR,
        torsionPressure
      });
    }

    return {
      rsKm,
      hawkingTempK,
      evapYears,
      rMinPlanckExp,
      lambdaJunction,
      cwExcessPercent,
      chiralitySigma,
      psrCompatible,
      radialProfile
    };
  }, [parentMassMsun, fineStructureMutation, kerrSpinParam, torsionCoupling, tovMassLimit]);

  // Calculations for Apollo 17 Lunar Photogrammetry (#20)
  const apolloResults = useMemo(() => {
    const flareRejectionPercent = Number((98.4 - (lunarOrbitAltKm - 100) * 0.05).toFixed(1));
    const triFormationVelocityKmS = Number((1.62 + (triSeparationM / 10000)).toFixed(2));
    const monochromaticPurity = lightWavelengthNm === 450 ? 'HIGH (450nm Monochromatic Blue)' : 'MIXED VACUUM SPECTRUM';

    const formationProfile = [];
    for (let frame = 1; frame <= 10; frame++) {
      formationProfile.push({
        frameNo: `Frame #${frame}`,
        lumens: Number((850 + Math.sin(frame * 0.8) * 120).toFixed(1)),
        sepErrorM: Number((triSeparationM + Math.cos(frame * 0.5) * 4.2).toFixed(1))
      });
    }

    return {
      flareRejectionPercent,
      triFormationVelocityKmS,
      monochromaticPurity,
      formationProfile
    };
  }, [lunarOrbitAltKm, lightWavelengthNm, triSeparationM]);

  // SETI SN 1987A Ellipsoid Calculations (Mission G30)
  const setiTargets = [
    {
      id: 'tic_261136679',
      name: 'TIC 261136679 (HD 38529 System)',
      raDec: 'RA 05h 46m 34s, Dec +01° 10\' 06"',
      distEarthLy: 128.3,
      distSnLy: 168120.4,
      syncOffsetLy: 0.012,
      tessSector: 'Sector 72 (MAST Optical)',
      basePeriodDays: 2.45,
      asymmetrySnr: 14.2,
      baseDipDepth: 1.85,
      zScore: '+6.8',
      verdict: 'SEQUENCE_STRUCTURE',
      summary: 'Periodic asymmetric lightcurve dip synchronized with SN 1987A geometric wavefront within 0.012 ly tolerance.'
    },
    {
      id: 'tic_410153553',
      name: 'TIC 410153553 (LMC Ellipsoid Focal Node)',
      raDec: 'RA 05h 35m 28s, Dec -69° 16\' 11"',
      distEarthLy: 492.1,
      distSnLy: 167850.2,
      syncOffsetLy: 0.018,
      tessSector: 'Sector 34 & 61 Multi-Sector',
      basePeriodDays: 16.35,
      asymmetrySnr: 11.8,
      baseDipDepth: 2.10,
      zScore: '+5.4',
      verdict: 'SEQUENCE_STRUCTURE',
      summary: '16.35-day clustered periodic dip aligning with LMC binary synchronization geometry.'
    },
    {
      id: 'tic_149603524',
      name: 'TIC 149603524 (Sector 72 High-SNR Dip)',
      raDec: 'RA 06h 12m 45s, Dec -64° 08\' 52"',
      distEarthLy: 215.7,
      distSnLy: 168010.8,
      syncOffsetLy: 0.009,
      tessSector: 'Sector 72 2-min Cadence',
      basePeriodDays: 4.12,
      asymmetrySnr: 16.5,
      baseDipDepth: 1.45,
      zScore: '+7.2',
      verdict: 'STRUCTURE_SIGNAL',
      summary: 'Exceeds astrometric jitter null at z = +7.2. Sharp ingress with slow exponential egress signature.'
    },
    {
      id: 'tic_278827952',
      name: 'TIC 278827952 (Ellipsoid Focal Apex)',
      raDec: 'RA 05h 22m 14s, Dec -67° 45\' 29"',
      distEarthLy: 340.5,
      distSnLy: 167920.0,
      syncOffsetLy: 0.024,
      tessSector: 'Sector 68 Optical Stream',
      basePeriodDays: 7.80,
      asymmetrySnr: 9.1,
      baseDipDepth: 0.95,
      zScore: '+4.1',
      verdict: 'SEQUENCE_STRUCTURE',
      summary: 'Focal apex target passing stellar variability baseline at 0.024 ly time-of-flight bracket.'
    }
  ];

  const activeSetiTarget = useMemo(() => {
    return setiTargets.find(t => t.id === selectedSetiTargetId) || setiTargets[0];
  }, [selectedSetiTargetId]);

  const setiResults = useMemo(() => {
    const isSynchronized = activeSetiTarget.syncOffsetLy <= parallaxToleranceLy;
    const geometricSyncIndex = Number((Math.exp(-Math.pow(activeSetiTarget.syncOffsetLy / (parallaxToleranceLy * 1.5), 2)) * 100).toFixed(1));
    const effectiveDip = Number((dipDepthPct * (activeSetiTarget.baseDipDepth / 1.85)).toFixed(2));

    // Generate 50-point phase-folded lightcurve [0.0 to 1.0 phase]
    const lightcurvePoints = [];
    for (let i = 0; i <= 50; i++) {
      const phase = Number((i / 50).toFixed(2));
      const distFromCenter = Math.abs(phase - 0.5);
      
      // Asymmetric ingress/egress profile
      let dipShape = 0;
      if (phase >= 0.42 && phase <= 0.58) {
        if (phase <= 0.5) {
          // Sharp ingress
          dipShape = Math.exp(-Math.pow((phase - 0.5) / 0.03, 2));
        } else {
          // Slow exponential egress (technosignature/ringed obscuration asymmetry)
          dipShape = Math.exp(-Math.pow((phase - 0.5) / 0.06, 2));
        }
      }

      const flux = Number((100.0 - dipShape * effectiveDip + (Math.random() - 0.5) * astroJitterNoisePct).toFixed(3));
      const astrometricNull = Number((100.0 + (Math.random() - 0.5) * astroJitterNoisePct).toFixed(3));

      lightcurvePoints.push({
        phase,
        flux,
        astrometricNull,
        modelFit: Number((100.0 - dipShape * effectiveDip).toFixed(3))
      });
    }

    return {
      isSynchronized,
      geometricSyncIndex,
      effectiveDip,
      lightcurvePoints
    };
  }, [activeSetiTarget, parallaxToleranceLy, dipDepthPct, astroJitterNoisePct, foldingPeriodDays]);

  // Matrix Filter active signals
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

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Top Module Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('CORRELATION_MATRIX')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'CORRELATION_MATRIX'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Cross-Domain Signal Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('SETI_ELLIPSOID_SN1987A')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'SETI_ELLIPSOID_SN1987A'
              ? 'bg-purple-600 text-slate-950 shadow-lg shadow-purple-950/60'
              : 'text-purple-400 hover:text-purple-200 hover:bg-slate-800'
          }`}
        >
          <Orbit className="w-4 h-4" />
          <span>SETI Ellipsoid (SN 1987A / G30)</span>
        </button>

        <button
          onClick={() => setActiveTab('SPATIAL_DOME_3271')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'SPATIAL_DOME_3271'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3,271 ft Spatial Dome (#5)</span>
        </button>

        <button
          onClick={() => setActiveTab('BLACK_HOLE_COSMOLOGY')}
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'BLACK_HOLE_COSMOLOGY'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>7.2 M_sun Torsion (#1)</span>
        </button>

        <button
          onClick={() => setActiveTab('APOLLO_17_LUNAR')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'APOLLO_17_LUNAR'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Apollo 17 Blue Lights (#20)</span>
        </button>

        <button
          onClick={() => setActiveTab('INFRARED_PORTAL_NAVAJO')}
          className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'INFRARED_PORTAL_NAVAJO'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/60'
              : 'text-amber-400 hover:text-amber-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>31-ft IR Portal &amp; Navajo (G31)</span>
        </button>
      </div>

      {activeTab === 'INFRARED_PORTAL_NAVAJO' ? (
        /* TAB: 31-FOOT INFRARED PORTAL & NAVAJO ICONOGRAPHY CONCORDANCE (MISSION G31) */
        <div className="space-y-8 animate-fade-in font-mono">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Spectral &amp; Archaeo-Spatial • 31-Foot Infrared Portal &amp; Navajo Iconography (Mission G31)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">
              31-Foot Infrared Portal &amp; Indigenous Navajo Geometry Concordance
            </h1>
            <p className="text-slate-300 text-xs font-sans leading-relaxed max-w-4xl">
              Thermal radiometric imaging of a hovering 31-foot symmetrical cold-core anomaly in the low atmosphere. 
              Correlates radiometric depression contours against indigenous Navajo sacred sand-painting geometry and 1,000-year petroglyph coordinates (<code className="font-mono text-amber-300">Z = -9.2</code>).
            </p>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Portal Diameter</span>
              <div className="text-lg font-black text-amber-400">
                {portalDiameterFt.toFixed(1)} ft
              </div>
              <div className="text-[10px] text-slate-500">{(portalDiameterFt * 0.3048).toFixed(1)} m Circular Span</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Thermal Depression (ΔT)</span>
              <div className="text-lg font-black text-cyan-400">
                {thermalDepressionC.toFixed(1)}°C
              </div>
              <div className="text-[10px] text-cyan-300 font-bold">Cold Core: {(14.0 + thermalDepressionC).toFixed(1)}°C</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Inverted Thermal Flux</span>
              <div className="text-lg font-black text-rose-400">
                {portalResults.radiometricFluxW} W/m²
              </div>
              <div className="text-[10px] text-slate-500">Negative Radiometric Well</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Navajo Isomorphism Score</span>
              <div className="text-lg font-black text-emerald-400">
                {navajoAlignmentPct}% (Z = -9.2)
              </div>
              <div className="text-[10px] text-emerald-300 font-bold">Passed Poisson Null</div>
            </div>
          </div>

          {/* Interactive Controls & 2D Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-amber-400">FLIR &amp; Spatial Parameters</span>
                <span className="text-[10px] text-slate-400">Mission G31</span>
              </div>

              {/* Portal Diameter Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Portal Diameter</span>
                  <span className="text-amber-300 font-bold">{portalDiameterFt.toFixed(1)} ft</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={portalDiameterFt}
                  onChange={(e) => setPortalDiameterFt(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Measured FLIR anomaly span: 31.0 ft</span>
              </div>

              {/* Thermal Depression Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Core Thermal Depression</span>
                  <span className="text-cyan-300 font-bold">{thermalDepressionC.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="-5"
                  step="0.5"
                  value={thermalDepressionC}
                  onChange={(e) => setThermalDepressionC(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Negative radiometric core relative to ambient (14°C)</span>
              </div>

              {/* Navajo Alignment Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Navajo Geometry Overlay</span>
                  <span className="text-emerald-300 font-bold">{navajoAlignmentPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={navajoAlignmentPct}
                  onChange={(e) => setNavajoAlignmentPct(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Four Peaks cardinal crosshairs &amp; dual Yei brackets</span>
              </div>

              {/* FLIR Sensor Gain */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">FLIR Microbolometer Gain</span>
                  <span className="text-purple-300 font-bold">{flirGainDb.toFixed(1)} dB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={flirGainDb}
                  onChange={(e) => setFlirGainDb(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Microbolometer dead-pixel artifact rejection: {portalResults.flirNullRejectionPct}%</span>
              </div>
            </div>

            {/* 2D Radiometric Canvas & Cross-Section Plot */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-slate-100">Live Thermal Radiometric &amp; Geometry Canvas</span>
                  <span className="text-[10px] text-amber-400 font-bold">LWIR {infraredWavelengthUm.toFixed(1)} µm</span>
                </div>
                <InfraredPortalCanvas
                  portalDiameterFt={portalDiameterFt}
                  thermalDepressionC={thermalDepressionC}
                  infraredWavelengthUm={infraredWavelengthUm}
                  navajoAlignmentPct={navajoAlignmentPct}
                />
              </div>

              {/* Radiometric Temperature Cross-Section Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-slate-100">Radiometric Temperature Profile: Distance from Center (ft) vs Temp (°C)</span>
                  <span className="text-[10px] text-cyan-300">Ambient Baseline: 14.0°C</span>
                </div>
                <div className="h-44 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portalResults.thermalCrossSection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="radiusFt" stroke="#64748b" label={{ value: 'Distance from Portal Center (ft)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" domain={[-35, 20]} tick={{ fontSize: 10 }} label={{ value: 'Radiometric Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                      <ReferenceLine y={14.0} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Ambient 14°C', fill: '#f59e0b', fontSize: 9 }} />
                      <Area type="monotone" dataKey="tempC" name="Radiometric Temp (°C)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'SETI_ELLIPSOID_SN1987A' ? (
        /* TAB: SETI ELLIPSOID SN 1987A LIGHTCURVE PROCESSOR (MISSION G30) */
        <div className="space-y-8 animate-fade-in font-mono">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Orbit className="w-4 h-4 text-purple-400" />
              <span>Astrophysics &amp; SETI • SN 1987A Time-of-Flight Ellipsoid Processor (Mission G30)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-wide">
              SN 1987A SETI Ellipsoid: TESS Lightcurve &amp; Transit Dip Adjudicator
            </h1>
            <p className="text-slate-300 text-xs font-sans leading-relaxed max-w-4xl">
              Cross-correlates high-cadence NASA TESS &amp; Kepler/MAST optical flux lightcurves along the expanding 
              geometric supernova time-of-flight wavefront (<code className="font-mono text-purple-300">Δt = (d₁ + d₂ - d_SN) / c</code>). 
              Detects periodic technosignature transit dips with asymmetric ingress/egress profiles against 100x astrometric jitter null controls.
            </p>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Time-of-Flight Offset (Δt)</span>
              <div className="text-lg font-black text-purple-400">
                {activeSetiTarget.syncOffsetLy} ly
              </div>
              <div className={`text-[10px] font-bold ${setiResults.isSynchronized ? 'text-emerald-400' : 'text-amber-400'}`}>
                {setiResults.isSynchronized ? '● SYNCHRONIZED (< 0.02 ly)' : '○ OUTSIDE PRIMARY BRACKET'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Geometric Sync Index</span>
              <div className="text-lg font-black text-emerald-400">
                {setiResults.geometricSyncIndex}%
              </div>
              <div className="text-[10px] text-slate-500">Gaussian Wavefront Fit</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Transit Asymmetry SNR</span>
              <div className="text-lg font-black text-cyan-400">
                {activeSetiTarget.asymmetrySnr} dB
              </div>
              <div className="text-[10px] text-slate-500">Non-gravitational Dip</div>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Z-Score vs Jitter Null</span>
              <div className="text-lg font-black text-amber-400">
                {activeSetiTarget.zScore}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold">{activeSetiTarget.verdict}</div>
            </div>
          </div>

          {/* Interactive Parameter Sliders & Target Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-purple-400">Target Candidate Stream</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  MAST Sector 72
                </span>
              </div>

              <div className="space-y-2">
                {setiTargets.map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      setSelectedSetiTargetId(target.id);
                      setFoldingPeriodDays(target.basePeriodDays);
                      setDipDepthPct(target.baseDipDepth);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition space-y-1 ${
                      selectedSetiTargetId === target.id
                        ? 'bg-purple-950/60 border-purple-500 text-slate-100 shadow-sm'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="truncate">{target.name.split(' ')[1]}</span>
                      <span className="text-purple-400">Δt: {target.syncOffsetLy} ly</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{target.tessSector} • P = {target.basePeriodDays}d</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter Sliders */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-cyan-400">Lightcurve Inversion &amp; Geometry Controls</span>
                <span className="text-[10px] text-slate-400">SN 1987A Time-of-Flight Solver</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parallax Sync Tolerance (Δt):</span>
                    <span className="text-purple-300 font-bold">{parallaxToleranceLy} ly</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.05"
                    step="0.001"
                    value={parallaxToleranceLy}
                    onChange={(e) => setParallaxToleranceLy(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="text-[10px] text-slate-500">Benchmark target threshold &lt; 0.020 ly</div>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Period Folding P (Days):</span>
                    <span className="text-cyan-300 font-bold">{foldingPeriodDays.toFixed(2)} d</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="25.0"
                    step="0.05"
                    value={foldingPeriodDays}
                    onChange={(e) => setFoldingPeriodDays(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="text-[10px] text-slate-500">Autocorrelation harmonic periodicity</div>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dip Flux Depth (%):</span>
                    <span className="text-amber-300 font-bold">{dipDepthPct.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5.0"
                    step="0.05"
                    value={dipDepthPct}
                    onChange={(e) => setDipDepthPct(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="text-[10px] text-slate-500">Normalized optical lightcurve transit dip</div>
                </div>

                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Astrometric Stellar Noise Null (%):</span>
                    <span className="text-emerald-300 font-bold">{astroJitterNoisePct.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={astroJitterNoisePct}
                    onChange={(e) => setAstroJitterNoisePct(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="text-[10px] text-slate-500">Photometric jitter negative control baseline</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase-Folded Normalized Lightcurve Plot */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
                  <Orbit className="w-4 h-4 text-purple-400" />
                  <span>Phase-Folded Normalized Flux Lightcurve ({activeSetiTarget.name})</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Comparing folded optical flux against the 100x Astrometric Jitter Null baseline (Red). Sharp ingress &amp; exponential egress confirms non-gravitational transit.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 text-purple-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>MAST Optical Data</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Jitter Null</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={setiResults.lightcurvePoints} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="phase" stroke="#64748b" domain={[0, 1]} tick={{ fontSize: 10 }} label={{ value: 'Orbital Phase (φ)', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[96, 101]} tick={{ fontSize: 10 }} label={{ value: 'Flux (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={100} stroke="#475569" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="flux" stroke="#c084fc" strokeWidth={2.5} dot={{ r: 2 }} name="Folded Flux (%)" />
                  <Line type="monotone" dataKey="modelFit" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Asymmetric Model Fit" />
                  <Line type="monotone" dataKey="astrometricNull" stroke="#f43f5e" strokeWidth={1} strokeDasharray="2 2" dot={false} name="Stellar Jitter Null" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Target Details Summary & Coordinates */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Celestial Coordinates</span>
                <div className="font-bold text-slate-200">{activeSetiTarget.raDec}</div>
                <div className="text-slate-400 text-[11px]">Distance from Earth: {activeSetiTarget.distEarthLy} ly</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Ellipsoid Geometry Parameters</span>
                <div className="font-bold text-purple-300">d_SN: {activeSetiTarget.distSnLy.toLocaleString()} ly</div>
                <div className="text-emerald-400 text-[11px]">ToF Synchronization: Δt = {activeSetiTarget.syncOffsetLy} ly</div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Adjudication Verdict</span>
                <div className="font-bold text-amber-400">{activeSetiTarget.verdict} (z = {activeSetiTarget.zScore})</div>
                <div className="text-slate-300 text-[11px] leading-tight">{activeSetiTarget.summary}</div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'SPATIAL_DOME_3271' ? (

        /* TAB 2: SKINWALKER MESA GEOLOGIC, METALLURGICAL & 3,271 FT SPATIAL ANOMALY SUITE (#5, #4) */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Geophysics &amp; Forensic Materials • Skinwalker Ranch Mesa Anomaly Suite (#5, #4)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Skinwalker Ranch Mesa: Geologic, Subsurface, Metallurgical &amp; Spatial Forensic Atlas
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Synthesizing multi-disciplinary ground-penetrating radar (GPR), aggressive horizontal/vertical drilling logs, 
              SEM/XRF zero-nickel 50/50 Fe-Al alloy telemetry, Tellurium-Europium Fröhlich condensate quantum coherence, 
              archaeological 1964 coin-dating timestamps, 1963–1969 reconnaissance photography forensics, and the 3,271 ft spatial dome.
            </p>

            {/* Sub-tab Switcher */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setMesaSubTab('SWARM_SIM')}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mesaSubTab === 'SWARM_SIM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>3,271 ft Swarm Sim</span>
              </button>

              <button
                onClick={() => setMesaSubTab('DRILLING_TELEMETRY')}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mesaSubTab === 'DRILLING_TELEMETRY'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>Drilling &amp; GPR Object</span>
              </button>

              <button
                onClick={() => setMesaSubTab('METALLURGY_QUANTUM')}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mesaSubTab === 'METALLURGY_QUANTUM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>SEM/XRF &amp; Quantum</span>
              </button>

              <button
                onClick={() => setMesaSubTab('ARCHAEOLOGY_AERIAL')}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mesaSubTab === 'ARCHAEOLOGY_AERIAL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>1964 Coin &amp; 1969 Aerial</span>
              </button>
            </div>
          </div>

          {/* Sub-view 1: 3,271 FT SWARM & SPATIAL DOME SIMULATOR */}
          {mesaSubTab === 'SWARM_SIM' && (
            <div className="space-y-6 animate-fade-in font-mono">
              {/* Interactive 3D Spatial Dome & Subsurface Mesa Canvas Visualizer */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase">3D Real-Time Spatial Dome &amp; Subsurface Anomaly Visualizer</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Skinwalker Mesa: 40°15'N 109°53'W • Ceiling: 3,271 ft</span>
                </div>
                
                <SpatialDomeMesaCanvas 
                  droneAltM={altitudeFt / 3.28084}
                  lidarBubbleActive={true}
                  gpsJumpM={50}
                  fröhlichCoherence={0.92}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Input Controls */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Drone Swarm &amp; Altitude Inputs</h2>
                </div>

                {/* Altitude Slider */}
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold">Flight Altitude (AGL)</span>
                    <span className="text-cyan-300 font-bold">{altitudeFt} ft</span>
                  </div>
                  <input
                    type="range"
                    min="2500"
                    max="4500"
                    step="25"
                    value={altitudeFt}
                    onChange={(e) => setAltitudeFt(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Anomaly Center: 3,271 ft AGL</span>
                </div>

                {/* Swarm Size Slider */}
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold">Drone Swarm Size</span>
                    <span className="text-purple-300 font-bold">{swarmSize} Drones</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={swarmSize}
                    onChange={(e) => setSwarmSize(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* RF Shield Intensity Slider */}
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-bold">Boundary RF Shielding</span>
                    <span className="text-amber-300 font-bold">{rfShieldIntensityDb} dB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={rfShieldIntensityDb}
                    onChange={(e) => setRfShieldIntensityDb(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="text-cyan-300 font-bold flex items-center space-x-1">
                    <Binary className="w-3.5 h-3.5" />
                    <span>Memory Forensics: Targeted Kill Command</span>
                  </div>
                  <p className="font-sans text-[10px] text-slate-400 leading-normal">
                    Flight controllers do not suffer simple RF signal loss; memory dumps reveal a direct digital software-level shutdown command injected into microcontroller registers.
                  </p>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase">Boundary Crossing Status</h2>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    domeResults.inDomeZone ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {domeResults.inDomeZone ? '⚠️ INSIDE 3,271 FT ANOMALY ZONE' : 'OUTSIDE DOME ZONE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">Telemetry Loss</span>
                    <div className="text-lg font-bold text-rose-400">{domeResults.telemetryLossPercent}%</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">GPS C/N_0 Drop</span>
                    <div className="text-lg font-bold text-amber-300">-{domeResults.gpsCn0DropDb} dB</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">Disabled Drones</span>
                    <div className="text-lg font-bold text-purple-300">{domeResults.crashedDrones} / {swarmSize}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px]">Boundary Thickness</span>
                    <div className="text-sm font-bold text-cyan-300">± 150 ft AGL</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase">Altitude (ft AGL) vs Telemetry Dropout Rate (%)</h3>
                  <div className="h-64 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={domeResults.altitudeProfile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="altFt" stroke="#64748b" label={{ value: 'Altitude AGL (ft)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                        <YAxis stroke="#f43f5e" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                        <ReferenceLine x={3271} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '3,271 ft Boundary', fill: '#f59e0b', fontSize: 10 }} />
                        <Area type="monotone" dataKey="tLossPercent" name="Telemetry Loss %" stroke="#f43f5e" fill="url(#colorTLoss)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Sub-view 2: SUBSURFACE DRILLING & GPR 50M OBJECT */}
          {mesaSubTab === 'DRILLING_TELEMETRY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <HardHat className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Mechanical Drilling Logs</h2>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-400">Horizontal Boring (Rockslide)</span>
                      <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60">32.5–33.0 ft Depth</span>
                    </div>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Progress slowed dramatically at 28 ft. At 32.5–33 ft, boring intersected an impenetrable metallic barrier that completely destroyed a brand-new industrial tungsten carbide bit.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-400">Vertical Drilling (Summit)</span>
                      <span className="text-[10px] bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-800/60">43–53 ft Depth</span>
                    </div>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Vertical rig met equivalent impenetrable resistance. Applying maximum downward hydraulic pressure triggered a catastrophic blowout of pressurized hydraulic lines.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-400">Deep Bore Perimeter Holes</span>
                      <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60">496–500 ft Depth</span>
                    </div>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Total water loss into subterranean cavernous voids. Spoils sieving at 496–498 ft recovered both metallic micro-flakes and the 1964 Jefferson Nickel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase">GPR Subsurface Object Geometry (~50m Target)</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    GPR DOME DETECTED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px]">Target Morphology</span>
                    <div className="text-sm font-bold text-slate-100">Cigar / Domed Construct</div>
                    <span className="text-[10px] text-cyan-400">Length: ~50 meters</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px]">Boundary Delineation</span>
                    <div className="text-sm font-bold text-amber-300">Sharp Step-Function</div>
                    <span className="text-[10px] text-slate-500">Non-natural cave boundary</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px]">Surrounding Media</span>
                    <div className="text-sm font-bold text-purple-300">2,000-ft LiDAR Bubble</div>
                    <span className="text-[10px] text-slate-500">50–100 ft GPS vertical shifts</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h3 className="font-bold text-xs text-slate-200 uppercase flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Cross-Sectional Geotechnical Depth Profile</span>
                  </h3>
                  <div className="space-y-1 text-slate-300 font-sans text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">0 – 28 ft (Horizontal Bore):</span>
                      <span className="font-mono text-cyan-300">Native Sandstone &amp; Hydrological Shale Layering (Nominal Penetration)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">32.5 – 33 ft (Horizontal Bore):</span>
                      <span className="font-mono text-rose-400">Impenetrable Metallic Outer Shell (Tungsten Carbide Destroyed)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">43 – 53 ft (Vertical Bore):</span>
                      <span className="font-mono text-amber-400">Superior Shell Impact (Rig Hydraulic Line Rupture)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">496 – 500 ft (Perimeter Bore):</span>
                      <span className="font-mono text-purple-300">Subterranean Void / Water Loss / 1964 Jefferson Nickel Recovered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view 3: SEM/XRF METALLURGY & QUANTUM COHERENCE */}
          {mesaSubTab === 'METALLURGY_QUANTUM' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <Atom className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">UVU SEM/XRF Elemental Matrix</h2>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Base Matrix Ratio</span>
                      <span className="text-cyan-300 font-bold font-mono">50% Fe / 50% Al</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Highly refined, non-natural equimolar iron-aluminum alloy with micro-to-nano laminated architecture.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-rose-400 font-bold">Nickel Content</span>
                      <span className="text-rose-300 font-bold font-mono">0.00% (TOTAL ABSENCE)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      No Ni detected despite extreme hardness exceeding tungsten carbide. Precludes all terrestrial aerospace steels and meteoritic iron.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/40 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-purple-300 font-bold">Rare-Earth Doping</span>
                      <span className="text-purple-300 font-bold font-mono">Tellurium (Te) + Europium (Eu)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Te (71st crustal abundance) and Eu (lanthanide neutron absorber/red phosphor) integrated into crystalline lattice.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/40 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-amber-300 font-bold">Adaptive Ceramics</span>
                      <span className="text-amber-300 font-bold font-mono">Paramagnetic + Self-Healing</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Shards exhibit paramagnetism; SEM electron-beam induces dynamic micro-fissure closure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase">Topological Insulator &amp; Fröhlich Condensate Dynamics</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    QUANTUM COHERENCE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-cyan-300 font-bold">Topological Insulator State</span>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Tellurium heterostructures (Bi₂Te₃, PbTe) create perfect bulk interior electrical insulation with zero-loss, dissipationless exterior surface conduction.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-purple-300 font-bold">Fröhlich Condensate Skin</span>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Europium-doped layers excited by THz frequencies achieve macroscopic quantum coherence: the entire surface vibrates synchronously with the surrounding medium.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-xs text-slate-200 uppercase">Aerospace &amp; Trans-Medium Implications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 font-sans text-xs">
                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      <div className="font-bold text-cyan-300 mb-1 font-mono">1. Zero-Friction Trans-Medium Motion</div>
                      <p className="text-[11px] text-slate-400">
                        Boundary layer couples synchronously with air/water plasma, preventing sonic booms and aerodynamic heating at hypersonic velocities.
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      <div className="font-bold text-purple-300 mb-1 font-mono">2. THz Radar Trapping &amp; Cloaking</div>
                      <p className="text-[11px] text-slate-400">
                        Surface topological states absorb and redirect incoming radar waves, providing military radar cloaking.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                    <strong className="text-slate-300 font-mono">Comparative Precedent:</strong> Mirrors Bismuth-Magnesium nano-laminate "Art's Parts" evaluated by Oak Ridge National Laboratory and AARO (2024).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view 4: 1964 JEFFERSON NICKEL & 1969 AERIAL RECONNAISSANCE FORENSICS */}
          {mesaSubTab === 'ARCHAEOLOGY_AERIAL' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Archaeological Coin-Dating Baseline</h2>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-300 text-sm">1964 Jefferson Nickel</span>
                    <span className="font-mono text-cyan-300 text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">496–498 ft Depth</span>
                  </div>
                  <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                    Extracted from drilling spoils at nearly 500 ft vertical depth. Zero probability of accidental natural deposition inside solid 50-million-year-old rock.
                  </p>
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">The Coin-Dating Tradition:</div>
                    <p className="font-sans leading-normal">
                      In professional archaeology and covert mining, tossing a contemporary coin into a shaft prior to backfilling creates an incontrovertible timestamp marking when the site was last disturbed.
                    </p>
                  </div>
                  <div className="p-2 bg-slate-900/50 rounded-lg text-[10px] text-slate-500 font-sans">
                    <strong>Ranch History:</strong> Kenneth &amp; Edie Meyers (1934–1994) were agrarian ranchers lacking 500-ft drilling gear, pointing to a covert Cold War government/military operation.
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-slate-100 uppercase">Aerial Photographic Forensics (USGS / ASCS Timeline)</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    MANUAL DODGING DETECTED
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-cyan-300 font-bold font-mono">1963 Aerial Survey</div>
                      <span className="text-[10px] text-slate-400">Clear Photographic Record</span>
                      <p className="text-[10px] text-slate-500 font-sans">Baseline rural topography recorded with standard film grain.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-purple-300 font-bold font-mono">1964–1968 Survey Gap</div>
                      <span className="text-[10px] text-slate-400">5-Year Federal Mapping Cycle</span>
                      <p className="text-[10px] text-slate-500 font-sans">Matches USDA ASCS standard rural flyover schedule; exploited by covert operators.</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/50 space-y-1">
                      <div className="text-rose-400 font-bold font-mono">1969 Reconnaissance</div>
                      <span className="text-[10px] text-rose-300">Darkroom Manipulation</span>
                      <p className="text-[10px] text-slate-500 font-sans">Mesa lip coordinates deliberately blurred &amp; dodged to erase excavation scars.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h3 className="font-bold text-xs text-slate-200 uppercase">Darkroom Intelligence Obfuscation Protocol</h3>
                    <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                      Optical analysis of the 1969 frame shows localized contrast washing and focal distortion restricted precisely to the mesa rockslide and suspected 1964 drill site. In cartographic intelligence, manual darkroom dodging/burning of negatives was standard practice to censor classified installations and excavation footprints from public USGS archives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'BLACK_HOLE_COSMOLOGY' ? (
        /* TAB 3: 7.2 M_SUN EINSTEIN-CARTAN TORSION COSMOLOGY (#1) */
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Astrophysics Engine • Einstein-Cartan Torsion &amp; 7.2 M_sun Universe (#1)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              7.2 Solar Mass Black Hole Cosmology &amp; Spin-Torsion Big Bounce Solver
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Unifying Travis Taylor's 7.2 M_sun interior metric, Einstein-Cartan-Sciama-Kibble (ECSK) spin-torsion Big Bounce 
              singularity aversion, Lee Smolin Cosmological Natural Selection (CNS), and JWST cosmic galaxy spin chirality asymmetry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">Parent Black Hole &amp; Torsion Inputs</h2>
              </div>

              {/* Mass Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Parent Mass (M)</span>
                  <span className="text-cyan-300 font-bold">{parentMassMsun.toFixed(1)} M_sun</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="20.0"
                  step="0.2"
                  value={parentMassMsun}
                  onChange={(e) => setParentMassMsun(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Taylor HABITABLE ZONE best fit: 7.2 M_sun</span>
              </div>

              {/* Kerr Spin Parameter Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Kerr Spin (a/M)</span>
                  <span className="text-purple-300 font-bold">{kerrSpinParam.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.99"
                  step="0.05"
                  value={kerrSpinParam}
                  onChange={(e) => setKerrSpinParam(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">JWST Galaxy Spin Parity Asymmetry</span>
              </div>

              {/* Torsion Coupling Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">ECSK Torsion Coupling (τ_spin)</span>
                  <span className="text-amber-300 font-bold">{torsionCoupling.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={torsionCoupling}
                  onChange={(e) => setTorsionCoupling(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Fermion Spin Singularity Aversion</span>
              </div>

              {/* Neutron Star TOV Mass Limit Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">CNS TOV Limit (M_TOV)</span>
                  <span className="text-emerald-300 font-bold">{tovMassLimit.toFixed(2)} M_sun</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="3.0"
                  step="0.05"
                  value={tovMassLimit}
                  onChange={(e) => setTovMassLimit(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">Stress Test: PSR J0952-0607 (2.35 M_sun)</span>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Orbit className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Metric Junction &amp; Torsion Bounce Metrics</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ISRAEL JUNCTION METRIC MATCHED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Schwarzschild Radius R_s</span>
                  <div className="text-lg font-bold text-cyan-300">{cosmologyResults.rsKm} km</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Hawking Temperature T_H</span>
                  <div className="text-sm font-bold text-purple-300">{cosmologyResults.hawkingTempK} K</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Minimum Bounce Radius</span>
                  <div className="text-xs font-bold text-amber-300">{cosmologyResults.rMinPlanckExp} m</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">JWST Galaxy Spin Parity</span>
                  <div className="text-sm font-bold text-rose-300">{cosmologyResults.cwExcessPercent}% CW ({cosmologyResults.chiralitySigma}σ)</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 sm:col-span-2 col-span-2">
                  <span className="text-slate-400 text-[10px]">PSR J0952-0607 Pulsar Stress Test</span>
                  <div className="text-xs font-bold text-emerald-400">{cosmologyResults.psrCompatible}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase">Normalized Horizon Radius (r / R_s) vs Spin-Torsion Repulsive Pressure</h3>
                <div className="h-64 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cosmologyResults.radialProfile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="rNormalized" stroke="#64748b" label={{ value: 'Normalized Radius (r / R_s)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#f59e0b" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <ReferenceLine x={1.0} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Event Horizon R_s', fill: '#38bdf8', fontSize: 10 }} />
                      <Line type="monotone" dataKey="torsionPressure" name="Spin-Torsion Pressure" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="curvatureR" name="Spacetime Curvature R" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'APOLLO_17_LUNAR' ? (
        /* TAB 4: APOLLO 17 LUNAR BLUE LIGHTS (#20) */
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Lunar Orbital Photogrammetry • Apollo 17 Triangular Blue Lights (#20)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Apollo 17 Orbital Imagery Ray Tracing &amp; Flare Elimination Engine
            </h1>
            <p className="text-slate-300 text-sm font-sans leading-relaxed max-w-4xl">
              Photogrammetric ray tracing, lens flare artifact rejection, and 3-point formation flight dynamics solver for the 
              triangular monochromatic blue luminous sources discovered in NASA Apollo 17 lunar orbital film frames.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">Lunar Orbit &amp; Optical Inputs</h2>
              </div>

              {/* Altitude Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Lunar Orbit Altitude</span>
                  <span className="text-cyan-300 font-bold">{lunarOrbitAltKm} km</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="10"
                  value={lunarOrbitAltKm}
                  onChange={(e) => setLunarOrbitAltKm(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Separation Slider */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">Tri-Point Separation</span>
                  <span className="text-purple-300 font-bold">{triSeparationM} meters</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={triSeparationM}
                  onChange={(e) => setTriSeparationM(Number(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase">Lens Flare Rejection Results</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {apolloResults.flareRejectionPercent}% LENS FLARE REJECTED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Formation Velocity</span>
                  <div className="text-lg font-bold text-cyan-300">{apolloResults.triFormationVelocityKmS} km/s</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Wavelength Spectrum</span>
                  <div className="text-sm font-bold text-purple-300">{apolloResults.monochromaticPurity}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5 sm:col-span-1 col-span-2">
                  <span className="text-slate-400 text-[10px]">Pentagon UAP File Status</span>
                  <div className="text-sm font-bold text-amber-300">Classified Unidentified</div>
                </div>
              </div>

              {/* Chart */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase">Apollo 17 Frames vs Luminous Source Intensity (Lumens)</h3>
                <div className="h-64 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apolloResults.formationProfile} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="frameNo" stroke="#64748b" />
                      <YAxis stroke="#c084fc" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="lumens" name="Luminous Flux (Lumens)" stroke="#c084fc" strokeWidth={2} dot={{ r: 4, fill: '#c084fc' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 1: ORIGINAL CROSS-DOMAIN SIGNAL MATRIX */
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
              <Orbit className="w-4 h-4" />
              <span>Integrated Geophysics &amp; Heliophysics Atlas</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">
              Cross-Domain Signal Correlation Matrix (8x8 Empirical Suite)
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
              Evaluating global co-variance between magnetospheric B-field vectors, crustal magnetization, infrasound, 
              solar plasma shocks, cosmic rays, and plant pulvini elongation.
            </p>
          </div>

          {/* Controls & Filter Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-100 uppercase">Matrix Display &amp; Filtering Controls</h2>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['ALL', 'GEOPHYSICS', 'SPACE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat as any)}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      categoryFilter === cat
                        ? 'bg-cyan-600 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Primary Signal A</span>
                <select
                  value={sigAId}
                  onChange={(e) => setSigAId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                >
                  {ANOMALOUS_SIGNALS.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Secondary Signal B</span>
                <select
                  value={sigBId}
                  onChange={(e) => setSigBId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                >
                  {ANOMALOUS_SIGNALS.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scatter Plot & Interpretation Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-bold text-cyan-400">ACTIVE PAIR COUPLING</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  p = {activePairStats.pVal}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pearson Correlation r:</span>
                  <span className="font-bold text-slate-100">{activePairStats.r}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spearman Rank Correlation:</span>
                  <span className="font-bold text-slate-100">{activePairStats.spearman}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mutual Information:</span>
                  <span className="font-bold text-purple-300">{activePairStats.mutualInfo} bits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Optimal Time Lag τ:</span>
                  <span className="font-bold text-amber-300">{activePairStats.optimalLagSec}s</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                {activePairStats.interpretation}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
                Pairwise Co-Variance Scatter Plot ({sigA.code} vs {sigB.code})
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="x" name={sigA.name} unit={sigA.unit} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="y" name={sigB.name} unit={sigB.unit} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Scatter name="Empirical Points" data={scatterData} fill="#38bdf8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
