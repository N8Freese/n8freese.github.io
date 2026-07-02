/* ============================================================================
 * project-page.js - renders a full case study at project.html?id=<id>
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
  var list = (window.PROJECTS || []).slice().sort(function (a, b) {
    return (a.order || 99) - (b.order || 99);
  });
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

  document.title = p.title + " | Nate Freese";
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
    p.code ? block(p.code.caption ? "Staging / ΔV budget" : "Code", codeBlock(p.code)) : "",
    p.learned ? block("What I learned", "<p>" + esc(p.learned) + "</p>") : "",
    p.model ? block("Interactive 3D", modelViewer(p.model)) : "",
    galleryBlock(p.gallery),
    p.pdr ? block("Project documentation", pdrBlock(p.pdr)) : "",
    pager(prev, next),
  ].join("");

  mountPdfViewers();
  mountLightbox();

  // gallery image fallback (no inline handlers — CSP-safe)
  root.querySelectorAll("img[data-missing-note]").forEach(function (img) {
    img.addEventListener("error", function () {
      img.parentNode.textContent = "Add: " + img.getAttribute("data-missing-note");
    });
  });

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
      mv.setAttribute("disable-zoom", "");   // rotation only - zoom disabled in case-study views
      mv.setAttribute("shadow-intensity", "1");
      mv.setAttribute("exposure", "1.05");
      mv.setAttribute("camera-orbit", "30deg 80deg 90%");
      mv.setAttribute("field-of-view", "32deg");
      mvHost.replaceChildren(mv);
    }).catch(function () {});
  }

  // code preview → expandable modal (shared component, see codeviewer.js)
  var codeHost = document.getElementById("codeview");
  if (codeHost && p.code && window.mountCodeViewer) {
    window.mountCodeViewer(codeHost, {
      title: p.code.title, src: p.code.src, lang: p.code.lang,
      caption: p.code.caption, previewLines: 16,
    });
  }

  /* ---- helpers -------------------------------------------------------- */
  function codeBlock(code) {
    return '<div id="codeview" class="codeview">' +
      '<div class="codeview__loading">Loading ' + esc(code.title) + " …</div></div>";
  }

  function pdrBlock(pdr) {
    return (pdr.blurb ? "<p>" + esc(pdr.blurb) + "</p>" : "") +
      '<a class="btn pdr__btn" href="' + esc(pdr.src) + '" target="_blank" rel="noopener">' +
      esc(pdr.label || "View document (PDF)") + " ↗</a>";
  }

  // PDF gallery items: clipped preview card that opens the full PDF in a modal.
  function mountPdfViewers() {
    document.querySelectorAll(".pdffig").forEach(function (fig) {
      var src = fig.getAttribute("data-pdf");
      var name = fig.getAttribute("data-name") || "Document";

      var modal = document.createElement("div");
      modal.className = "codemodal codemodal--pdf";
      modal.hidden = true;
      modal.innerHTML =
        '<div class="codemodal__backdrop" data-act="close"></div>' +
        '<div class="codemodal__panel is-full" role="dialog" aria-modal="true" tabindex="-1" aria-label="' + esc(name) + '">' +
          '<div class="demo__bar"><span class="dots dots--live">' +
            '<button type="button" class="dot dot--red"   data-act="close" title="Close"></button>' +
            '<button type="button" class="dot dot--amber" data-act="close" title="Minimize"></button>' +
            '<button type="button" class="dot dot--green" data-act="full"  title="Expand / restore"></button>' +
          '</span><span class="codeview__name">' + esc(name) + ' · PDF</span>' +
          '<a class="codemodal__link" href="' + esc(src) + '" target="_blank" rel="noopener">Open in new tab ↗</a></div>' +
          '<iframe class="codemodal__pdf" title="' + esc(name) + '" src="' + esc(src) + '"></iframe>' +
        "</div>";
      document.body.appendChild(modal);

      var panel = modal.querySelector(".codemodal__panel");
      function open()  { modal.hidden = false; document.body.style.overflow = "hidden"; try { panel.focus(); } catch (e) {} }
      function close() { modal.hidden = true; document.body.style.overflow = ""; }

      fig.addEventListener("click", open);
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      modal.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-act]");
        if (!btn) return;
        if (btn.getAttribute("data-act") === "full") panel.classList.toggle("is-full");
        else close();
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
    });
  }

  // Gallery lightbox: click an image to view it large; ‹ › buttons and arrow keys
  // navigate between image items in both directions; Esc or backdrop closes.
  function mountLightbox() {
    var figs = [].slice.call(root.querySelectorAll(
      ".detail__gallery .detail__fig:not(.detail__fig--pdf):not(.detail__fig--video)"));
    var items = [];
    figs.forEach(function (fig) {
      var img = fig.querySelector("img");
      if (!img) return;
      var cap = fig.querySelector("figcaption");
      var idx = items.push({ src: img.getAttribute("src"), caption: cap ? cap.textContent : "" }) - 1;
      var frame = fig.querySelector(".frame");
      frame.classList.add("is-zoomable");
      frame.setAttribute("role", "button");
      frame.setAttribute("tabindex", "0");
      frame.setAttribute("aria-label", "View " + (items[idx].caption || "image") + " full size");
      frame.addEventListener("click", function () { open(idx); });
      frame.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(idx); }
      });
    });
    if (!items.length) return;

    var modal = document.createElement("div");
    modal.className = "codemodal lightbox";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="codemodal__backdrop" data-act="close"></div>' +
      '<div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="Image viewer" tabindex="-1">' +
        '<button type="button" class="lightbox__btn lightbox__btn--close" data-act="close" aria-label="Close">×</button>' +
        (items.length > 1 ? '<button type="button" class="lightbox__btn lightbox__btn--prev" data-act="prev" aria-label="Previous image">‹</button>' : "") +
        '<img class="lightbox__img" alt="">' +
        (items.length > 1 ? '<button type="button" class="lightbox__btn lightbox__btn--next" data-act="next" aria-label="Next image">›</button>' : "") +
        '<p class="lightbox__cap"></p>' +
      "</div>";
    document.body.appendChild(modal);

    var panel = modal.querySelector(".lightbox__panel");
    var imgEl = modal.querySelector(".lightbox__img");
    var capEl = modal.querySelector(".lightbox__cap");
    var cur = 0;

    function show(i) {
      cur = (i + items.length) % items.length;
      imgEl.src = items[cur].src;
      imgEl.alt = items[cur].caption || "";
      capEl.textContent = (items[cur].caption || "") +
        (items.length > 1 ? "  ·  " + (cur + 1) + " / " + items.length : "");
    }
    function open(i) {
      show(i);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      try { panel.focus(); } catch (e) {}
    }
    function close() { modal.hidden = true; document.body.style.overflow = ""; }

    modal.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "prev") show(cur - 1);
      else if (act === "next") show(cur + 1);
      else close();
    });
    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(cur - 1);
      else if (e.key === "ArrowRight") show(cur + 1);
    });
  }

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
      if (item.pdf) {
        var nm = item.name || (item.pdf.split("/").pop());
        return '<figure class="detail__fig detail__fig--pdf">' +
          '<div class="frame pdffig" data-pdf="' + esc(item.pdf) + '" data-name="' + esc(nm) + '" ' +
            'role="button" tabindex="0" aria-label="Open ' + esc(item.caption || nm) + '">' +
            '<embed class="pdffig__embed" src="' + esc(item.pdf) + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH" type="application/pdf">' +
            '<span class="pdffig__badge">Open PDF</span>' +
          "</div>" +
          (item.caption ? "<figcaption>" + esc(item.caption) + "</figcaption>" : "") + "</figure>";
      }
      if (item.video) {
        // preload="auto": clips are small (a few MB), and full buffering makes the
        // scrubber seek reliably in both directions even on servers without Range support
        return '<figure class="detail__fig detail__fig--video">' +
          '<div class="frame frame--video">' +
            '<video class="detail__video" controls preload="auto" playsinline controlsList="nodownload"' +
            (item.poster ? ' poster="' + esc(item.poster) + '"' : "") + ">" +
              '<source src="' + esc(item.video) + '" type="video/mp4">' +
              "Your browser does not support embedded video." +
            "</video>" +
            (item.badge ? '<span class="detail__mediabadge">' + esc(item.badge) + "</span>" : "") +
          "</div>" +
          (item.caption ? "<figcaption>" + esc(item.caption) + "</figcaption>" : "") + "</figure>";
      }
      var media = item.src
        ? '<div class="frame" style="padding:0"><img src="' + esc(item.src) + '" alt="' + esc(item.caption || "") + '" loading="lazy" data-missing-note="' + esc(item.src) + '"></div>'
        : '<div class="frame">Image slot</div>';
      return '<figure class="detail__fig">' + media +
        (item.caption ? "<figcaption>" + esc(item.caption) + "</figcaption>" : "") + "</figure>";
    }).join("");
    return block("Gallery", '<div class="detail__gallery">' + figs + "</div>");
  }
  function modelViewer(src) {
    return '<div id="detail-model" class="rocket-viewer">' +
      '<div class="rocket-viewer__placeholder"><p>3D model coming soon</p>' +
      "<small>Drop <code>" + esc(src) + "</code> to enable.</small></div></div>";
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
