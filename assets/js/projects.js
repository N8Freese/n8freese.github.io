/* ============================================================================
 * projects.js - Single source of truth for all portfolio projects.
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
 *   approach    array of bullet strings - the engineering process
 *   tools       array of tools/methods used
 *   results     array of bullet strings - outcomes (quantified where possible)
 *   learned     "What I learned" paragraph
 *   gallery     array of { src, caption } image slots for the detail page
 *   needs       array of strings: assets still needed from you (shown as a note)
 * ==========================================================================*/

window.PROJECTS = [
  {
    id: "lunar-mission",
    order: 3,
    title: "Crewed Lunar Mission: Preliminary Design",
    category: "Project & Systems Lead · ERAU",
    tagline:
      "Led a 6-person team designing a crewed two-stage LOX/CH₄ lunar vehicle, launch through splashdown.",
    period: "Jan 2026 – May 2026",
    role: "Project & Systems Lead",
    tags: ["Fusion", "MATLAB", "NASA CEA", "CATIA V5", "Trade Studies"],
    featured: true,
    thumb: "assets/img/lunar-mission-cover.png",
    accent: "#7c5cff",
    demo: "",
    model: "assets/rocket/full-launch-vehicle.glb",
    links: [],
    problem:
      "Design a crewed two-stage launch vehicle capable of delivering a crew to the lunar surface and returning them safely, covering every phase from launch through splashdown, while meeting a fixed set of mission requirements.",
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
    code: {
      title: "test2.m",
      src: "assets/code/test2.m",
      lang: "MATLAB",
      caption: "Staging / ΔV budget summary: two-stage LOX/CH₄ vehicle sizing (MATLAB).",
    },
    // PDR document button (drop the PDF at assets/AE441-PDR.pdf to activate the link)
    pdr: {
      label: "Preliminary Design Review (PDF)",
      src: "assets/AE441-PDR.pdf",
      blurb: "Full Preliminary Design Review covering the vehicle architecture, staging, propulsion, and subsystem trades.",
    },
    gallery: [
      { src: "assets/img/lunar-engine.png", caption: "Engine assembly detail" },
    ],
    needs: [
      "Optional: a high-res CAD render/screenshot for the card & gallery - .png",
      "Optional: any sizing/trade-study plots from MATLAB - .png",
    ],
  },

  {
    id: "nasa-jsc-viz",
    order: 4,
    title: "NASA JSC Mission Visualization Tools",
    category: "KBR & LZ Technology · NASA Johnson Space Center",
    tagline:
      "Python/PyQt5 tools visualizing antenna blockage, tracking, and Orion/Starliner sims with live telemetry overlays.",
    period: "Jan 2025 – Aug 2025",
    role: "Engineering Technician I",
    tags: ["Python", "PyQt5", "Telemetry", "Linux", "GitLab", "Optimization"],
    featured: true,
    thumb: "assets/img/logos/nasa.svg",
    thumbStyle: "logo",
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
      "Working alongside flight operations taught me to optimize for the user under real-time constraints, and that a measured 13–21× speedup comes from profiling first, then targeting the true bottleneck, not from guessing.",
    gallery: [],
    needs: [],
  },

  {
    id: "mayott-uav",
    order: 2,
    title: "Mayott Aerospace: Heavy-Lift UAV",
    category: "CAD & Software Engineer · Mayott Aerospace",
    tagline:
      "Frame CAD optimized for weight & structural efficiency, plus flight software written in Rust for memory safety and real-time performance.",
    period: "Apr 2026 – Present",
    role: "CAD & Software Engineer",
    tags: ["Fusion 360", "Rust", "Structural design", "Embedded", "Real-time"],
    featured: true,
    thumb: "assets/img/mayott-cover.jpg",
    accent: "#22c3a6",
    demo: "",
    links: [
      { label: "Project overview (Prezi)", href: "https://prezi.com/view/GMI03G0bwPB44Vn5zlHD/?referral_token=o2aFxklnB3FN" },
    ],
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
      "Owning both the CAD and the flight software shows how tightly mechanical and software constraints couple on a real airframe, and why Rust's guarantees are attractive for safety-critical real-time control.",
    gallery: [
      { src: "assets/img/mayott-uav.jpg", caption: "Heavy-lift UAV frame (Fusion 360 render)" },
    ],
    needs: [],
  },

  {
    id: "collins-avionics",
    order: 1,
    title: "Avionics Test Automation",
    category: "System Engineering Intern · Collins Aerospace",
    tagline:
      "Python automation for transponder testing and verification documentation for next-gen avionics systems.",
    period: "May 2026 – Present",
    role: "System Engineering Intern",
    tags: ["Python", "Automation", "Verification", "JIRA", "Avionics"],
    featured: false,
    thumb: "assets/img/logos/collins.svg",
    thumbStyle: "logo",
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
      "Verification work shows how much of real avionics engineering is rigorous, traceable documentation, and how automation pays off across a long test campaign.",
    gallery: [],
    needs: [],
  },

  {
    id: "artemis-rocket",
    order: 5,
    title: "ERFSEDS Artemis Rocket",
    category: "Manufacturing Member · ERAU",
    tagline:
      "Scaled-down Artemis rocket: 3-D models in CATIA V5 / SolidWorks and OpenRocket flight optimization with a 15-student team.",
    period: "Aug 2024 – Jan 2025",
    role: "Manufacturing Member",
    tags: ["CATIA V5", "SolidWorks", "OpenRocket", "Manufacturing"],
    featured: false,
    thumb: "assets/img/artemis-cover.png",
    accent: "#ff8a4d",
    demo: "",
    model: "assets/rocket/artemis.glb",
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
    needs: ["Photo or CAD render of the rocket - .jpg / .png"],
  },

  {
    id: "spectre-rocket",
    order: 6,
    title: "ERPL Spectre Rocket",
    category: "Hardware Member · ERAU",
    tagline:
      "Active-stabilization high-powered rocket: structural components, Fusion 360 design, and MATLAB test-data analysis.",
    period: "Aug 2022 – May 2024",
    role: "Hardware Member",
    tags: ["Fusion 360", "MATLAB", "Hardware", "Data analysis"],
    featured: false,
    thumb: "assets/img/spectre-cover.png",
    thumbFit: "contain",
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
      "My first hands-on rocketry team: it grounded my analysis work in the reality of building, testing, and iterating on physical hardware.",
    gallery: [],
    needs: ["3 web-ready CAD models (Spectre Mk1 Full Assy, SM_Current, Canard) - need decimated .glb/.gltf ≤ ~5 MB each (current files are STEP, 30–53 MB)"],
  },

  /* ----- Coursework projects (kept as additional entries) ----------------- */

  {
    id: "nastran-fea",
    order: 7,
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
      "Built the model with GRID, CBEAM/PBEAM, and MAT1 bulk-data cards, applying loads with FORCE/MOMENT.",
      "Constrained all six rigid-body DOF with SPC1 and confirmed a clean (non-singular) solution.",
      "Ran a SOL 101 linear static analysis and recovered CBEAM forces (axial, shear, bending, torsion) and stresses at recovery points C/D/E/F.",
      "Post-processed nodal displacements and constraint (reaction) forces.",
    ],
    tools: ["NASTRAN", "Femap", "CBEAM/PBEAM", "SPC1", "SOL 101"],
    results: [
      "Recovered nodal displacements, CBEAM internal forces/stresses, and constraint reactions for the loaded structure.",
      "Cross-checked FEA results against analytical beam theory to verify the model.",
    ],
    learned: "Connected hand-calculation beam theory to a proper FEA workflow and result interpretation.",
    gallery: [{ src: "assets/img/nastran.png", caption: "Displacement contour / FEA result" }],
    needs: ["FEA result image - .png"],
  },

  {
    id: "earth-moon-relay",
    order: 8,
    title: "Earth–Moon Relay Pathfinder",
    category: "AE 429 · Coursework",
    tagline: "Space-environment analysis and test plan for a lunar communications relay pathfinder mission.",
    period: "Coursework",
    role: "Coursework",
    tags: ["Space environment", "Mission analysis", "Test planning"],
    featured: false,
    thumb: "assets/img/moon-relay-cover.svg",
    accent: "#7c5cff",
    demo: "",
    links: [],
    problem:
      "Assess the space-environment effects on an Earth–Moon relay pathfinder and define an appropriate environmental test plan.",
    approach: [
      "Characterized the cislunar radiation environment: Van Allen belt crossings during trans-lunar injection, solar energetic particles, and deep-space galactic cosmic rays, distinguishing TID, single-event effects, and displacement damage.",
      "Estimated aluminum-equivalent shielding and dose, and analyzed thermal eclipse cycling and micrometeorite flux for the trajectory.",
      "Mapped each environment to a standard qualification test and rationale to build the test plan.",
    ],
    tools: ["Radiation analysis (TID / SEE)", "Aluminum-equivalent shielding", "Thermal & micrometeorite analysis", "Environmental test planning"],
    results: [
      "Delivered an environmental analysis and a traceable test plan for the relay pathfinder concept.",
      "Tied each dominant environment to its driving design and qualification requirement.",
    ],
    learned: "Learned how the space environment drives qualification and test requirements early in design.",
    pdr: {
      label: "Read the full report (PDF)",
      src: "assets/earth-moon-relay.pdf",
      blurb: "Full space-environment analysis and qualification test plan for the Earth–Moon relay pathfinder.",
    },
    gallery: [],
    needs: [],
  },
];
