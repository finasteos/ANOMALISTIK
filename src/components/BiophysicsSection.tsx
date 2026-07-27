import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, XCircle, Flame, Layers, Award } from 'lucide-react';
import { BIOPHYSICAL_MARKERS } from '../data/labData';

export const BiophysicsSection: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState(BIOPHYSICAL_MARKERS[0]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs">
          <Database className="w-4 h-4" />
          <span>Track A/B • Classical Anomalistics (BLT Fingerprint Suite)</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">
          Biophysical & Mineralogical Cellular Markers
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Cellular and morphological plant anomalies function as the lab&apos;s empirical &quot;first line of defense&quot;. 
          Cellular node stretching up to 214%, internal steam explosion cavities, and clay mineral XRD shifts cannot be 
          replicated by mechanical tools like planks and ropes.
        </p>
      </div>

      {/* Comparison Banner: Hoax vs Authentic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-sm">
            <XCircle className="w-5 h-5" />
            <span>Human Hoaxes (Planks & Ropes)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-rose-400">•</span>
              <span>Bruised, broken, or crushed plant stems at ground contact</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-400">•</span>
              <span>0% pulvini node elongation beyond natural gravitropism (&lt;20%)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-400">•</span>
              <span>No expulsion cavities, no seed germination energy alteration</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-rose-400">•</span>
              <span>No soil XRD clay crystal shifts or fused meteoric iron glaze</span>
            </li>
          </ul>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Authentic Biophysical Anomalies</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400">•</span>
              <span>Pliable 90° bends without stem breakage or vascular damage</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400">•</span>
              <span>Pulvini node stretching up to +214% matching Beer-Lambert radiation curve</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400">•</span>
              <span>Internal steam explosion cavities (blow-out holes) in lower nodes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400">•</span>
              <span>600–800°C clay XRD interlayer shifts &amp; fused 10-40µm Fe3O4 spheres</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Markers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">
            BLT Marker Suite
          </h2>
          <div className="space-y-2">
            {BIOPHYSICAL_MARKERS.map((marker) => {
              const isSelected = selectedMarker.id === marker.id;
              return (
                <div
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                      {marker.category}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm">{marker.name}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {marker.hoaxReplicationDifficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Marker Detail Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
                {selectedMarker.category} MARKER
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-2">{selectedMarker.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Replication Status: {selectedMarker.hoaxReplicationDifficulty}</p>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Anomalous Recorded Baseline</span>
              <div className="text-sm font-bold text-emerald-400">{selectedMarker.anomalousBaseline}</div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px]">Natural Control Baseline</span>
              <div className="text-sm font-bold text-slate-400">{selectedMarker.naturalBaseline}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase">Biological / Physical Mechanism</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedMarker.mechanism}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase">Key Case Studies & Ingestion Records</h3>
            <div className="flex flex-wrap gap-2">
              {selectedMarker.caseStudies.map((cs, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs font-mono">
                  📍 {cs}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
