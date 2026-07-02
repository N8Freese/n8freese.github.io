/* ============================================================================
 * codeviewer.js - shared "code editor" preview that expands into a modal.
 *
 *   window.mountCodeViewer(host, {
 *     title, src, lang, caption, previewLines
 *   })
 *
 * Renders a clipped, clickable preview card (mac-style title bar) and a modal
 * with the full source. The three traffic-light buttons in the modal are REAL:
 *   red = close · amber = minimize (collapse to preview) · green = expand/restore.
 * Esc and the backdrop also close. Used by demo.js (Code Showcase) and
 * project-page.js (case-study code blocks) so behaviour is identical everywhere.
 * ==========================================================================*/
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Decorative lights on the preview (the whole card is the click target).
  function dotsStatic() {
    return '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  }
  // Functional lights for the modal.
  function dotsLive() {
    return '<span class="dots dots--live">' +
      '<button type="button" class="dot dot--red"   data-act="close" title="Close"    aria-label="Close"></button>' +
      '<button type="button" class="dot dot--amber" data-act="min"   title="Minimize" aria-label="Minimize"></button>' +
      '<button type="button" class="dot dot--green" data-act="full"  title="Expand"   aria-label="Expand / restore"></button>' +
      "</span>";
  }

  function barLabel(opts) {
    return '<span class="codeview__name">' + esc(opts.title) +
      (opts.lang ? " · " + esc(opts.lang) : "") + "</span>";
  }

  function render(host, opts, text) {
    var lines = text.replace(/\s+$/, "").split("\n");
    var n = opts.previewLines || 15;
    var preview = lines.slice(0, n).join("\n");
    var more = lines.length > n;

    host.innerHTML =
      '<div class="codeview__card" role="button" tabindex="0" aria-label="Expand ' + esc(opts.title) + ' source">' +
        '<div class="demo__bar">' + dotsStatic() + barLabel(opts) +
          '<span class="codeview__hint">Click to expand</span></div>' +
        '<pre class="demo__pre codeview__pre">' + esc(preview) + (more ? "\n…" : "") + "</pre>" +
        '<div class="codeview__fade"></div>' +
      "</div>" +
      (opts.caption ? '<p class="codeview__cap">' + esc(opts.caption) + "</p>" : "");

    var modal = document.createElement("div");
    modal.className = "codemodal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="codemodal__backdrop" data-act="close"></div>' +
      '<div class="codemodal__panel" role="dialog" aria-modal="true" tabindex="-1" aria-label="' + esc(opts.title) + ' source">' +
        '<div class="demo__bar">' + dotsLive() + barLabel(opts) + "</div>" +
        '<pre class="demo__pre codemodal__pre">' + esc(text) + "</pre>" +
      "</div>";
    document.body.appendChild(modal);

    var panel = modal.querySelector(".codemodal__panel");
    function open()  { modal.hidden = false; document.body.style.overflow = "hidden"; try { panel.focus(); } catch (e) {} }
    function close() { modal.hidden = true; panel.classList.remove("is-full"); document.body.style.overflow = ""; }
    function full()  { panel.classList.toggle("is-full"); }

    var card = host.querySelector(".codeview__card");
    card.addEventListener("click", open);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    modal.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "full") full(); else close();   // close + min both collapse to preview
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  window.mountCodeViewer = function (host, opts) {
    if (!host) return;
    if (opts.code != null) { render(host, opts, opts.code); return; }
    fetch(opts.src).then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (text) { render(host, opts, text); })
      .catch(function () {
        host.innerHTML = '<p class="codeview__cap">Source unavailable: ' + esc(opts.src) + "</p>";
      });
  };
})();
