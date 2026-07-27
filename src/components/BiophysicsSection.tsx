import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, XCircle, Flame, Layers, Award } from 'lucide-react';
import { BIOPHYSICAL_MARKERS } from '../data/labData';
import { useTheme } from '../ThemeContext';

export const BiophysicsSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [selectedMarker, setSelectedMarker] = useState(BIOPHYSICAL_MARKERS[0]);

  return (
    <div className="space-y-8 animate-fade-in font-mono">
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
  );
};

