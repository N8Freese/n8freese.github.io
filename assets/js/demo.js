/* ============================================================================
 * demo.js - tabbed "Code Showcase".
 *
 * Usage:  <div data-demo-tabs></div>
 * Renders a tab strip; each tab shows a short blurb, a clipped source-code
 * preview that expands into a full-screen modal (shared codeviewer.js), and a
 * live canvas simulation of what the script computes (sims.js). The sim runs
 * automatically while it is on screen, pauses off-screen, and the Replay
 * button restarts it.
 *
 * Add a tab by appending to the DEMOS array (point `src` at a file in
 * assets/code/ and `key` at an entry in window.CODE_SIMS).
 * Requires codeviewer.js and sims.js to be loaded first.
 * ==========================================================================*/
(function () {
  "use strict";

  var DEMOS = [
    {
      key: "artemis",
      tab: "Artemis II Trajectory",
      title: "HW4_ArtemisII_March_11_Launch.m",
      lang: "MATLAB",
      blurb: "An Artemis II–style translunar trajectory tool: propagates the spacecraft state under Earth, Moon, and Sun gravity (n-body) with tuned injection parameters to target a lunar free-return, the kind of orbital-mechanics analysis used in mission design.",
      src: "assets/code/artemis-ii-trajectory.m",
      simCaption: "Live: the same RK4 propagation running in your browser — translunar injection, lunar flyby, free return.",
    },
    {
      key: "uav-pid",
      tab: "UAV PID Control",
      title: "uav_pid_control.m",
      lang: "MATLAB",
      blurb: "A multi-axis quadrotor flight controller: cascaded PID on roll, pitch, yaw, and altitude with anti-windup, setpoint tracking, and disturbance rejection (wind-gust torque + thrust loss), integrated in a fixed-step rigid-body simulation loop.",
      src: "assets/code/uav_pid_control.m",
      simCaption: "Live: the closed-loop response — the quad tracks roll and altitude commands through a gust and a 15% thrust loss.",
    },
    {
      key: "project1",
      tab: "Nonlinear Dynamics & ODE Integration",
      title: "Project_1.m",
      lang: "MATLAB",
      blurb: "Numerical-dynamics project: integrates a coupled linear ODE system and a damped nonlinear pendulum about its equilibrium with ode45, sizing the viscous damping from a target logarithmic decrement (~5% amplitude loss per cycle).",
      src: "assets/code/project-1.m",
      simCaption: "Live: the damped nonlinear pendulum released 3° from inverted, with the wrapped θ(t) response.",
    },
  ];

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-demo-tabs]").forEach(mountTabs);

  function mountTabs(host) {
    host.className = (host.className + " demos").trim();
    var tabsHtml = DEMOS.map(function (d, i) {
      return '<button class="demos__tab' + (i === 0 ? " is-active" : "") +
        '" type="button" role="tab" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        esc(d.tab) + "</button>";
    }).join("");

    host.innerHTML =
      '<div class="demos__tabs" role="tablist" aria-label="Code showcase">' + tabsHtml + "</div>" +
      '<div class="demos__panel"></div>';

    var panel = host.querySelector(".demos__panel");
    var tabs = [].slice.call(host.querySelectorAll(".demos__tab"));
    var activeSim = null;
    var simObserver = null;

    function teardownSim() {
      if (activeSim) { activeSim.stop(); activeSim = null; }
      if (simObserver) { simObserver.disconnect(); simObserver = null; }
    }

    function show(i) {
      teardownSim();
      var d = DEMOS[i];
      panel.innerHTML =
        '<p class="demos__blurb">' + esc(d.blurb) + "</p>" +
        '<div class="demos__split">' +
          '<div class="demos__view"></div>' +
          '<div class="demos__run">' +
            '<div class="demo__bar"><span class="codeview__name">live simulation</span>' +
              '<button type="button" class="demo__btn demos__replay">Replay</button></div>' +
            '<canvas class="demos__canvas" aria-label="Live simulation of ' + esc(d.title) + '"></canvas>' +
            '<p class="demos__cap">' + esc(d.simCaption || "") + "</p>" +
          "</div>" +
        "</div>";
      tabs.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
        t.setAttribute("aria-selected", j === i);
      });
      if (window.mountCodeViewer) {
        window.mountCodeViewer(panel.querySelector(".demos__view"), {
          title: d.title, src: d.src, lang: d.lang, previewLines: 18,
        });
      }

      var canvas = panel.querySelector(".demos__canvas");
      var factory = window.CODE_SIMS && window.CODE_SIMS[d.key];
      if (canvas && factory) {
        activeSim = factory(canvas);
        var replay = panel.querySelector(".demos__replay");
        if (replay) replay.addEventListener("click", function () { activeSim.restart(); });
        if (reduceMotion) {
          // no auto-play: render the completed result; Replay animates on demand
          requestAnimationFrame(function () { activeSim.drawFinal(); });
        } else {
          simObserver = new IntersectionObserver(function (es) {
            if (!activeSim) return;
            if (es[0].isIntersecting) activeSim.start(); else activeSim.stop();
          }, { threshold: 0.15 });
          simObserver.observe(canvas);
        }
      }
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { show(+t.getAttribute("data-i")); });
    });

    show(0);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }
})();
