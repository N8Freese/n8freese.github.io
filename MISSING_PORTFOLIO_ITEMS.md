# 📎 Missing Portfolio Items — what I need from you

The site is fully built and live-ready, but several **image/asset slots are placeholders**. Everywhere a file is missing, the site shows a clean styled placeholder instead of a broken image — so nothing looks broken in the meantime. Drop the real files at the exact paths below and they appear automatically (no code changes needed).

> Tip: export photos/renders at ~1600 px wide and keep each file ≤ ~300 KB for fast loads.

---

## 1. Profile

- [ ] **Headshot** — `assets/img/headshot.jpg` — preferred: **.jpg** or .png (portrait, ~4:5 works best)
  - Then edit `index.html` (About section): replace the `<span>…</span>` inside `.about__photo` with `<img src="assets/img/headshot.jpg" alt="Nate Freese" />`.

## 2. Project images (one card image + optional gallery shots per project)

| Project | File to add | Preferred |
|---|---|---|
| Crewed Lunar Mission | `assets/img/lunar-mission.jpg` (CAD render of full vehicle) | .png / .jpg |
| Crewed Lunar Mission | `assets/img/lunar-staging.png` (ΔV / sizing plot) | .png |
| NASA JSC Visualization | `assets/img/nasa-jsc.jpg` (tool screenshot — **cleared for public use**) | .png |
| Mayott Heavy-Lift UAV | `assets/img/mayott-uav.jpg` (Fusion 360 frame render/photo) | .png / .jpg |
| Collins Avionics | `assets/img/collins.jpg` (any shareable diagram) | .png / .jpg |
| ERFSEDS Artemis Rocket | `assets/img/artemis.jpg` (CAD render or build photo) | .jpg / .png |
| ERPL Spectre Rocket | `assets/img/spectre.jpg` (hardware / test photo) | .jpg / .png |
| Attitude Dynamics (AE 426) | `assets/img/attitude-sim.png` (MATLAB result plot) | .png |
| NASTRAN FEA (AE 318) | `assets/img/nastran.png` (displacement contour) | .png |
| NACA 2414 Airfoil (AE 314/315) | `assets/img/airfoil.jpg` (wind-tunnel photo or Cp plot) | .jpg / .png |
| Earth–Moon Relay (AE 429) | `assets/img/earth-moon-relay.jpg` (mission diagram) | .png / .jpg |

## 3. Interactive 3D model (launch vehicle)

- [ ] **`assets/rocket/full-launch-vehicle.glb`** — preferred: **.glb**
  - If you can only export from CATIA/Fusion: give me a **.step / .stp** (precise) or **.stl** (mesh) and I'll convert + Draco-compress it to `.glb` and drop it in. Aim for ≤ ~8 MB.
  - Used on the homepage 3D section **and** the Lunar Mission project page.
  - ⚠️ Senior-design IP: don't upload CATIA/STEP files to public converters — hand them to me and I'll convert locally.

## 4. Links to confirm

- [x] **LinkedIn** — `https://www.linkedin.com/in/nathanyl-freese/` (already wired — confirm correct)
- [x] **GitHub** — `https://github.com/N8Freese` (already wired — confirm correct)
- [ ] **Per-project GitHub repos** (optional but strong): if any project has a public repo (e.g., the Mayott Rust software), send the **URL** and I'll add a link button to that project page. Add them to the `links: []` array in `assets/js/projects.js`.

## 5. Résumé

- [x] **`assets/Nate_Freese_Resume.pdf`** — present and current. Replace this file anytime to update the download everywhere.

## 6. Already generated for you (no action needed)

- [x] `assets/img/og-image.png` — social/link-preview image (1200×630)
- [x] `assets/img/favicon.svg` — browser tab icon

---

### Anything you can't verify, leave to me
Each project page lists its own "Assets still needed" note pulled from the `needs:` field in `assets/js/projects.js`. As you send files, I (or you) just delete that line. **Do not invent details** — if a metric or result isn't real, leave the placeholder and we'll fill it accurately.
