# 📎 Missing Portfolio Items — what I still need from you

The site is fully built and live-ready. Wherever a file is missing the site shows a
clean styled placeholder (or simply omits the section) — nothing looks broken, and no
"assets needed" notes are shown anywhere on the live portfolio.

> Assets are pulled from your `~/Documents/Portfolio/Photos` folder when provided.
> Tip: export photos/renders at ~1600 px wide and keep each file ≤ ~300 KB for fast loads.

_Last updated: 2026-06-15 (round-5 update)._

---

## ✅ Found & wired this round (round 5)

- [x] **ERFSEDS Artemis cover** — `ERFSEDS Cover Image.png` → `assets/img/artemis-cover.png` (replaced the CAD image as the cover)
- [x] **ERPL / Spectre cover** — `ERPL Cover Image.png` → `assets/img/spectre-cover.png` (project card / cover)
- [x] **ERAU timeline logo** — `ERAU Cover IMage.png` → `assets/img/logos/erau.png` (Thermodynamics Tutor card — now matches the KBR/Collins cards)
- [x] **Code Showcase — Artemis II** — `HW4_ArtemisII_March_11_Launch.m` → `assets/code/artemis-ii-trajectory.m` (preview + expandable modal)
- [x] **Code Showcase — Project 1** — `Project_1.m` → `assets/code/project-1.m`, titled "Nonlinear Dynamics & ODE Integration" (preview + expandable modal)
- [x] **Code Showcase — UAV PID demo** — newly authored `assets/code/uav_pid_control_demo.m` (clearly labeled as a demo/template)
- [x] **Earth–Moon Relay — report PDF in gallery** — `final.pdf` → `assets/earth-moon-relay.pdf` (clean PDF preview card → opens full PDF in a modal)
- [x] **Earth–Moon Relay cover** — custom, copyright-safe SVG (satellite orbiting the Moon) → `assets/img/moon-relay-cover.svg`

### Found & wired in earlier rounds
- [x] **Lunar Mission** cover (`Full Launch Vehicle v5.png`), engine gallery image (`ENGINE v2.png`), and staging/ΔV code (`test2.m`)
- [x] **Mayott Aerospace** cover (`Mayott Drone 2.jpeg`), UAV gallery (`Mayott Drone.png`), Prezi link
- [x] **Artemis rocket 3D model** (`arteminiAssembly.stl` → `artemis.glb`)
- [x] **Collins & NASA** cards use official logos (no confidential screenshots)

---

## ⏳ Still needed from you

### 3D models — need web-ready conversion (STEP can't be used directly on the web)
The web 3D viewer needs **`.glb` / `.gltf`**. STEP/STP files can't be loaded in-browser, and these are
also far too large as-is. No tooling here can read STEP (only STL→GLB is automated via `convert_models.py`).
For each, provide a **decimated `.glb` ≤ ~5 MB**, an **STL export** (I can convert STL→GLB), or confirm I may
install a STEP→mesh toolchain (FreeCAD/pythonocc) to attempt local conversion + heavy decimation.

- [ ] **Spectre Mk1 Full Assy** — currently `Spectre Mk1 Full Assy.step` (53 MB) → needs `.glb` ≤ ~5 MB
- [ ] **SM_Current Copy** — currently `SM_Current Copy.step` (30 MB) → needs `.glb` ≤ ~5 MB
- [ ] **Canard (v.4.0)** — currently `Canard (v.4.0).step` (0.45 MB) → needs `.glb`
  - These three would become the **Spectre Rocket gallery** (3 interactive spinning CAD views). Until then the Spectre gallery is omitted (its cover image is in place).
- [ ] **Lunar engine — 3D model** — only `ENGINE v2.png` (a 2D image) exists; it stays as a static gallery image. For an interactive spinning engine like the launch vehicle, provide an engine **`.stl` / `.glb`** export.

### Optional images (placeholders look fine until then)
- [ ] **NASTRAN FEA** result image — `assets/img/nastran.png` — **.png**

---

## Quick reference — preferred file types
- Cover images — **.png / .jpg / .svg** ✅ covers done
- 3D models — **.glb / .gltf** (or **.stl** for me to convert; **STEP not usable on web**) ⏳ Spectre set + engine pending
- Earth–Moon Relay report — **.pdf** ✅ done
- MATLAB for Code Showcase / case studies — **.m** ✅ done

> **No confidential content.** NASA JSC, KBR, and Collins sections are text + logos only. Mayott Aerospace
> flight software (Rust) is intentionally **not** shown and is **not** requested.
