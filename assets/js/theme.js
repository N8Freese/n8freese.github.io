/* ============================================================================
 * theme.js - light/dark mode
 * Loaded synchronously in <head> so the saved choice is applied before first
 * paint. Dark is the default; a visitor whose OS asks for light gets light.
 * The nav toggle is wired once the DOM is ready.
 * ==========================================================================*/
(function () {
  "use strict";

  var KEY = "theme";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: light)");

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(mode) {
    root.setAttribute("data-theme", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#0a0f16" : "#f4f0e8");
    var btn = document.querySelector(".nav__theme");
    if (btn) btn.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  apply(saved() || (mq.matches ? "light" : "dark"));

  // Track the OS setting until the user picks a mode explicitly.
  mq.addEventListener("change", function (e) {
    if (!saved()) apply(e.matches ? "light" : "dark");
  });

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".nav__theme");
    if (!btn) return;
    apply(root.getAttribute("data-theme"));
    btn.addEventListener("click", function () {
      var mode = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, mode); } catch (e) { /* private browsing */ }
      apply(mode);
    });
  });
})();
