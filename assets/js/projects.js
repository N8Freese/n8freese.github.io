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
 *   title       project name
 *   category    short label shown above the title (team / course / employer)
 *   tagline     one-line summary shown on the card
 *   period      dates, e.g. "Jan 2026 – May 2026"
 *   role        your role on the project
 *   tags        array of short tech tags (CATIA, MATLAB, Python, ...)
 *   featured    true = larger card, shown first
 *   thumb       card image path (assets/img/...). Leave "" for a styled placeholder.
 *   accent      optional hex to tint the card/detail header
 *   model       optional GLB path for an embedded 3D viewer on the detail page
 *   links       array of { label, href }
 *
 *   Two ways to write the body:
 *   a) template:  problem / approach[] / tools[] / results[] / code / gallery[]
 *   b) sections:  ordered [{ title, text[], bullets[], code, note, gallery[] }]
 *      (used for long write-ups; tools[] still renders after the sections)
 *
 *   gallery items: { src, caption, fit:"contain", wide:true }
 *                  { model, caption, feature:true }   (3D, GLB)
 *                  { video, poster, caption, badge }
 *   docs        array of { label, src, blurb } document buttons (PDR, CDR, report)
 * ==========================================================================*/

window.PROJECTS = [
  {
    id: "lunar-mission",
    order: 3,
    title: "Two-Stage Methalox Crewed Lunar Mission",
    category: "Senior capstone · Project & Systems Lead · ERAU",
    tagline:
      "Two-stage, orbitally refueled LOX/CH₄ launch vehicle for three crew to the lunar surface. I lead the 6-person team and own the propulsion design, CFD, TVC, mass properties, and all the Onshape CAD.",
    period: "Jan 2026 – Present",
    role: "Project & Systems Lead",
    tags: ["Onshape", "OpenFOAM", "NASA CEA", "MATLAB", "CATIA V5"],
    featured: true,
    thumb: "assets/img/lunar-mission-cover.png",
    accent: "#7c5cff",
    links: [],
    tools: [
      "NASA CEA", "OpenFOAM (rhoCentralFoam) + ParaView", "MATLAB", "Onshape + FeatureScript",
      "CATIA V5", "Fusion 360", "Requirements / WBS (MIL-STD-881F)", "Trade studies",
    ],
    sections: [
      {
        title: "The mission",
        text: [
          "COPE (Crewed Operations for Planetary Exploration) is our two-semester capstone at Embry-Riddle. The vehicle is a two-stage LOX/methane launch vehicle: Stage 1 puts Stage 2 and an Orion-class capsule into low Earth orbit, tanker flights (the same Stage 2 with the capsule swapped for propellant) refuel it, and Stage 2 then does trans-lunar injection, the halo-orbit insertion, lunar landing and liftoff, and trans-Earth injection. Three astronauts and a 5000 kg payload, 19.5 km/s total ΔV, 95 m tall, 6.9 m diameter, 1.43 million kg at liftoff, eight Stage 1 engines and three Stage 2 engines.",
          "I am the project and systems lead on a team of six. In the spring we took it through Preliminary Design Review; this fall we completed the Critical Design Review (October 2026). Both reports are linked at the bottom of this page.",
        ],
        gallery: [
          { model: "assets/rocket/full-launch-vehicle.glb", feature: true, caption: "Full launch stack (drag to rotate)" },
        ],
        note: {
          text: "The homepage has the exploded view of the stack and a live nozzle-flow simulation built from these engines.",
          label: "Open the interactive section",
          href: "index.html#rocket",
        },
      },
      {
        title: "Preliminary design (spring 2026)",
        text: [
          "PDR was about getting the architecture to close. I wrote the MATLAB vehicle-sizing model, iterating the rocket equation across both stages and the refueling scheme until the mass fractions and ΔV split worked, ran LOX/CH₄ combustion cases in NASA CEA to set engine Isp and sizing assumptions, and ran the team's trade studies across propulsion, structures, GNC, and thermal. I also built the full launch-vehicle assembly in CATIA V5 and Fusion 360 with a parts breakdown for each stage. The staging script below is the summary version of that sizing loop.",
        ],
        code: {
          title: "test2.m",
          src: "assets/code/test2.m",
          lang: "MATLAB",
          caption: "Staging / ΔV budget summary: two-stage LOX/CH₄ vehicle sizing (MATLAB).",
        },
      },
      {
        title: "Critical design (fall 2026): what I owned",
        text: [
          "At CDR every requirement from the system level down to level 4 had to have an analysis result and a status. I wrote the requirements tables and the work breakdown structure (numbered to MIL-STD-881F), and I was the only one working on the engine operating point, the nozzle contours and CFD, the turbopumps, injectors, and preburners, the feed ducts, thrust vector control, mass properties and the inertia matrices, the COTS and TRL assessment, and all of the Onshape CAD and dimensioned drawings. Teammates owned the regenerative cooling analysis and the structures, and part of the cycle balance was shared. Because I was also the systems lead, the integration of all of it into one consistent design was my job.",
          "Everything below is from the CDR report. All level-4 requirements closed as met, with a few PDR thrust and propellant allocations met within the 5% tolerance.",
        ],
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
          "I designed both bells as 80% Rao contours from a 132.3 mm throat: a contraction ratio of 2.5, L* of 1.10 m, 1.674 m and 2.646 m exit diameters, exit Mach 4.19 and 4.90. Then I set up each nozzle as an axisymmetric inviscid case in OpenFOAM (rhoCentralFoam), initialized from the CEA throat conditions and run until thrust settled.",
          "The CFD thrust coefficient came out just under CEA's, and that ratio is the nozzle efficiency used in the operating-point numbers above. The Stage 1 exit pressure of 70.5 kPa gives a pe/pa of 0.70 at sea level, well above the 0.40 separation screen, so the ε = 40 bell is safe to start on the pad. I also ran the exhaust plume for both engines to look at the shock structure downstream of the exit.",
        ],
        gallery: [
          { src: "assets/img/cope/nozzle-contours.jpg", fit: "contain", caption: "Rao 80% bell contours, Stage 1 (ε = 40) and Stage 2 (ε = 100), MATLAB" },
          { src: "assets/img/cope/s1-nozzle-mach.jpg", fit: "contain", caption: "Stage 1 nozzle Mach number, OpenFOAM axisymmetric case" },
          { src: "assets/img/cope/s1-plume-ma.jpg", wide: true, fit: "contain", caption: "Stage 1 exhaust plume Mach number contours (sea level)" },
          { src: "assets/img/cope/s1-plume-p.jpg", fit: "contain", caption: "Stage 1 plume pressure" },
          { src: "assets/img/cope/s1-plume-t.jpg", fit: "contain", caption: "Stage 1 plume temperature" },
          { src: "assets/img/cope/s2-plume-ma.jpg", fit: "contain", caption: "Stage 2 (ε = 100) plume Mach number" },
          { src: "assets/img/cope/s2-nozzle-mach.jpg", fit: "contain", caption: "Stage 2 nozzle Mach number" },
        ],
      },
      {
        title: "Turbopumps, injector, and preburners",
        text: [
          "The pumps are common to both engines and sized at the Stage 1 point from the cycle balance. The methane pump is a two-stage impeller running 11,162 rpm at 25.8 MW with 12,259 m of head; the LOX pump is single-stage, 7,131 rpm, 29.6 MW. Inducers were sized for cavitation margin at the design inlet pressures (NPSH available over critical of 1.12 for methane and 1.26 for LOX, against a 1.10 requirement).",
          "The main injector is a gas-gas coaxial design, since both propellants arrive as preburner gas: 130 elements in seven rings, ox-rich gas through the center post, fuel-rich gas around it, with a pressure drop of 20% of chamber pressure. The fuel-rich preburner runs at O/F 0.25 and 40.6 MPa (1010 K), the ox-rich preburner at O/F 50 and 41.9 MPa (858 K), each solved so its turbine carries at least 10% more power than its pump needs.",
        ],
        gallery: [
          { src: "assets/img/cope/fuel-turbopump.png", fit: "contain", caption: "Methane turbopump, casing hidden: inducer, two-stage impeller, shrouded turbine" },
          { src: "assets/img/cope/lox-turbopump.png", fit: "contain", caption: "LOX turbopump" },
          { src: "assets/img/cope/s1-injector.png", fit: "contain", caption: "Stage 1 main injector assembly" },
          { src: "assets/img/cope/s1-injector-faceplate.png", fit: "contain", caption: "Injector faceplate, 130 coaxial elements in 7 rings" },
          { src: "assets/img/cope/fr-preburner.png", fit: "contain", caption: "Fuel-rich preburner" },
          { src: "assets/img/cope/or-preburner.png", fit: "contain", caption: "Oxidizer-rich preburner" },
        ],
      },
      {
        title: "Thrust vector control",
        text: [
          "I traded gimbal-plus-electromechanical actuators against hydraulic actuation, differential throttling, and jet vanes, and went with gimbals and EMAs on every engine. To size them I wrote an ascent simulation (gravity turn with a 4 g throttle schedule) to find max-q: 37.9 kPa at 10.9 km and Mach 1.54. With a 1.5× disturbance-moment factor the Stage 1 engines need 5.05° at max-q and 6.47° with an outer engine out; Stage 2 needs 3.89° for an engine-out case at TLI. That set a common ±6° gimbal for both stages.",
        ],
        bullets: [
          "Actuator force 160 kN (Stage 1) and 257 kN (Stage 2), ±63 mm stroke, 0.105 m/s rate.",
          "22 kW and 36 kW electrical per actuator; 358 kW and 215 kW peak TVC bus power per stage.",
          "Gimbal pin 65 / 70 mm, actuator moment arm 600 mm; Moog MEMA-class actuators carried as COTS.",
        ],
        gallery: [
          { src: "assets/img/cope/s1-tvc.png", fit: "contain", caption: "Stage 1 gimbal and TVC: thrust-structure ring, gimbal cross, two EMAs, injector-dome interface" },
          { src: "assets/img/cope/tvc-authority.jpg", fit: "contain", caption: "Required gimbal deflection vs angle of attack at max-q, nominal and engine-out" },
          { src: "assets/img/cope/ascent-profiles.jpg", fit: "contain", caption: "Ascent simulation: altitude, velocity, dynamic pressure, and acceleration vs time" },
        ],
      },
      {
        title: "Mass properties and inertia",
        text: [
          "Engine masses were built bottom-up by component with a 5 to 20% mass growth allowance depending on maturity. The Stage 1 engine came out at 2688 kg against a 2800 kg allocation and the Stage 2 engine at 3106 kg against 3300 kg. Rolled up with the feed system, pressurization, and TVC hardware, the dry propulsion system is 41.8 t with its CG 16.34 m above the Stage 1 exit plane. I calculated the inertia tensor per stage and for the whole propulsion system by combining each component's own inertia through the parallel-axis theorem, so the off-diagonal terms come from the actual layout rather than an assumed symmetric system.",
        ],
        gallery: [
          { src: "assets/img/cope/mass-breakdown.jpg", wide: true, fit: "contain", caption: "Engine component mass breakdown, CBE plus MGA, Stage 1 and Stage 2" },
        ],
      },
      {
        title: "Engine CAD and drawings",
        text: [
          "The engines were built natively in Onshape, parametrically: the thrust chamber is revolved from the exported Rao contour with the cooled wall, and the turbopumps and TVC are custom FeatureScript features driven by the dimensions from the sizing scripts, so the CAD regenerated whenever an analysis number changed. Each turbopump is 49 parts with materials assigned (Ti-6Al-4V, Inconel 718, 440C with Si₃N₄ bearings): bolted inlet, discharge, and hot-gas flanges, labyrinth seal, keyed shaft, shrouded turbine. The TVC is a 14-part connected load path from the thrust-structure ring through the gimbal cross to the injector dome, with the two actuators pinned at both ends.",
          "From those models I produced the dimensioned drawing set for the appendix: engine assemblies, thrust chambers and liners, turbopumps with impeller, inducer, turbine rotor, and shaft sheets, main injectors, preburners, gimbal and TVC, and the propellant tanks.",
        ],
        gallery: [
          { model: "assets/rocket/cope-s1-engine.glb", feature: true, caption: "Stage 1 engine assembly, ε = 40 (drag to rotate)" },
          { model: "assets/rocket/cope-s2-engine.glb", feature: true, caption: "Stage 2 engine assembly, ε = 100 (drag to rotate)" },
          { src: "assets/img/cope/s1-engine.png", fit: "contain", caption: "Stage 1 engine render" },
          { src: "assets/img/cope/s2-engine.png", fit: "contain", caption: "Stage 2 engine render" },
          { src: "assets/img/cope/tanks.png", fit: "contain", caption: "Stage 1 and Stage 2 propellant tanks" },
          { src: "assets/img/cope/drawing-s1-engine.jpg", wide: true, fit: "contain", caption: "COPE-ENG-001, Stage 1 engine assembly drawing" },
          { src: "assets/img/cope/drawing-s1-thrust-chamber.jpg", caption: "COPE-TC-001, Stage 1 thrust chamber" },
          { src: "assets/img/cope/drawing-fuel-turbopump.jpg", caption: "COPE-TP-001, methane turbopump" },
          { src: "assets/img/cope/drawing-s1-injector.jpg", caption: "COPE-INJ-001, Stage 1 main injector" },
          { src: "assets/img/cope/drawing-s1-tvc.jpg", caption: "COPE-TVC-001, Stage 1 gimbal and TVC" },
        ],
      },
    ],
    docs: [
      {
        label: "Critical Design Review (PDF)",
        src: "assets/AE451-CDR.pdf",
        blurb: "Full CDR report (October 2026): requirements, engine operating point, nozzle and CFD, cooling, cycle balance, turbomachinery, feed, TVC, structures, mass properties, COTS and TRL, and the drawing appendix.",
      },
      {
        label: "Preliminary Design Review (PDF)",
        src: "assets/AE441-PDR.pdf",
        blurb: "PDR report (spring 2026): vehicle architecture, staging, propulsion, and subsystem trades.",
      },
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "nasa-jsc-viz",
    order: 4,
    title: "NASA JSC Mission Visualization Tools",
    category: "KBR & LZ Technology · NASA Johnson Space Center",
    tagline:
      "Python/PyQt5 tools visualizing antenna blockage, tracking, and Orion/Starliner sims with live telemetry overlays.",
    period: "Jan 2025 – Aug 2025",
    role: "Engineering Intern",
    tags: ["Python", "PyQt5", "Telemetry", "Linux", "GitLab", "Optimization"],
    featured: true,
    thumb: "assets/img/logos/nasa.svg",
    thumbStyle: "logo",
    accent: "#4d8dff",
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
    id: "heavy-lift-uav",
    aliases: ["mayott-uav"],
    order: 2,
    title: "Heavy Lift UAV Project",
    category: "CAD & Simulation Engineer · Daytona Beach, FL",
    tagline:
      "Frame, motor-mount, and 300+ lb payload-attachment CAD plus an Unreal Engine 5 flight simulator integrated with PX4 for testing autonomy before flight.",
    period: "Apr 2026 – Oct 2026",
    role: "CAD & Simulation Engineer",
    tags: ["SolidWorks", "Fusion 360", "Unreal Engine 5", "PX4", "Cosys-AirSim"],
    featured: true,
    thumb: "assets/img/uav-cover.jpg",
    accent: "#22c3a6",
    links: [
      { label: "Project overview (Prezi)", href: "https://prezi.com/view/GMI03G0bwPB44Vn5zlHD/?referral_token=o2aFxklnB3FN" },
    ],
    problem:
      "A heavy-lift multirotor needs an airframe and payload interface that are light but stiff enough to carry several hundred pounds, and a simulation environment realistic enough to test autonomous flight behavior before risking the aircraft.",
    approach: [
      "Designed frame components in Fusion 360 and SolidWorks, working the strength-to-weight ratio and manufacturability of each part.",
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
        badge: "Sample",
        caption: "Flight demonstration: 10-second sample clip (2026)",
      },
    ],
    needs: [],
  },

  {
    id: "collins-avionics",
    order: 1,
    title: "Avionics Test & Verification",
    category: "Systems Engineering Intern · Collins Aerospace",
    tagline:
      "Test automation, requirements verification, and evaluation of an internal AI test-case generation tool for transponder products.",
    period: "May 2026 – Present",
    role: "Systems Engineering Intern",
    tags: ["Python", "Verification", "Jama", "GitLab", "AI evaluation"],
    featured: false,
    thumb: "assets/img/logos/collins.svg",
    thumbStyle: "logo",
    accent: "#4d8dff",
    links: [],
    problem:
      "Transponder test campaigns are long and heavily procedural. My work has been on three fronts: making the existing testing faster, keeping the requirements and test procedures traceable as products move into sustainment, and finding out how far an internal AI tool can be trusted to draft test cases.",
    approach: [
      "Wrote Python automation that simulates the keyboard and mouse input to run 301 transponder test files unattended, cutting test runtime by 50%.",
      "Authored and updated test procedures and verified requirements in Jama, with Confluence and GitLab for documentation and version control.",
      "Evaluated the internal AI test-case generation tool across 80+ requirements, comparing its output against engineer-written baselines and feeding the results back to the tool's developers.",
      "Built a data dictionary defining requirement inputs and their ranges so the tool's retrieval-augmented generation has structured context to draw from.",
      "Updated legacy transponder test procedures and verified the associated test equipment to support sustainment and the transition to the next system.",
    ],
    tools: ["Python", "Jama", "Jira", "Confluence", "GitLab", "Test procedures", "Requirements verification"],
    results: [
      "301-file transponder test campaign automated, runtime cut in half.",
      "AI-generated test cases benchmarked across 80+ requirements, with feedback and a supporting data dictionary that improved the tool's accuracy.",
      "Legacy test procedures and equipment brought current for sustainment and system transition.",
    ],
    gallery: [],
    needs: [],
  },

  {
    id: "artemis-rocket",
    order: 5,
    title: "ERFSEDS Artemini Rocket",
    category: "Manufacturing Member · ERAU",
    tagline:
      "Scaled-down Artemis rocket: 3-D models in CATIA V5 / SolidWorks and OpenRocket flight optimization with a 15-student team.",
    period: "Aug 2024 – Jan 2025",
    role: "Manufacturing Member",
    tags: ["CATIA V5", "SolidWorks", "OpenRocket", "Manufacturing"],
    featured: false,
    thumb: "assets/img/artemis-cover.png",
    accent: "#ff8a4d",
    model: "assets/rocket/artemis.glb",
    links: [],
    problem:
      "Build a scaled-down version of the Artemis rocket to enable local launches, with sound aerodynamics, stability, and structural reliability, as part of a large student team.",
    approach: [
      "Developed 3-D models of the scaled Artemis rocket in CATIA V5 and SolidWorks.",
      "Ran OpenRocket and MATLAB simulations to optimize trajectory, stability, and flight parameters.",
      "Collaborated with a 15-member team to integrate design modifications and ensure structural reliability.",
    ],
    tools: ["CATIA V5", "SolidWorks", "OpenRocket", "MATLAB"],
    results: [
      "Delivered 3-D models supporting manufacturing and integration.",
      "Tuned trajectory and stability parameters through simulation.",
    ],
    gallery: [],
    needs: [],
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
    links: [],
    problem:
      "Contribute to the structure of an active-stabilization high-powered rocket and use flight/test data to drive continuous design improvement.",
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
      { model: "assets/rocket/spectre-full-assy.glb", feature: true, caption: "Spectre Mk1 full airframe assembly (drag to rotate)" },
      { model: "assets/rocket/spectre-canard.glb", caption: "Canard control surface, v4.0 (drag to rotate)" },
      { model: "assets/rocket/spectre-sm.glb", caption: "Service module (drag to rotate)" },
    ],
    needs: [],
  },

  /* ----- Coursework projects (kept as additional entries) ----------------- */

  {
    id: "nastran-fea",
    order: 7,
    hidden: true, // temporarily off the site until result images are ready; flip to false to restore
    title: "NASTRAN Structural Analysis",
    category: "AE 318 · Coursework",
    tagline: "Finite-element structural model using CBEAM/PBEAM elements and a SOL 101 linear static solution.",
    period: "Coursework",
    role: "Coursework",
    tags: ["NASTRAN", "FEA", "Femap", "Structures"],
    featured: false,
    thumb: "assets/img/nastran.png",
    accent: "#22c3a6",
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
    docs: [{
      label: "Read the full report (PDF)",
      src: "assets/earth-moon-relay.pdf",
      blurb: "Full space-environment analysis and qualification test plan for the Earth–Moon relay pathfinder.",
    }],
    gallery: [],
    needs: [],
  },
];
