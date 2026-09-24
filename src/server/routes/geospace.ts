// Geospace routes, extracted from server.ts (TASKLIST B3).
// Mount: app.use("/api/geospace", createGeospaceRouter({ syncDir, downloadsDir })).
import express from "express";
import path from "path";
import fs from "fs";
import { parseCSV, pf } from "../../lib/stats";

export function createGeospaceRouter(opts: { syncDir: string; downloadsDir: string }) {
  const router = express.Router();
  const DATA_SYNCED_DIR = opts.syncDir;
  const DATA_DOWNLOADS_DIR = opts.downloadsDir;

  // ── Helper: find latest file matching pattern in a directory ──────────────
  function latestFile(dir: string, pattern: RegExp): string | null {
    try {
      const files = fs.readdirSync(dir)
        .filter(f => pattern.test(f))
        .map(f => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      return files[0] ? path.join(dir, files[0].name) : null;
    } catch { return null; }
  }

  // ── Shared pure helpers live in ./src/lib/stats (TASKLIST Q3/B3) ──────────

  // ─────────────────────────────────────────────────────────────────────────
  // API Route: Geospace Live Feed
  // Returns last N rows of DSCOVR + INTERMAGNET from synced CSV
  // ─────────────────────────────────────────────────────────────────────────
  router.get("/", (_req, res) => {
    try {
      const csvPath = latestFile(DATA_SYNCED_DIR, /geospace.*\.csv$/);
      if (!csvPath) {
        return res.status(404).json({
          error: "No synced geospace data found. Run: .venv/bin/python3 scripts/fetch_geospace_sync.py",
          hint: "python3 scripts/fetch_geospace_sync.py --sources dscovr,intermagnet"
        });
      }

      const raw = fs.readFileSync(csvPath, "utf-8");
      const rows = parseCSV(raw);
      if (rows.length === 0) return res.status(404).json({ error: "Empty dataset" });

      // Take last 180 rows (3 hours @ 1min, or 1440 rows @ 5min = 5 days)
      const tail = rows.slice(-180);

      // Extract DSCOVR magnetometer time-series
      const dscovr_mag = tail.map(r => ({
        t: r["datetime_utc"] || r[""],
        bt:     pf(r["dscovr_mag__bt"]),
        bx_gsm: pf(r["dscovr_mag__bx_gsm"]),
        by_gsm: pf(r["dscovr_mag__by_gsm"]),
        bz_gsm: pf(r["dscovr_mag__bz_gsm"]),
        theta:  pf(r["dscovr_mag__theta_gsm"]),
      })).filter(r => r.bt !== null);

      // Extract DSCOVR plasma time-series
      const dscovr_plasma = tail.map(r => ({
        t:           r["datetime_utc"] || r[""],
        density:     pf(r["dscovr_plasma__proton_density"]) ?? pf(r["dscovr_plasma__density"]),
        speed:       pf(r["dscovr_plasma__bulk_speed"])     ?? pf(r["dscovr_plasma__speed"]),
        temperature: pf(r["dscovr_plasma__ion_temperature"]) ?? pf(r["dscovr_plasma__temperature"]),
      })).filter(r => r.speed !== null || r.density !== null);

      // Extract INTERMAGNET stations (look for imag_* columns)
      const imagCols = Object.keys(rows[0] || {}).filter(c => c.startsWith("imag_"));
      const stations: Record<string, { t: string; X: number | null; Y: number | null; Z: number | null; F: number | null }[]> = {};
      const staCodes = [...new Set(imagCols.map(c => c.split("__")[0].replace("imag_", "")))];
      for (const sta of staCodes) {
        stations[sta] = tail.map(r => ({
          t: r["datetime_utc"] || r[""],
          X: pf(r[`imag_${sta}__X`]),
          Y: pf(r[`imag_${sta}__Y`]),
          Z: pf(r[`imag_${sta}__Z`]),
          F: pf(r[`imag_${sta}__F`]),
        })).filter(r => r.F !== null || r.X !== null);
      }

      // Latest snapshot (last row with valid Bz)
      const lastMag = [...dscovr_mag].reverse().find(r => r.bz_gsm !== null);
      const lastPlasma = [...dscovr_plasma].reverse().find(r => r.speed !== null);

      // Kp-proxy from Bz (rough estimate: strong southward = elevated Kp)
      const kpProxy = lastMag?.bz_gsm != null
        ? Math.min(9, Math.max(0, Math.round((-lastMag.bz_gsm / 5) + 2)))
        : null;

      return res.json({
        source_file: path.basename(csvPath),
        rows_total:  rows.length,
        rows_returned: tail.length,
        last_updated: fs.statSync(csvPath).mtime.toISOString(),
        snapshot: {
          bz_gsm:      lastMag?.bz_gsm      ?? null,
          bt:          lastMag?.bt           ?? null,
          bx_gsm:      lastMag?.bx_gsm      ?? null,
          by_gsm:      lastMag?.by_gsm      ?? null,
          solar_speed: lastPlasma?.speed     ?? null,
          density:     lastPlasma?.density   ?? null,
          kp_proxy:    kpProxy,
          timestamp:   lastMag?.t            ?? lastPlasma?.t ?? null,
        },
        timeseries: { dscovr_mag, dscovr_plasma, stations },
      });
    } catch (err: any) {
      console.error("[/api/geospace]", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // API Route: Geospace Pipeline Status
  // ─────────────────────────────────────────────────────────────────────────
  router.get("/status", (_req, res) => {
    try {
      const csvPath  = latestFile(DATA_SYNCED_DIR,     /geospace.*\.csv$/);
      const manifest = latestFile(DATA_SYNCED_DIR,     /manifest.*\.json$/);
      const dscovr   = latestFile(path.join(DATA_DOWNLOADS_DIR, "dscovr"),       /\.parquet$/);
      const eida     = latestFile(path.join(DATA_DOWNLOADS_DIR, "eida"),         /\.parquet$/);
      const imag     = latestFile(path.join(DATA_DOWNLOADS_DIR, "intermagnet"),  /\.parquet$/);

      const age = (p: string | null) => {
        if (!p) return null;
        try {
          const ms = Date.now() - fs.statSync(p).mtimeMs;
          return Math.round(ms / 60000); // minutes ago
        } catch { return null; }
      };

      return res.json({
        pipeline_ready:    !!csvPath,
        synced_csv:        csvPath ? path.basename(csvPath) : null,
        synced_age_min:    age(csvPath),
        dscovr_age_min:    age(dscovr),
        eida_age_min:      age(eida),
        intermagnet_age_min: age(imag),
        manifest:          manifest ? path.basename(manifest) : null,
        fetch_command:     ".venv/bin/python3 scripts/fetch_geospace_sync.py --sources dscovr,intermagnet,eida",
      });
    } catch (err: any) {
      console.error("[/api/geospace/status]", err);
      return res.status(500).json({ error: "Failed to read pipeline status." });
    }
  });

  return router;
}
