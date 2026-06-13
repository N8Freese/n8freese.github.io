/* ============================================================================
 * main.js — homepage behavior
 *   · footer year
 *   · sticky-nav shadow + mobile menu
 *   · scroll-reveal animations (IntersectionObserver)
 *   · render project cards from assets/js/projects.js
 *   · auto-load the 3D rocket viewer when its GLB exists
 * ==========================================================================*/
(function () {
  "use strict";

  /* ---- Footer year ----------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: scrolled state + mobile toggle ----------------------------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = nav.querySelector(".nav__toggle");
    var links = nav.querySelector(".nav__links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { nav.classList.toggle("is-open"); });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") nav.classList.remove("is-open");
      });
    }
  }

  /* ---- Scroll-reveal --------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Render project cards ------------------------------------------- */
  var grid = document.getElementById("projects-grid");
  if (grid && window.PROJECTS) {
    var ordered = window.PROJECTS.slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
    grid.innerHTML = ordered.map(cardHTML).join("");
    // reveal newly added cards
    grid.querySelectorAll(".reveal").forEach(function (el) {
      if (io) io.observe(el); else el.classList.add("is-visible");
    });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function cardHTML(p, i) {
    var media = p.thumb
      ? '<img src="' + esc(p.thumb) + '" alt="' + esc(p.title) + '" loading="lazy" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="ph" style="display:none"><span class="glyph">✦</span><span>Image: ' + esc(p.thumb) + '</span></div>'
      : '<div class="ph"><span class="glyph">✦</span><span>Add image</span></div>';

    var tags = (p.tags || []).slice(0, 4).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    var period = p.period && p.period !== "Coursework"
      ? '<span class="card__period">' + esc(p.period) + "</span>" : "";

    return (
      '<article class="card reveal' + (p.featured ? " card--featured" : "") + '" data-delay="' + (i % 3) + '">' +
        '<a class="card__medialink" href="project.html?id=' + esc(p.id) + '" aria-label="' + esc(p.title) + '">' +
          '<div class="card__media">' + media + period + "</div>" +
        "</a>" +
        '<div class="card__body">' +
          '<span class="card__cat">' + esc(p.category || "") + "</span>" +
          "<h3>" + esc(p.title) + "</h3>" +
          '<p class="card__tagline">' + esc(p.tagline || "") + "</p>" +
          '<div class="card__tags">' + tags + "</div>" +
          '<a class="card__link" href="project.html?id=' + esc(p.id) + '">' +
            "View case study <span class=\"arrow\">→</span></a>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---- 3D rocket viewer: load GLB if present --------------------------- */
  (function () {
    var GLB = "assets/rocket/full-launch-vehicle.glb";
    var host = document.getElementById("rocket-viewer");
    if (!host) return;
    fetch(GLB, { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) return;
        var mv = document.createElement("model-viewer");
        mv.setAttribute("src", GLB);
        mv.setAttribute("alt", "Crewed lunar mission launch vehicle (3D)");
        mv.setAttribute("auto-rotate", "");
        mv.setAttribute("camera-controls", "");
        mv.setAttribute("shadow-intensity", "1");
        mv.setAttribute("exposure", "1");
        mv.setAttribute("camera-orbit", "45deg 75deg 105%");
        host.replaceChildren(mv);
      })
      .catch(function () {});
  })();
})();
