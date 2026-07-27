import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Database, Server, Terminal, CheckCircle2, AlertTriangle, FileText, Globe } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface VerificationLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const DataVerificationSection: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [logs, setLogs] = useState<VerificationLog[]>([]);

  const runScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setLogs([]);

    const sequence = [
      { msg: 'Initiating connection to CDLI Main API...', delay: 500, type: 'info' as const },
      { msg: 'Authentication successful. Requesting current P-Number manifests.', delay: 1200, type: 'success' as const },
      { msg: 'Downloading remote hash tables for 4,295 Cuneiform artifacts...', delay: 2000, type: 'info' as const },
      { msg: 'Comparing remote hashes against local CEIPP & CDLI cache...', delay: 3500, type: 'info' as const },
      { msg: 'WARNING: Hash mismatch detected on P393042 (Uruk IV tablet).', delay: 4800, type: 'warning' as const },
      { msg: 'WARNING: Metadata drift detected on P393043 (Translation modified remotely).', delay: 5200, type: 'warning' as const },
      { msg: 'Integrity check complete. 4,293 artifacts synchronized. 2 anomalies detected.', delay: 6500, type: 'error' as const }
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black tracking-widest uppercase font-mono ${theme.primaryTextColor}`}>
            Data Verification & Integrity
          </h2>
          <p className={`text-sm font-mono mt-1 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
            Cross-reference local epistemic corpora against external authoritative APIs to detect drift.
          </p>
        </div>
      </div>

      <div className={`border rounded-xl p-6 ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900/50 border-slate-800'}`}>
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Verification Target Info */}
          <div className="flex-1 space-y-4">
            <h3 className={`font-bold font-mono ${theme.primaryTextColor} flex items-center space-x-2`}>
              <Database className="w-4 h-4" />
              <span>Target: CDLI (Cuneiform Digital Library Initiative)</span>
            </h3>
            
            <div className={`p-4 rounded-lg border text-sm font-mono space-y-3 ${isLight ? 'bg-stone-50 border-stone-200 text-stone-700' : 'bg-slate-950/50 border-slate-800 text-slate-300'}`}>
              <div className="flex justify-between items-center border-b pb-2 border-current/10">
                <span className="opacity-70">Local Records</span>
                <span className="font-bold">4,295</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-current/10">
                <span className="opacity-70">Last Sync</span>
                <span className="font-bold">2026-07-21 04:33:00 UTC</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2 border-current/10">
                <span className="opacity-70">API Endpoint</span>
                <span className="font-bold flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>cdli.mpiwg-berlin.mpg.de/api</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="opacity-70">Status</span>
                {scanComplete ? (
                   <span className="font-bold text-rose-500 flex items-center space-x-1">
                     <AlertTriangle className="w-3 h-3" />
                     <span>DRIFT DETECTED</span>
                   </span>
                ) : (
                   <span className={`font-bold flex items-center space-x-1 ${isLight ? 'text-stone-500' : 'text-slate-500'}`}>
                     <span>PENDING SCAN</span>
                   </span>
                )}
              </div>
            </div>

            <button
              onClick={runScan}
              disabled={isScanning}
              className={`w-full py-3 rounded-lg font-bold font-mono text-sm transition-all flex items-center justify-center space-x-2 ${
                isScanning 
                  ? 'opacity-50 cursor-not-allowed border ' + (isLight ? 'bg-stone-100 text-stone-500' : 'bg-slate-800 text-slate-500')
                  : isLight 
                    ? 'bg-stone-900 hover:bg-stone-800 text-white' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Corpus Integrity...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Run CDLI Integrity Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Output */}
          <div className="flex-[1.5]">
             <div className={`h-full min-h-[300px] rounded-lg border font-mono text-xs overflow-hidden flex flex-col ${isLight ? 'bg-[#1e1e1e] border-stone-800 text-stone-300' : 'bg-black border-slate-800 text-slate-300'}`}>
                <div className="px-3 py-2 border-b border-current/20 flex items-center space-x-2 bg-white/5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-bold tracking-wider">VERIFICATION_TERMINAL</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
                  {logs.length === 0 && !isScanning && (
                    <div className="opacity-50 italic">System ready. Awaiting scan initiation...</div>
                  )}
                  {logs.map((log) => (
                    <div key={log.id} className="flex space-x-3">
                      <span className="opacity-50 shrink-0">[{log.timestamp}]</span>
                      <span className={`${
                        log.type === 'error' ? 'text-rose-400 font-bold' :
                        log.type === 'warning' ? 'text-amber-400 font-bold' :
                        log.type === 'success' ? 'text-emerald-400' :
                        'text-sky-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {isScanning && (
                    <div className="flex space-x-3 opacity-50 animate-pulse">
                      <span className="shrink-0">[{new Date().toISOString().substring(11, 19)} UTC]</span>
                      <span>_</span>
                    </div>
                  )}
                </div>
             </div>
          </div>

        </div>

        {/* Action Panel for Drift Resolution */}
        {scanComplete && (
          <div className={`mt-6 p-4 rounded-lg border animate-fade-in ${
            isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-900/50'
          }`}>
             <h4 className={`font-bold font-mono flex items-center space-x-2 ${isLight ? 'text-amber-900' : 'text-amber-500'}`}>
               <AlertTriangle className="w-4 h-4" />
               <span>Resolution Required</span>
             </h4>
             <p className={`text-sm mt-2 font-mono ${isLight ? 'text-amber-800' : 'text-amber-400/80'}`}>
               2 artifacts show metadata or hash drift from the authoritative CDLI server. 
               The local corpus translation models may be impacted if updates are not synced.
             </p>
             <div className="mt-4 flex gap-3">
               <button className={`px-4 py-2 rounded-md font-mono text-xs font-bold transition ${
                 isLight ? 'bg-amber-200 hover:bg-amber-300 text-amber-900' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
               }`}>
                 Sync Divergent Records (2)
               </button>
               <button className={`px-4 py-2 rounded-md font-mono text-xs font-bold border transition ${
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
