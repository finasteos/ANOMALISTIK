// Declassified archive routes, extracted from server.ts (TASKLIST B3).
// Mount: app.use("/api/declassified", createDeclassifiedRouter({ samplesDir, catalogPath })).
import express from "express";
import fs from "fs";

export function createDeclassifiedRouter(opts: { samplesDir: string; catalogPath: string }) {
  const router = express.Router();
  const DECLAS_SAMPLES_DIR = opts.samplesDir;
  const DECLAS_CATALOG_PATH = opts.catalogPath;

  // API Route: Declassified UAP Archives Catalog & Sample Images
  // ─────────────────────────────────────────────────────────────────────────
  if (fs.existsSync(DECLAS_SAMPLES_DIR)) {
    router.use("/images", express.static(DECLAS_SAMPLES_DIR));
  }

  router.get("/catalog", (_req, res) => {
    try {
      if (fs.existsSync(DECLAS_CATALOG_PATH)) {
        const data = JSON.parse(fs.readFileSync(DECLAS_CATALOG_PATH, "utf-8"));
        return res.json(data);
      }
      return res.status(404).json({ error: "Catalog not found. Run scripts/catalog_declassified_archives.py" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to load catalog." });
    }
  });

  return router;
}
