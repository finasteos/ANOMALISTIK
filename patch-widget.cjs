const fs = require('fs');

let content = fs.readFileSync('src/components/AtlasOverview.tsx', 'utf8');

const widgetJSX = `
      {/* Active Projects Widget */}
      <div className={\`p-6 rounded-2xl border shadow-sm \${
        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }\`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-emerald-500" />
            <span>Active Projects & Progress</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActiveProjects.map(proj => (
            <div 
              key={proj.anomaly_id}
              className={\`p-4 rounded-xl border space-y-3 cursor-pointer transition-all hover:scale-[1.01] \${
                isLight ? 'bg-stone-50 border-stone-200 hover:border-stone-400' : 'bg-slate-950 border-slate-700 hover:border-slate-500'
              }\`}
              onClick={() => setInspectingProject(proj)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={\`px-2 py-0.5 text-[10px] font-bold rounded font-mono \${
                    isLight ? 'bg-stone-900 text-stone-50' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }\`}>
                    {proj.code}
                  </span>
                  <h3 className="font-bold text-sm leading-tight mt-1">{proj.title}</h3>
                </div>
              </div>
              <p className={\`text-xs line-clamp-2 \${isLight ? 'text-stone-600' : 'text-slate-400'}\`}>
                {proj.summary}
              </p>
              
              {/* VISUAL PROGRESS BAR */}
              <div className="space-y-1.5 pt-2 border-t border-stone-200/50">
                <div className="flex justify-between text-xs font-mono">
                  <span className={isLight ? 'text-stone-600' : 'text-slate-400'}>Completion</span>
                  <span className="font-bold text-emerald-500">{proj.progress_percentage}%</span>
                </div>
                <div className={\`w-full h-2 rounded-full overflow-hidden \${isLight ? 'bg-stone-200' : 'bg-slate-800'}\`}>
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: \`\${proj.progress_percentage}%\` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
`;

content = content.replace('{/* Embedded Project Tracking & Milestone Management System */}', widgetJSX + '\n      {/* Embedded Project Tracking & Milestone Management System */}');

fs.writeFileSync('src/components/AtlasOverview.tsx', content);
