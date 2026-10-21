/* ============================================================================
 * nozzle-sim.js - flow through the COPE engine bells, on the homepage.
 *
 * Geometry and the quasi-1D solution (Mach, static temperature and pressure
 * at every station) come straight from the CDR analysis outputs in
 * assets/js/cope-data.js: the actual 80% Rao contours (Rt = 132.3 mm; Stage 1
 * eps = 40, Stage 2 eps = 100) with CEA chamber properties. The canvas shades
 * the selected field across the bell, draws the plume for the ambient each
 * stage runs in (sea-level shock cells for Stage 1, free expansion for
 * Stage 2), advects streak particles at the local velocity, and lets the
 * visitor probe any station with the pointer. It is a 1D model shaded for
 * display, not CFD.
 * ==========================================================================*/
(function () {
  "use strict";

  var canvas = document.querySelector("[data-nozzle]");
  var DATA = window.COPE_DATA;
  if (!canvas || !DATA) return;
  var ctx = canvas.getContext("2d");
  var playBtn = document.querySelector("[data-nozzle-play]");
  var readout = document.querySelector("[data-nozzle-readout]");

  var META = {
    S1: { label: "Stage 1 · Pc 25.53 MPa · ε 40 · 2.51 MN SL / 2.73 MN vac", short: "Stage 1 · ε 40 · 2.51 MN SL", eps: 40, pa: 101325, pe: 70500, De: 1.674, Isp: "331 s SL" },
    S2: { label: "Stage 2 · Pc 26.08 MPa · ε 100 · 2.91 MN vac", short: "Stage 2 · ε 100 · 2.91 MN vac", eps: 100, pa: 0, pe: 24000, De: 2.646, Isp: "376 s vac" },
  };
  var FIELDS = {
    M: { name: "Mach", unit: "", fmt: function (v) { return v.toFixed(2); } },
    T: { name: "Temperature", unit: "K", fmt: function (v) { return v.toFixed(0) + " K"; } },
    p: { name: "Pressure", unit: "", fmt: function (v) { return v >= 1e6 ? (v / 1e6).toFixed(2) + " MPa" : (v / 1e3).toFixed(1) + " kPa"; } },
  };

  var cur = "S1", field = "M";
  var st = null;
  var hover = null; // normalized station 0..1 under the pointer, or null

  function solve() {
    var c = DATA[cur].contour;
    var x = c.x_mm, r = c.r_mm;
    var x0 = x[0], x1 = x[x.length - 1];
    st = {
      xn: x.map(function (v) { return (v - x0) / (x1 - x0); }),
      x: x, r: r, M: c.Mach, T: c.T_K, p: c.p_Pa,
      t: DATA[cur].throat_i,
      rt: Math.min.apply(null, r), rMax: Math.max.apply(null, r),
      len: x1 - x0,
    };
    var n = r.length - 1;
    st.Me = st.M[n]; st.Te = st.T[n]; st.pe = st.p[n];
    st.Tmax = Math.max.apply(null, st.T); st.Tmin = Math.min.apply(null, st.T);
    st.lpMax = Math.log10(Math.max.apply(null, st.p)); st.lpMin = Math.log10(Math.min.apply(null, st.p));
  }

  // interpolate an array on the normalized station grid
  function at(arr, xq) {
    var x = st.xn;
    if (xq <= 0) return arr[0];
    if (xq >= 1) return arr[arr.length - 1];
    var lo = 0, hi = x.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (x[mid] <= xq) lo = mid; else hi = mid; }
    var f = (xq - x[lo]) / (x[hi] - x[lo] || 1);
    return arr[lo] + (arr[hi] - arr[lo]) * f;
  }
  // normalized 0..1 value of the active field at a station
  function fieldNorm(xq) {
    if (field === "M") return at(st.M, xq) / st.Me;
    if (field === "T") return (at(st.T, xq) - st.Tmin) / (st.Tmax - st.Tmin);
    return (Math.log10(at(st.p, xq)) - st.lpMin) / (st.lpMax - st.lpMin);
  }

  /* ---- colormaps ---------------------------------------------------------- */
  var MAPS = {
    // slow blue -> fast red (Mach)
    M: [[0, 24, 48, 160], [0.22, 32, 140, 230], [0.48, 48, 200, 150], [0.72, 255, 196, 70], [1, 255, 84, 60]],
    // cold black-red-orange-white (temperature)
    T: [[0, 20, 8, 40], [0.3, 120, 20, 60], [0.6, 230, 80, 30], [0.85, 255, 190, 60], [1, 255, 250, 220]],
    // pressure: deep violet -> teal -> pale
    p: [[0, 20, 10, 60], [0.35, 50, 60, 170], [0.65, 40, 170, 180], [1, 240, 250, 200]],
  };
  function cmap(t, alpha, k) {
    var S = MAPS[field];
    t = Math.min(Math.max(t, 0), 1); k = k == null ? 1 : k;
    var a = S[0], b = S[S.length - 1];
    for (var i = 0; i < S.length - 1; i++) if (t >= S[i][0] && t <= S[i + 1][0]) { a = S[i]; b = S[i + 1]; break; }
    var u = (t - a[0]) / (b[0] - a[0] || 1);
    var r = Math.min(255, Math.round((a[1] + (b[1] - a[1]) * u) * k));
    var g = Math.min(255, Math.round((a[2] + (b[2] - a[2]) * u) * k));
    var bl = Math.min(255, Math.round((a[3] + (b[3] - a[3]) * u) * k));
    return "rgba(" + r + "," + g + "," + bl + "," + (alpha == null ? 1 : alpha) + ")";
  }

  /* ---- particles ---------------------------------------------------------- */
  var PARTS = [];
  for (var i = 0; i < 140; i++) PARTS.push({ x: Math.random() * 1.3, f: Math.random() * 1.8 - 0.9, s: 0.7 + Math.random() * 0.6 });

  var clock = 0;
  function draw(dt) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clock += dt;

    // background: vignette
    var bg = ctx.createRadialGradient(W * 0.45, H * 0.5, 10, W * 0.45, H * 0.5, W * 0.7);
    bg.addColorStop(0, "#0e1320"); bg.addColorStop(1, "#070a10");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    var narrow = W < 640;
    var x0 = W * 0.04, x1 = W * (narrow ? 0.70 : 0.68), xPlume = W * 0.995;
    var yc = H * 0.53;
    var scale = (H * 0.40) / st.rMax;        // px per mm
    var X = function (xn) { return x0 + (x1 - x0) * xn; };
    var R = function (xn) { return at(st.r, xn) * scale; };
    var meta = META[cur];

    // ---- field inside the bell: per-column vertical gradient with a dark edge near the wall (display only)
    var cols = Math.max(160, Math.round((x1 - x0) / 2));
    for (var c = 0; c < cols; c++) {
      var u0 = c / cols, u1 = (c + 1) / cols;
      var xa = X(u0), xb = X(u1) + 1;
      var rm = (R(u0) + R(u1)) / 2;
      var v = fieldNorm((u0 + u1) / 2);
      var g = ctx.createLinearGradient(0, yc - rm, 0, yc + rm);
      g.addColorStop(0, cmap(v, 1, 0.55)); g.addColorStop(0.12, cmap(v, 1, 0.95));
      g.addColorStop(0.5, cmap(v, 1, 1.08)); g.addColorStop(0.88, cmap(v, 1, 0.95)); g.addColorStop(1, cmap(v, 1, 0.55));
      ctx.fillStyle = g; ctx.fillRect(xa, yc - rm, xb - xa, rm * 2);
    }

    // ---- plume
    var rExit = R(1), Me = st.Me;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (meta.pa > 0) {
      // overexpanded at sea level (pe/pa ≈ 0.70): the jet necks down and a train of shock cells forms.
      var ratio = meta.pe / meta.pa;
      var cellL = 0.9 * (2 * rExit) * Math.sqrt(Me * Me - 1) * Math.sqrt(ratio); // Prandtl-Pack style cell spacing, px
      var steps = 90, len = xPlume - x1;
      for (var k = 0; k < steps; k++) {
        var uu = k / steps, px = x1 + len * uu, pw = len / steps + 1;
        var decay = Math.exp(-uu * 2.2);
        var cell = Math.abs(Math.sin(Math.PI * (px - x1) / cellL));
        var rp = rExit * (0.82 + 0.18 * cell) * (1 + 0.25 * uu);
        var bright = (0.18 + 0.55 * Math.pow(1 - cell, 3)) * decay;
        var flick = 0.92 + 0.08 * Math.sin(clock * 37 + k * 1.7);
        var gg = ctx.createLinearGradient(0, yc - rp, 0, yc + rp);
        gg.addColorStop(0, "rgba(255,120,60,0)"); gg.addColorStop(0.5, "rgba(255,170,90," + (bright * flick).toFixed(3) + ")"); gg.addColorStop(1, "rgba(255,120,60,0)");
        ctx.fillStyle = gg; ctx.fillRect(px, yc - rp, pw, rp * 2);
        // bright diamond core
        if (cell < 0.25) {
          var core = ctx.createRadialGradient(px, yc, 0, px, yc, rp * 0.5);
          core.addColorStop(0, "rgba(255,245,210," + (0.7 * decay * flick).toFixed(3) + ")"); core.addColorStop(1, "rgba(255,200,120,0)");
          ctx.fillStyle = core; ctx.fillRect(px - 2, yc - rp, pw + 4, rp * 2);
        }
      }
    } else {
      // vacuum: free expansion, the plume fans out and fades
      var steps2 = 70, len2 = xPlume - x1;
      for (var k2 = 0; k2 < steps2; k2++) {
        var u2 = k2 / steps2, px2 = x1 + len2 * u2, pw2 = len2 / steps2 + 1;
        var rp2 = rExit * (1 + 1.6 * u2);
        var a2 = 0.42 * Math.exp(-u2 * 2.6) * (0.94 + 0.06 * Math.sin(clock * 21 + k2));
        var g2 = ctx.createLinearGradient(0, yc - rp2, 0, yc + rp2);
        g2.addColorStop(0, "rgba(120,160,255,0)"); g2.addColorStop(0.5, "rgba(190,210,255," + a2.toFixed(3) + ")"); g2.addColorStop(1, "rgba(120,160,255,0)");
        ctx.fillStyle = g2; ctx.fillRect(px2, yc - rp2, pw2, rp2 * 2);
      }
    }
    ctx.restore();

    // ---- walls: regen jacket band (metal) with the hot-wall line inside
    function wallPath(sign) {
      ctx.beginPath();
      for (var j = 0; j <= 200; j++) {
        var u = j / 200, px = X(u), py = yc + sign * R(u);
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    }
    ctx.lineCap = "round";
    [-1, 1].forEach(function (s) {
      wallPath(s); ctx.strokeStyle = "#2b313c"; ctx.lineWidth = 11; ctx.stroke();   // closeout jacket
      wallPath(s); ctx.strokeStyle = "#9aa3b2"; ctx.lineWidth = 7; ctx.stroke();    // jacket metal
      wallPath(s); ctx.strokeStyle = "#5e6675"; ctx.lineWidth = 2.2; ctx.stroke();  // channel land line
      // copper hot wall facing the gas
      ctx.save(); ctx.translate(0, -s * 3.2); wallPath(s); ctx.strokeStyle = "#c98a5a"; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    });
    // injector face
    ctx.strokeStyle = "#9aa3b2"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, yc - R(0) - 4); ctx.lineTo(x0, yc + R(0) + 4); ctx.stroke();
    ctx.strokeStyle = "#c98a5a"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + 4, yc - R(0)); ctx.lineTo(x0 + 4, yc + R(0)); ctx.stroke();

    // ---- throat marker
    var xt = st.xn[st.t], tx = X(xt);
    ctx.strokeStyle = "rgba(226,229,234,.5)"; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(tx, yc - R(xt) - 22); ctx.lineTo(tx, yc + R(xt) + 22); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#c8d3ea"; ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
    ctx.fillText("throat · M 1", tx, yc - R(xt) - 28);
    ctx.fillText("Me " + Me.toFixed(2) + " · De " + meta.De + " m", x1, narrow ? yc + rExit + 18 : yc - rExit - 12);
    ctx.textAlign = "left";

    // ---- particles, streaked by local velocity
    var Vexit = Me * Math.sqrt(st.Te / st.Tmax);
    for (var q = 0; q < PARTS.length; q++) {
      var pt = PARTS[q];
      var inside = pt.x <= 1;
      var Mloc = inside ? at(st.M, pt.x) : Me;
      var Tloc = inside ? at(st.T, pt.x) : st.Te;
      var Vloc = Math.max(Mloc * Math.sqrt(Tloc / st.Tmax), 0.04);
      pt.x += Vloc * 0.30 * dt * pt.s;
      if (pt.x > 1.3) { pt.x = 0.002; pt.f = Math.random() * 1.8 - 0.9; }
      var rHere = inside ? R(pt.x) : rExit * (meta.pa > 0 ? 0.9 : 1 + 1.2 * (pt.x - 1) / 0.3);
      var pxq = inside ? X(pt.x) : x1 + (xPlume - x1) * (pt.x - 1) / 0.3;
      var pyq = yc + pt.f * rHere * 0.9;
      var streak = 3 + Vloc * 14;
      var aQ = inside ? 0.9 : 0.8 * (1 - (pt.x - 1) / 0.3);
      ctx.strokeStyle = cmap(fieldNorm(Math.min(pt.x, 1)), aQ, 1.5);
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(pxq - streak, pyq); ctx.lineTo(pxq, pyq); ctx.stroke();
    }

    // ---- hover probe
    if (hover != null && hover >= 0 && hover <= 1) {
      var hx = X(hover), hr = R(hover);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(hx, yc - hr - 6); ctx.lineTo(hx, yc + hr + 6); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(10,13,20,.85)";
      var txt = "x " + ((at(st.x, hover)) / 1000).toFixed(2) + " m · A/At " + Math.pow(at(st.r, hover) / st.rt, 2).toFixed(1) + " · M " + at(st.M, hover).toFixed(2) + " · " + at(st.T, hover).toFixed(0) + " K · " + FIELDS.p.fmt(at(st.p, hover));
      ctx.font = "11px ui-monospace, Menlo, monospace";
      var tw = ctx.measureText(txt).width + 14, ty = Math.max(8, yc - hr - 44);
      var tx2 = Math.min(Math.max(8, hx - tw / 2), W - tw - 8);
      ctx.fillRect(tx2, ty, tw, 20); ctx.strokeStyle = "#353c48"; ctx.strokeRect(tx2 + 0.5, ty + 0.5, tw - 1, 19);
      ctx.fillStyle = "#e2e5ea"; ctx.fillText(txt, tx2 + 7, ty + 14);
    }

    // ---- colorbar + readout
    var cbW = narrow ? 110 : 180, cbX = W - cbW - 14, cbY = narrow ? H - 40 : 16;
    for (var b = 0; b < cbW; b++) { ctx.fillStyle = cmap(b / cbW, 1, 1); ctx.fillRect(cbX + b, cbY, 1.5, 8); }
    ctx.fillStyle = "#98a0ab"; ctx.font = "11px ui-monospace, Menlo, monospace";
    var lo = field === "M" ? "0" : field === "T" ? st.Tmin.toFixed(0) + " K" : FIELDS.p.fmt(Math.pow(10, st.lpMin));
    var hi = field === "M" ? Me.toFixed(2) : field === "T" ? st.Tmax.toFixed(0) + " K" : FIELDS.p.fmt(Math.pow(10, st.lpMax));
    ctx.fillText(lo, cbX, cbY + 22); ctx.textAlign = "right"; ctx.fillText(hi, cbX + cbW, cbY + 22); ctx.textAlign = "left";
    ctx.fillText(FIELDS[field].name, cbX, cbY - 4);
    ctx.fillStyle = "#c8d3ea"; ctx.font = "12px ui-monospace, Menlo, monospace";
    // exit velocity from the 1D state: a = sqrt(γ R T) with γ ≈ 1.2 and MW ≈ 24 g/mol frozen in the bell
    var Ve = Me * Math.sqrt(1.2 * (8314 / 24) * st.Te);
    if (narrow) {
      ctx.fillText(meta.short, 12, 20);
      ctx.fillStyle = "#98a0ab"; ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText((meta.pa > 0 ? "pe/pa " + (meta.pe / meta.pa).toFixed(2) + " · overexpanded" : "vacuum") + " · Ve ≈ " + (Ve / 1000).toFixed(2) + " km/s", 12, 38);
    } else {
      ctx.fillText(meta.label, 12, 20);
      ctx.fillStyle = "#98a0ab"; ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText((meta.pa > 0 ? "pe/pa = " + (meta.pe / meta.pa).toFixed(2) + " (overexpanded, no separation: > 0.40)" : "vacuum · pe = 24 kPa") + " · Ve ≈ " + (Ve / 1000).toFixed(2) + " km/s", 12, 38);
    }

    if (readout) {
      readout.innerHTML = "";
      var frag = document.createDocumentFragment();
      function add(label, val) { frag.appendChild(document.createTextNode(label + " ")); var s = document.createElement("span"); s.textContent = val; frag.appendChild(s); frag.appendChild(document.createTextNode("   ")); }
      add("ε", String(meta.eps)); add("Me", Me.toFixed(2)); add("Te", st.Te.toFixed(0) + " K"); add("pe", FIELDS.p.fmt(st.pe)); add("Isp", meta.Isp);
      readout.appendChild(frag);
    }
  }

  solve();
  draw(0); // static field is always visible; the button starts the animation

  // Stage / field buttons
  document.querySelectorAll("[data-nozzle-stage]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cur = btn.getAttribute("data-nozzle-stage"); solve(); draw(0);
      document.querySelectorAll("[data-nozzle-stage]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
    });
  });
  document.querySelectorAll("[data-nozzle-field]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      field = btn.getAttribute("data-nozzle-field"); draw(0);
      document.querySelectorAll("[data-nozzle-field]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
    });
  });

  // Pointer probe
  function probe(e) {
    var rect = canvas.getBoundingClientRect();
    var W = rect.width, narrow = W < 640;
    var x0 = W * 0.04, x1 = W * (narrow ? 0.70 : 0.68);
    var px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    hover = (px - x0) / (x1 - x0);
    if (hover < 0 || hover > 1) hover = null;
    if (!running) draw(0);
  }
  canvas.addEventListener("mousemove", probe);
  canvas.addEventListener("mouseleave", function () { hover = null; if (!running) draw(0); });

  // Run/pause: user turns the flow on; it also pauses off-screen.
  var userOn = false, visible = true, running = false, last = 0;
  function frame(ts) {
    if (!running) return;
    var dt = Math.min((ts - last) / 1000 || 0.016, 0.05);
    last = ts; draw(dt); requestAnimationFrame(frame);
  }
  function update() {
    var want = userOn && visible;
    if (want && !running) { running = true; last = 0; requestAnimationFrame(frame); }
    else if (!want) running = false;
  }
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      userOn = !userOn;
      playBtn.textContent = userOn ? "❚❚ Pause" : "▶ Run the flow";
      playBtn.setAttribute("aria-pressed", userOn ? "true" : "false");
      playBtn.classList.toggle("is-running", userOn);
      update();
    });
  }
  new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(canvas);
  window.addEventListener("resize", function () { if (!running) draw(0); });
})();
