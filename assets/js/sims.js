/* ============================================================================
 * sims.js - live canvas playbacks for the Code Showcase (demo.js).
 *
 * window.CODE_SIMS maps each showcase key to a factory:
 *   factory(canvas) -> { start(), stop(), restart(), drawFinal() }
 *
 * Three of the four playbacks replay the data the CDR MATLAB scripts wrote
 * (assets/js/cope-data.js); the Artemis II tool re-integrates its equations
 * in JS. demo.js starts a sim when it scrolls into view, pauses it
 * off-screen, and wires the Replay button to restart().
 * ==========================================================================*/
(function () {
  "use strict";

  var MONO = '11px "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace';
  var MONO_B = '600 11px "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace';
  var COL = {
    grid: "rgba(201,206,215,.08)",
    axis: "rgba(201,206,215,.25)",
    text: "#8a93a2",
    bright: "#e2e5ea",
    ref: "#6b7180",
    blue: "#6fb1ff",
    amber: "#ffb36b",
    orange: "#ff9a3c",
    red: "#ff6a5c",
    teal: "#22c3a6",
    metal: "#c9ced7",
    white: "#e2e5ea",
  };
  var D = window.COPE_DATA || {};

  /* ---- playback engine --------------------------------------------------- */
  function makePlayer(canvas, drawFrame, duration) {
    var ctx = canvas.getContext("2d");
    var HOLD = 1.6;
    var playT = 0, raf = 0, running = false, last = 0;

    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return null;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      var s = fit();
      if (!s) return;
      playT += dt;
      var t = playT % (duration + HOLD);
      drawFrame(ctx, Math.min(t, duration), s.w, s.h);
    }
    return {
      start: function () { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      restart: function () { playT = 0; this.start(); },
      drawFinal: function () { var s = fit(); if (s) drawFrame(ctx, duration, s.w, s.h); },
    };
  }

  /* ---- shared strip chart ------------------------------------------------ */
  // b: {x,y,w,h}; o: {tMax,yMin,yMax,label,series:[{t[],y[],color,dash,width,cutN}], marks:[{t,label}]}
  function drawChart(ctx, b, o) {
    ctx.save();
    ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (var gi = 1; gi < 4; gi++) {
      var gy = b.y + (b.h * gi) / 4; ctx.moveTo(b.x, gy); ctx.lineTo(b.x + b.w, gy);
      var gx = b.x + (b.w * gi) / 4; ctx.moveTo(gx, b.y); ctx.lineTo(gx, b.y + b.h);
    }
    ctx.stroke();
    ctx.strokeStyle = COL.axis; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
    (o.marks || []).forEach(function (m) {
      var X = b.x + ((m.t - (o.tMin || 0)) / (o.tMax - (o.tMin || 0))) * b.w;
      ctx.strokeStyle = "rgba(255,154,60,.35)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X, b.y); ctx.lineTo(X, b.y + b.h); ctx.stroke(); ctx.setLineDash([]);
      if (m.label) { ctx.fillStyle = COL.orange; ctx.font = MONO; ctx.fillText(m.label, X + 4, b.y + b.h - 6); }
    });
    o.series.forEach(function (s) {
      var n = s.cutN; if (n < 2) return;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.6; ctx.setLineDash(s.dash ? [4, 4] : []);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var X = b.x + ((s.t[i] - (o.tMin || 0)) / (o.tMax - (o.tMin || 0))) * b.w;
        var Y = b.y + b.h - ((s.y[i] - o.yMin) / (o.yMax - o.yMin)) * b.h;
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    if (o.label) { ctx.fillStyle = COL.text; ctx.font = MONO; ctx.fillText(o.label, b.x + 7, b.y + 14); }
  }

  function clear(ctx, w, h) { ctx.clearRect(0, 0, w, h); }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function lerp(a, b, u) { return a + (b - a) * u; }
  // linear interpolation on a monotone x array
  function interp(xs, ys, xq) {
    if (xq <= xs[0]) return ys[0];
    var n = xs.length; if (xq >= xs[n - 1]) return ys[n - 1];
    var lo = 0, hi = n - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (xs[mid] <= xq) lo = mid; else hi = mid; }
    var f = (xq - xs[lo]) / (xs[hi] - xs[lo] || 1);
    return ys[lo] + (ys[hi] - ys[lo]) * f;
  }

  /* ==========================================================================
   * 1) FFSC cycle balance - the Stage 1 pressure cascade solved by
   *    AE451_Stage1_FFSC_with_regen_FIXED.m (values from the CDR, Table 17).
   * ========================================================================*/
  function ffscSim(canvas) {
    // station list in solve order; each becomes a bar as the playhead reaches it
    var FUEL = [
      { k: "CH4 pump in", p: 0.285, node: "fpump" },
      { k: "CH4 pump out", p: 51.20, node: "fpump", note: "25.78 MW" },
      { k: "regen jacket out", p: 46.06, node: "regen", note: "−5.14 MPa · 381 K" },
      { k: "FR preburner", p: 40.60, node: "frpb", note: "O/F 0.25 · 1010 K" },
      { k: "fuel turbine out", p: 30.64, node: "fturb", note: "28.35 MW · +10%" },
      { k: "main injector", p: 30.64, node: "inj", note: "ΔP 20% Pc" },
      { k: "chamber Pc", p: 25.53, node: "mcc" },
    ];
    var OX = [
      { k: "LOX pump in", p: 0.351, node: "opump" },
      { k: "LOX pump out", p: 45.40, node: "opump", note: "29.60 MW" },
      { k: "OR preburner", p: 41.87, node: "orpb", note: "O/F 50 · 858 K" },
      { k: "LOX turbine out", p: 30.64, node: "oturb", note: "32.56 MW · +10%" },
      { k: "main injector", p: 30.64, node: "inj", note: "ΔP 20% Pc" },
      { k: "chamber Pc", p: 25.53, node: "mcc" },
    ];
    var STEPS = []; // interleave so the two paths advance together
    for (var i = 0; i < Math.max(FUEL.length, OX.length); i++) {
      if (FUEL[i]) STEPS.push({ side: "F", s: FUEL[i], i: i });
      if (OX[i]) STEPS.push({ side: "O", s: OX[i], i: i });
    }
    var DUR = 11, PER = DUR / STEPS.length;

    function draw(ctx, pt, w, h) {
      clear(ctx, w, h);
      var narrow = w < 560;
      var step = Math.min(STEPS.length, Math.floor(pt / PER) + (pt >= DUR ? 0 : 1));
      var frac = pt >= DUR ? 1 : (pt % PER) / PER;
      var nF = 0, nO = 0, cur = null;
      for (var k = 0; k < step; k++) { if (STEPS[k].side === "F") nF++; else nO++; cur = STEPS[k]; }

      // ---- schematic (left on wide, top on narrow) ----
      var sw = narrow ? w : Math.round(w * 0.46), sh = narrow ? Math.round(h * 0.46) : h;
      var N = {
        fpump: { x: .16, y: .86, l: "CH₄ pump" }, opump: { x: .84, y: .86, l: "LOX pump" },
        regen: { x: .16, y: .60, l: "regen jacket" },
        frpb: { x: .16, y: .36, l: "FR preburner" }, orpb: { x: .84, y: .36, l: "OR preburner" },
        fturb: { x: .36, y: .36, l: "fuel turbine" }, oturb: { x: .64, y: .36, l: "LOX turbine" },
        inj: { x: .5, y: .16, l: "main injector" }, mcc: { x: .5, y: .62, l: "chamber 25.5 MPa" },
      };
      var P = function (n) { return { x: 14 + N[n].x * (sw - 28), y: 14 + N[n].y * (sh - 28) }; };
      var lines = [
        ["fpump", "regen", COL.amber], ["regen", "frpb", COL.amber], ["frpb", "fturb", COL.red], ["fturb", "inj", COL.red],
        ["opump", "orpb", COL.blue], ["orpb", "oturb", COL.red], ["oturb", "inj", COL.red], ["inj", "mcc", COL.orange],
        ["opump", "frpb", "rgba(111,177,255,.45)"], ["fpump", "orpb", "rgba(255,179,107,.45)"],
      ];
      ctx.lineWidth = 2;
      lines.forEach(function (L) {
        var a = P(L[0]), b = P(L[1]);
        ctx.strokeStyle = L[2]; ctx.setLineDash(L[2].indexOf("rgba") === 0 ? [3, 5] : []);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.setLineDash([]);
      // travelling dots on the active lines
      var tt = pt * 0.9;
      lines.forEach(function (L, li) {
        if (L[2].indexOf("rgba") === 0) return;
        var a = P(L[0]), b = P(L[1]);
        for (var d = 0; d < 2; d++) {
          var u = ((tt * 0.5 + d * 0.5 + li * 0.13) % 1);
          ctx.fillStyle = L[2]; ctx.globalAlpha = .9;
          ctx.beginPath(); ctx.arc(lerp(a.x, b.x, u), lerp(a.y, b.y, u), 2.2, 0, 6.283); ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
      Object.keys(N).forEach(function (n) {
        var p = P(n), active = cur && cur.s.node === n;
        var bw = narrow ? 84 : 104, bh = 26;
        ctx.fillStyle = active ? "rgba(255,154,60,.18)" : "#141a24";
        ctx.strokeStyle = active ? COL.orange : "#2d3542"; ctx.lineWidth = active ? 1.5 : 1;
        rrect(ctx, p.x - bw / 2, p.y - bh / 2, bw, bh, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = active ? COL.white : COL.metal; ctx.font = MONO; ctx.textAlign = "center";
        ctx.fillText(N[n].l, p.x, p.y + 4); ctx.textAlign = "left";
      });

      // ---- cascade bars (right on wide, bottom on narrow) ----
      var bx = narrow ? 14 : sw + 10, by = narrow ? sh + 6 : 14;
      var bw2 = w - bx - 14, bh2 = h - by - 14;
      var rowH = Math.min(22, (bh2 - 80) / (FUEL.length + OX.length));
      var maxP = 56, lab = narrow ? 92 : 118, barW = bw2 - lab - 64;
      function bars(list, n, y0, title, color) {
        ctx.fillStyle = COL.text; ctx.font = MONO_B; ctx.fillText(title, bx, y0 + 10);
        for (var i = 0; i < list.length; i++) {
          var y = y0 + 16 + i * rowH, s = list[i];
          var done = i < n - 1, live = i === n - 1;
          var f = done ? 1 : live ? frac : 0;
          ctx.fillStyle = f > 0 ? COL.metal : COL.ref; ctx.font = MONO;
          ctx.fillText(s.k, bx, y + rowH * 0.68);
          ctx.fillStyle = "rgba(255,255,255,.05)"; ctx.fillRect(bx + lab, y + 4, barW, rowH - 8);
          if (f > 0) {
            var wv = Math.max(2, (s.p / maxP) * barW * f);
            ctx.fillStyle = color; ctx.globalAlpha = live ? .95 : .7; ctx.fillRect(bx + lab, y + 4, wv, rowH - 8); ctx.globalAlpha = 1;
            ctx.fillStyle = live ? COL.white : COL.metal;
            ctx.fillText((s.p * f).toFixed(s.p < 1 ? 3 : 2) + " MPa", bx + lab + barW + 6, y + rowH * 0.68);
          }
        }
      }
      bars(FUEL, nF, by, "METHANE PATH", COL.amber);
      bars(OX, nO, by + 16 + FUEL.length * rowH + 14, "LOX PATH", COL.blue);
      // footer note for the active station
      if (cur && cur.s.note) {
        ctx.fillStyle = COL.orange; ctx.font = MONO;
        ctx.fillText("▸ " + cur.s.k + ": " + cur.s.note, bx, h - 8);
      } else if (pt >= DUR) {
        ctx.fillStyle = COL.teal; ctx.font = MONO;
        ctx.fillText("✓ both turbines carry 10% margin · Pc = 25.53 MPa · Isp 331 s SL", bx, h - 8);
      }
    }
    return makePlayer(canvas, draw, DUR);
  }

  /* ==========================================================================
   * 2) Regenerative cooling - hot-wall temperature and heat flux along the
   *    Stage 1 contour, from regen_cooling_CDR.m output (channel CSV).
   * ========================================================================*/
  function regenSim(canvas) {
    var R = D.S1 && D.S1.regen, C = D.S1 && D.S1.contour;
    if (!R || !C) return makePlayer(canvas, function (ctx, t, w, h) { clear(ctx, w, h); ctx.fillStyle = COL.text; ctx.font = MONO; ctx.fillText("data unavailable", 12, 20); }, 1);
    var x = R.x_mm, rw = R.r_hotwall_mm, q = R.q_MW_m2, Twg = R.Twg_K, Tc = R.coolant_T_K, Vc = R.coolant_V_m_s;
    var x0 = x[0], x1 = x[x.length - 1], rmax = Math.max.apply(null, rw);
    var qmax = Math.max.apply(null, q), Tmax = Math.max.apply(null, Twg);
    var iq = q.indexOf(qmax), iT = Twg.indexOf(Tmax);
    var DUR = 9;
    function heat(u) { // 0..1 -> dark red .. white hot
      u = Math.max(0, Math.min(1, u));
      var r = Math.round(60 + 195 * Math.min(1, u * 1.6)), g = Math.round(30 + 180 * Math.max(0, u - 0.35) / 0.65), b = Math.round(40 + 160 * Math.max(0, u - 0.75) / 0.25);
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    function draw(ctx, pt, w, h) {
      clear(ctx, w, h);
      var u = pt / DUR, xq = x0 + (x1 - x0) * u;
      var narrow = w < 520;
      // --- contour strip (top) ---
      var top = 14, strip = Math.round(h * 0.34), cy = top + strip / 2;
      var pad = 16, sx = function (xx) { return pad + ((xx - x0) / (x1 - x0)) * (w - 2 * pad); };
      var sr = function (rr) { return (rr / rmax) * (strip / 2 - 6); };
      // wall colored by Twg up to the playhead
      for (var i = 0; i < x.length - 1; i++) {
        var X0 = sx(x[i]), X1 = sx(x[i + 1]) + 0.8;
        var done = x[i] <= xq;
        ctx.fillStyle = done ? heat((Twg[i] - 300) / (Tmax - 300)) : "#1b2130";
        ctx.fillRect(X0, cy - sr(rw[i]) - 4, X1 - X0, 4);
        ctx.fillRect(X0, cy + sr(rw[i]), X1 - X0, 4);
        // channel hint: faint coolant flow inside the wall band
        if (done) { ctx.fillStyle = "rgba(111,177,255,.35)"; ctx.fillRect(X0, cy - sr(rw[i]) - 7, X1 - X0, 2); ctx.fillRect(X0, cy + sr(rw[i]) + 5, X1 - X0, 2); }
      }
      // gas region
      ctx.fillStyle = "rgba(255,154,60,.06)";
      ctx.beginPath(); ctx.moveTo(sx(x[0]), cy - sr(rw[0]));
      for (var j = 1; j < x.length; j++) ctx.lineTo(sx(x[j]), cy - sr(rw[j]));
      for (var k = x.length - 1; k >= 0; k--) ctx.lineTo(sx(x[k]), cy + sr(rw[k]));
      ctx.closePath(); ctx.fill();
      // playhead
      var PX = sx(xq);
      ctx.strokeStyle = COL.orange; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(PX, top); ctx.lineTo(PX, top + strip); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = COL.text; ctx.font = MONO;
      ctx.fillText("injector", sx(x0) + 2, top + 10); ctx.textAlign = "right"; ctx.fillText("exit ε = 40", sx(x1) - 2, top + 10); ctx.textAlign = "left";
      ctx.fillText("throat", sx(0) - 18, top + strip - 2);

      // --- charts ---
      var chTop = top + strip + 12, chH = (h - chTop - 26) / 2 - 8;
      var cut = 0; while (cut < x.length && x[cut] <= xq) cut++;
      drawChart(ctx, { x: 46, y: chTop, w: w - 60, h: chH }, {
        tMin: x0, tMax: x1, yMin: 300, yMax: 900, label: "hot-wall temperature Twg (K) · limit 1000 K",
        series: [{ t: x, y: Twg, color: COL.red, cutN: cut }],
        marks: [{ t: x[iT], label: pt >= DUR ? "peak 797 K" : "" }],
      });
      drawChart(ctx, { x: 46, y: chTop + chH + 16, w: w - 60, h: chH }, {
        tMin: x0, tMax: x1, yMin: 0, yMax: 160, label: "heat flux q (MW/m²)",
        series: [{ t: x, y: q, color: COL.amber, cutN: cut }],
        marks: [{ t: x[iq], label: pt >= DUR ? "peak 144 MW/m²" : "" }],
      });
      // readout
      var Tn = interp(x, Twg, xq), qn = interp(x, q, xq), Tcn = interp(x, Tc, xq), Vn = interp(x, Vc, xq);
      ctx.fillStyle = COL.bright; ctx.font = MONO;
      var ro = "x = " + (xq / 1000).toFixed(2) + " m   Twg " + Tn.toFixed(0) + " K   q " + qn.toFixed(1) + " MW/m²   CH₄ " + Tcn.toFixed(0) + " K · " + Vn.toFixed(0) + " m/s";
      if (narrow) ro = "x " + (xq / 1000).toFixed(2) + " m  Twg " + Tn.toFixed(0) + " K  q " + qn.toFixed(0);
      ctx.fillText(ro, 46, h - 8);
    }
    return makePlayer(canvas, draw, DUR);
  }

  /* ==========================================================================
   * 3) Ascent - gravity-turn trajectory from Detail_Ascent.m (CSV output).
   * ========================================================================*/
  function ascentSim(canvas) {
    var A = D.ascent;
    if (!A) return makePlayer(canvas, function (ctx, t, w, h) { clear(ctx, w, h); }, 1);
    var t = A.t, hgt = A.h, v = A.v, gam = A.gamma, q = A.q, Mn = A.M, nx = A.nx, stg = A.stage, thr = A.throttle;
    var tEnd = t[t.length - 1];
    var qmax = Math.max.apply(null, q), iq = q.indexOf(qmax);
    var iStage = stg.indexOf(2);
    var DUR = 14;
    // crude downrange from v·cos(gamma) integration for the side view
    var dr = [0];
    for (var i = 1; i < t.length; i++) dr.push(dr[i - 1] + 0.5 * (v[i] * Math.cos(gam[i] * Math.PI / 180) + v[i - 1] * Math.cos(gam[i - 1] * Math.PI / 180)) * (t[i] - t[i - 1]));
    var drMax = dr[dr.length - 1], hMax = Math.max.apply(null, hgt);

    function draw(ctx, pt, w, h) {
      clear(ctx, w, h);
      var tq = (pt / DUR) * tEnd;
      var narrow = w < 560;
      var hN = interp(t, hgt, tq), vN = interp(t, v, tq), gN = interp(t, gam, tq), qN = interp(t, q, tq), MN = interp(t, Mn, tq), nN = interp(t, nx, tq);
      var stageN = tq >= t[iStage] ? 2 : 1, thN = interp(t, thr, tq);

      // --- side view (left) ---
      var vw = narrow ? w : Math.round(w * 0.5), vh = narrow ? Math.round(h * 0.5) : h - 24;
      var pad = 26;
      var sx = function (d) { return pad + (d / drMax) * (vw - 2 * pad); };
      var sy = function (hh) { return vh - pad - (hh / hMax) * (vh - 2 * pad - 10); };
      // ground + atmosphere bands
      ctx.fillStyle = "rgba(76,201,240,.05)"; ctx.fillRect(pad, sy(100e3), vw - 2 * pad, sy(0) - sy(100e3));
      ctx.strokeStyle = COL.axis; ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(vw - pad, sy(0)); ctx.stroke();
      ctx.fillStyle = COL.text; ctx.font = MONO;
      ctx.fillText("200 km", pad + 4, sy(200e3) + 12); ctx.fillText("Kármán 100 km", pad + 4, sy(100e3) + 12);
      ctx.strokeStyle = COL.grid; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(pad, sy(200e3)); ctx.lineTo(vw - pad, sy(200e3)); ctx.stroke(); ctx.setLineDash([]);
      // trajectory so far
      ctx.lineWidth = 2;
      var cut = 0; while (cut < t.length && t[cut] <= tq) cut++;
      ctx.beginPath();
      for (var i2 = 0; i2 < cut; i2++) { var X = sx(dr[i2]), Y = sy(hgt[i2]); if (i2 === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
      ctx.strokeStyle = COL.amber; ctx.stroke();
      // exhaust glow + vehicle glyph
      var drN = interp(t, dr, tq), px = sx(drN), py = sy(hN);
      var ang = -gN * Math.PI / 180; // gamma from horizontal; screen y down
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang + Math.PI / 2);
      if (thN > 0.01) {
        var g = ctx.createLinearGradient(0, 8, 0, 34);
        g.addColorStop(0, "rgba(255,154,60,.95)"); g.addColorStop(1, "rgba(255,106,92,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-3, 8); ctx.lineTo(3, 8); ctx.lineTo(0, 30 + 6 * Math.sin(pt * 40)); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = COL.white; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill();
      if (stageN === 1) { ctx.fillStyle = COL.metal; ctx.fillRect(-4, 2, 8, 6); }
      ctx.restore();
      // max-q + staging markers once passed
      if (tq >= t[iq]) { ctx.fillStyle = COL.orange; ctx.font = MONO; ctx.beginPath(); ctx.arc(sx(dr[iq]), sy(hgt[iq]), 3, 0, 6.283); ctx.fill(); ctx.fillText("max-q 35 kPa", sx(dr[iq]) + 8, sy(hgt[iq]) + 4); }
      if (tq >= t[iStage]) { ctx.fillStyle = COL.teal; ctx.font = MONO; ctx.beginPath(); ctx.arc(sx(dr[iStage]), sy(hgt[iStage]), 3, 0, 6.283); ctx.fill(); ctx.fillText("staging 150.6 s", sx(dr[iStage]) + 8, sy(hgt[iStage]) + 4); }
      if (pt >= DUR) { ctx.fillStyle = COL.teal; ctx.font = MONO; ctx.fillText("orbit 200 km · 7.79 km/s inertial", px - 150, py - 10); }

      // --- charts (right / bottom) ---
      var cx = narrow ? 44 : vw + 34, cy0 = narrow ? vh + 8 : 14;
      var cw = w - cx - 14, chH = (h - cy0 - 30) / 2 - 8;
      drawChart(ctx, { x: cx, y: cy0, w: cw, h: chH }, {
        tMax: tEnd, yMin: 0, yMax: 8000, label: "velocity (m/s)",
        series: [{ t: t, y: v, color: COL.blue, cutN: cut }],
        marks: [{ t: t[iStage], label: "" }],
      });
      drawChart(ctx, { x: cx, y: cy0 + chH + 16, w: cw, h: chH }, {
        tMax: tEnd, yMin: 0, yMax: 40, label: "dynamic pressure (kPa)",
        series: [{ t: t, y: q.map(function (val) { return val / 1000; }), color: COL.orange, cutN: cut }],
        marks: [{ t: t[iq], label: "" }],
      });
      ctx.fillStyle = COL.bright; ctx.font = MONO;
      var ro = "t " + tq.toFixed(0) + " s   h " + (hN / 1000).toFixed(1) + " km   V " + vN.toFixed(0) + " m/s   M " + MN.toFixed(2) + "   q " + (qN / 1000).toFixed(1) + " kPa   n " + nN.toFixed(2) + " g   S" + stageN;
      if (narrow) ro = "t " + tq.toFixed(0) + " s  h " + (hN / 1000).toFixed(0) + " km  V " + vN.toFixed(0) + "  M " + MN.toFixed(1) + "  " + nN.toFixed(1) + " g";
      ctx.fillText(ro, cx, h - 8);
    }
    return makePlayer(canvas, draw, DUR);
  }

  /* ==========================================================================
   * 4) Artemis II translunar trajectory - Earth + Moon gravity, RK4.
   *    Same force model as the MATLAB script (planar, circular Moon).
   * ========================================================================*/
  function artemisSim(canvas) {
    var muE = 398600, muM = 4903;
    var rMoon = 384400, rE = 6378;
    var omega = 2 * Math.PI / (27.322 * 86400);
    var vMag = 10.845, leadDeg = 127;
    var h = 120, maxDays = 9;
    var a0 = -leadDeg * Math.PI / 180;
    var st = [(rE + 300) * Math.cos(a0), (rE + 300) * Math.sin(a0), -vMag * Math.sin(a0), vMag * Math.cos(a0)];
    function deriv(t, s) {
      var ma = omega * t, mx = rMoon * Math.cos(ma), my = rMoon * Math.sin(ma);
      var re3 = Math.pow(s[0] * s[0] + s[1] * s[1], 1.5);
      var dx = s[0] - mx, dy = s[1] - my, rm3 = Math.pow(dx * dx + dy * dy, 1.5);
      return [s[2], s[3], -muE * s[0] / re3 - muM * dx / rm3, -muE * s[1] / re3 - muM * dy / rm3];
    }
    var xs = [st[0]], ys = [st[1]], ts = [0], t = 0, minMoon = 1e12, flybyI = 0;
    for (var i = 0; i < (maxDays * 86400) / h; i++) {
      var k1 = deriv(t, st);
      var s2 = st.map(function (v, j) { return v + h / 2 * k1[j]; }); var k2 = deriv(t + h / 2, s2);
      var s3 = st.map(function (v, j) { return v + h / 2 * k2[j]; }); var k3 = deriv(t + h / 2, s3);
      var s4 = st.map(function (v, j) { return v + h * k3[j]; }); var k4 = deriv(t + h, s4);
      st = st.map(function (v, j) { return v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]); });
      t += h; xs.push(st[0]); ys.push(st[1]); ts.push(t);
      var ma = omega * t, dm = Math.hypot(st[0] - rMoon * Math.cos(ma), st[1] - rMoon * Math.sin(ma));
      if (dm < minMoon) { minMoon = dm; flybyI = xs.length - 1; }
      if (t > 86400 && Math.hypot(st[0], st[1]) < rE) break;
    }
    var N = xs.length, minX = -rMoon, maxX = rMoon, minY = -rMoon, maxY = rMoon;
    for (var j = 0; j < N; j++) { if (xs[j] < minX) minX = xs[j]; if (xs[j] > maxX) maxX = xs[j]; if (ys[j] < minY) minY = ys[j]; if (ys[j] > maxY) maxY = ys[j]; }
    var DUR = 14;
    function draw(ctx, pt, w, h2) {
      clear(ctx, w, h2);
      var pad = 26, sc = Math.min((w - 2 * pad) / (maxX - minX), (h2 - 2 * pad) / (maxY - minY));
      var cx = (w - sc * (minX + maxX)) / 2, cy = (h2 + sc * (minY + maxY)) / 2;
      function PX(x) { return cx + x * sc; } function PY(y) { return cy - y * sc; }
      var idx = Math.max(1, Math.round((pt / DUR) * (N - 1))), tNow = ts[idx];
      ctx.strokeStyle = COL.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(PX(0), PY(0), rMoon * sc, 0, 2 * Math.PI); ctx.stroke();
      var eg = ctx.createRadialGradient(PX(0), PY(0), 1, PX(0), PY(0), 14);
      eg.addColorStop(0, "rgba(111,177,255,.9)"); eg.addColorStop(1, "rgba(111,177,255,0)");
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(PX(0), PY(0), 14, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = COL.blue; ctx.beginPath(); ctx.arc(PX(0), PY(0), 5, 0, 2 * Math.PI); ctx.fill();
      var ma = omega * tNow, mX = PX(rMoon * Math.cos(ma)), mY = PY(rMoon * Math.sin(ma));
      ctx.fillStyle = "#9aa1ac"; ctx.beginPath(); ctx.arc(mX, mY, 4, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = COL.amber; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(PX(xs[0]), PY(ys[0]));
      for (var i2 = 1; i2 <= idx; i2++) ctx.lineTo(PX(xs[i2]), PY(ys[i2]));
      ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(PX(xs[idx]), PY(ys[idx]), 3, 0, 2 * Math.PI); ctx.fill();
      if (idx >= flybyI) { ctx.fillStyle = COL.text; ctx.font = MONO; ctx.fillText("lunar flyby ~" + Math.round((minMoon - 1737) / 100) / 10 + "k km", PX(xs[flybyI]) + 8, PY(ys[flybyI]) - 6); }
      ctx.fillStyle = COL.text; ctx.font = MONO;
      var rNow = Math.hypot(xs[idx], ys[idx]);
      ctx.fillText("t = " + (tNow / 86400).toFixed(1) + " d    r = " + Math.round(rNow).toLocaleString() + " km", 12, 18);
      ctx.fillText("Earth", PX(0) + 8, PY(0) + 14); ctx.fillText("Moon", mX + 7, mY + 4);
    }
    return makePlayer(canvas, draw, DUR);
  }

  window.CODE_SIMS = {
    ffsc: ffscSim,
    regen: regenSim,
    ascent: ascentSim,
    artemis: artemisSim,
  };
})();
