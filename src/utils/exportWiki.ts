import {
  DATA_DOMAINS,
  LAB_MISSIONS,
  EPIGRAPHIC_CORPORA,
  M_ENGINES,
  BIOPHYSICAL_MARKERS,
} from '../data/labData';
import { ACTIVE_PROJECTS_LIST } from '../components/AtlasOverview';

/** Build a full markdown snapshot of in-app lab data (browser download). */
export function buildMarkdownWiki(): string {
  const exportedAt = new Date().toISOString();
  let md = `# ANOMALISTIK — Wiki Export\n\n`;
  md += `Exported: \`${exportedAt}\`\n\n`;
  md += `Snapshot of dashboard \`labData\` + active projects. For agent-curated pages (LANDED vs DESIGNED, data inventory, API map) see repo \`wiki/\` — **re-apply after every AI Studio publish** (Studio overwrites the git tree).\n\n`;
  md += `Stance: *Structure ≠ Message* · Layer 1 Negative Control\n\n`;
  md += `---\n\n`;

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
    md += `- **Highlights**:\n`;
    d.keyHighlights.forEach((hl) => {
      md += `  - ${hl}\n`;
    });
    md += `\n`;
  });

  md += `---\n\n`;

  // 2. LAB MISSIONS
  md += `## 2. Mission Log\n\n`;
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
  md += `## 3. Active Projects\n\n`;
  ACTIVE_PROJECTS_LIST.forEach((p) => {
    md += `### ${p.title} (${p.code})\n`;
    md += `- **Domain**: ${p.domain}\n`;
    md += `- **Anomaly ID**: ${p.anomaly_id}\n`;
    md += `- **Status**: ${p.status}\n`;
    md += `- **Progress**: ${p.progress_percentage}%\n`;
    md += `- **Last Anomaly Timestamp**: ${p.last_anomaly_timestamp}\n`;
    md += `- **Negative Controls Applied**: ${
      p.negative_controls_applied.length
        ? p.negative_controls_applied.join(', ')
        : 'None'
    }\n`;
    md += `- **Summary**: ${p.summary}\n\n`;
  });

  md += `---\n\n`;

  // 4. EPIGRAPHY
  md += `## 4. Epigraphic Corpora\n\n`;
  EPIGRAPHIC_CORPORA.forEach((c) => {
    md += `### [${c.code}] ${c.name}\n`;
    md += `- **Origin**: ${c.origin}\n`;
    md += `- **Sample**: ${c.sampleSize}\n`;
    md += `- **Verdict**: ${c.verdict}\n`;
    md += `- **z**: ${c.zScore} · **cond-H**: ${c.condEntropy} · **shuffle H**: ${c.shuffleNullEntropy} · **IC**: ${c.ic}\n`;
    if (c.refrains?.length) md += `- **Refrains**: ${c.refrains.join('; ')}\n`;
    md += `- **Findings**: ${c.keyFindings}\n\n`;
  });

  md += `---\n\n`;

  // 5. M-ENGINES
  md += `## 5. M-Engines (cross-stream combinations)\n\n`;
  M_ENGINES.forEach((e) => {
    md += `### ${e.code} — ${e.title}\n`;
    md += `- **Subtitle**: ${e.subtitle}\n`;
    md += `- **Status**: ${e.status}\n`;
    md += `- **Stream A**: ${e.streamA}\n`;
    md += `- **Stream B**: ${e.streamB}\n`;
    md += `- **Tool**: ${e.analyticalTool}\n`;
    md += `- **Hypothesis**: ${e.primaryHypothesis}\n`;
    md += `- **Description**: ${e.description}\n`;
    md += `- **Metrics**: ${e.keyMetrics.join('; ')}\n`;
    if (e.severityLevel) md += `- **Severity level**: ${e.severityLevel}\n`;
    md += `\n`;
  });

  md += `---\n\n`;

  // 6. BIOPHYSICS
  md += `## 6. Biophysical Markers\n\n`;
  BIOPHYSICAL_MARKERS.forEach((b) => {
    md += `### ${b.name}\n`;
    md += `- **Category**: ${b.category}\n`;
    md += `- **Mechanism**: ${b.mechanism}\n`;
    md += `- **Metric**: ${b.metric}\n`;
    md += `- **Anomalous baseline**: ${b.anomalousBaseline}\n`;
    md += `- **Natural baseline**: ${b.naturalBaseline}\n`;
    md += `- **Hoax replication**: ${b.hoaxReplicationDifficulty}\n`;
    md += `- **Cases**: ${b.caseStudies.join(', ')}\n`;
    md += `- **Description**: ${b.description}\n\n`;
  });

  md += `---\n\n`;
  md += `## Agent note\n\n`;
  md += `Drop this file into \`wiki/exports/\` or \`raw/\` after download if you want it versioned. Curated agent pages live under \`wiki/*.md\` and are maintained outside AI Studio.\n`;

  return md;
}

export function exportToMarkdownWiki() {
  const md = buildMarkdownWiki();
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Anomalistik_Wiki_Export_${new Date().toISOString().split('T')[0]}.md`,
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
