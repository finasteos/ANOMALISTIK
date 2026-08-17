import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Download, 
  Eye, 
  ShieldAlert, 
  Layers, 
  Camera, 
  Database,
  ArrowRight,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ArchiveFileItem {
  path: string;
  size_bytes: number;
  compressed_bytes: number;
  date_time: string;
  category: string;
  mapping: string;
  archive_name: string;
}

interface DeclassifiedArchiveIndex {
  generated_at: string;
  total_archives: number;
  total_files: number;
  total_uncompressed_bytes: number;
  archives: {
    name: string;
    archive_size_bytes: number;
    archive_size_mb: number;
    files: Omit<ArchiveFileItem, 'archive_name'>[];
  }[];
}

interface DeclassifiedArchiveSectionProps {
  onNavigate?: (tab: string) => void;
}

export const DeclassifiedArchiveSection: React.FC<DeclassifiedArchiveSectionProps> = ({ onNavigate }) => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';

  const [catalog, setCatalog] = useState<DeclassifiedArchiveIndex | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArchive, setSelectedArchive] = useState<string>('ALL');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch catalog from API
  useEffect(() => {
    fetch('/api/declassified/catalog')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load declassified archive index');
        return res.json();
      })
      .then((data: DeclassifiedArchiveIndex) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Flatten all files into a single array with archive_name
  const allFiles = useMemo<ArchiveFileItem[]>(() => {
    if (!catalog) return [];
    const list: ArchiveFileItem[] = [];
    for (const arc of catalog.archives) {
      for (const f of arc.files) {
        list.push({
          ...f,
          archive_name: arc.name
        });
      }
    }
    return list;
  }, [catalog]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return allFiles.filter((f) => {
      const matchSearch =
        searchQuery === '' ||
        f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.mapping.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.archive_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' ||
        (selectedCategory === 'IMAGES' && f.category === 'Image') ||
        (selectedCategory === 'PDFS' && f.category === 'Document (PDF)') ||
        (selectedCategory === 'VIDEOS' && f.category === 'Video') ||
        (selectedCategory === 'APOLLO' && f.mapping.includes('Apollo')) ||
        (selectedCategory === 'DOE' && (f.path.includes('DOE') || f.path.includes('Sandia') || f.path.includes('Pantex'))) ||
        (selectedCategory === 'NAVY_DOD' && (f.path.includes('Range-Fouler') || f.path.includes('DOD') || f.path.includes('DOW'))) ||
        (selectedCategory === 'HISTORICAL' && (f.path.includes('1947') || f.path.includes('Ghost-Rocket') || f.path.includes('Bluebook')));

      const matchArchive =
        selectedArchive === 'ALL' || f.archive_name === selectedArchive;

      return matchSearch && matchCategory && matchArchive;
    });
  }, [allFiles, searchQuery, selectedCategory, selectedArchive]);

  return (
    <div className="space-y-8 animate-fade-in font-mono">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-2xl border shadow-sm space-y-3 transition-all ${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
          <FolderArchive className={`w-4 h-4 ${isLight ? 'text-stone-900' : 'text-cyan-400'}`} />
          <span>Empirical Intelligence Triage Bench • Declassified US Government Files</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
          Declassified UAP &amp; Scientific Intelligence Archives
        </h1>
        <p className={`text-xs md:text-sm font-sans leading-relaxed max-w-4xl ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
          Indexed catalog of 375 declassified intelligence documents, NASA Apollo mission photographs, US Navy Range Fouler pilot debriefs, 
          DoD sensor telemetry, and historical Scandinavian Ghost Rocket reviews across 5 release packages (15.92 GB uncompressed).
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Cataloged Files</span>
          <div className="text-lg font-black text-cyan-400">
            {catalog ? catalog.total_files : '375'} Files
          </div>
          <div className="text-[10px] text-slate-500">5 Release Archives</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Uncompressed Volume</span>
          <div className="text-lg font-black text-purple-400">
            {catalog ? `${(catalog.total_uncompressed_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB` : '15.92 GB'}
          </div>
          <div className="text-[10px] text-slate-500">16.8 GB Compressed</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Active Filter Matches</span>
          <div className="text-lg font-black text-amber-400">
            {filteredFiles.length}
          </div>
          <div className="text-[10px] text-amber-300">Ready for Ingestion</div>
        </div>

        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Primary Agencies</span>
          <div className="text-xs font-bold text-emerald-400 pt-1">
            NASA • NAVY • DOE • USAF • CIA
          </div>
          <div className="text-[10px] text-emerald-300">1946–2026 Timeline</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 375 files by name, agency, mission mapping..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Archive Release Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">Archive:</span>
            <select
              value={selectedArchive}
              onChange={(e) => setSelectedArchive(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All 5 Releases (15.9 GB)</option>
              <option value="UFOFiles-Release1.zip">Release 1 (NASA Apollo / Bluebook)</option>
              <option value="UFOFiles-Release2.zip">Release 2 (DoD Video / Sandia / DOE)</option>
              <option value="UFOFiles-Release3.zip">Release 3 (FBI Forensic Renderings)</option>
              <option value="UFOFiles-Release4.zip">Release 4 (Navy Range Foulers / Los Alamos)</option>
              <option value="UFOFiles-Release5.zip">Release 5 (1947 Ghost Rockets / AMC)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'ALL', label: 'All Files' },
            { id: 'APOLLO', label: '🚀 NASA Apollo Imagery (#20)' },
            { id: 'NAVY_DOD', label: '⚓ US Navy / DoD Range Foulers (N2-ext)' },
            { id: 'DOE', label: '☢️ DOE / Sandia / Pantex (G31)' },
            { id: 'HISTORICAL', label: '📜 1947 Ghost Rockets & AMC (G32)' },
            { id: 'IMAGES', label: '🖼️ Images' },
            { id: 'PDFS', label: '📄 Documents (PDF)' },
            { id: 'VIDEOS', label: '🎥 DoD Sensor Videos' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                selectedCategory === c.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Table / Browser */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden text-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Declassified Repository Index ({filteredFiles.length} Records)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Click file to inspect or map</span>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-[11px] text-slate-400 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Archive</th>
                <th className="py-2.5 px-3">Mapped ANOMALISTIK Engine</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredFiles.slice(0, 100).map((file, idx) => {
                const isApollo = file.path.includes('apollo');
                const isImage = file.category === 'Image';
                const isVideo = file.category === 'Video';

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-200 flex items-center space-x-2">
                      {isImage ? (
                        <Image className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : isVideo ? (
                        <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="truncate max-w-xs sm:max-w-md">{file.path}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {file.size_bytes > 1024 * 1024
                        ? `${(file.size_bytes / (1024 * 1024)).toFixed(1)} MB`
                        : `${(file.size_bytes / 1024).toFixed(1)} KB`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isImage
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : isVideo
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {file.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                      {file.archive_name.replace('.zip', '')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                        {file.mapping}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {isApollo ? (
                        <button
                          onClick={() => onNavigate && onNavigate('geophysics')}
                          className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-700 transition text-[10px] font-bold inline-flex items-center space-x-1"
                        >
                          <span>Inspect in Apollo #20</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isImage && file.path.includes('images/') ? (
                        <button
                          onClick={() => setPreviewImage(`/api/declassified/images/${file.path.replace('images/', '')}`)}
                          className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-700 transition text-[10px] font-bold inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFiles.length > 100 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-slate-400 text-[10px]">
            Showing first 100 of {filteredFiles.length} matching files. Use search above to narrow down results.
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-200">Declassified Photographic Preview</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-100 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
            <div className="w-full h-[400px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={previewImage}
                alt="Declassified Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="text-[10px] font-mono">{previewImage}</span>
              <button
                onClick={() => onNavigate && onNavigate('geophysics')}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 text-slate-950 font-bold hover:bg-cyan-500 transition text-xs flex items-center space-x-1"
              >
                <span>Open in Photogrammetry Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
