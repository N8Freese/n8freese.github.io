/* ============================================================================
 * projects.js — Single source of truth for all portfolio projects.
 *
 * Add or edit a project HERE and it automatically appears as:
 *   1) a card on index.html (#projects)
 *   2) a full case-study page at project.html?id=<id>
 *
 * Field guide (all optional except id + title):
 *   id          unique slug (used in the URL: project.html?id=lunar-mission)
 *   title       project name
 *   category    short label shown above the title (team / course / employer)
 *   tagline     one-line summary shown on the card
 *   period      dates, e.g. "Jan 2026 – May 2026"
 *   role        your role on the project
 *   tags        array of short tech tags (CATIA, MATLAB, Rust, ...)
 *   featured    true = larger card, shown first
 *   thumb       card image path (assets/img/...). Leave "" for a styled placeholder.
 *   accent      optional hex to tint the card/detail header
 *   demo        optional id of an interactive demo to embed (see demo.js): "orbit"
 *   model       optional GLB path for an embedded 3D viewer on the detail page
 *   links       array of { label, href }
 *   problem     "The problem / objective" paragraph
 *   approach    array of bullet strings — the engineering process
 *   tools       array of tools/methods used
 *   results     array of bullet strings — outcomes (quantified where possible)
 *   learned     "What I learned" paragraph
 *   gallery     array of { src, caption } image slots for the detail page
 *   needs       array of strings: assets still needed from you (shown as a note)
 * ==========================================================================*/

window.PROJECTS = [
  {
    id: "lunar-mission",
    title: "Crewed Lunar Mission — Preliminary Design",
    category: "Project & Systems Lead · ERAU",
    tagline:
      "Led a 6-person team designing a crewed two-stage LOX/CH₄ lunar vehicle, launch through splashdown.",
    period: "Jan 2026 – May 2026",
    role: "Project & Systems Lead",
    tags: ["Systems", "MATLAB", "NASA CEA", "CATIA V5", "Fusion 360", "Trade Studies"],
    featured: true,
    thumb: "assets/img/lunar-mission.jpg",
    accent: "#7c5cff",
    demo: "orbit",
    model: "assets/rocket/full-launch-vehicle.glb",
    links: [],
    problem:
      "Design a crewed two-stage launch vehicle capable of delivering a crew to the lunar surface and returning them safely — covering every phase from launch through splashdown — while meeting a fixed set of mission requirements.",
    approach: [
      "Led a 6-person team and owned the systems-engineering loop: requirements flow-down, interface definition, and integration across all subsystems.",
      "Performed vehicle sizing and mass budgeting in MATLAB, iterating the rocket equation across stages and propellant fractions.",
      "Ran LOX/CH₄ combustion and performance analysis in NASA CEA to inform engine sizing and Isp assumptions.",
      "Drove trade studies across propulsion, structures, GNC, and thermal to converge on a balanced design.",
      "Modeled the full launch-vehicle assembly in CATIA V5 and Fusion 360, producing a detailed parts breakdown.",
    ],
    tools: ["MATLAB", "NASA CEA", "CATIA V5", "Fusion 360", "Systems engineering / trade studies"],
    results: [
      "Converged on a feasible two-stage LOX/CH₄ architecture meeting mission requirements end-to-end.",
      "Delivered a full CAD assembly and parts breakdown for the integrated vehicle.",
      "Coordinated subsystem trades into a single, traceable preliminary design.",
    ],
    learned:
      "Leading the systems integration taught me how to balance competing subsystem demands against a fixed requirements set, and how disciplined mass and ΔV budgeting drives nearly every downstream design decision.",
    gallery: [
      { src: "assets/img/lunar-mission.jpg", caption: "Integrated launch-vehicle CAD assembly (CATIA V5)" },
      { src: "assets/img/lunar-staging.png", caption: "Staging / ΔV budget summary" },
    ],
    needs: [
      "CAD render or screenshot of the full vehicle assembly — .png",
      "Any sizing/trade-study plots from MATLAB — .png",
      "The CATIA assembly exported as .glb (or .step/.stl for me to convert) for the 3D viewer",
    ],
  },

  {
    id: "nasa-jsc-viz",
    title: "NASA JSC Mission Visualization Tools",
    category: "KBR & LZ Technology · NASA Johnson Space Center",
    tagline:
      "Python/PyQt5 tools visualizing antenna blockage, tracking, and Orion/Starliner sims with live telemetry overlays.",
    period: "Jan 2025 – Aug 2025",
    role: "Engineering Technician I",
    tags: ["Python", "PyQt5", "Telemetry", "Linux", "GitLab", "Optimization"],
    featured: true,
    thumb: "assets/img/nasa-jsc.jpg",
    accent: "#4d8dff",
    demo: "",
    links: [],
    problem:
      "Flight controllers and trainers needed clear, real-time visualization of antenna blockage, vehicle tracking, and spacecraft state for Orion, Starliner, and Gateway during simulated missions and controller training.",
    approach: [
      "Built desktop visualization tools in Python with PyQt5, overlaying live telemetry onto tracking and blockage displays.",
      "Led development of the Starliner visualization tool, integrating telemetry overlays used in operational workflows.",
      "Profiled and re-architected the Gateway visualization tool to eliminate rendering and data-handling bottlenecks.",
      "Developed and debugged in a Linux environment using Spyder and VS Code, with GitLab for version control.",
    ],
    tools: ["Python", "PyQt5", "Linux", "Spyder / VS Code", "GitLab"],
    results: [
      "Achieved a 13× overall performance boost and 21× faster graphics rendering on the Gateway tool.",
      "Delivered a Starliner visualization tool with integrated telemetry overlays used in operational workflows.",
      "Supported controller training and simulated missions with live telemetry overlays.",
    ],
    learned:
      "Working alongside flight operations taught me to optimize for the user under real-time constraints — and that a measured 13–21× speedup comes from profiling first, then targeting the true bottleneck, not from guessing.",
    gallery: [
      { src: "assets/img/nasa-jsc.jpg", caption: "Telemetry overlay visualization (screenshot)" },
    ],
    needs: [
      "Screenshot(s) of the visualization tools (cleared for public sharing) — .png",
      "Confirmation of anything that must stay NDA / not shown publicly",
    ],
  },

  {
    id: "mayott-uav",
    title: "Mayott Aerospace — Heavy-Lift UAV",
    category: "CAD & Software Engineer · Mayott Aerospace",
    tagline:
      "Frame CAD optimized for weight & structural efficiency, plus flight software written in Rust for memory safety and real-time performance.",
    period: "Apr 2026 – Present",
    role: "CAD & Software Engineer",
    tags: ["Fusion 360", "Rust", "Structural design", "Embedded", "Real-time"],
    featured: true,
    thumb: "assets/img/mayott-uav.jpg",
    accent: "#22c3a6",
    demo: "",
    links: [],
    problem:
      "Develop a heavy-lift UAV with a frame that is light yet structurally efficient, supported by flight software that is both memory-safe and capable of real-time performance.",
    approach: [
      "Modeling heavy-lift UAV frame components in Fusion 360, optimizing geometry for weight and structural efficiency.",
      "Developing flight software in Rust, targeting memory safety and deterministic real-time behavior.",
      "Bridging the mechanical and software sides of the airframe as a single integrated design.",
    ],
    tools: ["Fusion 360", "Rust", "Structural optimization"],
    results: [
      "Frame components modeled and iterated for a favorable strength-to-weight balance.",
      "Flight software under active development in Rust for safety-critical, real-time operation.",
    ],
    learned:
      "Owning both the CAD and the flight software shows how tightly mechanical and software constraints couple on a real airframe — and why Rust's guarantees are attractive for safety-critical real-time control.",
    gallery: [
      { src: "assets/img/mayott-uav.jpg", caption: "Heavy-lift UAV frame (Fusion 360 render)" },
    ],
    needs: [
      "UAV frame CAD render or photo — .png / .jpg",
      "Optional: a public GitHub link to the Rust flight software (if shareable) — URL",
    ],
  },

  {
    id: "collins-avionics",
    title: "Avionics Test Automation",
    category: "System Engineering Intern · Collins Aerospace",
    tagline:
      "Python automation for transponder testing and verification documentation for next-gen avionics systems.",
    period: "May 2026 – Present",
    role: "System Engineering Intern",
    tags: ["Python", "Automation", "Verification", "JIRA", "Avionics"],
    featured: false,
    thumb: "assets/img/collins.jpg",
    accent: "#4d8dff",
    demo: "",
    links: [],
    problem:
      "Improve the efficiency and traceability of transponder testing for next-generation avionics systems.",
    approach: [
      "Developing Python automation scripts to support transponder testing simulations and improve testing efficiency.",
      "Creating and updating system test procedures, test plans, and JIRA documentation for verification.",
    ],
    tools: ["Python", "JIRA", "Systems test procedures"],
    results: [
      "Automation scripts supporting transponder test simulations and improved testing throughput.",
      "Maintained verification artifacts (procedures, test plans, JIRA) for next-gen avionics.",
    ],
    learned:
      "Verification work shows how much of real avionics engineering is rigorous, traceable documentation — and how automation pays off across a long test campaign.",
    gallery: [],
    needs: ["Any shareable screenshot or diagram (cleared for public use) — .png"],
  },

  {
    id: "artemis-rocket",
    title: "ERFSEDS Artemis Rocket",
    category: "Manufacturing Member · ERAU",
    tagline:
      "Scaled-down Artemis rocket: 3-D models in CATIA V5 / SolidWorks and OpenRocket flight optimization with a 15-student team.",
    period: "Aug 2024 – Jan 2025",
    role: "Manufacturing Member",
    tags: ["CATIA V5", "SolidWorks", "OpenRocket", "Manufacturing"],
    featured: false,
    thumb: "assets/img/artemis.jpg",
    accent: "#ff8a4d",
    demo: "",
    links: [],
    problem:
      "Build a scaled-down version of the Artemis rocket with sound aerodynamics, stability, and structural integrity as part of a large student team.",
    approach: [
      "Developed 3-D models of the scaled Artemis rocket in CATIA V5 and SolidWorks.",
      "Ran OpenRocket simulations to optimize trajectory, stability, and flight parameters.",
      "Collaborated with a 15-student team to integrate design modifications and ensure structural integrity.",
    ],
    tools: ["CATIA V5", "SolidWorks", "OpenRocket"],
    results: [
      "Delivered 3-D models supporting manufacturing and integration.",
      "Tuned trajectory and stability parameters through simulation.",
    ],
    learned:
      "Working within a 15-person build team taught me how design changes ripple through manufacturing and integration, and the value of simulation before you cut hardware.",
    gallery: [{ src: "assets/img/artemis.jpg", caption: "Artemis rocket CAD / build photo" }],
    needs: ["Photo or CAD render of the rocket — .jpg / .png"],
  },

  {
    id: "spectre-rocket",
    title: "ERPL Spectre Rocket",
    category: "Hardware Member · ERAU",
    tagline:
      "Active-stabilization high-powered rocket: structural components, Fusion 360 design, and MATLAB test-data analysis.",
    period: "Aug 2022 – May 2024",
    role: "Hardware Member",
    tags: ["Fusion 360", "MATLAB", "Hardware", "Data analysis"],
    featured: false,
    thumb: "assets/img/spectre.jpg",
    accent: "#ff8a4d",
    demo: "",
    links: [],
    problem:
      "Contribute to the structure of an active-stabilization high-powered rocket and use flight/test data to drive continuous design improvement.",
    approach: [
      "Built structural components of the rocket as part of a 10-student team.",
      "Used Fusion 360 to refine the design and minimize aerodynamic forces.",
      "Analyzed and documented test data in MATLAB to drive iterative improvements.",
    ],
    tools: ["Fusion 360", "MATLAB", "Hand assembly / soldering"],
    results: [
      "Delivered structural hardware for an active-stabilization high-powered rocket.",
      "Closed the loop from test data back into design via MATLAB analysis.",
    ],
    learned:
      "My first hands-on rocketry team — it grounded my analysis work in the reality of building, testing, and iterating on physical hardware.",
    gallery: [{ src: "assets/img/spectre.jpg", caption: "Spectre rocket hardware / test photo" }],
    needs: ["Photo of the rocket or test setup — .jpg / .png"],
  },

  /* ----- Coursework projects (kept as additional entries) ----------------- */

  {
    id: "attitude-dynamics",
    title: "Spacecraft Attitude Dynamics Simulation",
    category: "AE 426 · Coursework",
    tagline:
      "Rigid-body attitude propagation (torque & torque-free) using Euler's equations and quaternion kinematics in MATLAB.",
    period: "Coursework",
    role: "Coursework",
    tags: ["MATLAB", "ode45", "Quaternions", "Dynamics"],
    featured: false,
    thumb: "assets/img/attitude-sim.png",
    accent: "#4d8dff",
    demo: "orbit",
    links: [],
    problem:
      "Simulate the rotational motion of a rigid spacecraft under both torque-free and applied-torque conditions, tracking attitude through quaternion kinematics.",
    approach: [
      "Implemented Euler's rotational equations of motion in MATLAB.",
      "Propagated angular velocity and quaternion attitude with ode45.",
      "Examined precession and nutation behavior across inertia configurations.",
    ],
    tools: ["MATLAB", "Euler's equations", "ode45", "Quaternion kinematics"],
    results: [
      "Produced angular-velocity and quaternion histories for torque-free and torqued cases.",
      "Visualized precession/nutation consistent with rigid-body theory.",
    ],
    learned:
      "Reinforced how quaternions avoid gimbal-lock singularities and how inertia distribution governs spin stability.",
    gallery: [{ src: "assets/img/attitude-sim.png", caption: "Angular velocity / quaternion histories" }],
    needs: ["MATLAB result plots — .png"],
  },

  {
    id: "nastran-fea",
    title: "NASTRAN Structural Analysis",
    category: "AE 318 · Coursework",
    tagline: "Finite-element structural model using CBEAM/PBEAM elements and a SOL 101 linear static solution.",
    period: "Coursework",
    role: "Coursework",
    tags: ["NASTRAN", "FEA", "Femap", "Structures"],
    featured: false,
    thumb: "assets/img/nastran.png",
    accent: "#22c3a6",
    demo: "",
    links: [],
    problem:
      "Model a structure with beam finite elements and solve for displacements and reaction forces under static loading.",
    approach: [
      "Built the beam model with CBEAM/PBEAM element and property cards.",
      "Ran a SOL 101 linear static analysis.",
      "Post-processed displacements and constraint (reaction) forces.",
    ],
    tools: ["NASTRAN", "Femap", "CBEAM/PBEAM", "SOL 101"],
    results: ["Recovered nodal displacements and constraint forces for the loaded structure."],
    learned: "Connected hand-calculation beam theory to a proper FEA workflow and result interpretation.",
    gallery: [{ src: "assets/img/nastran.png", caption: "Displacement contour / FEA result" }],
    needs: ["FEA result image — .png"],
  },

  {
    id: "naca-airfoil",
    title: "NACA 2414 Airfoil — Numerical & Wind Tunnel",
    category: "AE 314 / 315 · Coursework",
    tagline: "Compared numerical aerodynamic predictions against wind-tunnel measurements for a NACA 2414 airfoil.",
    period: "Coursework",
    role: "Coursework",
    tags: ["Aerodynamics", "Wind tunnel", "Cl/Cd/Cp", "DAQ"],
    featured: false,
    thumb: "assets/img/airfoil.jpg",
    accent: "#4d8dff",
    demo: "",
    links: [],
    problem:
      "Characterize the lift, drag, and pressure distribution of a NACA 2414 airfoil and validate numerical predictions experimentally.",
    approach: [
      "Computed Cl, Cd, and Cp distributions numerically.",
      "Ran wind-tunnel tests with pressure-tap data acquisition.",
      "Compared numerical vs. experimental results and discussed discrepancies.",
    ],
    tools: ["Wind-tunnel testing", "Data acquisition", "Cl / Cd / Cp analysis"],
    results: ["Quantified lift/drag behavior and validated numerical predictions against tunnel data."],
    learned: "Saw firsthand where idealized aerodynamic models diverge from measured reality.",
    gallery: [{ src: "assets/img/airfoil.jpg", caption: "Airfoil model in the wind tunnel / Cp plot" }],
    needs: ["Wind-tunnel photo or Cp/Cl/Cd plot — .jpg / .png"],
  },

  {
    id: "earth-moon-relay",
    title: "Earth–Moon Relay Pathfinder",
    category: "AE 429 · Coursework",
    tagline: "Space-environment analysis and test plan for a lunar communications relay pathfinder mission.",
    period: "Coursework",
    role: "Coursework",
    tags: ["Space environment", "Mission analysis", "Test planning"],
    featured: false,
    thumb: "assets/img/earth-moon-relay.jpg",
    accent: "#7c5cff",
    demo: "",
    links: [],
    problem:
      "Assess the space-environment effects on an Earth–Moon relay pathfinder and define an appropriate environmental test plan.",
    approach: [
      "Analyzed radiation, thermal, and orbital environment factors for the mission.",
      "Defined an environmental test plan to qualify the spacecraft.",
    ],
    tools: ["Space-environment analysis", "Environmental test planning"],
    results: ["Delivered an environmental analysis and test plan for the relay pathfinder concept."],
    learned: "Learned how the space environment drives qualification and test requirements early in design.",
    gallery: [{ src: "assets/img/earth-moon-relay.jpg", caption: "Mission / environment diagram" }],
    needs: ["Mission diagram or analysis figure — .png"],
  },
];
