/* ============================================================================
 * nozzle-sim.js - quasi-1D isentropic flow through the COPE engine bells
 * Wall contours are the actual Rao bell profiles from the AE 451 detail-design
 * work (Rt = 132.3 mm; stage 1 eps = 40, stage 2 eps = 100), downsampled and
 * normalized by throat radius. Mach number at each station is solved from the
 * area-Mach relation by bisection (subsonic upstream of the throat, supersonic
 * downstream); temperature/pressure follow from the isentropic relations.
 * Slow flow renders blue, fast flow red. A 1D flow model, not CFD.
 * Mounted on case studies with a `nozzle` field (see project-page.js).
 * ==========================================================================*/
(function () {
  "use strict";

  var canvas = document.querySelector("[data-nozzle]");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var playBtn = document.querySelector("[data-nozzle-play]");

  var GAMMA = 1.2; // frozen CEA value for LOX/CH4 combustion products

  // x: station (0 = injector, 1 = exit, normalized by overall length)
  // r: wall radius / throat radius   t: throat index
  var CONTOURS = {"S1":{"x":[0.0,0.0089,0.0161,0.025,0.0322,0.0411,0.05,0.0572,0.0661,0.075,0.0822,0.0911,0.0983,0.1063,0.1108,0.1144,0.1189,0.1233,0.1268,0.1311,0.1344,0.1385,0.1425,0.1444,0.1462,0.1479,0.1494,0.1511,0.1526,0.1544,0.1561,0.1576,0.1597,0.1633,0.1662,0.1699,0.173,0.1769,0.1808,0.184,0.188,0.192,0.1953,0.1969,0.1976,0.1985,0.1996,0.2007,0.2016,0.2027,0.2038,0.2046,0.2056,0.2064,0.2074,0.2192,0.2287,0.2408,0.2529,0.2628,0.2752,0.2852,0.2979,0.3107,0.3211,0.3341,0.3473,0.358,0.3715,0.3823,0.396,0.4098,0.421,0.4351,0.4493,0.4608,0.4753,0.4869,0.5017,0.5165,0.5285,0.5436,0.5589,0.5712,0.5867,0.5992,0.6149,0.6308,0.6436,0.6597,0.676,0.6891,0.7056,0.7189,0.7357,0.7526,0.7662,0.7834,0.8007,0.8146,0.8321,0.8463,0.8641,0.882,0.8964,0.9146,0.9329,0.9477,0.9662,0.9812,1.0],"r":[1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.577,1.571,1.557,1.539,1.52,1.493,1.467,1.43,1.389,1.368,1.348,1.327,1.311,1.291,1.274,1.254,1.234,1.217,1.193,1.156,1.128,1.098,1.076,1.053,1.034,1.022,1.01,1.003,1.0,1.0,1.0,1.001,1.004,1.008,1.012,1.018,1.025,1.032,1.041,1.05,1.062,1.211,1.33,1.476,1.621,1.735,1.876,1.987,2.125,2.26,2.368,2.5,2.63,2.733,2.86,2.961,3.084,3.206,3.302,3.42,3.536,3.628,3.741,3.83,3.94,4.047,4.132,4.236,4.339,4.419,4.518,4.596,4.692,4.785,4.859,4.949,5.037,5.107,5.192,5.258,5.34,5.419,5.482,5.558,5.632,5.69,5.761,5.816,5.884,5.95,6.001,6.063,6.123,6.17,6.227,6.271,6.325],"t":43},"S2":{"x":[0.0,0.0057,0.0103,0.0161,0.0207,0.0264,0.0322,0.0368,0.0425,0.0483,0.0529,0.0586,0.0632,0.0684,0.0713,0.0736,0.0765,0.0793,0.0816,0.0843,0.0865,0.0891,0.0917,0.0929,0.094,0.0952,0.0961,0.0972,0.0982,0.0993,0.1005,0.1014,0.1027,0.105,0.1069,0.1093,0.1113,0.1138,0.1163,0.1184,0.1209,0.1235,0.1256,0.1267,0.1271,0.1278,0.1286,0.1293,0.13,0.1307,0.1315,0.132,0.1328,0.1333,0.134,0.147,0.1575,0.1708,0.1842,0.1951,0.2088,0.2198,0.2338,0.2479,0.2593,0.2736,0.2881,0.2999,0.3146,0.3265,0.3416,0.3568,0.369,0.3844,0.4,0.4126,0.4284,0.4412,0.4573,0.4736,0.4867,0.5032,0.5199,0.5333,0.5502,0.5639,0.5811,0.5984,0.6124,0.6299,0.6477,0.662,0.68,0.6945,0.7127,0.7311,0.746,0.7646,0.7835,0.7986,0.8177,0.833,0.8524,0.8719,0.8876,0.9073,0.9272,0.9432,0.9634,0.9796,1.0],"r":[1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.581,1.577,1.571,1.557,1.539,1.52,1.493,1.467,1.43,1.389,1.368,1.348,1.327,1.311,1.291,1.274,1.254,1.234,1.217,1.193,1.156,1.128,1.098,1.076,1.053,1.034,1.022,1.01,1.003,1.0,1.0,1.0,1.002,1.005,1.009,1.014,1.021,1.03,1.038,1.049,1.059,1.073,1.36,1.587,1.866,2.14,2.357,2.623,2.833,3.092,3.345,3.545,3.791,4.032,4.222,4.454,4.638,4.862,5.083,5.256,5.468,5.675,5.838,6.038,6.194,6.385,6.572,6.719,6.897,7.071,7.207,7.373,7.503,7.661,7.814,7.934,8.079,8.219,8.329,8.461,8.564,8.688,8.808,8.901,9.012,9.12,9.202,9.301,9.377,9.468,9.554,9.62,9.698,9.772,9.828,9.893,9.943,10.0],"t":43}};

  var META = {
    S1: { label: "stage 1 · Pc = 25.5 MPa · F = 2.6 MN (SL) · Rt = 132.3 mm", eps: 40 },
    S2: { label: "stage 2 · Pc = 26.1 MPa · F = 2.8 MN (vac) · Rt = 132.3 mm", eps: 100 },
  };

  var cur = "S1";
  var st = null;

  function areaMach(M) {
    var e = (GAMMA + 1) / (2 * (GAMMA - 1));
    return Math.pow((2 / (GAMMA + 1)) * (1 + (GAMMA - 1) / 2 * M * M), e) / M;
  }

  // Bisection on the area-Mach relation: monotone decreasing in M on the
  // subsonic branch, increasing on the supersonic branch.
  function solveM(aRatio, supersonic) {
    var lo = supersonic ? 1 : 1e-4;
    var hi = supersonic ? 30 : 1;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      var f = areaMach(mid) - aRatio;
      if ((f > 0) === supersonic) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  }

  function solve() {
    var c = CONTOURS[cur];
    var M = [], T = [];
    for (var i = 0; i < c.r.length; i++) {
      var m = i === c.t ? 1 : solveM(c.r[i] * c.r[i], i > c.t);
      M.push(m);
      T.push(1 / (1 + (GAMMA - 1) / 2 * m * m)); // T/T0
    }
    var n = M.length - 1;
    st = {
      x: c.x, r: c.r, M: M, T: T, Me: M[n],
      pe: Math.pow(T[n], GAMMA / (GAMMA - 1)), // pe/p0
    };
  }

  // Linear interpolation over the (non-uniform) station grid.
  function at(arr, xq) {
    var x = st.x;
    if (xq <= x[0]) return arr[0];
    if (xq >= x[x.length - 1]) return arr[arr.length - 1];
    var lo = 0, hi = x.length - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (x[mid] <= xq) lo = mid; else hi = mid;
    }
    var f = (xq - x[lo]) / (x[hi] - x[lo] || 1);
    return arr[lo] + (arr[hi] - arr[lo]) * f;
  }

  // Slow = blue, fast = red.
  var STOPS = [
    [0.00, 28, 63, 184],
    [0.25, 30, 157, 230],
    [0.50, 39, 198, 144],
    [0.75, 255, 193, 77],
    [1.00, 255, 92, 71],
  ];
  function machColor(t, alpha, brightness) {
    t = Math.min(Math.max(t, 0), 1);
    var k = brightness == null ? 1 : brightness;
    var a = STOPS[0], b = STOPS[STOPS.length - 1];
    for (var i = 0; i < STOPS.length - 1; i++) {
      if (t >= STOPS[i][0] && t <= STOPS[i + 1][0]) { a = STOPS[i]; b = STOPS[i + 1]; break; }
    }
    var u = (t - a[0]) / (b[0] - a[0] || 1);
    var r = Math.min(255, Math.round((a[1] + (b[1] - a[1]) * u) * k));
    var g = Math.min(255, Math.round((a[2] + (b[2] - a[2]) * u) * k));
    var bl = Math.min(255, Math.round((a[3] + (b[3] - a[3]) * u) * k));
    return "rgba(" + r + "," + g + "," + bl + "," + (alpha == null ? 1 : alpha) + ")";
  }

  // Flow particles: advected at the local velocity ~ M*sqrt(T/T0), colored by
  // local Mach (blue slow, red fast). Small floor so the chamber isn't frozen.
  var PARTS = [];
  for (var i = 0; i < 90; i++) {
    PARTS.push({ x: Math.random() * 1.2, f: Math.random() * 1.7 - 0.85 });
  }

  function draw(dt) {
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    if (canvas.width !== Math.round(W * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#0a0c11";
    ctx.fillRect(0, 0, W, H);

    var x0 = W * 0.05, x1 = W * 0.76, xPlume = W * 0.98;
    var yc = H * 0.55;
    var rExit = st.r[st.r.length - 1];
    var scale = (H * 0.37) / rExit;
    function X(x) { return x0 + (x1 - x0) * x; }

    // Mach color field inside the contour (dimmed so the particles read)
    var n = st.r.length - 1;
    for (var i = 0; i < n; i++) {
      var xa = X(st.x[i]), xb = X(st.x[i + 1]) + 0.8;
      var rm = (st.r[i] + st.r[i + 1]) / 2 * scale;
      ctx.fillStyle = machColor(((st.M[i] + st.M[i + 1]) / 2) / st.Me, 0.9, 0.62);
      ctx.fillRect(xa, yc - rm, xb - xa, rm * 2);
    }

    // Exhaust plume past the exit plane
    var steps = 26;
    for (var k = 0; k < steps; k++) {
      var u = k / steps;
      var xa2 = x1 + (xPlume - x1) * u, xb2 = x1 + (xPlume - x1) * (u + 1 / steps) + 0.8;
      var rp = rExit * scale * (1 + 0.30 * u);
      ctx.fillStyle = machColor(1, 0.38 * (1 - u), 0.62);
      ctx.fillRect(xa2, yc - rp, xb2 - xa2, rp * 2);
    }

    // Nozzle walls + injector face
    ctx.strokeStyle = "#aab1bb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var j = 0; j <= n; j++) {
      var px = X(st.x[j]), py = yc - st.r[j] * scale;
      if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath();
    for (var j2 = 0; j2 <= n; j2++) {
      var px2 = X(st.x[j2]), py2 = yc + st.r[j2] * scale;
      if (j2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, yc - st.r[0] * scale);
    ctx.lineTo(x0, yc + st.r[0] * scale);
    ctx.stroke();

    // Throat marker
    var xtN = st.x[CONTOURS[cur].t];
    var tx = X(xtN);
    ctx.strokeStyle = "rgba(226,229,234,.55)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(tx, yc - scale * 1.9 - 12);
    ctx.lineTo(tx, yc + scale * 1.9 + 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#c8d3ea";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("throat  M = 1", tx, yc - scale * 1.9 - 18);
    ctx.fillText("Me = " + st.Me.toFixed(2), x1, yc - rExit * scale - 10);

    // Particles: colored slow-blue -> fast-red
    for (var q = 0; q < PARTS.length; q++) {
      var pt = PARTS[q];
      var Mloc = pt.x <= 1 ? at(st.M, pt.x) : st.Me;
      var Vloc = pt.x <= 1
        ? Math.max(Mloc * Math.sqrt(at(st.T, pt.x)), 0.05)
        : st.Me * Math.sqrt(st.T[st.T.length - 1]);
      pt.x += Vloc * 0.26 * dt;
      if (pt.x > 1.28) { pt.x = 0.001; pt.f = Math.random() * 1.7 - 0.85; }
      var rHere = (pt.x <= 1 ? at(st.r, pt.x) : rExit * (1 + 0.30 * (pt.x - 1) / 0.28)) * scale;
      var pxq = pt.x <= 1 ? X(pt.x) : x1 + (xPlume - x1) * (pt.x - 1) / 0.28;
      var pyq = yc + pt.f * rHere * 0.92;
      var streak = 3 + Vloc * 9;
      var aQ = pt.x > 1 ? 0.85 * (1 - (pt.x - 1) / 0.28) : 0.95;
      ctx.strokeStyle = machColor(Mloc / st.Me, aQ, 1.35);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pxq - streak, pyq);
      ctx.lineTo(pxq, pyq);
      ctx.stroke();
    }

    // Readout (values from the engine spec / solved state)
    ctx.textAlign = "left";
    ctx.fillStyle = "#98a0ab";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillText(
      "γ = " + GAMMA.toFixed(2) +
      "   Ae/At = " + META[cur].eps +
      "   Me = " + st.Me.toFixed(2) +
      "   pe/p0 = " + st.pe.toExponential(2),
      12, 20
    );
    ctx.fillText(META[cur].label, 12, 38);
  }

  solve();
  draw(0); // static field is always visible; the button starts the animation

  // Stage preset buttons
  document.querySelectorAll("[data-nozzle-stage]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cur = btn.getAttribute("data-nozzle-stage");
      solve();
      draw(0);
      document.querySelectorAll("[data-nozzle-stage]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  // Run/pause: user turns the flow on; it also pauses off-screen.
  var userOn = false, visible = true, running = false, last = 0;

  function frame(ts) {
    if (!running) return;
    var dt = Math.min((ts - last) / 1000 || 0.016, 0.05);
    last = ts;
    draw(dt);
    requestAnimationFrame(frame);
  }
  function update() {
    var want = userOn && visible;
    if (want && !running) { running = true; last = 0; requestAnimationFrame(frame); }
    else if (!want) running = false;
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      userOn = !userOn;
      playBtn.textContent = userOn ? "❚❚ Pause" : "▶ Run simulation";
      playBtn.setAttribute("aria-pressed", userOn ? "true" : "false");
      playBtn.classList.toggle("is-running", userOn);
      update();
    });
  }

  var io = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: 0.15 });
  io.observe(canvas);
})();
