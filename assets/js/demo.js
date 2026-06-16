/* ============================================================================
 * demo.js - tabbed "Code Showcase".
 *
 * Usage:  <div data-demo-tabs></div>
 * Renders a tab strip; each tab shows a short blurb and a clipped source-code
 * preview that expands into a full-screen modal (shared codeviewer.js).
 *
 * Add a tab by appending to the DEMOS array (point `src` at a file in
 * assets/code/). Requires codeviewer.js to be loaded first.
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
    },
    {
      key: "uav-pid",
      tab: "UAV PID Control",
      title: "uav_pid_control_demo.m",
      lang: "MATLAB · demo",
      blurb: "A multi-axis quadrotor flight-controller demo: cascaded PID on roll, pitch, yaw, and altitude with anti-windup, setpoint tracking, and disturbance rejection (wind-gust torque + thrust loss), integrated in a fixed-step rigid-body simulation loop. Labeled as a demo/template, not flight-tested code.",
      src: "assets/code/uav_pid_control_demo.m",
    },
    {
      key: "project1",
      tab: "Nonlinear Dynamics & ODE Integration",
      title: "Project_1.m",
      lang: "MATLAB",
      blurb: "Numerical-dynamics project: integrates a coupled linear ODE system and a damped nonlinear pendulum about its equilibrium with ode45, sizing the viscous damping from a target logarithmic decrement (~5% amplitude loss per cycle).",
      src: "assets/code/project-1.m",
    },
  ];

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

    function show(i) {
      var d = DEMOS[i];
      panel.innerHTML =
        '<p class="demos__blurb">' + esc(d.blurb) + "</p>" +
        '<div class="demos__view"></div>';
      tabs.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
        t.setAttribute("aria-selected", j === i);
      });
      if (window.mountCodeViewer) {
        window.mountCodeViewer(panel.querySelector(".demos__view"), {
          title: d.title, src: d.src, lang: d.lang, previewLines: 18,
        });
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
