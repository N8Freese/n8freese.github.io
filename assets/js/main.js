/* ============================================================================
 * main.js - homepage behavior
 *   · footer year
 *   · sticky-nav mobile menu
 *   · render project cards from assets/js/projects.js
 *   · hero line art: the real Stage 1 nozzle contour from assets/js/cope-data.js
 *   · scroll reveal
 * (The homepage 3D viewer is assets/js/rocket3d.js; the nozzle flow sim is
 *  assets/js/nozzle-sim.js.)
 * ==========================================================================*/
(function () {
  "use strict";

  /* ---- Always land at the top ----------------------------------------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  /* ---- Footer year ----------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: mobile toggle ---------------------------------------------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var toggle = nav.querySelector(".nav__toggle");
    var links = nav.querySelector(".nav__links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
      });
    }
  }

  /* ---- Render project cards ------------------------------------------- */
  var grid = document.getElementById("projects-grid");
  if (grid && window.PROJECTS) {
    var ordered = window.PROJECTS.filter(function (p) { return !p.hidden; }).sort(function (a, b) {
      return (a.order || 99) - (b.order || 99);
    });
    grid.innerHTML = ordered.map(cardHTML).join("");
    grid.querySelectorAll("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.display = "none";
        if (img.nextElementSibling) img.nextElementSibling.style.display = "flex";
      });
    });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cardHTML(p) {
    var media = p.thumbStyle === "logo" && p.thumb
      ? '<div class="card__logo"><img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + ' logo" loading="lazy"></div>'
      : p.thumb
      ? '<img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + '" loading="lazy" data-fallback>' +
        '<div class="ph" style="display:none"><span>Image: ' + esc(p.thumb) + '</span></div>'
      : '<div class="ph"><span>Add image</span></div>';

    var tags = (p.tags || []).slice(0, 4).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    var period = p.period && p.period !== "Coursework"
      ? '<span class="card__period">' + esc(p.period) + "</span>" : "";

    return (
      '<article class="card reveal">' +
        '<a class="card__medialink" href="project.html?id=' + esc(p.id) + '" aria-label="' + esc(p.title) + '">' +
          '<div class="card__media' + (p.thumbFit === "contain" ? " card__media--contain" : "") + '">' + media + period + "</div>" +
        "</a>" +
        '<div class="card__body">' +
          '<span class="card__cat">' + esc(p.category || "") + "</span>" +
          "<h3>" + esc(p.title) + "</h3>" +
          '<p class="card__tagline">' + esc(p.tagline || "") + "</p>" +
          '<div class="card__tags">' + tags + "</div>" +
          '<a class="card__link" href="project.html?id=' + esc(p.id) + '">' +
            'Read the case study <span class="arrow">↗</span></a>' +
        "</div>" +
      "</article>"
    );
  }

  /* ---- Hero line art: Stage 1 Rao contour + Mach isolines ------------- */
  var art = document.querySelector("[data-nozzle-art]");
  var D = window.COPE_DATA && window.COPE_DATA.S1 && window.COPE_DATA.S1.contour;
  if (art && D) {
    var NS = "http://www.w3.org/2000/svg";
    var W = 1000, H = 420, cy = H / 2;
    var xs = D.x_mm, rs = D.r_mm, M = D.Mach;
    var x0 = xs[0], x1 = xs[xs.length - 1], rmax = Math.max.apply(null, rs);
    var sx = function (x) { return ((x - x0) / (x1 - x0)) * W; };
    var sr = function (r) { return (r / rmax) * (H / 2 - 20); };
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    function path(d, cls) { var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("class", cls); svg.appendChild(p); }
    var top = "", bot = "";
    for (var i = 0; i < xs.length; i++) {
      var X = sx(xs[i]), R = sr(rs[i]);
      top += (i ? "L" : "M") + X.toFixed(1) + "," + (cy - R).toFixed(1) + " ";
      bot += (i ? "L" : "M") + X.toFixed(1) + "," + (cy + R).toFixed(1) + " ";
    }
    path(top, "contour"); path(bot, "contour");
    // injector face + centreline
    path("M" + sx(x0).toFixed(1) + "," + (cy - sr(rs[0])).toFixed(1) + " L" + sx(x0).toFixed(1) + "," + (cy + sr(rs[0])).toFixed(1), "contour");
    path("M0," + cy + " L" + W + "," + cy, "axis");
    // Mach isolines (vertical ticks where M crosses whole numbers) with labels
    [1, 2, 3, 4].forEach(function (mv) {
      var best = 0, bd = 1e9;
      for (var k = 0; k < M.length; k++) { var d = Math.abs(M[k] - mv); if (d < bd) { bd = d; best = k; } }
      var X = sx(xs[best]), R = sr(rs[best]);
      path("M" + X.toFixed(1) + "," + (cy - R).toFixed(1) + " L" + X.toFixed(1) + "," + (cy + R).toFixed(1), "iso");
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", (X + 6).toFixed(1)); t.setAttribute("y", (cy - R - 8).toFixed(1));
      t.setAttribute("class", "tick"); t.textContent = "M " + mv;
      svg.appendChild(t);
    });
    var lbl = document.createElementNS(NS, "text");
    lbl.setAttribute("x", (W - 8).toString()); lbl.setAttribute("y", (H - 10).toString()); lbl.setAttribute("class", "tick"); lbl.setAttribute("text-anchor", "end");
    lbl.textContent = "COPE S1 · 80% Rao bell · ε = 40 · Rt = 132.3 mm";
    svg.appendChild(lbl);
    art.appendChild(svg);
  }

  /* ---- Scroll reveal --------------------------------------------------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".skills__group, .timeline__item, .glance__item, .edu").forEach(function (el) { el.classList.add("reveal"); });
  var revealables = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }
})();
