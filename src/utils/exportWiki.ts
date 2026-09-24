import { DATA_DOMAINS, LAB_MISSIONS } from '../data/labData';
import { ACTIVE_PROJECTS_LIST } from '../components/AtlasOverview';

function escapeMd(v: unknown): string {
  return String(v ?? 'N/A').replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1').slice(0, 2000);
}

export function exportToMarkdownWiki() {
  try {
  let md = `# ANOMALISTICS - Wiki Export\n\n`;
  md += `This document contains an exported copy of all lab data, missions, and active projects from the ANOMALISTICS framework. It is intended to be used as a wiki to cross-check data and translation consistency.\n\n`;

  // 1. DATA DOMAINS
  md += `## 1. Research Domains Taxonomy\n\n`;
  DATA_DOMAINS.forEach((d) => {
    md += `### ${escapeMd(d.code)} - ${escapeMd(d.title)}\n`;
    md += `- **Track**: ${escapeMd(d.track)}\n`;
    md += `- **Category**: ${escapeMd(d.category)}\n`;
    md += `- **Year Range**: ${escapeMd(d.yearRange)}\n`;
    md += `- **Verdict**: ${escapeMd(d.verdict)}\n`;
    md += `- **Severity Score**: ${escapeMd(d.severityScore)}\n`;
    if (d.zScore) md += `- **Z-Score**: ${escapeMd(d.zScore)}\n`;
    md += `- **Description**: ${escapeMd(d.description)}\n`;
    md += `- **Key Sources**: ${escapeMd(d.keySources.join(', '))}\n`;
    md += `- **Metrics**: ${escapeMd(d.metrics.join(', '))}\n`;
    md += `- **Highlights**: \n`;
    d.keyHighlights.forEach(hl => md += `  - ${escapeMd(hl)}\n`);
    md += `\n`;
  });

  md += `---\n\n`;

  // 2. LAB MISSIONS
  md += `## 2. Active ANOMALISTICS Mission Log\n\n`;
  LAB_MISSIONS.forEach((m) => {
    md += `### [${escapeMd(m.code)}] ${escapeMd(m.title)}\n`;
    md += `- **Domain**: ${escapeMd(m.domain)}\n`;
    md += `- **Year(s)**: ${escapeMd(m.yearRange || m.year)}\n`;
    md += `- **Status**: ${escapeMd(m.status)}\n`;
    md += `- **Target Object**: ${escapeMd(m.targetObject)}\n`;
    md += `- **Methodology**: ${escapeMd(m.methodology)}\n`;
    md += `- **Score/Metric**: ${escapeMd(m.zScoreOrMetric)}\n`;
    md += `- **Severity**: ${escapeMd(m.severityScore)}\n`;
    md += `- **Summary**: ${escapeMd(m.summary)}\n\n`;
  });

  md += `---\n\n`;

  // 3. ACTIVE PROJECTS
  md += `## 3. Active Projects List\n\n`;
  ACTIVE_PROJECTS_LIST.forEach((p) => {
    md += `### ${escapeMd(p.title)} (${escapeMd(p.code)})\n`;
    md += `- **Domain**: ${escapeMd(p.domain)}\n`;
    md += `- **Anomaly ID**: ${escapeMd(p.anomaly_id)}\n`;
    md += `- **Status**: ${escapeMd(p.status)}\n`;
    md += `- **Progress**: ${escapeMd(p.progress_percentage)}%\n`;
    md += `- **Last Anomaly Timestamp**: ${escapeMd(p.last_anomaly_timestamp)}\n`;
    md += `- **Negative Controls Applied**: ${p.negative_controls_applied.length ? escapeMd(p.negative_controls_applied.join(', ')) : 'None'}\n`;
    md += `- **Summary**: ${escapeMd(p.summary)}\n\n`;
  });

  // Download logic
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Anomalistics_Wiki_Export_${new Date().toISOString().split('T')[0]}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Avoid blob-URL leak; revoke on next tick so download can start
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  } catch (err) {
    console.error('[exportWiki] failed to export wiki:', err);
    throw err;
  }
}
