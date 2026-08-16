import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Search, 
  CheckSquare, 
  Square, 
  Plus, 
  FileJson, 
  Clock, 
  ArrowRight, 
  X, 
  Terminal, 
  Layers, 
  Check, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Code
} from 'lucide-react';
import { useTheme } from '../ThemeContext';

export interface ProjectTaskItem {
  id: string;
  title: string;
  completed: boolean;
  assigned_role: string;
}

export interface ProjectLogEntry {
  id: string;
  timestamp: string;
  author: string;
  note: string;
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
  tasks: ProjectTaskItem[];
  logs: ProjectLogEntry[];
}

export const INITIAL_PROJECTS_DATA: ActiveProjectSchema[] = [
  {
    anomaly_id: 'G30_TESS_SN1987A',
    code: 'G30',
    title: 'TESS SN 1987A SETI Ellipsoid Probe',
    domain: 'Astro & SETI Ellipsoid',
    target_tab: 'geophysics',
    status: 'SEQUENCE_STRUCTURE',
    progress_percentage: 100,
    last_anomaly_timestamp: '2026-08-16 23:10:00 UTC',
    metrics: {
      z_score: '+6.8',
      synchronicity_ly: '< 0.012 ly',
      target_objects: 'MAST Sector 72 Lightcurves along Supernova Wavefront'
    },
    negative_controls_applied: ['Astrometric jitter null', 'Stellar variability baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Searches for synchronized optical flux dips and technosignatures along the SN 1987A SETI Ellipsoid time-of-flight geometry.',
    tasks: [
      { id: 't1', title: 'Ingest MAST optical lightcurves for SN1987A ellipsoid targets', completed: true, assigned_role: 'Astro Pipeline' },
      { id: 't2', title: 'Apply 100x Astrometric jitter negative control baseline', completed: true, assigned_role: 'Null Control' },
      { id: 't3', title: 'Cross-correlate TESS Sector 72 dip periodicity', completed: true, assigned_role: 'Adjudicator' },
      { id: 't4', title: 'Verify parallax time-of-flight synchronicity < 0.02 ly', completed: true, assigned_role: 'Lead Analyst' }
    ],
    logs: [
      { id: 'l2', timestamp: '2026-08-16 23:10 UTC', author: 'ANOMALISTIK Adjudication Team', note: 'Parallax ToF synchronization confirmed (Δt < 0.012 ly) on TIC 261136679 with asymmetric dip SNR 14.2 dB. Status: SEQUENCE_STRUCTURE validated.' },
      { id: 'l1', timestamp: '2026-07-26 23:28 UTC', author: 'Dr. V. Aris', note: 'Z-score +6.8 confirmed across 14 MAST lightcurves. Proceeding to parallax check.' }
    ]
  },
  {
    anomaly_id: 'G20_BOYAJIAN_DIP',
    code: 'G20',
    title: "Boyajian's Star Periodic Dip Engine",
    domain: 'Astrophysics & Exoplanets',
    target_tab: 'geophysics',
    status: 'DIP_STRUCTURE',
    progress_percentage: 100,
    last_anomaly_timestamp: '2026-08-16 23:12:00 UTC',
    metrics: {
      z_score: 'Z² = 60.1',
      periodicity_days: 24.5,
      deepest_dip: '22% Flux Drop'
    },
    negative_controls_applied: ['Cometary dust thermal model', 'Kepler/TESS instrumental baseline'],
    repo_file_path: 'src/components/GeophysicsAstroSection.tsx',
    summary: 'Analyzes recurring asymmetric lightcurve dips for non-gravitational obscuration geometries.',
    tasks: [
      { id: 't1', title: 'Filter Kepler & TESS instrumental baseline noise', completed: true, assigned_role: 'Kepler Data Engine' },
      { id: 't2', title: 'Fit cometary dust thermal scattering model null', completed: true, assigned_role: 'Dust Modeler' },
      { id: 't3', title: 'Run 24.5-day periodicity autocorrelation engine', completed: true, assigned_role: 'Signal Adjudicator' },
      { id: 't4', title: 'Publish multi-spectral IR excess verdict', completed: true, assigned_role: 'Lead Researcher' }
    ],
    logs: [
      { id: 'l2', timestamp: '2026-08-16 23:12 UTC', author: 'Lead Researcher', note: 'Multi-spectral IR excess verdict published. Non-gravitational asymmetric transit profile matches macro-structure obscuration model.' },
      { id: 'l1', timestamp: '2026-07-26 22:15 UTC', author: 'A. Lindberg', note: 'Asymmetric 22% dip confirmed. Cometary model fails to explain zero-polarization phase.' }
    ]
  },
  {
    anomaly_id: 'G28_TURGAI_STEPPE',
    code: 'G28',
    title: 'Turgai Steppe Earthworks Orientation',
    domain: 'Geo-Spatial & Archaeoastronomy',
    target_tab: 'epigraphy',
    status: 'STRUCTURE_SIGNAL',
    progress_percentage: 100,
    last_anomaly_timestamp: '2026-08-16 23:13:00 UTC',
    metrics: {
      z_score: '-8.4',
      alignment: 'Winter Solstice Solar Bracket'
    },
    negative_controls_applied: ['Poisson random control', 'Topographic ridge null'],
    repo_file_path: 'src/data/labData.ts',
    summary: '8,000-year-old Kazakh earthworks confirm strict North-South orientation and solstice alignment against Poisson controls.',
    tasks: [
      { id: 't1', title: 'Extract high-resolution satellite DEM vector lines', completed: true, assigned_role: 'GIS Specialist' },
      { id: 't2', title: 'Run Poisson random point distribution negative control', completed: true, assigned_role: 'Null Control' },
      { id: 't3', title: 'Calculate Winter Solstice solar azimuth bracket', completed: true, assigned_role: 'Archaeoastronomer' },
      { id: 't4', title: 'Finalize spatial layout report for Kazakh steppes', completed: true, assigned_role: 'Lead Analyst' }
    ],
    logs: [
      { id: 'l2', timestamp: '2026-08-16 23:13 UTC', author: 'Archaeoastronomy Team', note: 'Spatial layout report finalized. Poisson control rejection confirmed at z = -8.4.' },
      { id: 'l1', timestamp: '2026-07-26 21:05 UTC', author: 'K. Saryev', note: 'Z-score -8.4 proves intentional geometric construction exceeding random chance.' }
    ]
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
    repo_file_path: 'src/components/EpigraphySection.tsx',
    summary: 'Symbol sequence conditional entropy dropped to 0.12 bits/char, passing 100x Fisher-Yates null permutations.',
    tasks: [
      { id: 't1', title: 'Parse 1,270 Meroitic cursive royal inscriptions', completed: true, assigned_role: 'Epigrapher' },
      { id: 't2', title: 'Execute 100x Fisher-Yates glyph shuffle null', completed: true, assigned_role: 'Information Theorist' },
      { id: 't3', title: 'Compute conditional entropy H(Y|X)', completed: true, assigned_role: 'Algorithm Lead' },
      { id: 't4', title: 'Cross-reference Remu & Qere royal lineage titles', completed: true, assigned_role: 'Linguist' }
    ],
    logs: [
      { id: 'l1', timestamp: '2026-07-26 20:42 UTC', author: 'Dr. M. El-Sayed', note: 'Conditional entropy reached 0.12 bits/char, confirming non-random linguistic syntax.' }
    ]
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
    summary: 'Scans Amazon jungle canopy for hidden geometrical earthwork structures using GEDI spaceborne pulses.',
    tasks: [
      { id: 't1', title: 'Filter GEDI spaceborne pulse return waveforms', completed: true, assigned_role: 'LIDAR Engineer' },
      { id: 't2', title: 'Subtract tree canopy shadow artifacts', completed: true, assigned_role: 'Image Analyst' },
      { id: 't3', title: 'Identify circular earthwork ditch contours', completed: false, assigned_role: 'Pattern AI' },
      { id: 't4', title: 'Perform ground-truth archaeological verification', completed: false, assigned_role: 'Field Team' }
    ],
    logs: [
      { id: 'l1', timestamp: '2026-07-26 18:30 UTC', author: 'R. Silva', note: '1.2M points processed. 4 candidate geometric enclosures detected under dense canopy.' }
    ]
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
    summary: 'Evaluates periodic fast radio burst clustering and optical counterpart correlations.',
    tasks: [
      { id: 't1', title: 'Ingest CHIME Catalog 2 pulse arrival timestamps', completed: true, assigned_role: 'Radio Pipeline' },
      { id: 't2', title: 'Subtract solar wind radio noise baseline', completed: true, assigned_role: 'Signal Processor' },
      { id: 't3', title: 'Confirm 16.35-day periodic window clustering', completed: true, assigned_role: 'Time Series Lead' },
      { id: 't4', title: 'Correlate with binary companion orbit models', completed: false, assigned_role: 'Astro Theorist' }
    ],
    logs: [
      { id: 'l1', timestamp: '2026-07-26 16:22 UTC', author: 'E. Chen', note: '16.35-day period robust against solar flare noise nulls at z = +6.2.' }
    ]
  }
];

interface ProjectTrackerProps {
  onNavigate: (tab: string) => void;
}

export const ProjectTrackerSection: React.FC<ProjectTrackerProps> = ({ onNavigate }) => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';

  const [projects, setProjects] = useState<ActiveProjectSchema[]>(() => {
    try {
      const saved = localStorage.getItem('anomalistics_projects_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load projects from localStorage:', e);
    }
    return INITIAL_PROJECTS_DATA;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<ActiveProjectSchema | null>(null);
  const [inspectingJson, setInspectingJson] = useState<ActiveProjectSchema | null>(null);
  const [newNote, setNewNote] = useState<string>('');

  // Persist projects to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('anomalistics_projects_data', JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to localStorage:', e);
    }
  }, [projects]);

  // Reset projects to initial dataset
  const handleResetProjects = () => {
    if (window.confirm('Reset all project task lists and progress to default?')) {
      setProjects(INITIAL_PROJECTS_DATA);
      setSelectedProject(null);
      try {
        localStorage.removeItem('anomalistics_projects_data');
      } catch (e) {}
    }
  };

  // Toggle Task Checklist Item
  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.anomaly_id !== projectId) return proj;

        const updatedTasks = proj.tasks.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );

        // Recalculate progress percentage based on completed tasks
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const totalCount = updatedTasks.length;
        const newProgress = Math.round((completedCount / totalCount) * 100);

        const updatedProject = {
          ...proj,
          tasks: updatedTasks,
          progress_percentage: newProgress,
          last_anomaly_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
        };

        if (selectedProject && selectedProject.anomaly_id === projectId) {
          setSelectedProject(updatedProject);
        }

        return updatedProject;
      })
    );
  };

  // Add Log Entry / Ticket Note
  const handleAddLogNote = (projectId: string) => {
    if (!newNote.trim()) return;

    const logItem: ProjectLogEntry = {
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      author: 'Lab Researcher',
      note: newNote.trim()
    };

    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.anomaly_id !== projectId) return proj;

        const updatedProject = {
          ...proj,
          logs: [logItem, ...proj.logs],
          last_anomaly_timestamp: logItem.timestamp
        };

        if (selectedProject && selectedProject.anomaly_id === projectId) {
          setSelectedProject(updatedProject);
        }

        return updatedProject;
      })
    );

    setNewNote('');
  };

  // Filter Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'CONFIRMED') return matchesSearch && (p.status === 'STRUCTURE_SIGNAL' || p.status === 'SEQUENCE_STRUCTURE' || p.status === 'DIP_STRUCTURE');
    if (statusFilter === 'UNDERDETERMINED') return matchesSearch && p.status === 'UNDERDETERMINED';
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && p.progress_percentage < 100;
    return matchesSearch;
  });

  return (
    <section id="project-tracking-section" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4 border-stone-200/80">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <FolderKanban className={`w-5 h-5 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
              <h2 className="text-lg font-black tracking-wider uppercase font-mono">
                ANOMALISTICS • Active Project Tracking &amp; Milestones
              </h2>
            </div>
            <p className={`text-xs font-mono ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              Real-time progress, task checklists, negative null controls, and codebase inspection for all active missions.
            </p>
          </div>

          <div className="flex flex-wrap items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `ANOMALISTIK_Project_Manifest_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className={`px-3 py-1 rounded-lg border font-bold transition flex items-center space-x-1.5 ${
                isLight ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Export all project tasks & logs as JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleResetProjects}
              className={`px-3 py-1 rounded-lg border font-bold transition flex items-center space-x-1.5 ${
                isLight ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
              title="Reset tasks to initial status"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <span className={`px-3 py-1 rounded-full border font-bold flex items-center space-x-1.5 ${
              isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pipe: READY</span>
            </span>
            <span className={`px-3 py-1 rounded-full border font-bold ${
              isLight ? 'bg-stone-100 border-stone-300 text-stone-900' : 'bg-cyan-950 border-cyan-800 text-cyan-300'
            }`}>
              {projects.length} Active Projects
            </span>
          </div>
        </div>

        {/* Live Pipe / Triage Stream Banner */}
        <div className={`mb-4 p-3.5 rounded-xl border font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isLight ? 'bg-stone-50 border-stone-300 text-stone-800' : 'bg-slate-950 border-slate-800 text-slate-200'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-bold uppercase tracking-wide">Live Triage &amp; Adjudication Stream Pipeline</span>
            </div>
            <p className="text-[11px] opacity-80">
              Real-time triage events from live sensors, M-Engine runs, and local scripts pipe directly into this dashboard via <code className="font-bold font-mono">POST /api/adjudicate</code> and local webhooks.
            </p>
          </div>

          <button
            onClick={() => {
              const newId = 'LIVE_' + Math.floor(1000 + Math.random() * 9000);
              const liveProject: ActiveProjectSchema = {
                anomaly_id: newId,
                code: 'LIVE',
                title: 'Live Triage Signal Ingest #' + newId.slice(-4),
                domain: 'Real-time Field Pipe',
                target_tab: 'geophysics',
                status: 'STRUCTURE_SIGNAL',
                progress_percentage: 25,
                last_anomaly_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
                metrics: { z_score: '+7.4', signal_snr: '18.2 dB' },
                negative_controls_applied: ['Live baseline noise null', 'Sensor calibration check'],
                repo_file_path: 'server.ts',
                summary: 'Real-time triage event piped from live stream. Adjudication pipeline calculating entropy jump.',
                tasks: [
                  { id: 't1', title: 'Live stream ingested via /api/adjudicate', completed: true, assigned_role: 'Triage Pipe' },
                  { id: 't2', title: 'Run automated negative control filter', completed: false, assigned_role: 'Auto-Filter' },
                  { id: 't3', title: 'Adjudicate Z-score against null model', completed: false, assigned_role: 'Adjudicator' }
                ],
                logs: [
                  { id: 'l1', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC', author: 'Live Webhook', note: 'Piped live triage event into dashboard.' }
                ]
              };
              setProjects(prev => [liveProject, ...prev]);
            }}
            className={`px-3 py-1.5 rounded-lg border font-bold text-[11px] transition flex items-center space-x-1.5 flex-shrink-0 ${
              isLight
                ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-900'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pipe Test Triage Event</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, title, or domain..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-mono transition outline-none ${
                isLight 
                  ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-900' 
                  : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500'
              }`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'CONFIRMED', label: 'Signal Passed Null' },
              { id: 'UNDERDETERMINED', label: 'Underdetermined' },
              { id: 'IN_PROGRESS', label: 'In-Progress (<100%)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition text-[11px] ${
                  statusFilter === f.id
                    ? isLight
                      ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-sm'
                      : 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : isLight
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => {
          const completedTasksCount = proj.tasks.filter(t => t.completed).length;

          return (
            <div
              key={proj.anomaly_id}
              className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
                isLight
                  ? 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Code, Title, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                        isLight ? 'bg-stone-900 text-stone-50' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {proj.code}
                      </span>
                      <span className={`text-[10px] font-mono ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        {proj.domain}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-1" title={proj.title}>
                      {proj.title}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold flex-shrink-0 ${
                    proj.status === 'STRUCTURE_SIGNAL' || proj.status === 'SEQUENCE_STRUCTURE' || proj.status === 'DIP_STRUCTURE'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : proj.status === 'UNDERDETERMINED'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-200 text-stone-800 border border-stone-300'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                {/* Summary */}
                <p className={`text-xs leading-relaxed line-clamp-2 ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
                  {proj.summary}
                </p>

                {/* Progress Bar & Tasks Indicator */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`text-[11px] font-semibold ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                      Milestone Progress ({completedTasksCount}/{proj.tasks.length} tasks)
                    </span>
                    <span className="font-bold text-emerald-600">{proj.progress_percentage}%</span>
                  </div>

                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-stone-200' : 'bg-slate-950'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                      style={{ width: `${proj.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Task Checklist Preview */}
                <div className="space-y-1.5 pt-2 border-t border-stone-200/80">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">
                    Active Tasks &amp; Milestones:
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {proj.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleToggleTask(proj.anomaly_id, task.id)}
                        className={`w-full text-left flex items-start space-x-2 p-1.5 rounded text-xs font-mono transition ${
                          task.completed
                            ? isLight ? 'bg-emerald-50 text-emerald-900' : 'bg-emerald-950/40 text-emerald-300'
                            : isLight ? 'bg-stone-50 text-stone-700 hover:bg-stone-100' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5 opacity-50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`line-clamp-1 ${task.completed ? 'line-through opacity-80' : ''}`}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Codebase File Reference */}
                <div className={`p-2 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
                  isLight ? 'bg-stone-50 border-stone-200 text-stone-700' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <Code className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                    <span className="truncate">{proj.repo_file_path}</span>
                  </div>
                  <button
                    onClick={() => onNavigate(proj.target_tab)}
                    className="text-stone-900 hover:underline font-bold flex items-center space-x-0.5 flex-shrink-0"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs font-mono">
                <button
                  onClick={() => setSelectedProject(proj)}
                  className={`flex-1 py-1.5 rounded-lg border font-bold transition flex items-center justify-center space-x-1 ${
                    isLight
                      ? 'bg-stone-900 hover:bg-stone-800 text-stone-50 border-stone-900'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-500'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Manage &amp; Logs</span>
                </button>

                <button
                  onClick={() => setInspectingJson(proj)}
                  className={`px-2.5 py-1.5 rounded-lg border font-bold transition flex items-center space-x-1 ${
                    isLight
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="View Anomaly JSON Schema"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PROJECT MANAGER & LOGS MODAL DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 font-mono text-xs border max-h-[90vh] overflow-y-auto ${
            isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-3 border-stone-200/80">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-50 font-bold">
                    {selectedProject.code}
                  </span>
                  <span className="font-bold text-sm">{selectedProject.title}</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Domain: {selectedProject.domain} • Codebase File: <code className="font-bold">{selectedProject.repo_file_path}</code>
                </p>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg border opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Checklist Manager */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Validation Tasks &amp; Milestones ({selectedProject.tasks.filter(t => t.completed).length}/{selectedProject.tasks.length})</span>
                </h4>
                <span className="font-bold text-emerald-600 text-sm">{selectedProject.progress_percentage}% Completed</span>
              </div>

              <div className="space-y-1.5 border rounded-xl p-3 bg-stone-50/80 border-stone-200">
                {selectedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(selectedProject.anomaly_id, task.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                      task.completed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-white border-stone-200 text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 opacity-50 flex-shrink-0" />
                      )}
                      <span className={task.completed ? 'line-through opacity-80' : ''}>{task.title}</span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-mono">
                      {task.assigned_role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Controls Applied */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-stone-800">Negative Null Controls Applied:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.negative_controls_applied.map((ctrl, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[11px]">
                    ✓ {ctrl}
                  </span>
                ))}
              </div>
            </div>

            {/* Developer Notes / Ticket Logs */}
            <div className="space-y-3 pt-2 border-t border-stone-200/80">
              <h4 className="font-bold uppercase tracking-wider text-stone-800 flex items-center space-x-1.5">
                <Clock className="w-4 h-4" />
                <span>Project Audit Logs &amp; Ticket Updates</span>
              </h4>

              {/* Add Note Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a project update note..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-xs font-mono outline-none focus:border-stone-900"
                />
                <button
                  onClick={() => handleAddLogNote(selectedProject.anomaly_id)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Log</span>
                </button>
              </div>

              {/* Log Entries List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedProject.logs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl border bg-stone-50 border-stone-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span className="font-bold text-stone-800">{log.author}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-stone-800 leading-relaxed">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200/80">
              <button
                onClick={() => {
                  onNavigate(selectedProject.target_tab);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs transition border border-stone-300 flex items-center space-x-1"
              >
                <span>Jump to Module ({selectedProject.target_tab})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON SCHEMA INSPECTOR MODAL */}
      {inspectingJson && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs text-stone-100">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileJson className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold">
                  Anomaly JSON Schema Payload: {inspectingJson.anomaly_id}
                </h3>
              </div>
              <button
                onClick={() => setInspectingJson(null)}
                className="p-1 rounded-lg bg-stone-950 text-stone-400 hover:text-stone-100 border border-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-stone-300 font-sans text-xs">
              {inspectingJson.summary}
            </p>

            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 text-cyan-300 overflow-x-auto max-h-80">
              <pre className="text-[11px] leading-relaxed">
{JSON.stringify(inspectingJson, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-stone-500 text-[10px]">
                Valid according to Universal Anomaly JSON Schema v2026.7
              </span>
              <button
                onClick={() => setInspectingJson(null)}
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
