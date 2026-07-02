# Nate Freese — Portfolio

Personal portfolio for **Nathanyl "Nate" Freese**, Aerospace Engineering (ERAU).
Plain **HTML / CSS / JS** — no build step, no dependencies to compile. Publishes to GitHub Pages as-is.

## Structure
```
index.html              # homepage (hero, about, skills, projects, demo, 3D, experience, education, contact)
project.html            # case-study template — renders project.html?id=<id> from data
404.html                # styled not-found page
robots.txt / sitemap.xml
assets/
  css/styles.css        # design system + all components (dark "deep space" theme)
  js/
    projects.js         # ⭐ SINGLE SOURCE OF TRUTH for all projects (edit here)
    main.js             # nav, scroll-reveal, renders project cards, loads 3D model
    project-page.js     # renders the case-study page from projects.js
    demo.js             # reusable interactive "engineering demo" (orbit canvas sim)
    model-viewer.min.js # vendored 3D viewer (self-hosted, no CDN)
  img/                  # project + profile images, favicon, OG image
  rocket/               # web-ready (decimated) .glb models for the 3D viewers
  video/                # compressed .mp4 project videos (H.264, faststart)
  Nate_Freese_Resume.pdf
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

### Update the résumé
Replace `assets/Nate_Freese_Resume.pdf`. Every "Résumé" link/button uses it.

### Add a 3D model
Drop a **decimated** `.glb` in `assets/rocket/` and point a project's `model` field at it.
Never commit source CAD (STEP/CATPart/SLDPRT) — `.gitignore` blocks it, and only
low-poly web meshes belong in a public repo. Convert STEP → mesh in CAD, then STL → GLB
with `../convert_models.py`, keeping each file ≤ ~5 MB.

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
- Employer content (NASA/Collins/Mayott) is limited to publicly shareable material —
  text, logos, and approved media only.
