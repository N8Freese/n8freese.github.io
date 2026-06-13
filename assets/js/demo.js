/* ============================================================================
 * demo.js — reusable "engineering demo" component.
 *
 * Usage:  <div data-demo="orbit"></div>
 * The script renders a split view: source code on one side, a live canvas
 * simulation on the other. The code "types in" and the sim starts when the
 * component scrolls into view. Pure vanilla JS + Canvas — no dependencies.
 *
 * Add a new demo by registering it in the DEMOS map below.
 * ==========================================================================*/
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Registry of available demos ------------------------------------ */
  var DEMOS = {
    orbit: {
      title: "orbit_propagate.m",
      caption: "Two-body orbit — leapfrog integration of Newtonian gravity.",
      code: [
        ["c", "% Two-body orbit propagation (leapfrog / velocity-Verlet)"],
        ["k", "mu", "p", " = ", "n", "398600", "p", ";", "c", "          % km^3/s^2 (Earth GM)"],
        ["k", "r", "p", "  = [", "n", "7000", "p", "; ", "n", "0", "p", "];", "c", "        % position (km)"],
        ["k", "v", "p", "  = [", "n", "0", "p", "; ", "n", "8.1", "p", "];", "c", "         % velocity (km/s)"],
        ["p", ""],
        ["k", "for", "p", " k = ", "n", "1", "p", ":N", ""],
        ["p", "    a  = -mu * r / ", "f", "norm", "p", "(r)^", "n", "3", "p", ";"],
        ["p", "    v  = v + a * dt;", "c", "          % kick"],
        ["p", "    r  = r + v * dt;", "c", "          % drift"],
        ["p", "    plot(r(", "n", "1", "p", "), r(", "n", "2", "p", "));"],
        ["k", "end", ""],
      ],
      build: orbitSim,
    },
  };

  /* ---- Mount every data-demo on the page ------------------------------ */
  document.querySelectorAll("[data-demo]").forEach(function (host) {
    var def = DEMOS[host.getAttribute("data-demo")];
    if (!def) return;
    mount(host, def);
  });

  function mount(host, def) {
    var codeLines = def.code.map(function (tokens) {
      var html = "";
      for (var i = 0; i < tokens.length; i += 2) {
        var cls = tokens[i], txt = tokens[i + 1];
        html += cls === "p" ? esc(txt) : '<span class="' + cls + '">' + esc(txt) + "</span>";
      }
      return '<span class="ln">' + (html || "&nbsp;") + "</span>";
    }).join("");

    host.className = "demo";
    host.innerHTML =
      '<div class="demo__code">' +
        '<div class="demo__bar"><span class="dots"><i></i><i></i><i></i></span>' + esc(def.title) + "</div>" +
        '<pre class="demo__pre">' + codeLines + "</pre>" +
      "</div>" +
      '<div class="demo__stage">' +
        '<div class="demo__controls"><button class="demo__btn" type="button" data-act="replay">↻ Replay</button></div>' +
        "<canvas></canvas>" +
        '<div class="demo__caption">' + esc(def.caption) + "</div>" +
      "</div>";

    var canvas = host.querySelector("canvas");
    var sim = def.build(canvas);
    var started = false;

    function start() {
      if (started) return;
      started = true;
      if (!reduce) {
        // stagger each line via its own transition-delay, then trigger the CSS reveal
        host.querySelectorAll(".demo__pre .ln").forEach(function (ln, i) {
          ln.style.transitionDelay = (i * 0.05) + "s";
        });
      }
      host.classList.add("is-visible");
      sim.start();
    }

    if (reduce) { host.classList.add("is-visible"); sim.start(); }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) { if (en.isIntersecting) { start(); obs.disconnect(); } });
      }, { threshold: 0.35 }).observe(host);
    } else { start(); }

    host.querySelector('[data-act="replay"]').addEventListener("click", function () {
      sim.reset(); sim.start();
    });
  }

  /* ---- Demo: two-body orbit simulation -------------------------------- */
  function orbitSim(canvas) {
    var ctx = canvas.getContext("2d");
    var raf = null, trail = [], state, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
    }
    window.addEventListener("resize", function () { size(); });

    function reset() {
      cancelAnimationFrame(raf); raf = null; trail = [];
      // scaled two-body: position/velocity in arbitrary units tuned to look good
      state = { x: 1.0, y: 0, vx: 0, vy: 1.02, t: 0 };
    }

    function step() {
      var dt = 0.018, mu = 1, sub = 4;
      for (var s = 0; s < sub; s++) {
        var r = Math.hypot(state.x, state.y);
        var a = -mu / (r * r * r);
        state.vx += a * state.x * dt;
        state.vy += a * state.y * dt;
        state.x += state.vx * dt;
        state.y += state.vy * dt;
      }
      trail.push([state.x, state.y]);
      if (trail.length > 480) trail.shift();
    }

    function draw() {
      size();
      var w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      var scale = Math.min(w, h) * 0.30;
      ctx.clearRect(0, 0, w, h);

      // starfield (static-ish)
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (var i = 0; i < 40; i++) {
        var sx = (i * 197 % w), sy = (i * 311 % h);
        ctx.globalAlpha = 0.15 + (i % 5) * 0.06;
        ctx.fillRect(sx, sy, dpr, dpr);
      }
      ctx.globalAlpha = 1;

      // central body
      var grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26 * dpr);
      grd.addColorStop(0, "#9ecbff"); grd.addColorStop(1, "#2b6fd6");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, 11 * dpr, 0, Math.PI * 2); ctx.fill();

      // orbit trail
      ctx.lineWidth = 1.6 * dpr;
      for (var j = 1; j < trail.length; j++) {
        var alpha = j / trail.length;
        ctx.strokeStyle = "rgba(124,92,255," + (alpha * 0.9) + ")";
        ctx.beginPath();
        ctx.moveTo(cx + trail[j - 1][0] * scale, cy + trail[j - 1][1] * scale);
        ctx.lineTo(cx + trail[j][0] * scale, cy + trail[j][1] * scale);
        ctx.stroke();
      }

      // spacecraft
      var px = cx + state.x * scale, py = cy + state.y * scale;
      ctx.fillStyle = "#22c3a6";
      ctx.shadowColor = "#22c3a6"; ctx.shadowBlur = 12 * dpr;
      ctx.beginPath(); ctx.arc(px, py, 4.5 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }

    reset();
    return {
      start: function () { if (!raf) { size(); loop(); } },
      reset: function () { reset(); draw(); },
    };
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
})();
