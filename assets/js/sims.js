/* ============================================================================
 * sims.js - live canvas simulations for the Code Showcase (demo.js).
 *
 * window.CODE_SIMS maps each showcase key to a factory:
 *   factory(canvas) -> { start(), stop(), restart(), drawFinal() }
 *
 * Each factory precomputes the response the MATLAB script produces (same
 * equations ported to JS), then animates a playhead over the data. demo.js
 * starts a sim when it scrolls into view, pauses it off-screen, and wires
 * the Replay button to restart().
 * ==========================================================================*/
(function () {
  "use strict";

  var MONO = '11px "SF Mono", "JetBrains Mono", ui-monospace, Menlo, monospace';
  var COL = {
    grid: "rgba(201,206,215,.08)",
    axis: "rgba(201,206,215,.25)",
    text: "#80858f",
    ref: "#6b7180",
    blue: "#7c9cff",
    teal: "#22c3a6",
    amber: "#ffbd6b",
    metal: "#c9ced7",
    white: "#e2e5ea",
  };

  /* ---- playback engine --------------------------------------------------- */
  // drawFrame(ctx, t, w, h) renders the state at playback time t (seconds).
  // The clip loops with a short hold on the final frame.
  function makePlayer(canvas, drawFrame, duration) {
    var ctx = canvas.getContext("2d");
    var HOLD = 1.4;
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
      start: function () {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      restart: function () { playT = 0; this.start(); },
      drawFinal: function () { var s = fit(); if (s) drawFrame(ctx, duration, s.w, s.h); },
    };
  }

  /* ---- shared strip chart ------------------------------------------------ */
  // b: {x,y,w,h}; o: {tMax,yMin,yMax,label,series:[{t[],y[],color,dash,width,cutN}]}
  function drawChart(ctx, b, o) {
    ctx.save();
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gi = 1; gi < 4; gi++) {
      var gy = b.y + (b.h * gi) / 4;
      ctx.moveTo(b.x, gy); ctx.lineTo(b.x + b.w, gy);
      var gx = b.x + (b.w * gi) / 4;
      ctx.moveTo(gx, b.y); ctx.lineTo(gx, b.y + b.h);
    }
    ctx.stroke();
    ctx.strokeStyle = COL.axis;
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

    ctx.beginPath();
    ctx.rect(b.x, b.y, b.w, b.h);
    ctx.clip();
    o.series.forEach(function (s) {
      var n = s.cutN;
      if (n < 2) return;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width || 1.5;
      ctx.setLineDash(s.dash ? [4, 4] : []);
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var X = b.x + (s.t[i] / o.tMax) * b.w;
        var Y = b.y + b.h - ((s.y[i] - o.yMin) / (o.yMax - o.yMin)) * b.h;
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
    ctx.restore();
    if (o.label) {
      ctx.fillStyle = COL.text;
      ctx.font = MONO;
      ctx.fillText(o.label, b.x + 7, b.y + 14);
    }
  }

  function cutN(len, dt, tCut) {
    var n = Math.floor(tCut / dt) + 1;
    return n > len ? len : n;
  }

  function clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
  }

  /* ==========================================================================
   * 1) Artemis II translunar trajectory - Earth + Moon gravity, RK4.
   *    Same force model as the MATLAB script (planar, circular Moon).
   * ========================================================================*/
  function artemisSim(canvas) {
    var muE = 398600, muM = 4903;
    var rMoon = 384400, rE = 6378;
    var omega = 2 * Math.PI / (27.322 * 86400);
    var vMag = 10.845, leadDeg = 127;      // injection tuned for a free-return flyby
    var h = 120, maxDays = 9;

    // precompute the trajectory (RK4)
    var a0 = -leadDeg * Math.PI / 180;
    var st = [ (rE + 300) * Math.cos(a0), (rE + 300) * Math.sin(a0),
               -vMag * Math.sin(a0), vMag * Math.cos(a0) ];
    function deriv(t, s) {
      var ma = omega * t;
      var mx = rMoon * Math.cos(ma), my = rMoon * Math.sin(ma);
      var re3 = Math.pow(s[0] * s[0] + s[1] * s[1], 1.5);
      var dx = s[0] - mx, dy = s[1] - my;
      var rm3 = Math.pow(dx * dx + dy * dy, 1.5);
      return [ s[2], s[3],
               -muE * s[0] / re3 - muM * dx / rm3,
               -muE * s[1] / re3 - muM * dy / rm3 ];
    }
    var xs = [st[0]], ys = [st[1]], ts = [0];
    var t = 0, minMoon = 1e12, flybyI = 0;
    for (var i = 0; i < (maxDays * 86400) / h; i++) {
      var k1 = deriv(t, st);
      var s2 = st.map(function (v, j) { return v + h / 2 * k1[j]; });
      var k2 = deriv(t + h / 2, s2);
      var s3 = st.map(function (v, j) { return v + h / 2 * k2[j]; });
      var k3 = deriv(t + h / 2, s3);
      var s4 = st.map(function (v, j) { return v + h * k3[j]; });
      var k4 = deriv(t + h, s4);
      st = st.map(function (v, j) { return v + h / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]); });
      t += h;
      xs.push(st[0]); ys.push(st[1]); ts.push(t);
      var ma = omega * t;
      var dm = Math.hypot(st[0] - rMoon * Math.cos(ma), st[1] - rMoon * Math.sin(ma));
      if (dm < minMoon) { minMoon = dm; flybyI = xs.length - 1; }
      if (t > 86400 && Math.hypot(st[0], st[1]) < rE) break;   // re-entry
    }
    var N = xs.length;

    // fit view to the trajectory + the Moon's orbit
    var minX = -rMoon, maxX = rMoon, minY = -rMoon, maxY = rMoon;
    for (var j = 0; j < N; j++) {
      if (xs[j] < minX) minX = xs[j]; if (xs[j] > maxX) maxX = xs[j];
      if (ys[j] < minY) minY = ys[j]; if (ys[j] > maxY) maxY = ys[j];
    }

    var DUR = 14; // seconds of playback per loop
    function draw(ctx, pt, w, h2) {
      clear(ctx, w, h2);
      var pad = 26;
      var sc = Math.min((w - 2 * pad) / (maxX - minX), (h2 - 2 * pad) / (maxY - minY));
      var cx = (w - sc * (minX + maxX)) / 2;
      var cy = (h2 + sc * (minY + maxY)) / 2;
      function PX(x) { return cx + x * sc; }
      function PY(y) { return cy - y * sc; }

      var idx = Math.max(1, Math.round((pt / DUR) * (N - 1)));
      var tNow = ts[idx];

      // Moon orbit
      ctx.strokeStyle = COL.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(PX(0), PY(0), rMoon * sc, 0, 2 * Math.PI);
      ctx.stroke();

      // Earth
      var eg = ctx.createRadialGradient(PX(0), PY(0), 1, PX(0), PY(0), 14);
      eg.addColorStop(0, "rgba(124,156,255,.9)");
      eg.addColorStop(1, "rgba(124,156,255,0)");
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(PX(0), PY(0), 14, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = COL.blue;
      ctx.beginPath(); ctx.arc(PX(0), PY(0), 5, 0, 2 * Math.PI); ctx.fill();

      // Moon at current time
      var ma = omega * tNow;
      var mX = PX(rMoon * Math.cos(ma)), mY = PY(rMoon * Math.sin(ma));
      ctx.fillStyle = "#9aa1ac";
      ctx.beginPath(); ctx.arc(mX, mY, 4, 0, 2 * Math.PI); ctx.fill();

      // trajectory up to the playhead
      ctx.strokeStyle = COL.metal;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(PX(xs[0]), PY(ys[0]));
      for (var i2 = 1; i2 <= idx; i2++) ctx.lineTo(PX(xs[i2]), PY(ys[i2]));
      ctx.stroke();

      // spacecraft
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(PX(xs[idx]), PY(ys[idx]), 3, 0, 2 * Math.PI); ctx.fill();

      // flyby marker once passed
      if (idx >= flybyI) {
        ctx.fillStyle = COL.text;
        ctx.font = MONO;
        ctx.fillText("lunar flyby ~" + Math.round((minMoon - 1737) / 100) / 10 + "k km", PX(xs[flybyI]) + 8, PY(ys[flybyI]) - 6);
      }

      // HUD
      ctx.fillStyle = COL.text;
      ctx.font = MONO;
      var rNow = Math.hypot(xs[idx], ys[idx]);
      ctx.fillText("t = " + (tNow / 86400).toFixed(1) + " d    r = " + Math.round(rNow).toLocaleString() + " km", 12, 18);
      ctx.fillText("Earth", PX(0) + 8, PY(0) + 14);
      ctx.fillText("Moon", mX + 7, mY + 4);
    }
    return makePlayer(canvas, draw, DUR);
  }

  /* ==========================================================================
   * 2) Quadrotor cascaded PID - port of uav_pid_control.m (same gains,
   *    dynamics, disturbances), animated vehicle + response charts.
   * ========================================================================*/
  function uavSim(canvas) {
    var dt = 0.002, tEnd = 12, n = Math.round(tEnd / dt);
    var m = 1.2, g = 9.81;
    var I = [0.015, 0.015, 0.028], tauM = 0.03;
    var G = [[6, 1.2, 2.2], [6, 1.2, 2.2], [3.5, 0.5, 0.8], [8, 2.5, 5]];
    var IL = [0.6, 0.6, 0.4, 4];
    function ref(t) {
      return [0.20 * (t > 1 ? 1 : 0),
              -0.15 * (t > 3 ? 1 : 0),
              (30 * Math.PI / 180) * Math.min(t / 6, 1),
              1.0 * (t > 0.5 ? 1 : 0) + 0.5 * (t > 7 ? 1 : 0)];
    }
    var att = [0, 0, 0], rate = [0, 0, 0], z = 0, zDot = 0, T = m * g;
    var intE = [0, 0, 0, 0], prevE = [0, 0, 0, 0];
    // decimated logs (every 5th step -> 100 Hz)
    var DEC = 5, M = Math.floor(n / DEC);
    var lt = new Float32Array(M), lRoll = new Float32Array(M), lRollR = new Float32Array(M);
    var lZ = new Float32Array(M), lZR = new Float32Array(M);
    for (var k = 0; k < n; k++) {
      var t = k * dt, r = ref(t);
      var meas = [att[0], att[1], att[2], z];
      var aCmd = [0, 0, 0, 0];
      for (var a = 0; a < 4; a++) {
        var e = r[a] - meas[a];
        intE[a] = Math.max(Math.min(intE[a] + e * dt, IL[a]), -IL[a]);
        var de = (e - prevE[a]) / dt;
        prevE[a] = e;
        aCmd[a] = G[a][0] * e + G[a][1] * intE[a] + G[a][2] * de;
      }
      var Mx = I[0] * aCmd[0], My = I[1] * aCmd[1], Mz = I[2] * aCmd[2];
      var Tcmd = m * (g + aCmd[3]) / Math.max(Math.cos(att[0]) * Math.cos(att[1]), 0.5);
      var gust = [0.02 * Math.sin(2 * Math.PI * 0.7 * t) * (t > 4 ? 1 : 0),
                  0.03 * (t > 4 && t < 4.5 ? 1 : 0), 0];
      if (t > 8) Tcmd *= 0.85;
      T += (Tcmd - T) * dt / tauM;
      var p = rate[0], q = rate[1], rr = rate[2];
      var rd = [(Mx + gust[0] + (I[1] - I[2]) * q * rr) / I[0],
                (My + gust[1] + (I[2] - I[0]) * p * rr) / I[1],
                (Mz + gust[2] + (I[0] - I[1]) * p * q) / I[2]];
      for (a = 0; a < 3; a++) { rate[a] += rd[a] * dt; att[a] += rate[a] * dt; }
      var az = (T * Math.cos(att[0]) * Math.cos(att[1]) - m * g) / m;
      zDot += az * dt; z += zDot * dt;
      if (k % DEC === 0) {
        var i = k / DEC;
        lt[i] = t; lRoll[i] = att[0] * 180 / Math.PI; lRollR[i] = r[0] * 180 / Math.PI;
        lZ[i] = z; lZR[i] = r[3];
      }
    }
    var ldt = dt * DEC;

    var DUR = 12; // 1:1 playback
    function draw(ctx, pt, w, h2) {
      clear(ctx, w, h2);
      var idx = Math.min(M - 1, Math.floor(pt / ldt));
      var animH = Math.round(h2 * 0.46);

      // --- animated vehicle (front view): roll + altitude ---
      var railX = 44, railTop = 16, railBot = animH - 12;
      function altY(a) { return railBot - (a / 1.8) * (railBot - railTop); }
      ctx.strokeStyle = COL.axis; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(railX, railTop); ctx.lineTo(railX, railBot); ctx.stroke();
      ctx.fillStyle = COL.text; ctx.font = MONO;
      for (var a2 = 0; a2 <= 1.5; a2 += 0.5) {
        var yy = altY(a2);
        ctx.beginPath(); ctx.moveTo(railX - 4, yy); ctx.lineTo(railX, yy); ctx.stroke();
        ctx.fillText(a2.toFixed(1) + " m", 6, yy + 4);
      }
      // altitude command marker
      var cmdY = altY(lZR[idx]);
      ctx.strokeStyle = COL.ref; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(railX, cmdY); ctx.lineTo(w - 16, cmdY); ctx.stroke();
      ctx.setLineDash([]);

      // quad body
      var qx = railX + (w - railX) / 2, qy = altY(lZ[idx]);
      var roll = lRoll[idx] * Math.PI / 180, arm = Math.min(70, (w - railX) * 0.16);
      ctx.save();
      ctx.translate(qx, qy);
      ctx.rotate(-roll);
      ctx.strokeStyle = COL.metal; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0); ctx.stroke();
      ctx.fillStyle = COL.metal;
      [-arm, arm].forEach(function (ax) {
        ctx.beginPath(); ctx.ellipse(ax, -6, 14, 3.2, 0, 0, 2 * Math.PI); ctx.fill();
        ctx.fillRect(ax - 1.5, -6, 3, 6);
      });
      ctx.beginPath(); ctx.arc(0, 1, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.restore();

      // disturbance annotations
      var tNow = lt[idx];
      ctx.font = MONO;
      if (tNow > 4) {
        ctx.fillStyle = COL.blue;
        ctx.fillText("wind gust", w - 92, railTop + 12);
        var gph = Math.sin(2 * Math.PI * 0.7 * tNow);
        ctx.strokeStyle = COL.blue; ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(w - 92, railTop + 24);
        ctx.quadraticCurveTo(w - 76, railTop + 24 - 5 * gph, w - 60, railTop + 24);
        ctx.stroke();
      }
      if (tNow > 8) {
        ctx.fillStyle = COL.amber;
        ctx.fillText("-15% thrust", w - 92, railTop + 44);
      }

      // --- response charts ---
      var chTop = animH + 8, chH = (h2 - chTop - 14) / 2 - 7;
      drawChart(ctx, { x: railX, y: chTop, w: w - railX - 16, h: chH }, {
        tMax: tEnd, yMin: -8, yMax: 16, label: "roll (deg)",
        series: [
          { t: lt, y: lRollR, color: COL.ref, dash: true, cutN: idx + 1 },
          { t: lt, y: lRoll, color: COL.blue, cutN: idx + 1 },
        ],
      });
      drawChart(ctx, { x: railX, y: chTop + chH + 14, w: w - railX - 16, h: chH }, {
        tMax: tEnd, yMin: -0.1, yMax: 1.9, label: "altitude (m)",
        series: [
          { t: lt, y: lZR, color: COL.ref, dash: true, cutN: idx + 1 },
          { t: lt, y: lZ, color: COL.teal, cutN: idx + 1 },
        ],
      });
      ctx.fillStyle = COL.text;
      ctx.fillText("t = " + tNow.toFixed(1) + " s", w - 76, h2 - 6);
    }
    return makePlayer(canvas, draw, DUR);
  }

  /* ==========================================================================
   * 3) Damped nonlinear pendulum - port of Project_1.m Q2: released near the
   *    inverted equilibrium, ~5% amplitude loss per cycle.
   * ========================================================================*/
  function pendulumSim(canvas) {
    var mP = 1, L = 2, g = 9.81;
    var delta = -Math.log(0.95);
    var zeta = delta / Math.sqrt(4 * Math.PI * Math.PI + delta * delta);
    var wn = Math.sqrt(g / L);
    var b = 2 * zeta * wn * mP * L * L;

    var dt = 0.005, Tf = 30, n = Math.round(Tf / dt);
    var th = Math.PI + 3 * Math.PI / 180, thd = 0;
    function f(s) {
      return [s[1], -(b / (mP * L * L)) * s[1] - (g / L) * Math.sin(s[0])];
    }
    var DEC = 2, M = Math.floor(n / DEC);
    var lt = new Float32Array(M), lth = new Float32Array(M), lwrap = new Float32Array(M);
    for (var k = 0; k < n; k++) {
      var s = [th, thd];
      var k1 = f(s);
      var k2 = f([s[0] + dt / 2 * k1[0], s[1] + dt / 2 * k1[1]]);
      var k3 = f([s[0] + dt / 2 * k2[0], s[1] + dt / 2 * k2[1]]);
      var k4 = f([s[0] + dt * k3[0], s[1] + dt * k3[1]]);
      th += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      thd += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (k % DEC === 0) {
        var i = k / DEC;
        lt[i] = k * dt;
        lth[i] = th;
        var wRad = ((th + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        lwrap[i] = wRad;
      }
    }
    var ldt = dt * DEC;

    var DUR = 15; // 30 s of dynamics in 15 s of playback
    function draw(ctx, pt, w, h2) {
      clear(ctx, w, h2);
      var idx = Math.min(M - 1, Math.floor((pt / DUR) * (M - 1)));

      // --- pendulum animation (left) ---
      var px = Math.round(w * 0.26), py = Math.round(h2 * 0.5);
      var Ls = Math.min(w * 0.2, h2 * 0.34);
      // mount
      ctx.strokeStyle = COL.axis;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px - 16, py); ctx.lineTo(px + 16, py); ctx.stroke();
      // faint trace of the recent bob path
      ctx.strokeStyle = "rgba(124,156,255,.25)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      var back = Math.min(idx, Math.round(1.6 / ldt / (Tf / DUR)));
      for (var j = idx - back; j <= idx; j++) {
        if (j < 0) continue;
        var bx = px + Ls * Math.sin(lth[j]);
        var by = py + Ls * Math.cos(lth[j]);
        if (j === idx - back) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
      }
      ctx.stroke();
      // rod + bob
      var bX = px + Ls * Math.sin(lth[idx]);
      var bY = py + Ls * Math.cos(lth[idx]);
      ctx.strokeStyle = COL.metal;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bX, bY); ctx.stroke();
      ctx.fillStyle = COL.axis;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = COL.blue;
      ctx.beginPath(); ctx.arc(bX, bY, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = COL.text;
      ctx.font = MONO;
      ctx.fillText("released 3° from inverted", 12, h2 - 10);

      // --- theta(t) chart (right) ---
      var chX = Math.round(w * 0.47);
      drawChart(ctx, { x: chX, y: 22, w: w - chX - 14, h: h2 - 56 }, {
        tMax: Tf, yMin: -Math.PI - 0.3, yMax: Math.PI + 0.3, label: "θ (rad), wrapped",
        series: [{ t: lt, y: lwrap, color: COL.teal, cutN: idx + 1 }],
      });
      ctx.fillStyle = COL.text;
      ctx.fillText("t = " + lt[idx].toFixed(1) + " s   ζ = " + zeta.toFixed(4), chX, h2 - 10);
    }
    return makePlayer(canvas, draw, DUR);
  }

  window.CODE_SIMS = {
    artemis: artemisSim,
    "uav-pid": uavSim,
    project1: pendulumSim,
  };
})();
