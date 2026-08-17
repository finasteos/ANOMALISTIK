import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import { Activity, Radio, Satellite, Wifi, WifiOff, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../ThemeContext';

// ── Types ──────────────────────────────────────────────────────────────────
interface MagPoint   { t: string; bt: number | null; bx_gsm: number | null; by_gsm: number | null; bz_gsm: number | null; }
interface PlasmaPoint { t: string; density: number | null; speed: number | null; temperature: number | null; }
interface ImagPoint   { t: string; X: number | null; Y: number | null; Z: number | null; F: number | null; }

interface Snapshot {
  bz_gsm: number | null;
  bt: number | null;
  bx_gsm: number | null;
  by_gsm: number | null;
  solar_speed: number | null;
  density: number | null;
  kp_proxy: number | null;
  timestamp: string | null;
}

interface GeospaceData {
  source_file: string;
  rows_total: number;
  rows_returned: number;
  last_updated: string;
  snapshot: Snapshot;
  timeseries: {
    dscovr_mag: MagPoint[];
    dscovr_plasma: PlasmaPoint[];
    stations: Record<string, ImagPoint[]>;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number | null, dec = 1, unit = '') =>
  v === null ? '—' : `${v.toFixed(dec)}${unit}`;

const shortTime = (iso: string) => {
  try { return new Date(iso).toUTCString().slice(17, 25) + ' UTC'; }
  catch { return iso.slice(11, 19); }
};

const bzColor = (bz: number | null) => {
  if (bz === null) return '#64748b';
  if (bz < -10) return '#ef4444';
  if (bz < -5)  return '#f97316';
  if (bz < 0)   return '#facc15';
  return '#22c55e';
};

const kpLabel = (kp: number | null) => {
  if (kp === null) return { label: '—', color: '#64748b' };
  if (kp >= 7) return { label: `Kp~${kp} EXTREME`, color: '#ef4444' };
  if (kp >= 5) return { label: `Kp~${kp} STORM`,   color: '#f97316' };
  if (kp >= 3) return { label: `Kp~${kp} ACTIVE`,  color: '#facc15' };
  return { label: `Kp~${kp} QUIET`, color: '#22c55e' };
};

// ── Sparkline metric card ──────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string;
  value: string;
  color: string;
  sub?: string;
}> = ({ label, value, color, sub }) => (
  <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-0.5">
    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{label}</span>
    <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
    {sub && <span className="text-[10px] text-slate-500 font-mono">{sub}</span>}
  </div>
);

// ── Custom tooltip ─────────────────────────────────────────────────────────
const GeoTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono shadow-xl">
      <div className="text-slate-400 mb-1">{shortTime(label)}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : '—'}
        </div>
      ))}
    </div>
  );
};

// ── Status dot ────────────────────────────────────────────────────────────
const StatusDot: React.FC<{ ok: boolean; label: string; age?: number | null }> = ({ ok, label, age }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
    <span className="text-[10px] font-mono text-slate-400">{label}</span>
    {age !== undefined && age !== null && (
      <span className="text-[10px] font-mono text-slate-600">{age}m ago</span>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export const GeospaceliveFeed: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<GeospaceData | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [showPlasma, setShowPlasma] = useState(false);
  const [showStations, setShowStations] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [geoRes, statusRes] = await Promise.all([
        fetch('/api/geospace'),
        fetch('/api/geospace/status'),
      ]);

      if (!geoRes.ok) {
        const j = await geoRes.json().catch(() => ({}));
        setError(j.error || `HTTP ${geoRes.status}`);
        setData(null);
      } else {
        const j = await geoRes.json();
        setData(j);
        setError(null);
      }

      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }

      setLastFetch(new Date());
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount + refresh every 5 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const snap = data?.snapshot;
  const magSeries  = data?.timeseries.dscovr_mag     ?? [];
  const plasmaSeries = data?.timeseries.dscovr_plasma ?? [];
  const stationKeys  = Object.keys(data?.timeseries.stations ?? {});

  // Down-sample for chart performance (max 120 points)
  const downsample = <T,>(arr: T[], max = 120): T[] => {
    if (arr.length <= max) return arr;
    const step = Math.ceil(arr.length / max);
    return arr.filter((_, i) => i % step === 0);
  };

  const magChart    = downsample(magSeries);
  const plasmaChart = downsample(plasmaSeries);

  return (
    <div className="space-y-4">
      {/* ── Header row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest uppercase">
            Live Geospace Feed
          </span>
          {loading && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />}
        </div>

        {/* Pipeline status pills */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusDot ok={!!status?.pipeline_ready}    label="Pipeline"   />
          <StatusDot ok={!!status?.dscovr_age_min !== null && (status?.dscovr_age_min ?? 9999) < 120}
                     label="DSCOVR"    age={status?.dscovr_age_min} />
          <StatusDot ok={!!status?.eida_age_min !== null && (status?.eida_age_min ?? 9999) < 240}
                     label="EIDA"      age={status?.eida_age_min} />
          <StatusDot ok={!!status?.intermagnet_age_min !== null}
                     label="INTERMAGNET" age={status?.intermagnet_age_min} />
          <button
            onClick={fetchData}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-400 transition-colors ml-1"
          >
            <RefreshCw className="w-3 h-3" />
            {lastFetch ? shortTime(lastFetch.toISOString()) : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error / not-ready state ────────────────────────────────────── */}
      {error && (
        <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-amber-300 text-xs font-mono font-semibold">Pipeline data unavailable</p>
            <p className="text-amber-400/70 text-[11px] font-mono">{error}</p>
            <p className="text-slate-400 text-[11px] font-mono mt-2">
              Kör i terminal:{' '}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">
                .venv/bin/python3 scripts/fetch_geospace_sync.py
              </code>
            </p>
          </div>
        </div>
      )}

      {/* ── Snapshot cards ─────────────────────────────────────────────── */}
      {snap && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <MetricCard
              label="Bz (GSM)"
              value={fmt(snap.bz_gsm, 1, ' nT')}
              color={bzColor(snap.bz_gsm)}
              sub={snap.bz_gsm !== null
                ? snap.bz_gsm < 0 ? '↓ Southward (geomag active)' : '↑ Northward (quiet)'
                : undefined}
            />
            <MetricCard
              label="|B| total"
              value={fmt(snap.bt, 1, ' nT')}
              color="#38bdf8"
              sub="DSCOVR @ L1"
            />
            <MetricCard
              label="Solar Wind"
              value={fmt(snap.solar_speed, 0, ' km/s')}
              color="#a78bfa"
              sub={snap.density !== null ? `ρ = ${snap.density.toFixed(1)} p/cc` : undefined}
            />
            <MetricCard
              label="Kp Proxy"
              value={kpLabel(snap.kp_proxy).label}
              color={kpLabel(snap.kp_proxy).color}
              sub={snap.timestamp ? shortTime(snap.timestamp) : undefined}
            />
          </div>

          {/* ── DSCOVR Magnetometer Chart ─────────────────────────────── */}
          {magChart.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">
                  DSCOVR Magnetometer — Bx / By / Bz (GSM)
                </span>
                <span className="text-[10px] text-slate-500 font-mono ml-auto">
                  {magChart.length} pts · source: NOAA SWPC
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={magChart} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }}
                    tickFormatter={shortTime}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} />
                  <Tooltip content={<GeoTooltip />} />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                  <Line dataKey="bz_gsm" name="Bz" stroke="#ef4444" dot={false} strokeWidth={1.5} />
                  <Line dataKey="bt"     name="|B|" stroke="#38bdf8" dot={false} strokeWidth={1.5} />
                  <Line dataKey="bx_gsm" name="Bx" stroke="#64748b" dot={false} strokeWidth={1} />
                  <Line dataKey="by_gsm" name="By" stroke="#94a3b8" dot={false} strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Plasma (collapsible) ───────────────────────────────────── */}
          {plasmaChart.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowPlasma(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">
                    DSCOVR Plasma — Solar Wind Speed & Density
                  </span>
                </div>
                {showPlasma ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {showPlasma && (
                <div className="px-3 pb-3">
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={plasmaChart} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }}
                             tickFormatter={shortTime} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'monospace' }} />
                      <Tooltip content={<GeoTooltip />} />
                      <Area dataKey="speed" name="Speed km/s" stroke="#a78bfa"
                            fill="url(#speedGrad)" strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── INTERMAGNET stations (collapsible) ────────────────────── */}
          {stationKeys.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowStations(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">
                    INTERMAGNET — {stationKeys.length} Station{stationKeys.length > 1 ? 's' : ''}: {stationKeys.join(' · ')}
                  </span>
                </div>
                {showStations ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {showStations && (
                <div className="px-3 pb-3 space-y-3">
                  {stationKeys.map(sta => {
                    const pts = downsample(data!.timeseries.stations[sta]);
                    return (
                      <div key={sta}>
                        <p className="text-[10px] font-mono text-slate-500 mb-1 uppercase">{sta} — F (total field, nT)</p>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={pts} margin={{ top: 2, right: 8, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#475569', fontFamily: 'monospace' }}
                                   tickFormatter={shortTime} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 8, fill: '#475569', fontFamily: 'monospace' }} />
                            <Tooltip content={<GeoTooltip />} />
                            <Line dataKey="F" name="F nT" stroke="#22c55e" dot={false} strokeWidth={1.5} />
                            <Line dataKey="Z" name="Z nT" stroke="#86efac" dot={false} strokeWidth={1} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Data provenance ───────────────────────────────────────── */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span>📁 {data?.source_file} · {data?.rows_total} rows total</span>
            <span>Uppdaterad {data?.last_updated ? shortTime(data.last_updated) : '—'}</span>
          </div>
        </>
      )}

      {/* ── Empty / no data state ─────────────────────────────────────── */}
      {!loading && !error && !snap && (
        <div className="text-center py-8 text-slate-500 text-sm font-mono">
          Inga geospace-data laddade än.
        </div>
      )}
    </div>
  );
};
