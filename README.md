# Nate Freese — Portfolio Site

Plain HTML/CSS/JS. No build step, no dependencies to compile. Publishes to GitHub Pages as-is.

## Structure
```
site/
  index.html              # all sections (edit copy here)
  assets/
    css/styles.css        # dark theme
    js/main.js            # footer year + auto-loads the 3D rocket when its GLB exists
    js/model-viewer.min.js# vendored 3D viewer (self-hosted, no CDN)
    img/                  # project + profile images (see img/README.md)
    rocket/               # drop full-launch-vehicle.glb here (see rocket/README.md)
```

## Preview locally
```bash
cd "~/Documents/Portfolio/site"
python3 -m http.server 8000
# open http://localhost:8000
```
(Use a server, not file://, so main.js can fetch the GLB.)

## Publish on GitHub Pages (free)
This repo (`n8freese.github.io`) starts **private** while you finish it. To go live:
1. Repo → Settings → change visibility to **Public** (private repos can't publish Pages on the free plan).
2. Repo → Settings → Pages → Build from branch `main` → `/ (root)`.
3. Live at `https://n8freese.github.io` in ~1 minute.

The `site/` contents are already at the repo root (this folder *is* the repo).

## What's a placeholder
- Every `<!-- [fill-in: ...] -->` comment in `index.html` — replace with your copy.
- `data-todo` links (LinkedIn, GitHub, résumé) show a ⚠ until you set real URLs.
- Image `.card__media` / `.about__photo` boxes — swap the placeholder `<span>` for an `<img>`.
- 3D rocket — appears automatically once `assets/rocket/full-launch-vehicle.glb` is added.
