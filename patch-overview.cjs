const fs = require('fs');

let content = fs.readFileSync('src/components/AtlasOverview.tsx', 'utf8');

const hook = `  // Listen for background service updates to LAB_MISSIONS
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleUpdate = () => forceUpdate({});
    window.addEventListener('lab-missions-updated', handleUpdate);
    return () => window.removeEventListener('lab-missions-updated', handleUpdate);
  }, []);`;

content = content.replace('  // Auditor Export Handler', hook + '\n\n  // Auditor Export Handler');

fs.writeFileSync('src/components/AtlasOverview.tsx', content);
