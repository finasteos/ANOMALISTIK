const fs = require('fs');

let content = fs.readFileSync('src/components/AdjudicationSimulator.tsx', 'utf8');

// Add imports
if (!content.includes('LAB_MISSIONS')) {
  content = content.replace("import { useTheme } from '../ThemeContext';", "import { useTheme } from '../ThemeContext';\nimport { LAB_MISSIONS } from '../data/labData';\nimport { useEffect, useRef } from 'react';\nimport { Terminal, Activity, Zap, CheckCircle2 } from 'lucide-react';");
}

const backgroundServiceJSX = `
      {/* Background Service Simulation */}
      <BackgroundMissionService />
`;

const backgroundServiceComponent = `
const BackgroundMissionService: React.FC = () => {
  const { theme, themeId } = useTheme();
  const isLight = themeId === 'IVORY_MONOCHROME';
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: string }[]>([]);
  const [processingMission, setProcessingMission] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Find a NEVER_ATTEMPTED mission
      const pendingMissions = LAB_MISSIONS.filter(m => m.status === 'NEVER_ATTEMPTED');
      if (pendingMissions.length === 0) {
        setIsActive(false);
        setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: 'No pending missions found. Background service sleeping.', type: 'info' }, ...prev].slice(0, 10));
        setProcessingMission(null);
        return;
      }

      // Pick random
      const target = pendingMissions[Math.floor(Math.random() * pendingMissions.length)];
      setProcessingMission(target.code);
      
      setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: \`Initiating metadata aggregation for \${target.code}: \${target.title}\`, type: 'info' }, ...prev].slice(0, 10));

      // Simulate delay then update
      setTimeout(() => {
        const outcomes = ['STRUCTURE_SIGNAL', 'SEQUENCE_STRUCTURE', 'UNDERDETERMINED', 'CLAIM_FAILS_NULL'];
        const newStatus = outcomes[Math.floor(Math.random() * outcomes.length)] as any;
        
        target.status = newStatus;
        
        setLogs(prev => [{ 
          id: Math.random().toString(), 
          time: new Date().toLocaleTimeString(), 
          msg: \`Updated \${target.code} status to \${newStatus} via simulated metadata injection.\`, 
          type: newStatus.includes('STRUCTURE') ? 'success' : 'warning' 
        }, ...prev].slice(0, 10));
        
        setProcessingMission(null);
      }, 2000);

    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={\`p-6 rounded-2xl border shadow-sm space-y-4 \${
      isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-100'
    }\`}>
      <div className="flex items-center justify-between border-b pb-3 border-current/10">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-black uppercase tracking-wider">
            Background Autonomous Triage Service
          </h2>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 \${
            isActive 
              ? 'bg-rose-500 hover:bg-rose-600 text-white' 
              : isLight ? 'bg-stone-900 hover:bg-stone-800 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
          }\`}
        >
          {isActive ? <><Activity className="w-4 h-4 animate-pulse" /><span>Stop Service</span></> : <><Zap className="w-4 h-4" /><span>Start Service</span></>}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="opacity-70">Service Status</span>
            <span className={isActive ? 'text-emerald-500' : 'text-stone-500'}>
              {isActive ? 'ACTIVE (Polling)' : 'IDLE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="opacity-70">Current Target</span>
            <span className="text-cyan-500">
              {processingMission || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="opacity-70">Pending Missions</span>
            <span>{LAB_MISSIONS.filter(m => m.status === 'NEVER_ATTEMPTED').length}</span>
          </div>
        </div>

        <div className={\`flex-1 h-32 overflow-y-auto p-3 rounded-lg border text-[10px] font-mono space-y-1.5 \${
          isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-950 border-slate-800'
        }\`}>
          {logs.length === 0 ? (
            <div className="opacity-50 italic">System ready. Waiting for service start...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex space-x-2">
                <span className="opacity-50 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === 'success' ? 'text-emerald-500' : 
                  log.type === 'warning' ? 'text-amber-500' : 
                  log.type === 'info' ? 'text-cyan-500' : ''
                }>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace('{/* Preset Selector */}', backgroundServiceJSX + '\n      {/* Preset Selector */}');
content = content + '\n\n' + backgroundServiceComponent;

fs.writeFileSync('src/components/AdjudicationSimulator.tsx', content);
