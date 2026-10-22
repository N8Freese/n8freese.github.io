# Nate Freese — Portfolio

Personal portfolio for **Nathanyl "Nate" Freese**, Aerospace Engineering (ERAU).
Plain **HTML / CSS / JS** — no build step, no dependencies to compile. Publishes to GitHub Pages as-is.
Dark by default with a warm-paper light theme (toggle in the nav; the choice is remembered).

## Structure
```
index.html              # homepage (hero, about, toolset, work, 3D viewer, experience, education, contact)
project.html            # case-study template — renders project.html?id=<id> from data
404.html                # styled not-found page
robots.txt / sitemap.xml
assets/
  css/styles.css        # design tokens (dark + light) and every component
  js/
    projects.js         # ⭐ SINGLE SOURCE OF TRUTH for all projects (edit here)
    cope-data.js        # CDR analysis outputs (nozzle contours, regen channels, ascent) that feed the live sims
    main.js             # nav, project cards, hero contour art, scroll reveal
    project-page.js     # renders the case-study page from projects.js (sections, tables, stats, docs)
    rocket3d.js         # homepage Three.js viewer: launch stack, refuel config, both engines, drag + explode
    nozzle-sim.js       # quasi-1D flow through the real Rao bells (kept in the repo, not mounted on the homepage)
    demo.js + sims.js   # Code Showcase tabs with CDR MATLAB playback (kept in the repo, not mounted on the homepage)
    codeviewer.js       # code preview card + full-source modal
    model-viewer.min.js # vendored 3D viewer for case-study galleries (self-hosted, no CDN)
  img/                  # project + profile images, favicon, OG image
  rocket/               # web-ready .glb models (launch stack, refuel config, cope-s1/s2-engine from Onshape, Artemini, Spectre parts)
  code/                 # MATLAB shown in the Code Showcase and case studies (copied from the CDR folder)
  video/                # compressed .mp4 project videos (H.264, faststart)
  nathanyl_freese_resume.pdf, AE441-PDR.pdf, AE451-CDR.pdf
```

## How to update content

### Add or edit a project (the important one)
Everything about projects lives in **`assets/js/projects.js`**. Each entry in the
`PROJECTS` array automatically becomes **both** a card on the homepage **and** a full
case-study page at `project.html?id=<id>`. Edit one place, both update.

```js
{
  id: "my-project",            // becomes the URL: project.html?id=my-project
  title: "My Project",
  category: "Role · Org",
  tagline: "One-line summary for the card.",
  period: "2026",
  role: "Lead Engineer",
  tags: ["MATLAB", "CAD"],
  featured: true,              // true = wide card, shown first
  thumb: "assets/img/my-project.jpg",
  demo: "orbit",              // optional: embed an interactive demo
  model: "assets/rocket/x.glb",// optional: embed a 3D model
  links: [{ label: "GitHub", href: "https://..." }],
  problem: "What you were solving.",
  approach: ["Step 1", "Step 2"],
  tools: ["Tool A", "Tool B"],
  results: ["Outcome 1"],
  learned: "What you took away.",
  gallery: [
    { src: "assets/img/x.png", caption: "Caption" },
    { video: "assets/video/x.mp4", poster: "assets/img/x-poster.jpg", caption: "Caption" },
  ],
  needs: ["Asset still needed — .png"],   // shows a reminder note on the page
}
```

### Add a video
Compress first — GitHub rejects files over 100 MB, and nobody streams a raw screen
recording. From a raw export:
```bash
ffmpeg -i raw.mp4 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
       -c:a aac -b:a 96k -movflags +faststart assets/video/name.mp4
ffmpeg -ss 20 -i assets/video/name.mp4 -frames:v 1 -q:v 3 assets/img/name-poster.jpg
```
Then add a `{ video, poster, caption }` entry to the project's `gallery`.

### Add an image
Drop the file in `assets/img/` and make sure a project's `thumb` / `gallery` points to it.
Until a file exists, a clean placeholder is shown automatically.

### Add a headshot
Put `assets/img/headshot.jpg`, then in `index.html` (About section) replace the
`<span>…</span>` inside `.about__photo` with
`<img src="assets/img/headshot.jpg" alt="Nate Freese" />`.

### Update the resume
Replace `assets/nathanyl_freese_resume.pdf`. Every "Resume" link/button uses it.

### Add a 3D model
Drop a **decimated** `.glb` in `assets/rocket/` and point a gallery item's `model` field at it.
Never commit source CAD (STEP/CATPart/SLDPRT) — `.gitignore` blocks it, and only
low-poly web meshes belong in a public repo. STL → GLB goes through `../convert_models.py`;
The engine assemblies come from Onshape (API `…/assemblies/…/gltf` from a signed-in tab),
grouped by appearance colour with `trimesh` in `../.convert-venv`, then decimated in Blender
(`blender -b --python decimate.py`). Keep each file ≤ ~5 MB.

### Refresh the CDR data behind the live sims
`assets/js/cope-data.js` is exported from the CDR folder's `Engine/Stage{1,2}_Contour.csv`,
`Engine/RegenCooling_Stage{1,2}_Channels.csv`, and `TVC/Ascent_Trajectory.csv`. Re-export it
(downsampled, JSON) whenever those change; the nozzle sim, regen and ascent playbacks, and
the hero contour art all read from it.

## Preview locally
```bash
cd path/to/n8freese.github.io
python3 -m http.server 8000
# open http://localhost:8000
```
Use a local server (not `file://`) so `fetch()` for the GLB and project data works.

## Publish on GitHub Pages
1. Repo → **Settings → Pages** → Build from branch `main` → `/ (root)`.
2. Live at `https://n8freese.github.io` in ~1 minute.
   (Pages on the free plan requires the repo to be **public**.)

## Design notes
- Zero runtime dependencies; everything is vanilla and self-hosted.
- Respects `prefers-reduced-motion`.
- SEO + Open Graph/Twitter meta and JSON-LD are set in `index.html`.
- Responsive across desktop / tablet / mobile; accessible (landmarks, alt text, focus states).

## Security posture
Everything served by a public static site is downloadable — plan around that, don't
pretend otherwise. What this repo does:
- **No source CAD, ever.** Only decimated `.glb` meshes are published (a few MB,
  display-quality). Original STEP/parametric models never enter the repo; `.gitignore`
  enforces it and history has been checked clean.
- **Content-Security-Policy** via `<meta>` on every page: same-origin only for scripts,
  media, frames, and fetches; the one inline script (the import map) is hash-allowlisted;
  no inline event handlers anywhere. (GitHub Pages can't set response headers, so header-only
  directives like `frame-ancestors` aren't available — meta CSP is the ceiling here.)
- **All rendered strings are HTML-escaped** (`esc()` in `main.js` / `project-page.js`);
  the only URL input (`?id=`) is used as a lookup key, never echoed as markup.
- **Self-hosted everything** — no CDNs, no analytics, no third-party requests.
- `rel="noopener"` on all external links; `strict-origin-when-cross-origin` referrer policy.
- `.well-known/security.txt` for responsible disclosure contact.
- Employer content (NASA/Collins) is limited to publicly shareable material —
  text, logos, and approved media only.
