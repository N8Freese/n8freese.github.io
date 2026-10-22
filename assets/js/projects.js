/* ============================================================================
 * projects.js - Single source of truth for all portfolio projects.
 *
 * Add or edit a project HERE and it automatically appears as:
 *   1) a card on index.html (#projects)
 *   2) a full case-study page at project.html?id=<id>
 *
 * Field guide (all optional except id + title):
 *   id          unique slug (used in the URL: project.html?id=lunar-mission)
 *   aliases     former ids; old links redirect to the current id
 *   order       card order on the homepage (ascending)
 *   hidden      true = kept in this file but not shown anywhere
 *   title       project name
 *   category    short label shown above the title (role · team / employer)
 *   tagline     one-line summary shown on the card and as the page lead
 *   period      dates, e.g. "Jan 2026 – Present"
 *   role        your role on the project
 *   tags        array of short tech tags
 *   thumb       card image path. thumbStyle:"logo" centres a logo on white.
 *   stats       [{ n:"19.5", u:"km/s", l:"Mission ΔV" }] tiles under the lead
 *   links       array of { label, href }
 *
 *   Two ways to write the body:
 *   a) template:  problem / approach[] / tools[] / results[]
 *   b) sections:  ordered [{ title, text[], bullets[], table, code, note, gallery[] }]
 *      table: { head:[...], rows:[[...], ...] }   (ok:true cells render green)
 *      (tools[] still renders after the sections)
 *
 *   gallery items: { src, caption, fit:"contain", wide:true, dark:true }
 *                  { model, caption, feature:true }   (3D, GLB)
 *                  { video, poster, caption, badge }
 *   docs        array of { label, src, blurb } document buttons (CDR, PDR, report)
 * ==========================================================================*/

window.PROJECTS = [
  {
    id: "collins-avionics",
    order: 1,
    title: "Avionic Systems Development",
    category: "Systems Engineering Intern · Collins Aerospace",
    tagline:
      "Test automation, requirements verification, and benchmarking of an internal AI test-case generation tool for transponder products.",
    period: "May 2026 – Present",
    role: "Systems Engineering Intern",
    tags: ["Python", "Requirements verification", "Jama", "GitLab", "AI evaluation"],
    thumb: "assets/img/logos/collins.svg",
    thumbStyle: "logo",
    stats: [
      { n: "301", l: "Test files automated" },
      { n: "50", u: "%", l: "Test runtime cut" },
      { n: "80+", l: "Requirements benchmarked" },
    ],
    links: [],
    problem:
      "Transponder test campaigns are long and heavily procedural. My work has been on three fronts: making the existing testing faster, keeping the requirements and test procedures traceable as products move into sustainment, and finding out how far an internal AI tool can be trusted to draft test cases.",
    approach: [
      "Developed Python automation that drives the keyboard and mouse to run 301 transponder test files unattended, cutting test runtime by 50%.",
      "Evaluated the internal AI test-case generation tool across 80+ requirements, comparing its output against engineer-written baselines and feeding the results back to the tool's developers.",
      "Built a data dictionary defining requirement inputs and their ranges so the tool's retrieval-augmented generation has structured context to draw from.",
      "Supported requirements verification and test-procedure development in Jama, with Confluence and GitLab for documentation and version control.",
      "Updated legacy transponder test procedures and verified the associated test equipment to support sustainment and the transition to the next system.",
    ],
    tools: ["Python", "Jama", "Jira", "Confluence", "GitLab", "Test procedures", "Requirements verification", "Test equipment verification"],
    results: [
      "301-file transponder test campaign automated, runtime cut in half.",
      "AI-generated test cases benchmarked across 80+ requirements, with feedback and a supporting data dictionary that improved the tool's accuracy.",
      "Legacy test procedures and equipment brought current for sustainment and system transition.",
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "lunar-mission",
    order: 2,
    title: "Two-Stage Methalox Crewed Lunar Vehicle",
    category: "Senior capstone · Project & Systems Lead · Embry-Riddle",
    tagline:
      "A two-stage, orbitally refueled LOX/CH₄ launch vehicle that takes three crew to the lunar surface and back. I lead the six-person team and own the engine operating point, nozzle design and CFD, thrust vector control, mass properties, and the Onshape CAD, through PDR and CDR.",
    period: "Jan 2026 – Present",
    role: "Project & Systems Lead",
    tags: ["Onshape", "NASA CEA", "CFD", "MATLAB", "CATIA V5"],
    thumb: "assets/img/lunar-mission-cover.png",
    stats: [
      { n: "19.5", u: "km/s", l: "Mission ΔV" },
      { n: "95", u: "m", l: "Vehicle height · 6.9 m diameter" },
      { n: "1.43", u: "Mkg", l: "Liftoff mass · T/W 1.43" },
      { n: "11", u: "engines", l: "8 on Stage 1 · 3 on Stage 2" },
      { n: "2.51", u: "MN", l: "Sea-level thrust per engine" },
    ],
    links: [],
    tools: [
      "NASA CEA", "CFD", "MATLAB", "Onshape", "CATIA V5", "Fusion 360", "Requirements & trade studies", "Python",
    ],
    sections: [
      {
        title: "The mission",
        text: [
          "COPE (Crewed Operations for Planetary Exploration) is our two-semester capstone at Embry-Riddle. The vehicle is a two-stage LOX/methane launch vehicle: Stage 1 puts Stage 2 and an Orion-class capsule into low Earth orbit, tanker flights (the same Stage 2 with the capsule swapped for propellant) refuel it, and Stage 2 then does trans-lunar injection, halo-orbit insertion, lunar landing and liftoff, and trans-Earth injection. Three astronauts and a 5,000 kg payload, 19.5 km/s total ΔV, 95 m tall, 6.9 m diameter, 1.43 million kg at liftoff.",
          "I am the project and systems lead on a team of six. In the spring we took it through Preliminary Design Review; in October 2026 we delivered the Critical Design Review. Both reports are linked at the bottom of this page, and the homepage has the interactive stack and both engines in 3D.",
        ],
        gallery: [
          { model: "assets/rocket/full-launch-vehicle.glb", feature: true, caption: "Full launch stack (drag to rotate)" },
        ],
        note: {
          text: "Explode the stack and orbit the engines on the homepage.",
          label: "Open the 3D section",
          href: "index.html#rocket",
        },
      },
      {
        title: "Preliminary design (Spring 2026)",
        text: [
          "PDR was about getting the architecture to close. I wrote the MATLAB vehicle-sizing model, iterating the rocket equation across both stages and the refueling scheme until the mass fractions and ΔV split worked, ran LOX/CH₄ combustion cases in NASA CEA to set engine Isp and sizing assumptions, and ran the team's trade studies across propulsion, structures, GNC, and thermal. I also built the full launch-vehicle assembly in CATIA V5 and Fusion 360 with a parts breakdown for each stage.",
        ],
        bullets: [
          "Two stages on a common 6.9 m diameter, 95 m tall, 1.43 million kg at liftoff with a liftoff T/W of 1.43.",
          "Stage 1: eight LOX/CH₄ engines, 3.6 km/s of ΔV to staging. Stage 2: three engines of the same family, 6.4 km/s to orbit and 9.7 km/s after refueling for the lunar mission.",
          "Orbital refueling by tanker flights of the same Stage 2, so one engine and one tank design serve the whole architecture.",
          "Engine family set at ~2.6 MN per engine, O/F 3.5, with sea-level and vacuum bells on the same chamber.",
        ],
        note: {
          text: "The full PDR report is linked under Documents below.",
          label: "Preliminary Design Review (PDF)",
          href: "assets/AE441-PDR.pdf",
        },
      },
      {
        title: "Critical design (Fall 2026)",
        text: [
          "At CDR every requirement from the system level down to the component level had to have an analysis result and a status. I wrote the requirements tables and the work breakdown structure, and owned the engine operating point, the nozzle contours and CFD, the turbopumps, injectors, and preburners, the feed ducts, thrust vector control, mass properties and the inertia matrices, the COTS and TRL assessment, and the Onshape CAD and drawings. Because I was also the systems lead, integrating all of it into one consistent design was my job.",
          "Every requirement closed as met, with the two engine thrust allocations met within the 5% tolerance. The major ones:",
        ],
        table: {
          head: ["Requirement", "Target", "Result", "Status"],
          rows: [
            ["Mission ΔV", "19.5 km/s", "19,505 m/s (3,622 + 6,328 + 9,555)", { ok: true, t: "Met" }],
            ["Liftoff mass", "≤ 1,460,000 kg", "1,432,341 kg", { ok: true, t: "Met" }],
            ["Stage 1 T/W", "1.4", "1.43 at current sized mass", { ok: true, t: "Met" }],
            ["Stage 1 engine Isp", "≥ 329 s SL / 358 s vac", "331.2 s / 360.6 s", { ok: true, t: "Met" }],
            ["Stage 2 engine Isp", "≥ 372.6 s vac", "375.7 s", { ok: true, t: "Met" }],
            ["Stage 1 thrust", "2,600 kN", "2,507 kN SL (vehicle T/W still met)", { ok: true, t: "Met (within 5%)" }],
            ["Stage 2 thrust", "2,980 kN", "2,905 kN vac (−2.5%)", { ok: true, t: "Met (within 5%)" }],
            ["Hot-wall temperature", "≤ 1,000 K", "797 K (S1) / 801 K (S2)", { ok: true, t: "Met" }],
            ["Turbine power margin", "≥ 1.10 × pump", "1.10 fuel / 1.10 LOX, both stages", { ok: true, t: "Met" }],
            ["Interstage axial load", "≤ 15.5 MN / 180 MPa", "15.43 MN / 178 MPa", { ok: true, t: "Met" }],
          ],
        },
      },
      {
        title: "Engine operating point",
        text: [
          "Both stages use a common full-flow staged-combustion LOX/CH₄ engine with the same chamber and throat (0.0550 m², O/F 3.5). Stage 1 runs 25.53 MPa with an expansion ratio of 40 so it can start at sea level; Stage 2 runs 26.08 MPa at ε = 100 for vacuum. I ran NASA CEA for the equilibrium combustion properties, applied a 0.98 c* efficiency for combustion losses, and took the nozzle efficiency (0.992) from my own CFD rather than assuming it.",
        ],
        bullets: [
          "Delivered Isp: 331 s sea level and 361 s vacuum for Stage 1, 376 s vacuum for Stage 2.",
          "Thrust per engine: 2.51 MN sea level, 2.73 MN vacuum (Stage 1); 2.91 MN vacuum (Stage 2).",
          "Stage 2 needs 372.6 s to close the post-refuel mass ratio; 375.7 s leaves about 80 m/s of reserve.",
          "Benchmarked against Raptor 2, RS-25, and RD-180 to show the chamber pressures and thrust levels sit inside the range of flown staged-combustion engines.",
        ],
      },
      {
        title: "Nozzle contour and CFD",
        text: [
          "I designed both bells as 80% Rao contours from a 132.3 mm throat: a contraction ratio of 2.5, L* of 1.10 m, 1.674 m and 2.646 m exit diameters, exit Mach 4.19 and 4.90. Then I set up each nozzle as an axisymmetric inviscid CFD case, initialized from the CEA throat conditions and run until thrust settled.",
          "The CFD thrust coefficient came out just under CEA's (1.944 against 1.960 for Stage 1), and that ratio is the nozzle efficiency used in the operating-point numbers above. The Stage 1 exit pressure of 70.5 kPa gives a pe/pa of 0.70 at sea level, well above the 0.40 separation screen, so the ε = 40 bell is safe to start on the pad. I also ran the exhaust plume for both engines to look at the shock structure downstream of the exit.",
        ],
        gallery: [
          { src: "assets/img/cope/s1-thrust-chamber-render.jpg", fit: "contain", dark: true, caption: "Stage 1 thrust chamber (ε = 40): GRCop-42 liner, closeout jacket, coolant manifolds" },
          { src: "assets/img/cope/s2-thrust-chamber-render.jpg", fit: "contain", dark: true, caption: "Stage 2 thrust chamber (ε = 100)" },
          { src: "assets/img/cope/s1-nozzle-mach.jpg", fit: "contain", caption: "Stage 1 nozzle Mach number, axisymmetric CFD" },
          { src: "assets/img/cope/s2-nozzle-mach.jpg", fit: "contain", caption: "Stage 2 nozzle Mach number" },
          { src: "assets/img/cope/s1-plume-ma.jpg", wide: true, fit: "contain", caption: "Stage 1 exhaust plume Mach number contours (sea level)" },
          { src: "assets/img/cope/s1-plume-p.jpg", fit: "contain", caption: "Stage 1 plume pressure" },
          { src: "assets/img/cope/s1-plume-t.jpg", fit: "contain", caption: "Stage 1 plume temperature" },
          { src: "assets/img/cope/s2-plume-ma.jpg", fit: "contain", caption: "Stage 2 (ε = 100) plume Mach number" },
        ],
      },
      {
        title: "Engine CAD",
        text: [
          "The engines were built natively in Onshape, parametrically: the thrust chamber is revolved from the exported Rao contour with the cooled wall, and the turbopumps, preburners, injectors, plumbing, and thrust vector control are driven by the dimensions from the sizing scripts, so the CAD regenerated whenever an analysis number changed. Each turbopump is 49 parts with materials assigned (Ti-6Al-4V, Inconel 718, 440C with Si₃N₄ bearings); the TVC is a 14-part connected load path from the thrust-structure ring through the gimbal cross to the injector dome.",
        ],
        gallery: [
          { model: "assets/rocket/cope-s1-engine.glb", feature: true, caption: "Stage 1 engine assembly, ε = 40 (drag to rotate)" },
          { model: "assets/rocket/cope-s2-engine.glb", feature: true, caption: "Stage 2 engine assembly, ε = 100 (drag to rotate)" },
          { src: "assets/img/cope/s1-engine.png", fit: "contain", dark: true, caption: "Stage 1 engine render" },
          { src: "assets/img/cope/s2-engine.png", fit: "contain", dark: true, caption: "Stage 2 engine render" },
        ],
      },
    ],
    docs: [
      {
        label: "Full CDR report (PDF)",
        src: "assets/AE451-CDR.pdf",
        blurb: "Critical Design Review (October 2026): requirements, engine operating point, nozzle and CFD, cooling, cycle balance, turbomachinery, feed, TVC, structures, mass properties, COTS and TRL, and the drawing appendix.",
      },
      {
        label: "Preliminary Design Review (PDF)",
        src: "assets/AE441-PDR.pdf",
        blurb: "PDR report (Spring 2026): vehicle architecture, staging, propulsion, and subsystem trades.",
      },
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "heavy-lift-uav",
    aliases: ["mayott-uav"],
    order: 3,
    title: "Heavy Lift UAV Project",
    category: "CAD & Simulation Engineer · Daytona Beach, FL",
    tagline:
      "Frame, motor-mount, and 300+ lb payload-attachment CAD plus an Unreal Engine 5 flight simulator integrated with PX4 for testing autonomy before flight.",
    period: "Apr 2026 – Present",
    role: "CAD & Simulation Engineer",
    tags: ["SolidWorks", "Fusion 360", "Unreal Engine 5", "PX4", "Cosys-AirSim"],
    thumb: "assets/img/uav-cover.jpg",
    stats: [
      { n: "300+", u: "lb", l: "Payload attachment design load" },
      { n: "360", u: "°", l: "Sensor coverage layout" },
      { n: "UE5 + PX4", l: "Simulation-in-the-loop" },
    ],
    links: [],
    problem:
      "A heavy-lift multirotor needs an airframe and payload interface that are light but stiff enough to carry several hundred pounds, and a simulation environment realistic enough to test autonomous flight behavior before risking the aircraft.",
    approach: [
      "Designed frame components in SolidWorks and Fusion 360, working the strength-to-weight ratio and manufacturability of each part.",
      "Contributed to the 300+ lb payload attachment system and the motor mount, developing the CAD models used for integration.",
      "Laid out sensor mounting to get full 360-degree coverage for future autonomous operations.",
      "Built a photorealistic flight simulation in Unreal Engine 5 with Cosys-AirSim and Cesium global terrain, integrated with the PX4 autopilot, and used it for simulation-driven testing and validation of autonomous flight.",
    ],
    tools: ["SolidWorks", "Fusion 360", "Unreal Engine 5", "Cosys-AirSim", "Cesium", "PX4"],
    results: [
      "Frame components, motor mount, and a payload attachment system modeled for payloads up to 300 lb.",
      "Sensor mounting concepts sized for full 360-degree coverage.",
      "A working UE5 + PX4 simulation loop for autonomous flight testing.",
    ],
    gallery: [
      {
        video: "assets/video/uav-demo-sample.mp4",
        poster: "assets/img/uav-demo-poster.jpg",
        badge: "Flight",
        caption: "Flight demonstration, 10-second clip (2026)",
      },
    ],
    needs: [],
  },

  {
    id: "nasa-jsc-viz",
    order: 4,
    title: "NASA JSC Mission Visualization Tools",
    category: "Engineering Intern · KBR & LZ Technology · NASA Johnson Space Center",
    tagline:
      "Python/PyQt5 tools visualizing antenna blockage, tracking, and Orion/Starliner simulations with live telemetry overlays for controller training.",
    period: "Jan 2025 – Aug 2025",
    role: "Engineering Intern",
    tags: ["Python", "PyQt5", "Telemetry", "Linux", "GitLab", "Optimization"],
    thumb: "assets/img/logos/nasa.svg",
    thumbStyle: "logo",
    stats: [
      { n: "13", u: "×", l: "Overall speedup, Gateway tool" },
      { n: "21", u: "×", l: "Faster graphics rendering" },
      { n: "3", l: "Vehicles: Orion, Starliner, Gateway" },
    ],
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
      "13× overall performance boost and 21× faster graphics rendering on the Gateway tool after profiling and targeting the real bottleneck.",
      "Starliner visualization tool with integrated telemetry overlays, used in operational simulations.",
      "Supported controller training and simulated missions with live telemetry overlays.",
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "artemis-rocket",
    order: 5,
    title: "ERFSEDS Artemini Rocket",
    category: "Manufacturing Member · Embry-Riddle Future Space Explorers",
    tagline:
      "Scaled-down Artemis rocket: 3D models in CATIA V5 and SolidWorks and OpenRocket flight optimization with a 15-student team.",
    period: "Aug 2024 – Jan 2025",
    role: "Manufacturing Member",
    tags: ["CATIA V5", "SolidWorks", "OpenRocket", "Manufacturing"],
    thumb: "assets/img/artemis-cover.png",
    model: "assets/rocket/artemis.glb",
    links: [],
    problem:
      "Build a scaled-down version of the Artemis rocket to enable local launches, with sound aerodynamics, stability, and structural reliability, as part of a large student team.",
    approach: [
      "Developed 3D models of the scaled Artemis rocket in CATIA V5 and SolidWorks.",
      "Ran OpenRocket and MATLAB simulations to optimize trajectory, stability, and flight parameters.",
      "Collaborated with a 15-member team to integrate design modifications and ensure structural reliability.",
    ],
    tools: ["CATIA V5", "SolidWorks", "OpenRocket", "MATLAB"],
    results: [
      "Delivered 3D models supporting manufacturing and integration.",
      "Tuned trajectory and stability parameters through simulation.",
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "spectre-rocket",
    order: 6,
    title: "ERPL Spectre Rocket",
    category: "Hardware Member · Experimental Rocket Propulsion Lab",
    tagline:
      "Active-stabilization high-powered rocket: structural components, Fusion 360 design, and MATLAB test-data analysis.",
    period: "Aug 2022 – May 2024",
    role: "Hardware Member",
    tags: ["Fusion 360", "MATLAB", "Hardware", "Data analysis"],
    thumb: "assets/img/spectre-cover.png",
    thumbFit: "contain",
    links: [],
    problem:
      "Contribute to the structure of an active-stabilization high-powered rocket and use flight and test data to drive continuous design improvement.",
    approach: [
      "Contributed to the design, assembly, and testing of the active-stabilization system, including canard integration, within a 10-member team.",
      "Modeled structural components in Fusion 360, refining the design to minimize aerodynamic forces.",
      "Soldered avionics hardware and analyzed test data in MATLAB to drive iterative improvements.",
    ],
    tools: ["Fusion 360", "MATLAB", "Hand assembly / soldering"],
    results: [
      "Delivered structural hardware for an active-stabilization high-powered rocket.",
      "Closed the loop from test data back into design via MATLAB analysis.",
    ],
    gallery: [
      { model: "assets/rocket/spectre-canard.glb", caption: "Canard control surface, v4.0 (drag to rotate)" },
      { model: "assets/rocket/spectre-sm.glb", caption: "Service module (drag to rotate)" },
    ],
    needs: [],
  },

  /* ----- Coursework (kept here, hidden from the site) -------------------- */

  {
    id: "nastran-fea",
    order: 7,
    hidden: true,
    title: "NASTRAN Structural Analysis",
    category: "AE 318 · Coursework",
    tagline: "Finite-element structural model using CBEAM/PBEAM elements and a SOL 101 linear static solution.",
    period: "Coursework",
    role: "Coursework",
    tags: ["NASTRAN", "FEA", "Femap", "Structures"],
    thumb: "assets/img/nastran.png",
    links: [],
    problem: "Model a structure with beam finite elements and solve for displacements and reaction forces under static loading.",
    approach: [
      "Built the model with GRID, CBEAM/PBEAM, and MAT1 bulk-data cards, applying loads with FORCE/MOMENT.",
      "Constrained all six rigid-body DOF with SPC1 and confirmed a clean (non-singular) solution.",
      "Ran a SOL 101 linear static analysis and recovered CBEAM forces and stresses at recovery points C/D/E/F.",
    ],
    tools: ["NASTRAN", "Femap", "CBEAM/PBEAM", "SPC1", "SOL 101"],
    results: ["Recovered nodal displacements, CBEAM internal forces/stresses, and constraint reactions for the loaded structure."],
    gallery: [],
    needs: [],
  },

  {
    id: "earth-moon-relay",
    order: 8,
    hidden: true,
    title: "Earth–Moon Relay Pathfinder",
    category: "AE 429 · Coursework",
    tagline: "Space-environment analysis and test plan for a lunar communications relay pathfinder mission.",
    period: "Coursework",
    role: "Coursework",
    tags: ["Space environment", "Mission analysis", "Test planning"],
    thumb: "assets/img/moon-relay-cover.svg",
    links: [],
    problem: "Assess the space-environment effects on an Earth–Moon relay pathfinder and define an appropriate environmental test plan.",
    approach: [
      "Characterized the cislunar radiation environment: Van Allen belt crossings during trans-lunar injection, solar energetic particles, and deep-space galactic cosmic rays.",
      "Estimated aluminum-equivalent shielding and dose, and analyzed thermal eclipse cycling and micrometeorite flux for the trajectory.",
      "Mapped each environment to a standard qualification test and rationale to build the test plan.",
    ],
    tools: ["Radiation analysis (TID / SEE)", "Aluminum-equivalent shielding", "Thermal & micrometeorite analysis", "Environmental test planning"],
    results: ["Delivered an environmental analysis and a traceable test plan for the relay pathfinder concept."],
    docs: [{ label: "Read the full report (PDF)", src: "assets/earth-moon-relay.pdf", blurb: "Full space-environment analysis and qualification test plan." }],
    gallery: [],
    needs: [],
  },
];
