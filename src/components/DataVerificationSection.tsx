import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  Database, 
  Server, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Globe,
  Radio,
  Activity,
  Zap,
  Layers,
  Sparkles,
  Sliders,
  Download,
  Filter,
  Eye,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Atom,
  Binary
} from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface VerificationLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface WishlistItem {
  id: string;
  streamName: string;
  sensorType: string;
  format: string;
  sampleRate: string;
  justification: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sampleSchema: string;
}

const RESEARCHER_WISHLIST_DATA: WishlistItem[] = [
  {
    id: 'rf-iq',
    streamName: '1.6 GHz & 2–5 MHz Raw SDR I/Q Dumps',
    sensorType: 'Software Defined Radio (Ettus USRP / HackRF / BladeRF)',
    format: 'SigMF (.sigmf-data + .sigmf-meta JSON)',
    sampleRate: '≥ 40 MS/s Complex 16-bit I/Q',
    justification: 'Enables independent FFT demodulation, phase noise analysis, and detection of injected drone kill commands or non-local EMP coupling.',
    priority: 'CRITICAL',
    sampleSchema: JSON.stringify({
      "global": {
        "core:datatype": "ci16_le",
        "core:sample_rate": 40000000,
        "core:version": "1.0.0",
        "core:hw": "Ettus USRP X310 + GPSDO (1 PPS synchronized)",
        "core:author": "Skinwalker Research Telemetry Node",
        "core:frequency": 1618000000
      },
      "captures": [{ "core:sample_start": 0, "core:time": "2026-08-17T00:15:00.000000Z" }]
    }, null, 2)
  },
  {
    id: 'gamma-dosimetry',
    streamName: 'Microsecond Event-by-Event Gamma List-Mode',
    sensorType: 'Scintillation Spectrometer (NaI:Tl / HPGe / CeBr3)',
    format: 'ANSI N42.42 XML / Unbinned CSV List Mode',
    sampleRate: 'Event-by-Event List Mode (0.01 to 10.0 MeV, <1 µs tag)',
    justification: 'Separates localized non-cosmic gamma radiation spikes causing sterile tissue necrosis from baseline terrestrial and cosmic muon showers.',
    priority: 'CRITICAL',
    sampleSchema: `<?xml version="1.0" encoding="UTF-8"?>
<RadInstrumentData xmlns="http://physics.nist.gov/N42/2011/N42">
  <RadInstrumentInformation>
    <RadInstrumentManufacturerName>Mirion / Canberra HPGe</RadInstrumentManufacturerName>
    <RadInstrumentModelName>Skinwalker Station 3 Crest</RadInstrumentModelName>
  </RadInstrumentInformation>
  <EnergyCalibration ChannelData="0 1024 2048 4096" EnergyData="0.0 2.5 5.0 10.0"/>
  <RadiationEventList TimeStamp="2026-08-17T00:15:30.124567Z" EnergyMeV="4.82" RealTimeSec="0.000001"/>
</RadInstrumentData>`
  },
  {
    id: 'lidar-gnss',
    streamName: 'Raw 3D LiDAR Point Cloud & GNSS Ephemeris / C/N0',
    sensorType: 'RIEGL VUX-1UAV LiDAR + Septentrio AsteRx RTK GNSS',
    format: 'LAS / LAZ 1.4 + RINEX 3.04 (.rnx) / UBX Raw Logs',
    sampleRate: '1.2 MHz Laser Pulse + 20 Hz GNSS Raw Observations',
    justification: 'Distinguishes genuine gravitational-electromagnetic metric phase delays (50–100 ft vertical jumps) from ground jamming or spoofing at 3,271 ft.',
    priority: 'CRITICAL',
    sampleSchema: JSON.stringify({
      "lidar_format": "LAS 1.4 Point Format 6",
      "coordinate_system": "UTM Zone 12N NAD83",
      "gnss_logging": {
        "raw_carrier_phase_L1_L2": true,
        "carrier_to_noise_snr_db": "Continuous C/N0 @ 20Hz",
        "pseudorange_multipath_filter": "UNFILTERED_RAW"
      }
    }, null, 2)
  },
  {
    id: 'gpr-radargrams',
    streamName: 'Unprocessed Time-Domain GPR & Seismic Reflection',
    sensorType: 'GSSI SIR-4000 (100MHz / 400MHz) + Seismic Geophone Array',
    format: 'SEG-Y (.sgy) / GSSI Raw .dzt (Zero Post-Processing)',
    sampleRate: '512 samples/trace @ 100 scans/sec',
    justification: 'Permits global geophysicists to independently reconstruct dielectric boundaries for the Mesa rockslide 50m cigar anomaly and subterranean cavern voids.',
    priority: 'HIGH',
    sampleSchema: JSON.stringify({
      "segy_revision": "SEG-Y rev 1",
      "time_window_ns": 450,
      "dielectric_constant_relative": 6.2,
      "trace_coordinate_datum": "WGS84_MESA_BOREHOLE_TRANSECT"
    }, null, 2)
  },
  {
    id: 'radiometric-ir',
    streamName: '14-Bit Radiometric Thermal Video (31-ft Portal Zone)',
    sensorType: 'FLIR A655sc / Telops FAST-IR MWIR (3–5 µm & 8–14 µm)',
    format: 'Uncompressed Radiometric SEQ / Multi-page 16-bit TIFF',
    sampleRate: '640x512 @ 60 FPS (Calibrated Kelvin / °C Matrix)',
    justification: 'Correlates the hovering 31-foot symmetrical thermal radiance contour against Navajo sand painting portal geometries and petroglyphic vectors.',
    priority: 'HIGH',
    sampleSchema: JSON.stringify({
      "radiometric_format": "FLIR_SEQ_14BIT",
      "atmospheric_transmission_tau": 0.94,
      "emissivity_assumed": 0.98,
      "target_elevation_agl_ft": 31.0,
      "sensor_wavelength_um": "8.0-14.0 (LWIR)"
    }, null, 2)
  },
  {
    id: 'sem-xrf-raw',
    streamName: 'SEM / EDS / XRF Photon Spectrum Array (Mesa Metamaterial)',
    sensorType: 'Field Emission SEM + Oxford Instruments EDS / Bruker XRD',
    format: 'EMSA/MAS Spectral Data (.emsa) + Raw XRD Two-Theta Arrays',
    sampleRate: '10 eV/channel, 2048 channels, Live Time 300s',
    justification: 'Allows global metallurgical verification of the 50/50 Fe-Al stoichiometric ratio, confirmation of 0.00% Ni, and Tellurium/Europium doping profile.',
    priority: 'HIGH',
    sampleSchema: `#FORMAT      : EMSA/MAS Spectral Data File
#VERSION     : 1.0
#TITLE       : Skinwalker Mesa Core Drill Sheared Metamaterial
#DATE        : 2026-08-17
#XUNITS      : eV
#YUNITS      : COUNTS
#CHANNELS    : 2048
#OFFSET      : 0.0
#XPERCHAN    : 10.0
#ELEMENTS    : Fe, Al, Te, Eu
#NICKEL_PCT  : 0.000`
  },
  {
    id: 'geomag-fluxgate',
    streamName: '100 Hz High-Rate 3-Axis Fluxgate Magnetometer Vectors',
    sensorType: 'Bartington Mag-03MS100 3-Axis Low-Noise Sensor',
    format: 'INTERMAGNET 100Hz CDF / Standard ASCII Columnar',
    sampleRate: '100 Hz Continuous Vector (Bx, By, Bz) in nT (0.01 nT res)',
    justification: 'Captures microsecond-scale transient dB/dt pulses synchronized with multi-state EMP coupling incidents across remote receiver nodes.',
    priority: 'MEDIUM',
    sampleSchema: JSON.stringify({
      "sensor": "Bartington 3-Axis Fluxgate",
      "sample_rate_hz": 100,
      "units": "nanoTesla (nT)",
      "baseline_epoch": "2026-08-17T00:00:00Z",
      "columns": ["TIMESTAMP_UTC_EPOCH_MS", "BX_NT", "BY_NT", "BZ_NT", "TOTAL_FIELD_F"]
    }, null, 2)
  }
];

export const DataVerificationSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  
  // Active intake target: 'CDLI_CORPUS' or 'SKINWALKER_OPEN_DATA'
  const [activeTarget, setActiveTarget] = useState<'CDLI_CORPUS' | 'SKINWALKER_OPEN_DATA'>('SKINWALKER_OPEN_DATA');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [logs, setLogs] = useState<VerificationLog[]>([]);

  // Wishlist interactive state
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<WishlistItem>(RESEARCHER_WISHLIST_DATA[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isWishlistExpanded, setIsWishlistExpanded] = useState<boolean>(true);

  const handleCopySchema = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadWishlistJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(RESEARCHER_WISHLIST_DATA, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "ANOMALISTIK_Skinwalker_Public_Data_Wishlist_v1.0.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const runCdliScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setLogs([]);

    const sequence = [
      { msg: 'Initiating connection to CDLI Main API (cdli.mpiwg-berlin.mpg.de)...', delay: 400, type: 'info' as const },
      { msg: 'Authentication successful. Requesting current P-Number manifests.', delay: 900, type: 'success' as const },
      { msg: 'Downloading remote SHA-256 hash tables for 4,295 Cuneiform artifacts...', delay: 1600, type: 'info' as const },
      { msg: 'Comparing remote hashes against local CEIPP & CDLI cache...', delay: 2600, type: 'info' as const },
      { msg: 'WARNING: Hash mismatch detected on P393042 (Uruk IV administrative tablet).', delay: 3600, type: 'warning' as const },
      { msg: 'WARNING: Metadata drift detected on P393043 (Phonetic normalization modified).', delay: 4200, type: 'warning' as const },
      { msg: 'Integrity check complete. 4,293 artifacts synchronized. 2 anomalies flagged.', delay: 5200, type: 'error' as const }
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
          message: item.msg,
          type: item.type
        }]);
        
        if (index === sequence.length - 1) {
          setIsScanning(false);
          setScanComplete(true);
        }
      }, item.delay);
    });
  };

  const runSkinwalkerIntake = () => {
    setIsScanning(true);
    setScanComplete(false);
    setLogs([]);

    const sequence = [
      { msg: 'Connecting to Skinwalker Open-Access Raw Telemetry Ingestion Hub (Public Node)...', delay: 400, type: 'info' as const },
      { msg: 'Handshake verified. Ingesting raw multi-sensor telemetry packets (Epoch: LIVE).', delay: 900, type: 'success' as const },
      { msg: 'Ingesting Stream 1: 1.610–1.625 GHz RF I/Q Raw Dump (40 MS/s, 16-bit Complex)...', delay: 1500, type: 'info' as const },
      { msg: 'ANOMALY DETECTED [Stream 1]: High-amplitude 1.618 GHz burst detected (+42.4 dB SNR over noise floor).', delay: 2300, type: 'warning' as const },
      { msg: 'Ingesting Stream 2: Gamma Scintillation & Dosimetry (Station 3 & Mesa Crest)...', delay: 3000, type: 'info' as const },
      { msg: 'ANOMALY DETECTED [Stream 2]: Transient Gamma Spike: 4.8 µSv/h (Threshold: 0.15 µSv/h, z = +8.4).', delay: 3700, type: 'error' as const },
      { msg: 'Ingesting Stream 3: 3D LiDAR & Drone Swarm Barometric/GPS Telemetry...', delay: 4300, type: 'info' as const },
      { msg: 'ANOMALY DETECTED [Stream 3]: GPS C/N0 step-function attenuation (-31.2 dB) at 3,271 ft AGL.', delay: 4900, type: 'warning' as const },
      { msg: 'Ingesting Stream 4: 31-Foot Low-Altitude Radiometric IR Feed & Subsurface GPR Slices...', delay: 5500, type: 'info' as const },
      { msg: 'CORRELATION VERIFIED: 31 ft Symmetrical IR radiance contour matches Navajo portal iconography (z = -9.2).', delay: 6100, type: 'success' as const },
      { msg: 'Batch Ingestion Complete: 12,480 packets triaged. 3 Level-1 Anomaly Signals confirmed against Fisher-Yates nulls.', delay: 6800, type: 'success' as const }
    ];

    sequence.forEach((item, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
          message: item.msg,
          type: item.type
        }]);
        
        if (index === sequence.length - 1) {
          setIsScanning(false);
          setScanComplete(true);
        }
      }, item.delay);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
          <span>Data Ingestion &amp; Open-Source Verification Hub</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
          Real-Time Telemetry Intake &amp; Epistemic Integrity
        </h1>
        <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          Ingest raw, unedited public telemetry streams and cross-reference local datasets against authoritative remote repositories. 
          Democratizing anomalous signal adjudication through open-access sensor validation and cryptographic integrity verification.
        </p>
      </div>

      {/* Target Selection Switcher */}
      <div className={`flex flex-wrap p-1.5 rounded-xl border gap-2 ${
        isLight ? 'bg-stone-100 border-stone-300' : 'bg-slate-950 border-slate-800'
      }`}>
        <button
          onClick={() => {
            setActiveTarget('SKINWALKER_OPEN_DATA');
            setScanComplete(false);
            setLogs([]);
          }}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 ${
            activeTarget === 'SKINWALKER_OPEN_DATA'
              ? (isLight ? 'bg-white text-stone-900 shadow-sm border border-stone-300' : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20')
              : (isLight ? 'text-stone-600 hover:bg-stone-200' : 'text-slate-400 hover:bg-slate-900')
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Skinwalker Public Raw Telemetry Stream (NEW)</span>
        </button>

        <button
          onClick={() => {
            setActiveTarget('CDLI_CORPUS');
            setScanComplete(false);
            setLogs([]);
          }}
          className={`flex-1 min-w-[240px] py-3 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 ${
            activeTarget === 'CDLI_CORPUS'
              ? (isLight ? 'bg-white text-stone-900 shadow-sm border border-stone-300' : 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20')
              : (isLight ? 'text-stone-600 hover:bg-stone-200' : 'text-slate-400 hover:bg-slate-900')
          }`}
        >
          <Database className="w-4 h-4" />
          <span>CDLI Epigraphic &amp; Cuneiform Corpus Sync</span>
        </button>
      </div>

      {/* PUBLIC DATA RELEASE WISHLIST BANNER (VISIBLE DIRECTLY IN FEED) */}
      {activeTarget === 'SKINWALKER_OPEN_DATA' && (
        <div className={`border rounded-2xl p-6 transition-all shadow-sm space-y-5 ${
          isLight ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-950/90 border-cyan-500/40 shadow-cyan-950/30'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-current/10">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${
                isLight ? 'bg-amber-200 text-amber-900' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLight ? 'bg-amber-200 text-amber-900' : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                  }`}>
                    📡 Open Science Initiative
                  </span>
                  <span className="text-[10px] opacity-60">ANOMALISTIK Spec v1.0</span>
                </div>
                <h3 className={`text-base md:text-lg font-black uppercase tracking-wide mt-0.5 ${
                  isLight ? 'text-stone-900' : 'text-slate-100'
                }`}>
                  Public Data Release Wishlist &amp; Schema Matrix
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadWishlistJson}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border shadow-sm ${
                  isLight 
                    ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300' 
                    : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Wishlist (.JSON)</span>
              </button>
              <button
                onClick={() => setIsWishlistExpanded(!isWishlistExpanded)}
                className={`p-2 rounded-lg text-xs font-bold transition border ${
                  isLight 
                    ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isWishlistExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className={`text-xs font-sans leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
            To the Skinwalker Ranch Research &amp; Operations Team: Here are the 7 standardized, uncompressed raw sensor 
            data formats and sampling thresholds requested by independent physicists and data scientists for decentralized Layer 1 null-hypothesis adjudication.
          </p>

          {isWishlistExpanded && (
            <div className="space-y-4 animate-fade-in">
              {/* Wishlist Sensor Stream Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {RESEARCHER_WISHLIST_DATA.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedWishlistItem(item)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedWishlistItem.id === item.id
                        ? (isLight ? 'bg-white border-amber-500 shadow-sm ring-2 ring-amber-400/40' : 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400')
                        : (isLight ? 'bg-amber-100/60 border-amber-200 hover:bg-white' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80')
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-sky-500/20 text-sky-400'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold truncate mt-2 text-slate-200">
                      {item.streamName.split(' ')[0]} {item.streamName.split(' ')[1]}
                    </span>
                    <span className="text-[9px] opacity-60 truncate">
                      {item.format.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Item Specification Card */}
              <div className={`p-4 md:p-5 rounded-xl border space-y-3 ${
                isLight ? 'bg-white border-stone-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-current/10">
                  <div>
                    <h4 className="text-sm font-bold flex items-center space-x-2 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                      <span>{selectedWishlistItem.streamName}</span>
                    </h4>
                    <span className="text-[10px] opacity-70">
                      Sensor: {selectedWishlistItem.sensorType} • Preferred Format: <span className="font-bold text-amber-400">{selectedWishlistItem.format}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-bold">
                      {selectedWishlistItem.sampleRate}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-sans space-y-1.5">
                  <span className="font-bold font-mono text-[11px] text-slate-400">Scientific Justification &amp; Anomaly Metric:</span>
                  <p className={`leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
                    {selectedWishlistItem.justification}
                  </p>
                </div>

                {/* Schema Snippet & Copy Action */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono opacity-70">
                    <span>Standardized Ingestion Schema Payload (RFC/N42/SigMF compliant):</span>
                    <button
                      onClick={() => handleCopySchema(selectedWishlistItem.sampleSchema)}
                      className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Schema'}</span>
                    </button>
                  </div>
                  <pre className={`p-3 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed border max-h-48 ${
                    isLight ? 'bg-stone-900 text-amber-300 border-stone-800' : 'bg-black text-cyan-300 border-slate-800'
                  }`}>
                    {selectedWishlistItem.sampleSchema}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Verification & Ingestion Console */}
      <div className={`border rounded-2xl p-6 md:p-8 ${isLight ? 'bg-white border-stone-300' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Target Info & Ingestion Triggers */}
          <div className="flex-1 space-y-4">
            <h3 className={`font-bold font-mono text-base ${theme.primaryTextColor} flex items-center space-x-2`}>
              {activeTarget === 'SKINWALKER_OPEN_DATA' ? (
                <>
                  <Radio className="w-5 h-5 text-cyan-400" />
                  <span>Target: Skinwalker Open Data Live Stream</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Target: CDLI (Cuneiform Digital Library)</span>
                </>
              )}
            </h3>
            
            {activeTarget === 'SKINWALKER_OPEN_DATA' ? (
              <div className={`p-4 rounded-xl border text-xs font-mono space-y-3 ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Data Source</span>
                  <span className="font-bold text-cyan-400">Public Open-Access Sensor Mesh</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Live Stream Bandwidth</span>
                  <span className="font-bold">120 MB/s (I/Q + LiDAR + Gamma)</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Active Sensor Channels</span>
                  <span className="font-bold">5 Concurrent Nodes</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">SHA-256 Checksum</span>
                  <span className="font-bold font-mono text-[10px] text-emerald-400">VERIFIED_IMMUTABLE</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="opacity-70">Null Test Pipeline</span>
                  {scanComplete ? (
                    <span className="font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>3 ANOMALIES ADJUDICATED</span>
                    </span>
                  ) : (
                    <span className={`font-bold flex items-center space-x-1 ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                      <span>AWAITING STREAM INTAKE</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border text-xs font-mono space-y-3 ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Local Epigraphic Records</span>
                  <span className="font-bold">4,295 Cuneiform Inscriptions</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Authoritative API</span>
                  <span className="font-bold flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-cyan-400" />
                    <span>cdli.mpiwg-berlin.mpg.de</span>
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 border-current/10">
                  <span className="opacity-70">Last Hash Verification</span>
                  <span className="font-bold">2026-08-16 23:45 UTC</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="opacity-70">Corpus Drift Status</span>
                  {scanComplete ? (
                    <span className="font-bold text-rose-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>2 DRIFT ANOMALIES</span>
                    </span>
                  ) : (
                    <span className={`font-bold flex items-center space-x-1 ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                      <span>PENDING AUDIT</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={activeTarget === 'SKINWALKER_OPEN_DATA' ? runSkinwalkerIntake : runCdliScan}
              disabled={isScanning}
              className={`w-full py-3.5 rounded-xl font-bold font-mono text-sm transition-all flex items-center justify-center space-x-2 shadow-md ${
                isScanning 
                  ? 'opacity-50 cursor-not-allowed border ' + (isLight ? 'bg-stone-200 text-stone-500' : 'bg-slate-800 text-slate-500')
                  : isLight 
                    ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/20' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{activeTarget === 'SKINWALKER_OPEN_DATA' ? 'Ingesting Raw Telemetry Stream...' : 'Verifying Corpus Hash Tables...'}</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>{activeTarget === 'SKINWALKER_OPEN_DATA' ? 'Initiate Public Raw Telemetry Intake' : 'Run CDLI Epistemic Audit'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Terminal Output & Live Triage */}
          <div className="flex-[1.6]">
             <div className={`h-full min-h-[340px] rounded-xl border font-mono text-xs overflow-hidden flex flex-col shadow-inner ${
               isLight ? 'bg-[#18181b] border-stone-800 text-stone-300' : 'bg-black border-slate-800 text-slate-300'
             }`}>
                <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold tracking-wider text-[11px] uppercase">
                      {activeTarget === 'SKINWALKER_OPEN_DATA' ? 'SKINWALKER_TELEMETRY_INGESTION_LOG' : 'CDLI_VERIFICATION_TERMINAL'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE_PIPE</span>
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                  {logs.length === 0 && !isScanning && (
                    <div className="opacity-40 italic">
                      {activeTarget === 'SKINWALKER_OPEN_DATA' 
                        ? '📡 Ready to connect to Skinwalker Ranch public raw data feed. Click above to initiate stream ingestion.'
                        : '🏛️ Epistemic engine ready. Awaiting CDLI hash table scan initiation...'}
                    </div>
                  )}
                  {logs.map((log) => (
                    <div key={log.id} className="flex space-x-3 leading-relaxed">
                      <span className="opacity-40 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`${
                        log.type === 'error' ? 'text-rose-400 font-bold' :
                        log.type === 'warning' ? 'text-amber-400 font-bold' :
                        log.type === 'success' ? 'text-emerald-400 font-semibold' :
                        'text-sky-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {isScanning && (
                    <div className="flex space-x-3 opacity-50 animate-pulse">
                      <span className="shrink-0">[{new Date().toISOString().substring(11, 19)} UTC]</span>
                      <span className="text-cyan-400 font-bold">_ [RECEIVING TELEMETRY CHUNKS]</span>
                    </div>
                  )}
                </div>
             </div>
          </div>

        </div>

        {/* Live Stream Adjudication Summary Cards (After Intake) */}
        {scanComplete && activeTarget === 'SKINWALKER_OPEN_DATA' && (
          <div className="mt-8 pt-6 border-t border-current/10 space-y-4 animate-fade-in">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm uppercase flex items-center space-x-2 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Public Stream Adjudication Summary (Skinwalker Raw Feed)</span>
                </h4>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Passed Layer 1 Fisher-Yates Nulls
                </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1.6 GHz Burst Card */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center text-amber-400 font-bold">
                    <span>1.618 GHz RF Burst</span>
                    <span>SNR +42.4 dB</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    High-power narrow-band L-band emission detected directly from ground coordinates during mechanical drilling.
                  </p>
                  <div className="text-[10px] text-cyan-400 font-bold pt-1">
                    Mapped to Biophysics Frey Effect Engine
                  </div>
                </div>

                {/* Gamma Anomaly Card */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center text-rose-400 font-bold">
                    <span>Gamma Spike (4.8 µSv/h)</span>
                    <span>z = +8.4 vs Null</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Non-cosmic localized ionizing gamma burst. Exceeds background baseline by 32x. Correlates with sterile tissue necrosis.
                  </p>
                  <div className="text-[10px] text-rose-400 font-bold pt-1">
                    Mapped to Sterile Radiation Pathology
                  </div>
                </div>

                {/* 31ft IR Portal Card */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>31-ft IR Symmetrical Radiance</span>
                    <span>z = -9.2</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Radiometric infrared contour overlay matches ancient Navajo portal sand paintings and 1,000-yr petroglyph vectors.
                  </p>
                  <div className="text-[10px] text-emerald-400 font-bold pt-1">
                    Mapped to Archaeo-Spatial Portal Engine
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Action Panel for CDLI Drift Resolution */}
        {scanComplete && activeTarget === 'CDLI_CORPUS' && (
          <div className={`mt-6 p-4 rounded-xl border animate-fade-in ${
            isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-900/50'
          }`}>
             <h4 className={`font-bold font-mono flex items-center space-x-2 ${isLight ? 'text-amber-900' : 'text-amber-500'}`}>
               <AlertTriangle className="w-4 h-4" />
               <span>Resolution Required: Epistemic Drift</span>
             </h4>
             <p className={`text-sm mt-2 font-mono ${isLight ? 'text-amber-800' : 'text-amber-400/80'}`}>
               2 artifacts show metadata or hash drift from the authoritative CDLI server (P393042 &amp; P393043). 
               Local corpus translation and entropy models may be impacted if updates are not synchronized.
             </p>
             <div className="mt-4 flex gap-3">
               <button className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition ${
                 isLight ? 'bg-amber-200 hover:bg-amber-300 text-amber-900' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
               }`}>
                 Sync Divergent Records (2)
               </button>
               <button className={`px-4 py-2 rounded-lg font-mono text-xs font-bold border transition ${
                 isLight ? 'bg-transparent border-amber-300 text-amber-900 hover:bg-amber-100' : 'bg-transparent border-amber-700 text-amber-500 hover:bg-amber-950/50'
               }`}>
                 Ignore (Keep Local)
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
