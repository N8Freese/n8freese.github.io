/* ============================================================================
 * demo.js - tabbed "Code Showcase".
 *
 * Usage:  <div data-demo-tabs></div>
 * Renders a tab strip; each tab shows a short blurb, a clipped source-code
 * preview that expands into a full-screen modal (shared codeviewer.js), and a
 * live canvas playback of what the script computes (sims.js). The sim runs
 * while it is on screen, pauses off-screen, and the Replay button restarts it.
 *
 * Add a tab by appending to the DEMOS array (point `src` at a file in
 * assets/code/ and `key` at an entry in window.CODE_SIMS).
 * Requires codeviewer.js and sims.js (and cope-data.js) to be loaded first.
 * ==========================================================================*/
(function () {
  "use strict";

  var DEMOS = [
    {
      key: "ffsc",
      tab: "FFSC engine cycle",
      title: "AE451_Stage1_FFSC_with_regen_FIXED.m",
      lang: "MATLAB",
      blurb: "The Stage 1 full-flow staged-combustion cycle balance from our CDR: CEA chamber properties, pump work from the cycle pressures, the regenerative jacket coupled into the methane path, and the fuel-rich and ox-rich preburner pressures solved so each turbine carries 10% more power than its pump.",
      src: "assets/code/cope-stage1-ffsc-cycle.m",
      simCaption: "Live: the pressure cascade the script solves, station by station, from the pump inlets to the 25.5 MPa chamber. Amber is the methane path, blue is LOX, red is preburner gas.",
    },
    {
      key: "regen",
      tab: "Regenerative cooling",
      title: "regen_cooling_CDR.m",
      lang: "MATLAB",
      blurb: "Thermal analysis of the GRCop-42 chamber liner: Bartz gas-side heat transfer, conduction through the 0.28 mm hot wall, Dittus-Boelter on the methane side, and the three parallel cooling branches marched along the contour with a CoolProp methane table. The output set the 1000 K wall limit margin and the jacket pressure drop that feeds the cycle balance.",
      src: "assets/code/cope-regen-cooling.m",
      simCaption: "Live: hot-wall temperature and heat flux swept along the real Stage 1 contour, from the data this script wrote. Peak 797 K and 144 MW/m² at the throat.",
    },
    {
      key: "ascent",
      tab: "Ascent & max-q",
      title: "Detail_Ascent.m",
      lang: "MATLAB",
      blurb: "Planar gravity-turn ascent of the full stack: US-76 atmosphere, Mach-dependent drag, a 4 g throttle schedule, and a shooting solver on the kick angle and Stage 2 linear-tangent steering to hit a 200 km circular orbit. Its max-q point sized the thrust-vector-control actuators.",
      src: "assets/code/cope-ascent.m",
      simCaption: "Live: the trajectory this script produced. Max-q of 35 kPa at 61.6 s and Mach 1.45, staging at 150.6 s, orbit at 305.7 s.",
    },
    {
      key: "artemis",
      tab: "Artemis II trajectory",
      title: "HW4_ArtemisII_March_11_Launch.m",
      lang: "MATLAB",
      blurb: "An Artemis II-style translunar trajectory tool: propagates the spacecraft under Earth, Moon, and Sun gravity with tuned injection parameters to target a lunar free return. Written for the preliminary-design semester to set the mission profile.",
      src: "assets/code/artemis-ii-trajectory.m",
      simCaption: "Live: the same RK4 propagation running in your browser. Translunar injection, lunar flyby, free return.",
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
            '<div class="demo__bar"><span class="dots"><i></i><i></i><i></i></span><span class="codeview__name">live playback</span>' +
              '<button type="button" class="demo__btn demos__replay">Replay</button></div>' +
            '<canvas class="demos__canvas" aria-label="Live playback of ' + esc(d.title) + '"></canvas>' +
            '<p class="demos__cap">' + esc(d.simCaption || "") + "</p>" +
          "</div>" +
        "</div>";
      tabs.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
        t.setAttribute("aria-selected", j === i);
      });
      if (window.mountCodeViewer) {
        window.mountCodeViewer(panel.querySelector(".demos__view"), {
          title: d.title, src: d.src, lang: d.lang, previewLines: 20,
        });
      }

      var canvas = panel.querySelector(".demos__canvas");
      var factory = window.CODE_SIMS && window.CODE_SIMS[d.key];
      if (canvas && factory) {
        activeSim = factory(canvas);
        var replay = panel.querySelector(".demos__replay");
        if (replay) replay.addEventListener("click", function () { activeSim.restart(); });
        if (reduceMotion) {
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
