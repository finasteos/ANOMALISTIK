import zipfile
import json
import os
from pathlib import Path

ARCHIVE_DIR = Path("/Users/imacpro/Downloads")
OUTPUT_JSON = Path("data/declassified_archive_index.json")
OUTPUT_MD = Path("history/2026-08-17_declassified_archives_catalog.md")

ARCHIVES = [
    ARCHIVE_DIR / f"UFOFiles-Release{i}.zip" for i in range(1, 6)
]

def catalog_archives():
    catalog = {
        "generated_at": "2026-08-17",
        "total_archives": len(ARCHIVES),
        "total_files": 0,
        "total_uncompressed_bytes": 0,
        "archives": []
    }

    md_lines = [
        "# Declassified UAP & Historical Intelligence Archives Catalog",
        "**Ingestion Date:** August 17, 2026",
        "",
        "Overview of declassified files indexed from `UFOFiles-Release1.zip` through `UFOFiles-Release5.zip` mapped against `ANOMALISTIK` lab analytical engines.",
        ""
    ]

    for arc_path in ARCHIVES:
        if not arc_path.exists():
            continue
        
        arc_stat = arc_path.stat()
        arc_info = {
            "name": arc_path.name,
            "archive_size_bytes": arc_stat.st_size,
            "archive_size_mb": round(arc_stat.st_size / (1024 * 1024), 2),
            "files": []
        }

        md_lines.append(f"## 📦 {arc_path.name} ({arc_info['archive_size_mb']} MB)")
        md_lines.append("| File Name | Size (KB) | Type | Potential ANOMALISTIK Mapping |")
        md_lines.append("| :--- | :--- | :--- | :--- |")

        with zipfile.ZipFile(arc_path, 'r') as z:
            for item in z.infolist():
                if item.is_dir():
                    continue
                
                catalog["total_files"] += 1
                catalog["total_uncompressed_bytes"] += item.file_size

                ext = Path(item.filename).suffix.lower()
                category = "Document (PDF)" if ext == ".pdf" else "Image" if ext in [".jpg", ".jpeg", ".png"] else "Video" if ext == ".mp4" else "Data"
                
                mapping = "General Archival"
                name_lower = item.filename.lower()
                if "apollo" in name_lower or "1972" in name_lower:
                    mapping = "Apollo 17 Photogrammetry (#20)"
                elif "sandia" in name_lower or "pantex" in name_lower or "doe" in name_lower:
                    mapping = "Nuclear Site Forensics & Radiation Surveys (G31 / G33)"
                elif "range-fouler" in name_lower or "dod" in name_lower:
                    mapping = "PURSUE & Aerodynamic Acceleration Triangulation (N2-ext)"
                elif "ghost-rocket" in name_lower or "1947" in name_lower or "bluebook" in name_lower:
                    mapping = "Historical Cold War Epigraphy & Archival Forensics (G32)"

                arc_info["files"].append({
                    "path": item.filename,
                    "size_bytes": item.file_size,
                    "compressed_bytes": item.compress_size,
                    "date_time": f"{item.date_time[0]}-{item.date_time[1]:02d}-{item.date_time[2]:02d}",
                    "category": category,
                    "mapping": mapping
                })

                md_lines.append(f"| `{item.filename}` | {round(item.file_size / 1024, 1)} | {category} | {mapping} |")
        
        md_lines.append("")
        catalog["archives"].append(arc_info)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(catalog, f, indent=2)

    OUTPUT_MD.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_MD, "w") as f:
        f.write("\n".join(md_lines))

    print(f"Cataloged {catalog['total_files']} files ({round(catalog['total_uncompressed_bytes'] / (1024*1024*1024), 2)} GB uncompressed) successfully.")

if __name__ == "__main__":
    catalog_archives()
