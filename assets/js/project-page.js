/* ============================================================================
 * project-page.js — renders a full case study at project.html?id=<id>
 * Pulls data from assets/js/projects.js (window.PROJECTS).
 * ==========================================================================*/
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile nav toggle
  var nav = document.querySelector(".nav");
  if (nav) {
    var t = nav.querySelector(".nav__toggle");
    if (t) t.addEventListener("click", function () { nav.classList.toggle("is-open"); });
  }

  var root = document.getElementById("detail");
  var list = window.PROJECTS || [];
  var id = new URLSearchParams(location.search).get("id");
  var idx = list.findIndex(function (p) { return p.id === id; });
  var p = list[idx];

  if (!p) {
    root.innerHTML =
      '<a class="detail__back" href="index.html#projects">← All projects</a>' +
      '<h1 class="detail__title">Project not found</h1>' +
      '<p>That project doesn\'t exist. <a href="index.html#projects">Back to all projects →</a></p>';
    return;
  }

  document.title = p.title + " — Nate Freese";
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", p.tagline || p.title);

  var prev = list[(idx - 1 + list.length) % list.length];
  var next = list[(idx + 1) % list.length];

  root.innerHTML = [
    '<a class="detail__back" href="index.html#projects">← All projects</a>',
    '<p class="detail__cat">' + esc(p.category || "") + "</p>",
    '<h1 class="detail__title">' + esc(p.title) + "</h1>",
    metaRow(p),
    tagRow(p.tags),
    p.tagline ? '<p class="detail__lead">' + esc(p.tagline) + "</p>" : "",
    block("The problem", p.problem ? "<p>" + esc(p.problem) + "</p>" : ""),
    p.demo ? block("Live demo", '<div data-demo="' + esc(p.demo) + '"></div>') : "",
    block("Engineering process", bullets(p.approach)),
    toolBlock(p.tools),
    block("Results", bullets(p.results)),
    p.learned ? block("What I learned", "<p>" + esc(p.learned) + "</p>") : "",
    p.model ? block("Interactive 3D", modelViewer(p.model)) : "",
    galleryBlock(p.gallery),
    needsBlock(p.needs),
    pager(prev, next),
  ].join("");

  // load any demo on the page
  if (window.__mountDemos) window.__mountDemos();
  else {
    var s = document.createElement("script");
    s.src = "assets/js/demo.js";
    document.body.appendChild(s);
  }

  // model-viewer: load GLB if present, else keep placeholder
  var mvHost = document.getElementById("detail-model");
  if (mvHost) {
    fetch(p.model, { method: "HEAD" }).then(function (res) {
      if (!res.ok) return;
      var mv = document.createElement("model-viewer");
      mv.setAttribute("src", p.model);
      mv.setAttribute("alt", p.title + " (3D model)");
      mv.setAttribute("auto-rotate", "");
      mv.setAttribute("camera-controls", "");
      mv.setAttribute("shadow-intensity", "1");
      mv.setAttribute("exposure", "1.05");
      mv.setAttribute("camera-orbit", "30deg 80deg 90%");
      mv.setAttribute("field-of-view", "32deg");
      mvHost.replaceChildren(mv);
    }).catch(function () {});
  }

  /* ---- helpers -------------------------------------------------------- */
  function metaRow(p) {
    var bits = [];
    if (p.role) bits.push("<span><b>Role:</b> " + esc(p.role) + "</span>");
    if (p.period) bits.push("<span><b>When:</b> " + esc(p.period) + "</span>");
    (p.links || []).forEach(function (l) {
      bits.push('<span><a href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.label) + " ↗</a></span>");
    });
    return bits.length ? '<div class="detail__meta">' + bits.join("") + "</div>" : "";
  }
  function tagRow(tags) {
    if (!tags || !tags.length) return "";
    return '<div class="detail__tags">' + tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>";
  }
  function block(title, body) {
    if (!body) return "";
    return '<h2 class="block">' + esc(title) + "</h2>" + body;
  }
  function bullets(arr) {
    if (!arr || !arr.length) return "";
    return '<ul class="bullets">' + arr.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>";
  }
  function toolBlock(tools) {
    if (!tools || !tools.length) return "";
    return block("Technical Skills",
      '<div class="detail__toolgrid">' + tools.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>");
  }
  function galleryBlock(g) {
    if (!g || !g.length) return "";
    var figs = g.map(function (item) {
      var media = item.src
        ? '<div class="frame" style="padding:0"><img src="' + esc(item.src) + '" alt="' + esc(item.caption || "") + '" loading="lazy" ' +
          "onerror=\"this.parentNode.innerHTML='Add: " + esc(item.src) + "'\"></div>"
        : '<div class="frame">Image slot</div>';
      return '<figure class="detail__fig">' + media +
        (item.caption ? "<figcaption>" + esc(item.caption) + "</figcaption>" : "") + "</figure>";
    }).join("");
    return block("Gallery", '<div class="detail__gallery">' + figs + "</div>");
  }
  function modelViewer(src) {
    return '<div id="detail-model" class="rocket-viewer">' +
      '<div class="rocket-viewer__placeholder"><p>🚀 3D model coming soon</p>' +
      "<small>Drop <code>" + esc(src) + "</code> to enable.</small></div></div>";
  }
  function needsBlock(needs) {
    if (!needs || !needs.length) return "";
    return '<div class="detail__needs"><h3>📎 Assets still needed for this project</h3><ul>' +
      needs.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul></div>";
  }
  function pager(prev, next) {
    return '<div class="detail__nav">' +
      '<a class="prev" href="project.html?id=' + esc(prev.id) + '"><span class="lbl">← Previous</span><span class="t">' + esc(prev.title) + "</span></a>" +
      '<a class="next" href="project.html?id=' + esc(next.id) + '"><span class="lbl">Next →</span><span class="t">' + esc(next.title) + "</span></a>" +
      "</div>";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
})();
