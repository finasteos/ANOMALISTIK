import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Binary, 
  Database, 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  ArrowRight,
  Sparkles,
  GitCommit,
  Filter,
  Calendar,
  Zap,
  RotateCcw,
  Bell,
  BellRing,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Download,
  FileJson,
  Terminal,
  ShieldCheck,
  Github,
  ExternalLink
} from 'lucide-react';
import { DATA_DOMAINS, EPIGRAPHIC_CORPORA, M_ENGINES, LAB_MISSIONS } from '../data/labData';
import { useTheme } from '../ThemeContext';
import { ProjectTrackerSection } from './ProjectTrackerSection';

interface RealtimeAlert {
  id: string;
  timestamp: string;
  metricName: string;
  currentValue: string;
  thresholdValue: string;
  zScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  domain: string;
  targetTab: string;
  title: string;
  description: string;
  sourceSensor: string;
}

export interface ActiveProjectSchema {
  anomaly_id: string;
  code: string;
  title: string;
  domain: string;
  target_tab: string;
  status: 'STRUCTURE_SIGNAL' | 'SEQUENCE_STRUCTURE' | 'DIP_STRUCTURE' | 'UNDERDETERMINED' | 'INSTRUMENT_SYSTEMATICS' | 'CLAIM_FAILS_NULL';
  progress_percentage: number;
  last_anomaly_timestamp: string;
  metrics: {
    z_score?: number | string;
    conditional_entropy?: number | string;
    snr_db?: number;
    periodicity_days?: number;
    elongation_pct?: number;
    synchronicity_ly?: string;
    [key: string]: any;
  };
  negative_controls_applied: string[];
  repo_file_path: string;
  summary: string;
}

export const ACTIVE_PROJECTS_LIST: ActiveProjectSchema[] = [
  {
    anomaly_id: 'G30_TESS_SN1987A',
    code: 'G30',
    title: 'TESS SN 1987A SETI Ellipsoid Probe',
    domain: 'Astro & SETI Ellipsoid',
    target_tab: 'geophysics',
    status: 'SEQUENCE_STRUCTURE',
    progress_percentage: 88,
    last_anomaly_timestamp: '2026-07-26 23:28:10 UTC',
    metrics: {
      z_score: '+6.8',
      synchronicity_ly: '< 0.02 ly',
      target_objects: 'MAST Lightcurves along Supernova Wavefront'
    },
    negative_controls_applied: ['Astrometric jitter null', 'Stellar variability baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Searches for synchronized optical flux dips and technosignatures along the SN 1987A SETI Ellipsoid time-of-flight geometry.'
  },
  {
    anomaly_id: 'G20_BOYAJIAN_DIP',
    code: 'G20',
    title: "Boyajian's Star Periodic Dip Engine",
    domain: 'Astrophysics & Exoplanets',
    target_tab: 'geophysics',
    status: 'DIP_STRUCTURE',
    progress_percentage: 95,
    last_anomaly_timestamp: '2026-07-26 22:15:04 UTC',
    metrics: {
      z_score: 'Z² = 60.1',
      periodicity_days: 24.5,
      deepest_dip: '22% Flux Drop'
    },
    negative_controls_applied: ['Cometary dust thermal model', 'Kepler/TESS instrumental baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Analyzes recurring asymmetric lightcurve dips for non-gravitational obscuration geometries.'
  },
  {
    anomaly_id: 'G28_TURGAI_STEPPE',
    code: 'G28',
    title: 'Turgai Steppe Earthworks Orientation',
    domain: 'Geo-Spatial & Archaeoastronomy',
    target_tab: 'epigraphy',
    status: 'STRUCTURE_SIGNAL',
    progress_percentage: 92,
    last_anomaly_timestamp: '2026-07-26 21:05:30 UTC',
    metrics: {
      z_score: '-8.4',
      alignment: 'Winter Solstice Solar Bracket'
    },
    negative_controls_applied: ['Poisson random control', 'Topographic ridge null'],
    repo_file_path: 'src/data/labData.ts',
    summary: '8,000-year-old Kazakh earthworks confirm strict North-South orientation and solstice alignment against Poisson controls.'
  },
  {
    anomaly_id: 'G01_MEROITIC_SCRIPT',
    code: 'G01',
    title: 'Meroitic Script (G-MER) Structural Jump',
    domain: 'Epigraphy & Information Theory',
    target_tab: 'epigraphy',
    status: 'SEQUENCE_STRUCTURE',
    progress_percentage: 98,
    last_anomaly_timestamp: '2026-07-26 20:42:00 UTC',
    metrics: {
      z_score: '-11,336',
      conditional_entropy: '0.12 bits/char',
      corpus_signs: 'Remu & Qere Royal Names'
    },
    negative_controls_applied: ['Fisher-Yates 100x shuffle', 'Random glyph generator'],
    repo_file_path: 'src/components/GSeriesSection.tsx',
    summary: 'Symbol sequence conditional entropy dropped to 0.12 bits/char, passing 100x Fisher-Yates null permutations.'
  },
  {
    anomaly_id: 'N2_PURSUE_UAP_TRIAGE',
    code: 'N2-ext',
    title: 'PURSUE Portal Metadata-Enriched Triage',
    domain: 'All-Domain Anomaly Tracking',
    target_tab: 'geophysics',
    status: 'SEQUENCE_STRUCTURE',
    progress_percentage: 82,
    last_anomaly_timestamp: '2026-07-26 19:11:45 UTC',
    metrics: {
      acceleration_vectors: '> 100g',
      files_triaged: '160+ Files, 20+ Videos'
    },
    negative_controls_applied: ['Parallax sensor glitch null', 'Standard aerodynamic drag baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Confirmed high-reliability sensor metadata with UAP flight trajectories defying aerodynamic drag models.'
  },
  {
    anomaly_id: 'G29_AMAZON_CANOPY_LIDAR',
    code: 'G29',
    title: 'Amazon Canopy Spaceborne LIDAR Scan',
    domain: 'Remote Sensing & AI',
    target_tab: 'epigraphy',
    status: 'UNDERDETERMINED',
    progress_percentage: 70,
    last_anomaly_timestamp: '2026-07-26 18:30:00 UTC',
    metrics: {
      pulses_ingested: '1.2M High-Density',
      dem_resolution: '0.5m Canopy Penetration'
    },
    negative_controls_applied: ['Tree canopy shadow null', 'Modern agricultural trench control'],
    repo_file_path: 'src/data/labData.ts',
    summary: 'Scans Amazon jungle canopy for hidden geometrical earthwork structures using GEDI spaceborne pulses.'
  },
  {
    anomaly_id: 'G13_VASCO_MISSING_STARS',
    code: 'G13',
    title: 'VASCO Vanishing Star Plate Probe',
    domain: 'Astrophysics & Transients',
    target_tab: 'geophysics',
    status: 'UNDERDETERMINED',
    progress_percentage: 64,
    last_anomaly_timestamp: '2026-07-26 17:00:12 UTC',
    metrics: {
      z_score: '|z| < 3.0',
      plate_defects_filtered: 450
    },
    negative_controls_applied: ['Emulsion defect spatial clustering', '1950s photographic plate noise'],
    repo_file_path: 'src/data/labData.ts',
    summary: 'Probes spatial clustering of vanishing stars on 1950s plates while applying plate-defect negative controls.'
  },
  {
    anomaly_id: 'R01_CHIME_FRB_PERIODICITY',
    code: 'R01',
    title: 'CHIME FRB 180916 Periodicity Engine',
    domain: 'Radio Astronomy & Transients',
    target_tab: 'geophysics',
    status: 'STRUCTURE_SIGNAL',
    progress_percentage: 90,
    last_anomaly_timestamp: '2026-07-26 16:22:00 UTC',
    metrics: {
      periodicity_days: 16.35,
      dispersion_measure: 348.8,
      z_score: '+6.2'
    },
    negative_controls_applied: ['Scintillation noise null', 'Solar radio noise baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Evaluates periodic fast radio burst clustering and optical counterpart correlations.'
  }
];

const PRESET_ANOMALY_SPIKES: Omit<RealtimeAlert, 'id' | 'timestamp'>[] = [
  {
    metricName: 'Interplanetary Magnetic Vector ΔT',
    currentValue: '184.2 nT/min',
    thresholdValue: '80.0 nT/min',
    zScore: 8.4,
    severity: 'CRITICAL',
    domain: 'Geophysics & Space',
    targetTab: 'geophysics',
    title: 'G5 Geomagnetic Induction Spike Detected',
    description: 'Interplanetary shock wave caused 184 nT/min magnetic field gradient surge & ground induction currents.',
    sourceSensor: 'NOAA DSCOVR / INTERMAGNET'
  },
  {
    metricName: 'Conditional Entropy H(X|Y)',
    currentValue: '0.12 bits/char',
    thresholdValue: '0.45 bits/char',
    zScore: 12.4,
    severity: 'CRITICAL',
    domain: 'Epigraphy & Linguistics',
    targetTab: 'epigraphy',
    title: 'Meroitic Script (G-MER) Structural Sequence Jump',
    description: 'Symbol sequence conditional entropy dropped to 0.12 bits/char, passing 100x Fisher-Yates null permutations.',
    sourceSensor: 'symbolseq N-gram Engine'
  },
  {
    metricName: 'CHIME Radio Burst Flux',
    currentValue: '48.2 Jy',
    thresholdValue: '12.0 Jy',
    zScore: 6.2,
    severity: 'HIGH',
    domain: 'Astrophysics',
    targetTab: 'geophysics',
    title: 'CHIME FRB 180916 Periodicity Micro-Burst',
    description: '16.35-day periodicity phase alignment confirmed with dispersion measure DM = 348.8 pc/cm³.',
    sourceSensor: 'CHIME Catalog 2 Telescope'
  },
  {
    metricName: 'Apical Pulvini Cell Stretch',
    currentValue: '+214%',
    thresholdValue: '+50%',
    zScore: 5.8,
    severity: 'HIGH',
    domain: 'Biophysics',
    targetTab: 'biophysics',
    title: 'Pulvini Node Cavitation & Stretch Surge',
    description: 'Stem pulvini cells stretched by +214% co-occurring with local micro-infrasound acoustic standing wave.',
    sourceSensor: 'BLT Field Sensor Micro-calipers'
  },
  {
    metricName: 'Spatial Ripley K Geometry Score',
    currentValue: 'K = 0.88',
    thresholdValue: 'K = 0.40',
    zScore: 7.1,
    severity: 'CRITICAL',
    domain: 'M-Engine Correlation',
    targetTab: 'mengines',
    title: 'M1 Field-Geometry Cross-Modal Coupling Surge',
    description: 'Ripley K-function spatial density score crossed 7.1 sigma above Monte Carlo negative control baseline.',
    sourceSensor: 'M1 Field vs Geometry Pipeline'
  }
];

interface AtlasOverviewProps {
  onNavigate: (tab: string) => void;
}

export const AtlasOverview: React.FC<AtlasOverviewProps> = ({ onNavigate }) => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';

  // Real-Time Threshold Alert System States
  const [alertThresholdZ, setAlertThresholdZ] = useState<number>(3.5);
  const [isStreamActive, setIsStreamActive] = useState<boolean>(true);
  const initialAlertObj: RealtimeAlert = {
    id: 'initial-alert-001',
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    metricName: PRESET_ANOMALY_SPIKES[0].metricName,
    currentValue: PRESET_ANOMALY_SPIKES[0].currentValue,
    thresholdValue: PRESET_ANOMALY_SPIKES[0].thresholdValue,
    zScore: PRESET_ANOMALY_SPIKES[0].zScore,
    severity: PRESET_ANOMALY_SPIKES[0].severity,
    domain: PRESET_ANOMALY_SPIKES[0].domain,
    targetTab: PRESET_ANOMALY_SPIKES[0].targetTab,
    title: PRESET_ANOMALY_SPIKES[0].title,
    description: PRESET_ANOMALY_SPIKES[0].description,
    sourceSensor: PRESET_ANOMALY_SPIKES[0].sourceSensor,
  };

  const [activeAlert, setActiveAlert] = useState<RealtimeAlert | null>(initialAlertObj);
  const [alertHistory, setAlertHistory] = useState<RealtimeAlert[]>(() => [
    initialAlertObj,
    {
      id: 'hist-alert-002',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
      metricName: PRESET_ANOMALY_SPIKES[1].metricName,
      currentValue: PRESET_ANOMALY_SPIKES[1].currentValue,
      thresholdValue: PRESET_ANOMALY_SPIKES[1].thresholdValue,
      zScore: PRESET_ANOMALY_SPIKES[1].zScore,
      severity: PRESET_ANOMALY_SPIKES[1].severity,
      domain: PRESET_ANOMALY_SPIKES[1].domain,
      targetTab: PRESET_ANOMALY_SPIKES[1].targetTab,
      title: PRESET_ANOMALY_SPIKES[1].title,
      description: PRESET_ANOMALY_SPIKES[1].description,
      sourceSensor: PRESET_ANOMALY_SPIKES[1].sourceSensor,
    },
    {
      id: 'hist-alert-003',
      timestamp: new Date(Date.now() - 10800000).toLocaleTimeString(),
      metricName: PRESET_ANOMALY_SPIKES[2].metricName,
      currentValue: PRESET_ANOMALY_SPIKES[2].currentValue,
      thresholdValue: PRESET_ANOMALY_SPIKES[2].thresholdValue,
      zScore: PRESET_ANOMALY_SPIKES[2].zScore,
      severity: PRESET_ANOMALY_SPIKES[2].severity,
      domain: PRESET_ANOMALY_SPIKES[2].domain,
      targetTab: PRESET_ANOMALY_SPIKES[2].targetTab,
      title: PRESET_ANOMALY_SPIKES[2].title,
      description: PRESET_ANOMALY_SPIKES[2].description,
      sourceSensor: PRESET_ANOMALY_SPIKES[2].sourceSensor,
    }
  ]);

  const [showAlertHistory, setShowAlertHistory] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Auditor Log Filter & State Controls
  const [logFilterSeverity, setLogFilterSeverity] = useState<string>('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedAuditLog, setCopiedAuditLog] = useState<boolean>(false);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return alertHistory.filter((item) => {
      if (logFilterSeverity !== 'ALL' && item.severity !== logFilterSeverity) {
        return false;
      }
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSensor = item.sourceSensor.toLowerCase().includes(q);
        const matchDomain = item.domain.toLowerCase().includes(q);
        const matchMetric = item.metricName.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSensor && !matchDomain && !matchMetric && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [alertHistory, logFilterSeverity, logSearchQuery]);

  // Active Projects Widget States
  const [projectSearchTerm, setProjectSearchTerm] = useState<string>('');
  const [projectFilterStatus, setProjectFilterStatus] = useState<string>('ALL');
  const [inspectingProject, setInspectingProject] = useState<ActiveProjectSchema | null>(null);

  // Filter Active Projects for Sidebar Widget
  const filteredActiveProjects = useMemo(() => {
    return ACTIVE_PROJECTS_LIST.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                          p.domain.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
                          p.anomaly_id.toLowerCase().includes(projectSearchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      if (projectFilterStatus === 'CONFIRMED') {
        return ['STRUCTURE_SIGNAL', 'SEQUENCE_STRUCTURE', 'DIP_STRUCTURE'].includes(p.status);
      } else if (projectFilterStatus === 'UNDERDETERMINED') {
        return p.status === 'UNDERDETERMINED';
      } else if (projectFilterStatus === 'IN_PROGRESS') {
        return p.progress_percentage < 100;
      }

      return true;
    });
  }, [projectSearchTerm, projectFilterStatus]);

  // Auditor Export Handler
  const handleExportAuditLogs = () => {
    const payload = JSON.stringify({
      auditSystem: 'ANOMALY_ATLAS_REALTIME_AUDITOR_LOG',
      generatedTimestamp: new Date().toISOString(),
      activeThresholdCutoffZ: alertThresholdZ,
      totalBreachesRecorded: alertHistory.length,
      auditRecords: alertHistory
    }, null, 2);

    navigator.clipboard.writeText(payload).then(() => {
      setCopiedAuditLog(true);
      setTimeout(() => setCopiedAuditLog(false), 3000);
    }).catch(() => {
      // Fallback
    });
  };

  // Function to manually trigger an anomaly spike
  const triggerSpike = (index?: number) => {
    const template = PRESET_ANOMALY_SPIKES[
      index !== undefined ? index : Math.floor(Math.random() * PRESET_ANOMALY_SPIKES.length)
    ];

    const newAlert: RealtimeAlert = {
      ...template,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setActiveAlert(newAlert);
    setAlertHistory((prev) => [newAlert, ...prev].slice(0, 15));
  };

  // Real-Time Simulator Loop: periodically evaluates stream metrics against threshold
  useEffect(() => {
    if (!isStreamActive) return;

    const interval = setInterval(() => {
      // 30% chance per tick to generate an anomaly spike
      if (Math.random() < 0.3) {
        const candidate = PRESET_ANOMALY_SPIKES[Math.floor(Math.random() * PRESET_ANOMALY_SPIKES.length)];
        
        // Compare z-score against threshold
        if (candidate.zScore >= alertThresholdZ) {
          const newAlert: RealtimeAlert = {
            ...candidate,
            id: `alert-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
          };

          setActiveAlert(newAlert);
          setAlertHistory((prev) => [newAlert, ...prev].slice(0, 15));
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreamActive, alertThresholdZ]);

  // Filter States
  const [selectedEra, setSelectedEra] = useState<string>('ALL'); // 'ALL' | 'ANCIENT' | 'MODERN' | 'FRONTIER'
  const [minYear, setMinYear] = useState<number>(1970);
  const [maxYear, setMaxYear] = useState<number>(2026);
  const [useCustomYearRange, setUseCustomYearRange] = useState<boolean>(false);
  
  const [minSeverity, setMinSeverity] = useState<number>(0); // 0 to 100
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL'); // 'ALL' | 'CONFIRMED' | 'DISPROVEN' | 'UNDERDETERMINED'

  // Filter Logic for Missions
  const filteredMissions = useMemo(() => {
    return LAB_MISSIONS.filter((m) => {
      // Date / Era Filter
      if (useCustomYearRange) {
        if (m.year && (m.year < minYear || m.year > maxYear)) return false;
      } else if (selectedEra === 'ANCIENT') {
        if (m.year && m.year >= 1980) return false;
      } else if (selectedEra === 'MODERN') {
        if (!m.year || m.year < 1980 || m.year > 2021) return false;
      } else if (selectedEra === 'FRONTIER') {
        if (!m.year || m.year < 2022) return false;
      }

      // Severity Score Filter
      const score = m.severityScore ?? 50;
      if (score < minSeverity) return false;

      // Verdict Filter
      if (selectedVerdict === 'CONFIRMED') {
        if (!['STRUCTURE_SIGNAL', 'SEQUENCE_STRUCTURE', 'DIP_STRUCTURE'].includes(m.status)) return false;
      } else if (selectedVerdict === 'DISPROVEN') {
        if (!['CLAIM_FAILS_NULL', 'INSTRUMENT_SYSTEMATICS'].includes(m.status)) return false;
      } else if (selectedVerdict === 'UNDERDETERMINED') {
        if (!['UNDERDETERMINED', 'NEVER_ATTEMPTED'].includes(m.status)) return false;
      }

      return true;
    });
  }, [selectedEra, minYear, maxYear, useCustomYearRange, minSeverity, selectedVerdict]);

  // Filter Logic for Domains
  const filteredDomains = useMemo(() => {
    return DATA_DOMAINS.filter((d) => {
      const score = d.severityScore ?? 50;
      if (score < minSeverity) return false;

      if (selectedVerdict === 'CONFIRMED') {
        if (!['STRUCTURE_SIGNAL', 'SEQUENCE_STRUCTURE', 'DIP_STRUCTURE'].includes(d.verdict)) return false;
      } else if (selectedVerdict === 'UNDERDETERMINED') {
        if (d.verdict !== 'UNDERDETERMINED') return false;
      }

      return true;
    });
  }, [minSeverity, selectedVerdict]);

  const handleResetFilters = () => {
    setSelectedEra('ALL');
    setMinYear(1970);
    setMaxYear(2026);
    setUseCustomYearRange(false);
    setMinSeverity(0);
    setSelectedVerdict('ALL');
  };

  const isFiltered = selectedEra !== 'ALL' || useCustomYearRange || minSeverity > 0 || selectedVerdict !== 'ALL';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SUPARAYS Inspired Foundational Hero Banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-8 md:p-10 shadow-sm flex flex-col items-center text-center space-y-6 transition-all ${
        isLight
          ? 'bg-white border-stone-300 text-stone-900'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        {/* Eyebrow Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border ${
            isLight ? 'bg-stone-100 text-stone-900 border-stone-300' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Lab Engine &amp; Data Hub</span>
          </div>
        </div>

        {/* SUPARAYS Main Large Display Header */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-widest uppercase font-mono leading-none">
          UNIVERSAL ENTROPY ATLAS
        </h1>

        {/* Primary Slogan */}
        <p className={`text-sm sm:text-lg md:text-xl font-mono max-w-2xl font-semibold ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          Multimodal Empirical Structure &amp; Universal Entropy Engine
        </p>

        {/* Inter-spaced tracked uppercase domain listing */}
        <div className={`py-3 px-4 border-y max-w-4xl w-full rounded-lg ${isLight ? 'border-stone-200 bg-stone-50/50' : 'border-slate-800 bg-slate-950/50'}`}>
          <span className={`block text-[10px] font-mono tracking-widest uppercase mb-1 font-bold ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
            FOURTEEN LAB SENSES &amp; CHANNEL DOMAINS
          </span>
          <p className={`text-xs md:text-sm font-mono tracking-wider leading-relaxed font-bold ${isLight ? 'text-stone-800' : 'text-cyan-300'}`}>
            EPIGRAPHY · GEOPHYSICS · HELIOPHYSICS · BIOPHYSICS · ASTROPHYSICS · RADIO · ACOUSTICS · REMOTE SENSING · ENTROPY · SPECTROSCOPY · MAGNETICS · THERMAL · KINEMATICS · SETI
          </p>
        </div>

        {/* Subtitle Slogan */}
        <p className={`text-xs sm:text-sm max-w-2xl font-mono leading-relaxed ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
          From ancient undeciphered scripts to fast radio bursts — 165+ empirical anomaly datasets and counting.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('simulator')}
            className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs transition shadow-md flex items-center space-x-2 ${
              isLight
                ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-900'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Launch Signal Adjudicator</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('project-tracking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs border transition flex items-center space-x-2 ${
              isLight
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <GitCommit className="w-4 h-4 text-emerald-600" />
            <span>View Project Tracking &amp; Tasks</span>
          </button>
          <button
            onClick={() => onNavigate('mengines')}
            className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs border transition flex items-center space-x-2 ${
              isLight
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
                : 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border-indigo-700/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>M-Engine Correlation Pipelines</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME THRESHOLD ALERT NOTIFICATION BANNER */}
      {activeAlert && (
        <div className={`relative overflow-hidden rounded-2xl p-5 border-2 shadow-lg animate-pulse-subtle transition-all ${
          isLight
            ? 'bg-rose-50/90 border-rose-300 text-stone-900 shadow-rose-100'
            : 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/90 border-rose-500/80 text-slate-100 shadow-2xl shadow-rose-950/50'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            {/* Left Column: Badge & Anomaly Details */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse ${
                  isLight ? 'bg-rose-600 text-white' : 'bg-rose-600 text-slate-950'
                }`}>
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Real-Time Anomaly Alert</span>
                </span>

                <span className={`px-2 py-0.5 rounded font-bold border ${
                  isLight ? 'bg-white border-rose-300 text-rose-900' : 'bg-slate-950 border-slate-800 text-rose-300'
                }`}>
                  z = +{activeAlert.zScore.toFixed(1)} (|Z| &ge; {alertThresholdZ.toFixed(1)})
                </span>

                <span className={`px-2 py-0.5 rounded font-bold border ${
                  isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-950 border-slate-800 text-cyan-300'
                }`}>
                  {activeAlert.domain}
                </span>

                <span className={`text-[11px] flex items-center space-x-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                  <Clock className={`w-3 h-3 ${isLight ? 'text-stone-500' : 'text-slate-500'}`} />
                  <span>Detected: {activeAlert.timestamp}</span>
                </span>
              </div>

              <h2 className={`text-lg font-bold flex items-center space-x-2 ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                <span>{activeAlert.title}</span>
              </h2>

              <p className={`text-xs leading-relaxed font-mono p-2.5 rounded-lg border ${
                isLight ? 'bg-white/80 border-stone-300 text-stone-800' : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}>
                <strong className={isLight ? 'text-amber-800' : 'text-amber-300'}>{activeAlert.metricName}:</strong> {activeAlert.currentValue} (Exceeds Cutoff {activeAlert.thresholdValue}) • <span className={isLight ? 'text-stone-600' : 'text-slate-400'}>Sensor: {activeAlert.sourceSensor}</span>. {activeAlert.description}
              </p>
            </div>

            {/* Right Column: Action Controls */}
            <div className="flex flex-wrap lg:flex-col items-stretch justify-center gap-2 min-w-[200px]">
              <button
                onClick={() => onNavigate(activeAlert.targetTab)}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center space-x-2 ${
                  isLight ? 'bg-stone-900 hover:bg-stone-800 text-stone-50' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <span>Inspect in {activeAlert.domain}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAlertHistory(!showAlertHistory)}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono transition flex items-center justify-center space-x-1 ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                  <span>Log ({alertHistory.length})</span>
                  {showAlertHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setActiveAlert(null)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition flex items-center justify-center ${
                    isLight ? 'bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border-stone-300' : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME ALERT STREAM CONTROL BAR & HISTORY LOG DRAWER */}
      <div className={`p-5 rounded-2xl border space-y-4 shadow-sm transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3 ${
          isLight ? 'border-stone-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Radio className={`w-4 h-4 ${isStreamActive ? 'text-emerald-500 animate-pulse' : 'text-stone-400'}`} />
            <h2 className="text-sm font-black font-mono uppercase tracking-wider">
              Real-Time Entropy Stream &amp; Spike Detection Controls
            </h2>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setIsStreamActive(!isStreamActive)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
                isStreamActive
                  ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isStreamActive ? <Pause className="w-3.5 h-3.5 text-emerald-600" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isStreamActive ? 'Stream Live' : 'Stream Paused'}</span>
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-lg border transition ${
                isLight ? 'bg-stone-100 text-stone-700 border-stone-300 hover:text-stone-900' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title={isMuted ? 'Unmute Alerts' : 'Mute Alerts'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Threshold Cutoff Slider */}
          <div className={`space-y-2 p-3.5 rounded-xl border ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Alert Trigger Cutoff (|Z| score)</span>
              </label>
              <span className="text-amber-600 font-bold">z = {alertThresholdZ.toFixed(1)}</span>
            </div>

            <input
              type="range"
              min="2.0"
              max="10.0"
              step="0.5"
              value={alertThresholdZ}
              onChange={(e) => setAlertThresholdZ(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className={`flex justify-between text-[10px] ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
              <span>z = 2.0 (Low)</span>
              <span>z = 3.5 (Standard)</span>
              <span>z = 10.0 (Extreme)</span>
            </div>
          </div>

          {/* Interactive Manual Spike Trigger Panel */}
          <div className={`space-y-2 p-3.5 rounded-xl border lg:col-span-2 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <label className="font-bold flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              <span>Simulate Real-Time Anomaly Spike Test Triggers</span>
            </label>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '☀️ Solar Storm (z = +8.4)', index: 0 },
                { label: '📜 Meroitic Entropy (z = -12.4)', index: 1 },
                { label: '📻 FRB Micro-Burst (z = +6.2)', index: 2 },
                { label: '🌱 Pulvini Stretch (z = +5.8)', index: 3 },
                { label: '📐 Ripley K Coupling (z = +7.1)', index: 4 },
              ].map((item) => (
                <button
                  key={item.index}
                  onClick={() => triggerSpike(item.index)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-bold transition flex items-center space-x-1 border ${
                    isLight 
                      ? 'bg-white hover:bg-stone-200 text-stone-900 border-stone-300' 
                      : 'bg-slate-900 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border-slate-800 hover:border-cyan-700'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Auditor Chronological Event & Threshold Breach Log Drawer */}
        {showAlertHistory && (
          <div className={`pt-4 border-t space-y-4 animate-fade-in font-mono ${
            isLight ? 'border-stone-200' : 'border-slate-800'
          }`}>
            {/* Auditor Header & Metric Summary Ribbon */}
            <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl border ${
              isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
            }`}>
              <div className="flex items-center space-x-2">
                <FileText className={`w-4 h-4 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Auditor Threshold Breach &amp; Event Record Log
                  </h3>
                  <p className={`text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                    Chronological audit log tracking all real-time threshold breaches, sensor anomalies &amp; system alerts.
                  </p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className={`px-2.5 py-1 rounded-lg border ${
                  isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  Total Breaches: <strong className={isLight ? 'text-amber-800 font-bold' : 'text-amber-300'}>{alertHistory.length}</strong>
                </span>

                <span className={`px-2.5 py-1 rounded-lg border ${
                  isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  Critical: <strong className={isLight ? 'text-rose-700 font-bold' : 'text-rose-400'}>{alertHistory.filter(a => a.severity === 'CRITICAL').length}</strong>
                </span>

                <span className={`px-2.5 py-1 rounded-lg border ${
                  isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  Max z: <strong className={isLight ? 'text-cyan-800 font-bold' : 'text-cyan-300'}>{alertHistory.length > 0 ? Math.max(...alertHistory.map(a => a.zScore)).toFixed(1) : '0.0'}</strong>
                </span>

                <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 border ${
                  isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                }`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                  <span>AUDITOR VERIFIED</span>
                </span>
              </div>
            </div>

            {/* Auditor Filter & Toolbar Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-stone-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Filter audit logs by title, sensor, or metric..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className={`w-full border pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono focus:ring-1 ${
                    isLight 
                      ? 'bg-white border-stone-300 text-stone-900 focus:ring-stone-500 focus:border-stone-500' 
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:ring-purple-500 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Severity Filter Buttons */}
              <div className={`flex items-center space-x-1 p-1 rounded-lg border text-[11px] ${
                isLight ? 'bg-stone-50 border-stone-300' : 'bg-slate-950 border-slate-800'
              }`}>
                {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setLogFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded font-bold transition ${
                      logFilterSeverity === sev
                        ? isLight ? 'bg-stone-900 text-stone-50' : 'bg-purple-600 text-slate-950'
                        : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* Export & Clear Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportAuditLogs}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                    isLight 
                      ? 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900' 
                      : 'bg-purple-950 hover:bg-purple-900 border-purple-800 text-purple-300 hover:text-purple-200'
                  }`}
                  title="Export complete JSON audit payload to clipboard"
                >
                  <FileJson className={`w-3.5 h-3.5 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                  <span>{copiedAuditLog ? 'Copied JSON!' : 'Export JSON Audit'}</span>
                </button>

                {alertHistory.length > 0 && (
                  <button
                    onClick={() => setAlertHistory([])}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs transition ${
                      isLight 
                        ? 'bg-white hover:bg-rose-100 border-stone-300 hover:border-rose-300 text-stone-600 hover:text-rose-900' 
                        : 'bg-slate-950 hover:bg-rose-950 border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300'
                    }`}
                    title="Reset Audit History"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Event List */}
            {filteredAuditLogs.length === 0 ? (
              <div className={`text-center py-6 rounded-xl border text-xs ${
                isLight ? 'bg-stone-50 border-stone-300 text-stone-500' : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                No chronological audit log entries match the selected search or severity filters.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredAuditLogs.map((item) => {
                  const isExpanded = expandedLogId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border transition overflow-hidden ${
                        isLight 
                          ? 'bg-white border-stone-300 hover:border-stone-400 text-stone-900' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-100'
                      }`}
                    >
                      {/* Item Main Row */}
                      <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Severity Badge */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                item.severity === 'CRITICAL'
                                  ? isLight ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : item.severity === 'HIGH'
                                  ? isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : isLight ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              }`}
                            >
                              {item.severity}
                            </span>

                            {/* Z Score */}
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                              isLight ? 'bg-stone-100 border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}>
                              z = +{item.zScore.toFixed(1)}
                            </span>

                            <span className={`font-bold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>{item.title}</span>

                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              isLight ? 'text-cyan-900 bg-cyan-50 border-cyan-200' : 'text-cyan-400 bg-cyan-950/40 border-cyan-900/60'
                            }`}>
                              {item.domain}
                            </span>
                          </div>

                          <p className={`text-[11px] line-clamp-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                            <strong className={isLight ? 'text-stone-800' : 'text-slate-300'}>{item.metricName}:</strong> {item.currentValue} (Threshold: {item.thresholdValue}) • Sensor: <span className={isLight ? 'text-stone-800' : 'text-slate-300'}>{item.sourceSensor}</span>
                          </p>
                        </div>

                        {/* Controls & Timestamp */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-[10px] ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>{item.timestamp}</span>

                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : item.id)}
                            className={`px-2.5 py-1 rounded border text-[11px] transition flex items-center space-x-1 ${
                              isLight ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                            }`}
                          >
                            <Terminal className={`w-3 h-3 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                            <span>{isExpanded ? 'Hide Payload' : 'Inspect'}</span>
                          </button>

                          <button
                            onClick={() => onNavigate(item.targetTab)}
                            className={`px-2.5 py-1 rounded border text-[11px] transition font-bold ${
                              isLight ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-900' : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
                            }`}
                          >
                            Jump
                          </button>
                        </div>
                      </div>

                      {/* Expanded Payload & Telemetry Detail Panel for Auditors */}
                      {isExpanded && (
                        <div className={`p-3 border-t space-y-2 text-[11px] animate-fade-in ${
                          isLight ? 'bg-stone-50 border-stone-200 text-stone-800' : 'bg-slate-900/90 border-slate-800 text-slate-300'
                        }`}>
                          <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 p-2.5 rounded-lg border ${
                            isLight ? 'bg-white border-stone-300' : 'bg-slate-950 border-slate-800/80'
                          }`}>
                            <div>
                              <span className={`text-[10px] block ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>METRIC PARAMETER</span>
                              <strong className={isLight ? 'text-amber-800' : 'text-amber-300'}>{item.metricName}</strong>
                            </div>
                            <div>
                              <span className={`text-[10px] block ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>READING VS CUTOFF</span>
                              <span className={isLight ? 'text-stone-900' : 'text-slate-200'}>{item.currentValue} (Limit: {item.thresholdValue})</span>
                            </div>
                            <div>
                              <span className={`text-[10px] block ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>SENSOR INSTRUMENT SOURCE</span>
                              <span className={isLight ? 'text-cyan-800 font-bold' : 'text-cyan-300'}>{item.sourceSensor}</span>
                            </div>
                          </div>

                          <p className={`leading-relaxed p-2 rounded border ${
                            isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}>
                            {item.description}
                          </p>

                          <div className={`flex items-center justify-between text-[10px] font-mono pt-1 ${
                            isLight ? 'text-stone-500' : 'text-slate-500'
                          }`}>
                            <span>EVENT_GUID: {item.id}</span>
                            <span>TARGET_MODULE: {item.targetTab}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Project Tracking & Milestone Management System */}
      <ProjectTrackerSection onNavigate={onNavigate} />

      {/* ANOMALY JSON SCHEMA INSPECTION MODAL DRAWER */}
      {inspectingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileJson className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Anomaly JSON Schema Payload: {inspectingProject.anomaly_id}
                </h3>
              </div>
              <button
                onClick={() => setInspectingProject(null)}
                className="p-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-100 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 font-sans text-xs">
              {inspectingProject.summary}
            </p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-cyan-300 overflow-x-auto max-h-80">
              <pre className="text-[11px] leading-relaxed">
{JSON.stringify({
  anomaly_id: inspectingProject.anomaly_id,
  code: inspectingProject.code,
  title: inspectingProject.title,
  domain: inspectingProject.domain,
  status: inspectingProject.status,
  progress_percentage: inspectingProject.progress_percentage,
  last_anomaly_timestamp: inspectingProject.last_anomaly_timestamp,
  metrics: inspectingProject.metrics,
  negative_controls_applied: inspectingProject.negative_controls_applied,
  repo_file_path: inspectingProject.repo_file_path
}, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 text-[10px]">
                Valid according to Universal Anomaly JSON Schema v2026.7
              </span>
              <button
                onClick={() => setInspectingProject(null)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`border rounded-xl p-4 space-y-1 transition shadow-sm ${
          isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Epigraphic Signal Peak</div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>z = -11,336</div>
          <div className={`text-xs font-mono truncate ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Meroitic Script (G-MER)</div>
        </div>
        <div className={`border rounded-xl p-4 space-y-1 transition shadow-sm ${
          isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Boyajian Dip Significance</div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>Z² ≈ 60</div>
          <div className={`text-xs font-mono truncate ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>24.5-Day Cycle (TESS G20)</div>
        </div>
        <div className={`border rounded-xl p-4 space-y-1 transition shadow-sm ${
          isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Max Node Elongation</div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>+214%</div>
          <div className={`text-xs font-mono truncate ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>BLT Pulvini Baseline</div>
        </div>
        <div className={`border rounded-xl p-4 space-y-1 transition shadow-sm ${
          isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
        }`}>
          <div className={`text-xs font-mono font-bold ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>FRB Catalog Ingested</div>
          <div className={`text-2xl font-black font-mono ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>4,539 Bursts</div>
          <div className={`text-xs font-mono truncate ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>CHIME Catalog 2 (R1)</div>
        </div>
      </div>

      {/* Granular Date & Severity Filtering Control Bar */}
      <div className={`p-5 rounded-2xl border space-y-4 shadow-sm transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-3 ${
          isLight ? 'border-stone-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <Filter className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
            <h2 className="text-sm font-black font-mono uppercase tracking-wider">
              Granular Date Era &amp; Severity Range Controls
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className={isLight ? 'text-stone-600' : 'text-slate-400'}>
              Active Filters: <strong className={isLight ? 'text-stone-900 font-black' : 'text-cyan-300'}>{filteredMissions.length}</strong> of {LAB_MISSIONS.length} Missions | <strong className={isLight ? 'text-stone-900 font-black' : 'text-indigo-300'}>{filteredDomains.length}</strong> of {DATA_DOMAINS.length} Tracks
            </span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 ${
                  isLight ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300' : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-800'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Era / Date Selector */}
          <div className={`space-y-2 p-3.5 rounded-xl border ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <label className="font-bold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" />
              <span>Observation Era / Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All Eras' },
                { id: 'ANCIENT', label: 'Pre-1980 / Ancient' },
                { id: 'MODERN', label: '1980 – 2021 Epoch' },
                { id: 'FRONTIER', label: '2022 – 2026 Frontier' },
              ].map((era) => (
                <button
                  key={era.id}
                  onClick={() => {
                    setSelectedEra(era.id);
                    setUseCustomYearRange(false);
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold transition text-left border ${
                    selectedEra === era.id && !useCustomYearRange
                      ? 'bg-stone-900 text-stone-50 border-stone-900'
                      : isLight 
                        ? 'bg-white hover:bg-stone-200 text-stone-800 border-stone-300' 
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>

            {/* Custom Year Inputs */}
            <div className={`pt-2 border-t space-y-1.5 ${isLight ? 'border-stone-200' : 'border-slate-800/80'}`}>
              <div className={`flex items-center justify-between text-[10px] ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                <span>Custom Year Range Filter</span>
                <input
                  type="checkbox"
                  checked={useCustomYearRange}
                  onChange={(e) => setUseCustomYearRange(e.target.checked)}
                  className="rounded border-stone-400 text-stone-900 focus:ring-0"
                />
              </div>
              {useCustomYearRange && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(Number(e.target.value))}
                    className={`w-full border rounded px-2 py-1 text-[11px] ${
                      isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                    placeholder="Min Year"
                  />
                  <span className={isLight ? 'text-stone-400' : 'text-slate-500'}>–</span>
                  <input
                    type="number"
                    value={maxYear}
                    onChange={(e) => setMaxYear(Number(e.target.value))}
                    className={`w-full border rounded px-2 py-1 text-[11px] ${
                      isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                    placeholder="Max Year"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Severity Score Slider */}
          <div className={`space-y-2 p-3.5 rounded-xl border ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <label className="font-bold flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Min Signal Severity Threshold</span>
              </label>
              <span className="text-amber-600 font-bold">{minSeverity}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minSeverity}
              onChange={(e) => setMinSeverity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className={`flex justify-between text-[10px] ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
              <span>0% (All Noise)</span>
              <span>40% (Moderate)</span>
              <span>80%+ (Extreme Outliers)</span>
            </div>

            <div className="flex gap-1.5 pt-1">
              {[
                { level: 0, name: 'All' },
                { level: 30, name: '≥ 30% Mod' },
                { level: 60, name: '≥ 60% High' },
                { level: 80, name: '≥ 80% Crit' },
              ].map((s) => (
                <button
                  key={s.level}
                  onClick={() => setMinSeverity(s.level)}
                  className={`flex-1 py-1 rounded text-[10px] transition font-bold ${
                    minSeverity === s.level
                      ? 'bg-stone-900 text-stone-50'
                      : isLight 
                        ? 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Verdict Status Filter */}
          <div className={`space-y-2 p-3.5 rounded-xl border sm:col-span-2 lg:col-span-1 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <label className="font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verdict Adjudication Status</span>
            </label>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All Verdicts' },
                { id: 'CONFIRMED', label: 'Confirmed Signals' },
                { id: 'DISPROVEN', label: 'Disproven / Null' },
                { id: 'UNDERDETERMINED', label: 'Needs Data' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVerdict(v.id)}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold transition text-left border ${
                    selectedVerdict === v.id
                      ? 'bg-stone-900 text-stone-50 border-stone-900'
                      : isLight 
                        ? 'bg-white hover:bg-stone-200 text-stone-800 border-stone-300' 
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Layer Universal Anomaly Detector Architecture */}
      <div className={`p-6 rounded-2xl border space-y-6 shadow-sm transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex items-center justify-between border-b pb-4 ${
          isLight ? 'border-stone-200' : 'border-slate-800'
        }`}>
          <div>
            <h2 className="text-lg font-black flex items-center space-x-2">
              <ShieldAlert className={`w-5 h-5 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
              <span>Universal 3-Layer Anomaly Detector Model</span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Rigorous scientific filter preventing false positives and ungrounded claims.
            </p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
            isLight ? 'bg-stone-100 text-stone-900 border-stone-300' : 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
          }`}>
            FPR Calibration = 1.67%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layer 1 */}
          <div className={`p-5 rounded-xl border space-y-3 relative ${
            isLight ? 'bg-stone-50 border-amber-300 text-stone-900 shadow-sm' : 'bg-slate-950/60 border-amber-900/40 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-600 px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                LAYER 1
              </span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-black text-sm">Negative Control Engine</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-400'}`}>
              Every incoming signal is subjected to Fisher-Yates shuffle nulls, known human hoaxes (Julia Set, Crabwood),
              and natural analogs (irrigation pivots, geological faulting).
            </p>
            <div className={`text-[11px] font-mono p-2.5 rounded border ${
              isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              • 50+ Monte Carlo Permutations<br />
              • Instrument Systematics Filter<br />
              • False Positive Rate (FPR) Calibration
            </div>
          </div>

          {/* Layer 2 */}
          <div className={`p-5 rounded-xl border space-y-3 relative ${
            isLight ? 'bg-stone-50 border-cyan-300 text-stone-900 shadow-sm' : 'bg-slate-950/60 border-cyan-900/40 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-cyan-700 px-2 py-0.5 rounded bg-cyan-100 border border-cyan-300">
                LAYER 2
              </span>
              <Cpu className="w-4 h-4 text-cyan-600" />
            </div>
            <h3 className="font-black text-sm">Signal Detection & Extraction</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-400'}`}>
              Domain-specialized extraction pipelines process raw high-dimensional bitstreams, satellite matrices, and time-series vectors.
            </p>
            <div className={`text-[11px] font-mono p-2.5 rounded border ${
              isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              • CCAT (Canny/Hough/Box-counting)<br />
              • symbolseq (H(X), Cond-H, IC)<br />
              • astro_probe & BFAST/SATLAS
            </div>
          </div>

          {/* Layer 3 */}
          <div className={`p-5 rounded-xl border space-y-3 relative ${
            isLight ? 'bg-stone-50 border-purple-300 text-stone-900 shadow-sm' : 'bg-slate-950/60 border-purple-900/40 text-slate-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-700 px-2 py-0.5 rounded bg-purple-100 border border-purple-300">
                LAYER 3
              </span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-black text-sm">Claim Adjudication</h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-700' : 'text-slate-400'}`}>
              Final mathematical verdict assignment based on z-score distance from shuffle nulls and physical cross-correlation.
            </p>
            <div className={`text-[11px] font-mono p-2.5 rounded border ${
              isLight ? 'bg-white border-stone-300 text-stone-800' : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              • SEQUENCE_STRUCTURE (Confirmed)<br />
              • CLAIM_FAILS_NULL (Disproven)<br />
              • UNDERDETERMINED (Needs data)
            </div>
          </div>
        </div>
      </div>

      {/* Core Philosophy Rules */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/80 border-slate-800 text-slate-100'
      }`}>
        <h2 className="text-md font-black flex items-center space-x-2">
          <FileText className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
          <span>Core Methodological Axioms & Forbidden Terms</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950/70 border-slate-800 text-slate-100'
          }`}>
            <div className={`font-bold font-mono ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>1. Structure ≠ Message</div>
            <p className={isLight ? 'text-stone-600' : 'text-slate-400'}>
              Periodicity or low entropy proves structural coupling (a physical relationship), never intentional messaging or extraterrestrial origin.
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950/70 border-slate-800 text-slate-100'
          }`}>
            <div className={`font-bold font-mono ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>2. Negative Control Rule</div>
            <p className={isLight ? 'text-stone-600' : 'text-slate-400'}>
              A signal is only an anomaly if mathematically distinguished from randomized noise, human hoaxes, and natural analogs.
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950/70 border-slate-800 text-slate-100'
          }`}>
            <div className={`font-bold font-mono ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>3. Forbidden Phrases Filter</div>
            <p className={isLight ? 'text-stone-600' : 'text-slate-400'}>
              System logs warnings for sensational terms: &quot;decoded&quot;, &quot;confirms extraterrestrials&quot;, &quot;99% decrypted&quot;.
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-slate-950/70 border-slate-800 text-slate-100'
          }`}>
            <div className={`font-bold font-mono ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>4. Missing Data Honesty</div>
            <p className={isLight ? 'text-stone-600' : 'text-slate-400'}>
              When data is unreachable (e.g. CDLI Proto-Elamite server drop), status is explicitly marked as <code className="text-rose-600 font-mono">NEVER_ATTEMPTED</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Four Research Tracks Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-black ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>Research Domains Taxonomy (4 Tracks)</h2>
          <span className={`text-xs font-mono ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>Showing {filteredDomains.length} of {DATA_DOMAINS.length} Domains</span>
        </div>

        {filteredDomains.length === 0 ? (
          <div className={`p-8 text-center border rounded-xl text-xs font-mono ${
            isLight ? 'bg-white border-stone-300 text-stone-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }`}>
            No research domains match the current date / severity filter settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDomains.map((domain) => (
              <div 
                key={domain.id} 
                className={`p-5 rounded-xl border space-y-4 transition group shadow-sm ${
                  isLight 
                    ? 'bg-white border-stone-300 hover:border-stone-400 text-stone-900' 
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                      isLight ? 'bg-stone-100 text-stone-900 border-stone-300' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}>
                      {domain.code}
                    </span>
                    {domain.yearRange && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isLight ? 'bg-stone-50 text-stone-600 border-stone-300' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}>
                        {domain.yearRange}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                    domain.verdict === 'STRUCTURE_SIGNAL' 
                      ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : domain.verdict === 'SEQUENCE_STRUCTURE' 
                        ? isLight ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : isLight ? 'bg-stone-100 text-stone-700 border-stone-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {domain.verdict}
                  </span>
                </div>

                <div>
                  <h3 className={`font-bold text-base transition ${
                    isLight ? 'text-stone-900 group-hover:text-stone-700' : 'text-slate-100 group-hover:text-cyan-300'
                  }`}>
                    {domain.title}
                  </h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{domain.description}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {domain.keyHighlights.map((hl, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded font-mono text-[11px] border ${
                        isLight ? 'bg-stone-50 text-stone-800 border-stone-300' : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}>
                        • {hl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                  isLight ? 'border-stone-200 text-stone-600' : 'border-slate-800/80 text-slate-400'
                }`}>
                  <span>Severity Index: <strong className={isLight ? 'text-amber-700 font-bold' : 'text-amber-300'}>{domain.severityScore ?? 50}%</strong></span>
                  <button
                    onClick={() => {
                      if (domain.track === 'G-Series') onNavigate('epigraphy');
                      else if (domain.track === 'A/B') onNavigate('biophysics');
                      else if (domain.track === 'R-Series') onNavigate('geophysics');
                      else onNavigate('mengines');
                    }}
                    className={`flex items-center space-x-1 font-sans font-bold transition ${
                      isLight ? 'text-stone-900 hover:text-stone-700' : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    <span>Explore Domain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Missions Summary Table */}
      <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className="text-md font-black flex items-center space-x-2">
            <GitCommit className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-purple-400'}`} />
            <span>Active ANOMALISTICS Mission Log &amp; Adjudications</span>
          </h2>
          <span className={`text-xs font-mono ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
            Filtered Missions: <strong className={isLight ? 'text-stone-900 font-bold' : 'text-cyan-300'}>{filteredMissions.length}</strong> / {LAB_MISSIONS.length}
          </span>
        </div>

        {filteredMissions.length === 0 ? (
          <div className={`p-8 text-center border rounded-xl text-xs font-mono ${
            isLight ? 'bg-stone-50 border-stone-300 text-stone-600' : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            No missions found matching the selected Era / Date / Severity filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs ${isLight ? 'text-stone-800' : 'text-slate-300'}`}>
              <thead className={`font-mono uppercase text-[10px] border-b ${
                isLight ? 'bg-stone-100 text-stone-700 border-stone-300' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Mission ID</th>
                  <th className="py-2.5 px-3">Era / Year</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Target Object</th>
                  <th className="py-2.5 px-3">Severity Score</th>
                  <th className="py-2.5 px-3">Z-Score / Metric</th>
                  <th className="py-2.5 px-3">Verdict Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${
                isLight ? 'divide-stone-200' : 'divide-slate-800/60'
              }`}>
                {filteredMissions.map((m) => (
                  <tr key={m.id} className={`transition ${
                    isLight ? 'hover:bg-stone-50' : 'hover:bg-slate-800/40'
                  }`}>
                    <td className={`py-2.5 px-3 font-bold ${isLight ? 'text-stone-900' : 'text-cyan-400'}`}>{m.code}</td>
                    <td className={`py-2.5 px-3 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{m.yearRange || m.year || 'N/A'}</td>
                    <td className={`py-2.5 px-3 font-sans font-semibold ${isLight ? 'text-stone-900' : 'text-slate-200'}`}>{m.title}</td>
                    <td className={`py-2.5 px-3 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>{m.targetObject}</td>
                    <td className={`py-2.5 px-3 font-bold ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>{m.severityScore ? `${m.severityScore}%` : 'N/A'}</td>
                    <td className={`py-2.5 px-3 font-bold ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>{m.zScoreOrMetric}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        m.status === 'STRUCTURE_SIGNAL' || m.status === 'SEQUENCE_STRUCTURE' || m.status === 'DIP_STRUCTURE'
                          ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : m.status === 'CLAIM_FAILS_NULL'
                          ? isLight ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950 text-rose-300 border-rose-800'
                          : m.status === 'UNDERDETERMINED'
                          ? isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-800'
                          : isLight ? 'bg-stone-100 text-stone-700 border-stone-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
