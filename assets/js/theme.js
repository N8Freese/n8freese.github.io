/* ============================================================================
 * theme.js - light/dark mode
 * Loaded synchronously in <head> so the saved choice (or OS preference) is
 * applied before first paint. The nav toggle is wired once the DOM is ready.
 * ==========================================================================*/
(function () {
  "use strict";

  var KEY = "theme";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(mode) {
    root.setAttribute("data-theme", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? "#11151b" : "#f7f8fa");
    var btn = document.querySelector(".nav__theme");
    if (btn) btn.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  apply(saved() || (mq.matches ? "dark" : "light"));

  // Track the OS setting until the user picks a mode explicitly.
  mq.addEventListener("change", function (e) {
    if (!saved()) apply(e.matches ? "dark" : "light");
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
