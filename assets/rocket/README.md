# Rocket 3D model — drop-in folder

The site looks for **`full-launch-vehicle.glb`** in this folder. Until it exists, the
"3D model coming soon" placeholder shows on the page. As soon as the GLB is here,
`main.js` detects it and swaps in the interactive viewer automatically — no code changes needed.

## How to produce the GLB (when you can get to CATIA)

1. **Export from CATIA** (ERAU lab / Windows machine — CATIA doesn't run on macOS):
   open `Full Launch Vehicle.CATProduct` → **Save As → STL** (medium tessellation / sag),
   or **STEP (.stp)** for precise geometry.
2. **Hand the STL/STEP to Claude.** It will convert → optimize (decimate + Draco-compress) →
   output `full-launch-vehicle.glb` and place it here.
   - Do **not** upload the CATIA/STEP files to an online converter without deciding it's OK —
     these are senior-design IP.
3. Refresh the page — the rotating rocket appears.

## Target
- File: `full-launch-vehicle.glb`
- Size: aim for ≤ ~8 MB for fast load (decimate the mesh if larger).

_Placeholder file `full-launch-vehicle.glb` is intentionally absent. This README is just the marker._
