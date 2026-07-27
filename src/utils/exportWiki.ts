import { DATA_DOMAINS, LAB_MISSIONS } from '../data/labData';
import { ACTIVE_PROJECTS_LIST } from '../components/AtlasOverview';

export function exportToMarkdownWiki() {
  let md = `# ANOMALISTICS - Wiki Export\n\n`;
  md += `This document contains an exported copy of all lab data, missions, and active projects from the ANOMALISTICS framework. It is intended to be used as a wiki to cross-check data and translation consistency.\n\n`;

  // 1. DATA DOMAINS
  md += `## 1. Research Domains Taxonomy\n\n`;
  DATA_DOMAINS.forEach((d) => {
    md += `### ${d.code} - ${d.title}\n`;
    md += `- **Track**: ${d.track}\n`;
    md += `- **Category**: ${d.category}\n`;
    md += `- **Year Range**: ${d.yearRange}\n`;
    md += `- **Verdict**: ${d.verdict}\n`;
    md += `- **Severity Score**: ${d.severityScore ?? 'N/A'}\n`;
    if (d.zScore) md += `- **Z-Score**: ${d.zScore}\n`;
    md += `- **Description**: ${d.description}\n`;
    md += `- **Key Sources**: ${d.keySources.join(', ')}\n`;
    md += `- **Metrics**: ${d.metrics.join(', ')}\n`;
    md += `- **Highlights**: \n`;
    d.keyHighlights.forEach(hl => md += `  - ${hl}\n`);
    md += `\n`;
  });

  md += `---\n\n`;

  // 2. LAB MISSIONS
  md += `## 2. Active ANOMALISTICS Mission Log\n\n`;
  LAB_MISSIONS.forEach((m) => {
    md += `### [${m.code}] ${m.title}\n`;
    md += `- **Domain**: ${m.domain}\n`;
    md += `- **Year(s)**: ${m.yearRange || m.year || 'N/A'}\n`;
    md += `- **Status**: ${m.status}\n`;
    md += `- **Target Object**: ${m.targetObject}\n`;
    md += `- **Methodology**: ${m.methodology}\n`;
    md += `- **Score/Metric**: ${m.zScoreOrMetric}\n`;
    md += `- **Severity**: ${m.severityScore ?? 'N/A'}\n`;
    md += `- **Summary**: ${m.summary}\n\n`;
  });

  md += `---\n\n`;

  // 3. ACTIVE PROJECTS
  md += `## 3. Active Projects List\n\n`;
  ACTIVE_PROJECTS_LIST.forEach((p) => {
    md += `### ${p.title} (${p.code})\n`;
    md += `- **Domain**: ${p.domain}\n`;
    md += `- **Anomaly ID**: ${p.anomaly_id}\n`;
    md += `- **Status**: ${p.status}\n`;
    md += `- **Progress**: ${p.progress_percentage}%\n`;
    md += `- **Last Anomaly Timestamp**: ${p.last_anomaly_timestamp}\n`;
    md += `- **Negative Controls Applied**: ${p.negative_controls_applied.length ? p.negative_controls_applied.join(', ') : 'None'}\n`;
    md += `- **Summary**: ${p.summary}\n\n`;
  });

  // Download logic
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Anomalistics_Wiki_Export_${new Date().toISOString().split('T')[0]}.md`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
