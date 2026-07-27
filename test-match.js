const fs = require('fs');

const overviewContent = fs.readFileSync('src/components/AtlasOverview.tsx', 'utf8');
const match = overviewContent.match(/export const ACTIVE_PROJECTS_LIST[^\]]+\];/);
if (match) {
  console.log("Found ACTIVE_PROJECTS_LIST");
} else {
  console.log("Could not parse ACTIVE_PROJECTS_LIST");
}
