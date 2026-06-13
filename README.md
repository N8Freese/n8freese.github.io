# Nate Freese — Portfolio

Personal portfolio for **Nathanyl "Nate" Freese**, Aerospace Engineering (ERAU).
Plain **HTML / CSS / JS** — no build step, no dependencies to compile. Publishes to GitHub Pages as-is.

> 👉 Need to know what files to provide? See **[MISSING_PORTFOLIO_ITEMS.md](MISSING_PORTFOLIO_ITEMS.md)**.

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
  rocket/               # drop full-launch-vehicle.glb here
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
  gallery: [{ src: "assets/img/x.png", caption: "Caption" }],
  needs: ["Asset still needed — .png"],   // shows a reminder note on the page
}
```

### Add an image
Drop the file in `assets/img/` and make sure a project's `thumb` / `gallery` points to it.
Until a file exists, a clean placeholder is shown automatically.

### Add a headshot
Put `assets/img/headshot.jpg`, then in `index.html` (About section) replace the
`<span>…</span>` inside `.about__photo` with
`<img src="assets/img/headshot.jpg" alt="Nate Freese" />`.

### Update the résumé
Replace `assets/Nate_Freese_Resume.pdf`. Every "Résumé" link/button uses it.

### Add the 3D rocket
Drop `assets/rocket/full-launch-vehicle.glb`. It appears automatically on the homepage
3D section and the Lunar Mission project page. (Have only STEP/STL? See MISSING_PORTFOLIO_ITEMS.md.)

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
