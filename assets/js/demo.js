/* ============================================================================
 * demo.js — tabbed "code showcase" of live engineering simulations.
 *
 * Usage:  <div data-demo-tabs></div>
 * Renders a tab strip; each tab swaps in a panel with:
 *   - a short blurb (what the code does + why it matters / aerospace relevance)
 *   - a source-code view (left on wide screens, top when stacked)
 *   - a live <canvas> simulation (right / below)
 * The active sim "types in" and starts when it scrolls into view; switching
 * tabs stops the old sim and starts the new one. Pure vanilla JS + Canvas.
 *
 * These are simplified, self-contained DEMO simulations meant to illustrate
 * methods — not the original course/work code.
 *
 * Add a demo by appending to the DEMOS array below.
 * ==========================================================================*/
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Registry of demos --------------------------------------------- */
  var DEMOS = [
    {
      key: "orbit",
      tab: "Orbit propagation",
      title: "orbit_propagate.m",
      blurb: "Numerically integrates a satellite's path around a central body with a leapfrog (velocity-Verlet) scheme — the same building block behind mission-design and orbit-determination tools.",
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
    {
      key: "launch",
      tab: "Launch ascent",
      title: "launch_ascent.py",
      blurb: "Integrates a rocket's powered ascent with thrust, gravity, and a pitch-over (gravity-turn) program to trace the trajectory to burnout — the core of launch-vehicle performance and Δv sizing.",
      caption: "Gravity-turn ascent — altitude vs. downrange to burnout.",
      code: [
        ["c", "# Gravity-turn launch ascent (forward Euler)"],
        ["k", "g", "p", ", T, mdot = ", "n", "9.81", "p", ", ", "n", "1.6e6", "p", ", ", "n", "620", ""],
        ["k", "m", "p", ", v, gam = ", "n", "5.0e4", "p", ", ", "n", "1.0", "p", ", ", "n", "1.57", "c", "   # mass, speed, pitch"],
        ["p", ""],
        ["k", "while", "p", " m > m_dry ", "k", "and", "p", " gam > ", "n", "0", "p", ":"],
        ["p", "    a   = (T - m*g*", "f", "sin", "p", "(gam)) / m"],
        ["p", "    v  += a * dt"],
        ["p", "    gam -= (g/v)*", "f", "cos", "p", "(gam) * dt", "c", "   # gravity turn"],
        ["p", "    x  += v*", "f", "cos", "p", "(gam)*dt;  h += v*", "f", "sin", "p", "(gam)*dt"],
        ["p", "    m  -= mdot * dt"],
      ],
      build: launchSim,
    },
    {
      key: "pid",
      tab: "PID attitude control",
      title: "pid_attitude.m",
      blurb: "A PID controller drives a spacecraft's pointing angle to a commanded setpoint, balancing rise time against overshoot — the control loop behind reaction-wheel attitude and UAV stabilization.",
      caption: "PID attitude slew — angle tracking a 60° command.",
      code: [
        ["c", "% PID attitude control — single-axis slew"],
        ["k", "Kp", "p", ", Ki, Kd = ", "n", "6.0", "p", ", ", "n", "0.5", "p", ", ", "n", "3.2", "p", ";"],
        ["k", "theta", "p", " = ", "n", "0", "p", "; w = ", "n", "0", "p", "; ie = ", "n", "0", "p", ";"],
        ["p", ""],
        ["k", "for", "p", " k = ", "n", "1", "p", ":N", ""],
        ["p", "    e   = ref - theta;", "c", "       % error"],
        ["p", "    ie  = ie + e*dt;"],
        ["p", "    u   = Kp*e + Ki*ie - Kd*w;", "c", " % torque"],
        ["p", "    w   = w + (u/I)*dt;"],
        ["p", "    theta = theta + w*dt;"],
        ["k", "end", ""],
      ],
      build: pidSim,
    },
  ];

  /* ---- Mount the tabbed showcase ------------------------------------- */
  document.querySelectorAll("[data-demo-tabs]").forEach(mountTabs);

  function mountTabs(host) {
    host.className = (host.className + " demos").trim();
    var tabsHtml = DEMOS.map(function (d, i) {
      return '<button class="demos__tab' + (i === 0 ? " is-active" : "") +
        '" type="button" role="tab" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        esc(d.tab) + "</button>";
    }).join("");

    host.innerHTML =
      '<div class="demos__tabs" role="tablist" aria-label="Code demos">' + tabsHtml + "</div>" +
      '<div class="demos__panel"></div>';

    var panel = host.querySelector(".demos__panel");
    var tabs = [].slice.call(host.querySelectorAll(".demos__tab"));
    var current = null;          // active mounted demo
    var pending = 0;             // index to start once visible
    var hasStarted = false;

    function show(i, autostart) {
      if (current) current.destroy();
      current = mountOne(panel, DEMOS[i]);
      tabs.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
        t.setAttribute("aria-selected", j === i);
      });
      if (autostart) current.start();
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        pending = +t.getAttribute("data-i");
        show(pending, true);
      });
    });

    // Build the first panel; start it when it scrolls into view.
    show(0, false);
    if (reduce) { current.start(); }
    else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !hasStarted) { hasStarted = true; current.start(); obs.disconnect(); }
        });
      }, { threshold: 0.25 }).observe(host);
    } else { current.start(); }
  }

  /* ---- Mount a single demo into the panel ---------------------------- */
  function mountOne(panel, def) {
    var codeLines = def.code.map(function (tokens) {
      var html = "";
      for (var i = 0; i < tokens.length; i += 2) {
        var cls = tokens[i], txt = tokens[i + 1];
        html += cls === "p" ? esc(txt) : '<span class="' + cls + '">' + esc(txt) + "</span>";
      }
      return '<span class="ln">' + (html || "&nbsp;") + "</span>";
    }).join("");

    panel.innerHTML =
      '<p class="demos__blurb">' + esc(def.blurb) + "</p>" +
      '<div class="demo">' +
        '<div class="demo__code">' +
          '<div class="demo__bar"><span class="dots"><i></i><i></i><i></i></span>' + esc(def.title) + "</div>" +
          '<pre class="demo__pre">' + codeLines + "</pre>" +
        "</div>" +
        '<div class="demo__stage">' +
          '<div class="demo__controls"><button class="demo__btn" type="button" data-act="replay">↻ Replay</button></div>' +
          "<canvas></canvas>" +
          '<div class="demo__caption">' + esc(def.caption) + "</div>" +
        "</div>" +
      "</div>";

    var wrap = panel.querySelector(".demo");
    var canvas = panel.querySelector("canvas");
    var sim = def.build(canvas);

    function start() {
      if (!reduce) {
        wrap.querySelectorAll(".demo__pre .ln").forEach(function (ln, i) {
          ln.style.transitionDelay = (i * 0.05) + "s";
        });
      }
      wrap.classList.add("is-visible");
      sim.start();
    }

    panel.querySelector('[data-act="replay"]').addEventListener("click", function () {
      sim.reset(); sim.start();
    });

    return {
      start: start,
      destroy: function () { sim.stop(); },
    };
  }

  /* ====================================================================
   *  Simulations — each returns { start, reset, stop }
   * ==================================================================== */

  function makeCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
    }
    return { ctx: canvas.getContext("2d"), dpr: dpr, size: size, canvas: canvas };
  }

  function starfield(ctx, w, h, dpr) {
    ctx.fillStyle = "rgba(255,255,255,.5)";
    for (var i = 0; i < 40; i++) {
      var sx = (i * 197 % w), sy = (i * 311 % h);
      ctx.globalAlpha = 0.12 + (i % 5) * 0.05;
      ctx.fillRect(sx, sy, dpr, dpr);
    }
    ctx.globalAlpha = 1;
  }

  /* ---- Demo 1: two-body orbit ---------------------------------------- */
  function orbitSim(canvas) {
    var c = makeCanvas(canvas), ctx = c.ctx, dpr = c.dpr;
    var raf = null, trail = [], state;
    function reset() {
      cancelAnimationFrame(raf); raf = null; trail = [];
      state = { x: 1.0, y: 0, vx: 0, vy: 1.02 };
    }
    function step() {
      var dt = 0.018, mu = 1, sub = 4;
      for (var s = 0; s < sub; s++) {
        var r = Math.hypot(state.x, state.y);
        var a = -mu / (r * r * r);
        state.vx += a * state.x * dt; state.vy += a * state.y * dt;
        state.x += state.vx * dt;     state.y += state.vy * dt;
      }
      trail.push([state.x, state.y]);
      if (trail.length > 480) trail.shift();
    }
    function draw() {
      c.size();
      var w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      var scale = Math.min(w, h) * 0.30;
      ctx.clearRect(0, 0, w, h);
      starfield(ctx, w, h, dpr);
      var grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26 * dpr);
      grd.addColorStop(0, "#9ed8ff"); grd.addColorStop(1, "#1e5fe0");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, 11 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.6 * dpr;
      for (var j = 1; j < trail.length; j++) {
        var alpha = j / trail.length;
        ctx.strokeStyle = "rgba(56,189,248," + (alpha * 0.9) + ")";
        ctx.beginPath();
        ctx.moveTo(cx + trail[j - 1][0] * scale, cy + trail[j - 1][1] * scale);
        ctx.lineTo(cx + trail[j][0] * scale, cy + trail[j][1] * scale);
        ctx.stroke();
      }
      var px = cx + state.x * scale, py = cy + state.y * scale;
      ctx.fillStyle = "#2dd4bf"; ctx.shadowColor = "#2dd4bf"; ctx.shadowBlur = 12 * dpr;
      ctx.beginPath(); ctx.arc(px, py, 4.5 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
    reset();
    return {
      start: function () { if (!raf) { c.size(); loop(); } },
      reset: function () { reset(); draw(); },
      stop: function () { cancelAnimationFrame(raf); raf = null; },
    };
  }

  /* ---- Demo 2: gravity-turn launch ascent ---------------------------- */
  function launchSim(canvas) {
    var c = makeCanvas(canvas), ctx = c.ctx, dpr = c.dpr;
    var raf = null, path = [], st, done;
    function reset() {
      cancelAnimationFrame(raf); raf = null; path = []; done = false;
      // normalized units tuned to look good; gravity turn from near-vertical
      st = { x: 0, h: 0, v: 0.0, gam: Math.PI / 2 - 0.02, m: 1.0, t: 0 };
    }
    function step() {
      if (done) return;
      var dt = 0.016, g = 0.16, T = 0.42, mdot = 0.018, mDry = 0.32, sub = 2;
      for (var s = 0; s < sub; s++) {
        if (st.m <= mDry || st.gam <= 0.02) { done = true; break; }
        var a = (T - st.m * g * Math.sin(st.gam)) / st.m;
        st.v += a * dt;
        st.gam -= (g / Math.max(st.v, 0.05)) * Math.cos(st.gam) * dt;
        st.x += st.v * Math.cos(st.gam) * dt;
        st.h += st.v * Math.sin(st.gam) * dt;
        st.m -= mdot * dt;
        path.push([st.x, st.h]);
      }
    }
    function draw() {
      c.size();
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      starfield(ctx, w, h, dpr);
      var padL = 44 * dpr, padB = 30 * dpr, padT = 20 * dpr, padR = 20 * dpr;
      var gx0 = padL, gy0 = h - padB, gw = w - padL - padR, gh = h - padB - padT;
      // ground
      ctx.strokeStyle = "rgba(159,177,202,.35)"; ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy0 - gh); ctx.stroke();
      ctx.fillStyle = "rgba(159,177,202,.7)"; ctx.font = (10 * dpr) + "px sans-serif";
      ctx.fillText("alt", gx0 - 38 * dpr, gy0 - gh + 4 * dpr);
      ctx.fillText("downrange", gx0 + gw - 70 * dpr, gy0 + 18 * dpr);
      // autoscale
      var maxX = 0.0001, maxY = 0.0001, i;
      for (i = 0; i < path.length; i++) { if (path[i][0] > maxX) maxX = path[i][0]; if (path[i][1] > maxY) maxY = path[i][1]; }
      var sxr = gw / (maxX * 1.1), syr = gh / (maxY * 1.1);
      function px(p) { return gx0 + p[0] * sxr; }
      function py(p) { return gy0 - p[1] * syr; }
      // trajectory
      ctx.lineWidth = 2.2 * dpr; ctx.strokeStyle = "#38bdf8"; ctx.beginPath();
      for (i = 0; i < path.length; i++) { var X = px(path[i]), Y = py(path[i]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.stroke();
      // rocket marker
      if (path.length) {
        var last = path[path.length - 1];
        ctx.fillStyle = done ? "#2dd4bf" : "#fbbf6b";
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10 * dpr;
        ctx.beginPath(); ctx.arc(px(last), py(last), 4.5 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
    reset();
    return {
      start: function () { if (!raf) { c.size(); loop(); } },
      reset: function () { reset(); draw(); },
      stop: function () { cancelAnimationFrame(raf); raf = null; },
    };
  }

  /* ---- Demo 3: PID attitude control ---------------------------------- */
  function pidSim(canvas) {
    var c = makeCanvas(canvas), ctx = c.ctx, dpr = c.dpr;
    var raf = null, hist = [], st, ref = Math.PI / 3; // 60 deg
    function reset() {
      cancelAnimationFrame(raf); raf = null; hist = [];
      st = { th: 0, w: 0, ie: 0, t: 0 };
    }
    function step() {
      var dt = 0.02, Kp = 6.0, Ki = 0.5, Kd = 3.2, I = 1.0, sub = 2;
      for (var s = 0; s < sub; s++) {
        var e = ref - st.th;
        st.ie += e * dt;
        var u = Kp * e + Ki * st.ie - Kd * st.w;
        st.w += (u / I) * dt;
        st.th += st.w * dt;
        st.t += dt;
        hist.push([st.t, st.th]);
      }
      if (st.t > 12) { hist.shift(); hist.shift(); } // scroll window once full
    }
    function draw() {
      c.size();
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // left: rotating spacecraft icon; right: response curve
      var split = w * 0.42;
      // --- spacecraft ---
      var cx = split * 0.5, cy = h * 0.5, R = Math.min(split, h) * 0.22;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-st.th);
      ctx.strokeStyle = "#2a3656"; ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#18233a"; ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.rect(-R * 0.28, -R * 0.5, R * 0.56, R); ctx.fill(); ctx.stroke();
      // solar panels
      ctx.fillStyle = "#1e5fe0";
      ctx.fillRect(-R * 1.05, -R * 0.18, R * 0.7, R * 0.36);
      ctx.fillRect(R * 0.35, -R * 0.18, R * 0.7, R * 0.36);
      // pointing arrow
      ctx.strokeStyle = "#2dd4bf"; ctx.lineWidth = 2.5 * dpr;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R * 1.3); ctx.stroke();
      ctx.restore();
      // setpoint ray
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-ref);
      ctx.strokeStyle = "rgba(45,212,191,.35)"; ctx.lineWidth = 1.5 * dpr; ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -R * 1.5); ctx.stroke(); ctx.restore();
      ctx.setLineDash([]);
      // --- response curve ---
      var gx0 = split + 16 * dpr, gy0 = h - 26 * dpr, gw = w - gx0 - 16 * dpr, gh = h - 40 * dpr;
      ctx.strokeStyle = "rgba(159,177,202,.3)"; ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0 + gw, gy0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy0 - gh); ctx.stroke();
      // setpoint line
      var maxA = ref * 1.6;
      var spY = gy0 - (ref / maxA) * gh;
      ctx.strokeStyle = "rgba(45,212,191,.5)"; ctx.setLineDash([5 * dpr, 5 * dpr]);
      ctx.beginPath(); ctx.moveTo(gx0, spY); ctx.lineTo(gx0 + gw, spY); ctx.stroke(); ctx.setLineDash([]);
      // theta(t)
      if (hist.length > 1) {
        var t0 = hist[0][0], t1 = hist[hist.length - 1][0], span = Math.max(t1 - t0, 0.001);
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.2 * dpr; ctx.beginPath();
        for (var i = 0; i < hist.length; i++) {
          var X = gx0 + ((hist[i][0] - t0) / span) * gw;
          var Y = gy0 - (hist[i][1] / maxA) * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(159,177,202,.7)"; ctx.font = (10 * dpr) + "px sans-serif";
      ctx.fillText("θ → 60° setpoint", gx0 + 6 * dpr, gy0 - gh + 12 * dpr);
    }
    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
    reset();
    return {
      start: function () { if (!raf) { c.size(); loop(); } },
      reset: function () { reset(); draw(); },
      stop: function () { cancelAnimationFrame(raf); raf = null; },
    };
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }
})();
