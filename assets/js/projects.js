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
 *                  { model, caption, feature:true, neutral:true }   (3D, GLB)
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
      "Avionics test automation, requirements verification, and sustainment work on next-generation and legacy transponder systems during my systems engineering internship.",
    period: "May 2026 – Present",
    role: "Systems Engineering Intern",
    tags: ["Python", "Requirements verification", "Jama", "GitLab", "AI evaluation"],
    thumb: "assets/img/logos/collins.svg",
    thumbStyle: "logo",
    stats: [
      { n: "301", l: "Test files automated" },
      { n: "50", u: "%", l: "Test runtime reduced" },
      { n: "80+", l: "Requirements evaluated" },
    ],
    links: [],
    tools: ["Python", "Jama", "Jira", "Confluence", "GitLab", "Test procedures", "Requirements verification", "Test equipment verification"],
    sections: [
      {
        title: "Overview",
        text: [
          "During my internship at Collins Aerospace I've gained practical experience in systems engineering, particularly in avionics testing, requirements verification, and test automation. My work has involved both next-generation and legacy transponder systems, which has given me exposure to different stages of a product's development and sustainment lifecycle.",
        ],
      },
      {
        title: "Test automation",
        text: [
          "One of my primary projects during the summer involved developing Python automation to improve the efficiency of transponder testing. The existing process required manually executing a large number of test files, which made the overall testing process time-consuming.",
          "I developed an automation script that simulated keyboard and mouse inputs to execute 301 test files, which reduced the total test runtime by approximately 50%.",
          "This project let me apply my programming experience to an engineering testing environment, and it taught me a lot about why verification efficiency matters when test campaigns run for weeks.",
        ],
      },
      {
        title: "AI test-case generation",
        text: [
          "I also had the opportunity to evaluate an internal AI tool designed to generate test cases from system requirements. I compared the AI-generated test cases against engineer-developed baselines across more than 80 requirements, identifying where the tool performed well and where it needed improvement, and fed those results back to the tool's developers.",
          "As part of this effort I developed a data dictionary defining requirement inputs and their associated ranges, which gives the tool's retrieval-augmented generation process more structured context to draw from.",
          "This work gave me a better understanding of how AI-based tools can support engineering verification, and it also made clear how important it is to review and validate anything they generate.",
        ],
      },
      {
        title: "Legacy transponder sustainment",
        text: [
          "More recently I've been supporting the sustainment of a legacy transponder system. This has involved updating existing test procedures, executing test cases, and verifying test equipment functionality to help maintain system verification during the transition to the next-generation product. Requirements and procedures are managed in Jama, with Confluence and GitLab for documentation and version control.",
        ],
      },
      {
        title: "What I've taken from it",
        text: [
          "This internship has given me a much better understanding of how systems engineering supports the development, verification, and sustainment of complex aerospace systems. I've particularly enjoyed working with requirements and testing, because it shows how engineering decisions turn into measurable system performance.",
        ],
      },
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
      "A conceptual two-stage LOX/CH₄ launch vehicle, refueled in orbit, designed by our six-person senior design team to carry three crew to the lunar surface and back. I lead the team and contribute the propulsion analysis, nozzle design and CFD, thrust vector control, mass properties, and CAD.",
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
        title: "Project overview",
        text: [
          "COPE (Crewed Operations for Planetary Exploration) is a two-semester senior design project at Embry-Riddle focused on developing a conceptual launch vehicle capable of transporting three astronauts and a 5,000 kg payload to the lunar surface and returning the crew to Earth.",
          "Our design is a two-stage liquid oxygen and methane launch vehicle that uses orbital refueling to support the lunar mission. Stage 1 puts Stage 2 and an Orion-class capsule into low Earth orbit, tanker flights of the same Stage 2 refuel it, and Stage 2 then performs trans-lunar injection, the lunar landing and liftoff, and the return to Earth. The vehicle is approximately 95 meters tall, has a diameter of 6.9 meters, and a liftoff mass of approximately 1.43 million kilograms.",
          "As the project and systems lead for our six-person team, I've been responsible for coordinating the overall design while also contributing directly to several technical areas, including propulsion analysis, engine sizing, nozzle design, CFD, thrust vector control, mass properties, and CAD development.",
          "The project has been a chance to work through the full engineering design process, from initial mission requirements and preliminary design to detailed subsystem analysis and our Critical Design Review. Both review reports are linked at the bottom of this page, and the homepage has the interactive launch stack and both engine assemblies in 3D.",
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
          "During the preliminary design phase our primary focus was establishing a feasible vehicle architecture capable of meeting the mission requirements.",
          "I developed a MATLAB-based vehicle sizing model to evaluate staging configurations, propellant mass requirements, and the overall velocity budget. I also performed combustion analysis using NASA CEA to establish preliminary engine performance characteristics, and supported trade studies across the vehicle's major subsystems, including propulsion, structures, guidance and control, and thermal management.",
          "Alongside the analytical work, I developed the initial launch vehicle CAD assembly in CATIA V5 and Fusion 360, which let our team visualize the overall configuration and start evaluating subsystem integration.",
          "By the end of the preliminary design phase we had established the vehicle architecture, preliminary propulsion requirements, and subsystem configurations needed to move into detailed design.",
        ],
        bullets: [
          "Two stages on a common 6.9 m diameter, 95 m tall, 1.43 million kg at liftoff with a liftoff thrust-to-weight ratio of 1.43.",
          "Stage 1 carries eight LOX/CH₄ engines and provides 3.6 km/s of ΔV to staging. Stage 2 carries three engines of the same family, with 6.4 km/s to orbit and 9.7 km/s after refueling for the lunar mission.",
          "Orbital refueling by tanker flights of the same Stage 2, so one engine design and one tank design serve the whole architecture.",
          "Engine family set at roughly 2.6 MN per engine and an O/F of 3.5, with sea-level and vacuum bells on the same chamber.",
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
          "Following the Preliminary Design Review our team moved into detailed design, where the focus shifted toward refining the subsystem designs and showing that the vehicle could meet its established requirements.",
          "My primary responsibilities included developing the engine operating conditions, designing the nozzle contours, performing the CFD analysis, evaluating turbomachinery and feed system requirements, and analyzing thrust vector control and vehicle mass properties.",
          "As the systems lead I was also responsible for developing and organizing the requirements structure, keeping the subsystem designs consistent with each other, and integrating the team's technical work into the final Critical Design Review.",
          "One of the more challenging parts of this phase was making sure that a change in one subsystem stayed consistent with the rest of the vehicle. Adjustments to engine performance, for example, affected the overall thrust requirements, the vehicle mass properties, and the mission performance.",
          "Our final design met the assessed requirements within their established tolerances, which gave us a consistent analytical baseline for the conceptual vehicle. Some of the major ones are summarized below.",
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
          "Both stages use a common full-flow staged-combustion engine architecture with liquid oxygen and methane as propellants. The engines share the same combustion chamber and throat geometry, but each stage uses a different nozzle expansion ratio to suit its operating environment.",
          "I used NASA CEA to evaluate the combustion properties and establish the engine operating conditions, including chamber pressure, mixture ratio, specific impulse, and thrust. Those results were then used to size the propulsion system and check its ability to meet the vehicle's performance requirements. A 0.98 c* efficiency was applied for combustion losses, and the nozzle efficiency came from my own CFD rather than an assumed value.",
          "The Stage 1 engine was designed for sea-level operation at 25.53 MPa with an expansion ratio of 40, while the Stage 2 engine was optimized for vacuum at 26.08 MPa and an expansion ratio of 100. The final analytical results predicted approximately 331 seconds of sea-level specific impulse for Stage 1 and 376 seconds of vacuum specific impulse for Stage 2.",
        ],
        bullets: [
          "Delivered Isp of 331 s sea level and 361 s vacuum for Stage 1, and 376 s vacuum for Stage 2.",
          "Thrust per engine of 2.51 MN sea level and 2.73 MN vacuum for Stage 1, and 2.91 MN vacuum for Stage 2.",
          "Stage 2 needs 372.6 s to close the post-refuel mass ratio, so 375.7 s leaves about 80 m/s of reserve.",
          "Benchmarked against Raptor 2, RS-25, and RD-180 to confirm the chamber pressures and thrust levels sit inside the range of flown staged-combustion engines.",
        ],
      },
      {
        title: "Nozzle design and CFD",
        text: [
          "One of my primary technical contributions was the design and analysis of the Stage 1 and Stage 2 engine nozzles. I developed both nozzle geometries as 80% Rao bell contours from a 132.3 mm throat, with expansion ratios of 40 and 100 for the first and second stages, a contraction ratio of 2.5, and exit Mach numbers of 4.19 and 4.90.",
          "The nozzle geometries were then evaluated using axisymmetric CFD simulations, initialized from the CEA throat conditions, to examine the internal flow behavior and estimate nozzle performance. The CFD results were compared against the theoretical predictions from NASA CEA to evaluate the nozzle thrust coefficient and estimate nozzle efficiency. For Stage 1 the CFD thrust coefficient came out at 1.944 against 1.960 from CEA, and that ratio is the efficiency used in the operating point above.",
          "I also examined the exhaust plume characteristics, including the Mach number, pressure, and temperature distributions. The Stage 1 exit pressure of 70.5 kPa gives a pressure ratio of 0.70 at sea level, well above the 0.40 screening value for flow separation, so the ε = 40 bell can start on the pad.",
          "This analysis gave us a more realistic estimate of engine performance and more confidence in the selected nozzle geometries.",
        ],
        gallery: [
          { src: "assets/img/cope/s1-thrust-chamber-render.jpg", fit: "contain", dark: true, caption: "Stage 1 thrust chamber (ε = 40) with GRCop-42 liner, closeout jacket, and coolant manifolds" },
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
        title: "Engine CAD development",
        text: [
          "Alongside the propulsion analysis I developed detailed CAD models of the engine assemblies to better understand the physical integration of the major propulsion components. The models include the thrust chamber, nozzle, turbomachinery, preburners, injectors, feed lines, and thrust vector control hardware.",
          "The CAD was built parametrically, with component dimensions taken from the analytical sizing results, so the models reflect the engineering calculations used throughout the design and could be regenerated whenever an analysis number changed. Each turbopump is 49 parts with materials assigned (Ti-6Al-4V, Inconel 718, 440C with Si₃N₄ bearings), and the TVC is a 14-part connected load path from the thrust-structure ring through the gimbal cross to the injector dome.",
          "Building these assemblies was particularly valuable because it connected the theoretical propulsion analysis to the physical configuration of the engine and surfaced integration problems, like duct routing around the nozzle bell, that the spreadsheets never would have.",
        ],
        gallery: [
          { model: "assets/rocket/cope-s1-engine.glb?v=3", feature: true, neutral: true, caption: "Stage 1 engine assembly, ε = 40 (drag to rotate)" },
          { model: "assets/rocket/cope-s2-engine.glb?v=3", feature: true, neutral: true, caption: "Stage 2 engine assembly, ε = 100 (drag to rotate)" },
          { src: "assets/img/cope/s1-engine.png", fit: "contain", dark: true, caption: "Stage 1 engine render" },
          { src: "assets/img/cope/s2-engine.png", fit: "contain", dark: true, caption: "Stage 2 engine render" },
        ],
      },
    ],
    docs: [
      {
        label: "Full CDR report (PDF)",
        src: "assets/AE451-CDR.pdf",
        blurb: "Critical Design Review (October 2026) covering requirements, engine operating point, nozzle and CFD, cooling, cycle balance, turbomachinery, feed, TVC, structures, mass properties, COTS and TRL, and the drawing appendix.",
      },
      {
        label: "Preliminary Design Review (PDF)",
        src: "assets/AE441-PDR.pdf",
        blurb: "PDR report (Spring 2026) covering vehicle architecture, staging, propulsion, and subsystem trades.",
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
      "A multirotor aircraft built to carry large payloads, where I've worked on the structural CAD for the frame, motor mounts, and payload attachment, and on a flight simulation environment for testing autonomy before flight.",
    period: "Apr 2026 – Present",
    role: "CAD & Simulation Engineer",
    tags: ["SolidWorks", "Fusion 360", "Unreal Engine 5", "PX4", "Cosys-AirSim"],
    thumb: "assets/img/uav-cover.jpg",
    stats: [
      { n: "300", u: "lb", l: "Payload attachment design load" },
      { n: "360", u: "°", l: "Sensor coverage layout" },
      { n: "UE5 + PX4", l: "Simulation environment" },
    ],
    links: [],
    tools: ["SolidWorks", "Fusion 360", "Unreal Engine 5", "Cosys-AirSim", "Cesium", "PX4"],
    sections: [
      {
        title: "Overview",
        text: [
          "The Heavy Lift UAV project focuses on the development of a multirotor aircraft designed to carry large payloads while maintaining a high payload-to-weight ratio. The project involves both the structural design of the aircraft and the development of a simulation environment to support testing before physical flight operations.",
        ],
      },
      {
        title: "My contributions",
        text: [
          "My primary contributions have been the CAD models for the aircraft's structural components, including the frame, motor mounts, and payload attachment system. Using SolidWorks and Fusion 360, I've worked on designs that balance structural strength, weight, and manufacturability while accommodating payloads of approximately 300 pounds. I also laid out the sensor mounting to get full 360-degree coverage for future autonomous operations.",
          "I've also been involved in developing a flight simulation environment using Unreal Engine 5, Cosys-AirSim, and PX4, with Cesium providing global terrain. This environment lets the team evaluate aircraft behavior and test autonomous flight capabilities in simulation before implementing them on the physical vehicle.",
          "Working on both the mechanical design and the simulation side has helped me see how structural design decisions and software development each contribute to the performance of an aircraft.",
        ],
      },
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
      "Python and PyQt5 mission visualization software for spacecraft telemetry, antenna tracking, and communication blockage, used to support flight controller training and simulated missions for Orion, Starliner, and Gateway.",
    period: "Jan 2025 – Aug 2025",
    role: "Engineering Intern",
    tags: ["Python", "PyQt5", "Telemetry", "Linux", "GitLab", "Optimization"],
    thumb: "assets/img/logos/nasa.svg",
    thumbStyle: "logo",
    stats: [
      { n: "13", u: "×", l: "Overall speedup, Gateway tool" },
      { n: "21", u: "×", l: "Faster graphics rendering" },
      { n: "3", l: "Vehicles, Orion, Starliner, and Gateway" },
    ],
    links: [],
    tools: ["Python", "PyQt5", "Linux", "Spyder / VS Code", "GitLab"],
    sections: [
      {
        title: "Overview",
        text: [
          "During my internship at NASA Johnson Space Center through KBR and LZ Technology, I worked on developing and improving mission visualization software used to support flight controller training and simulated space missions.",
          "The tools were written primarily in Python and PyQt5 and provided visual representations of spacecraft telemetry, antenna tracking, and communication blockage for vehicles including Orion, Starliner, and Gateway.",
        ],
      },
      {
        title: "My contributions",
        text: [
          "One of my primary responsibilities was improving the performance of an existing Gateway visualization application. By profiling the software and finding inefficiencies in its data processing and graphics rendering, I was able to improve its overall performance by approximately 13 times, including a 21-times improvement in graphics rendering speed.",
          "I also led the development of a Starliner visualization tool that incorporated telemetry overlays to help users better understand spacecraft behavior during simulated mission operations.",
          "Throughout the internship I worked in a Linux development environment and gained experience with Python application development, debugging, software optimization, and version control in GitLab.",
        ],
      },
      {
        title: "Looking back",
        text: [
          "This internship was particularly valuable because it showed me how software development supports real aerospace operations. It also strengthened my programming skills and gave me a better appreciation for building reliable, efficient tools for engineering use.",
        ],
      },
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
      "A student-built, scaled-down version of NASA's Artemis launch vehicle, where I contributed CAD models of rocket components and OpenRocket and MATLAB flight simulations as part of a 15-member team.",
    period: "Aug 2024 – Jan 2025",
    role: "Manufacturing Member",
    tags: ["CATIA V5", "SolidWorks", "OpenRocket", "Manufacturing"],
    thumb: "assets/img/artemis-cover.png",
    model: "assets/rocket/artemis.glb",
    links: [],
    tools: ["CATIA V5", "SolidWorks", "OpenRocket", "MATLAB"],
    sections: [
      {
        title: "Overview",
        text: [
          "The Artemini Rocket project was a student-led effort through Embry-Riddle Future Space Explorers to design and develop a scaled-down version of NASA's Artemis launch vehicle. As part of a 15-member team, I contributed to the design and development of the rocket, with a focus on CAD modeling and flight performance analysis.",
        ],
      },
      {
        title: "My contributions",
        text: [
          "I developed 3D models of rocket components using CATIA V5 and SolidWorks, and ran flight simulations in OpenRocket and MATLAB to evaluate trajectory and stability characteristics. I also worked with other team members to fold in design changes and support the integration of the rocket's structural components.",
          "The project gave me more experience with rocket design and showed me how CAD development, flight simulation, and teamwork all have to fit together over the course of a build.",
        ],
      },
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
      "A high-powered rocket with an active stabilization system, where I worked on the hardware team designing and testing the canard control system, modeling structural parts in Fusion 360, and analyzing test data in MATLAB.",
    period: "Aug 2022 – May 2024",
    role: "Hardware Member",
    tags: ["Fusion 360", "MATLAB", "Hardware", "Data analysis"],
    thumb: "assets/img/spectre-cover.png",
    thumbFit: "contain",
    links: [],
    tools: ["Fusion 360", "MATLAB", "Hand assembly / soldering"],
    sections: [
      {
        title: "Overview",
        text: [
          "The Spectre Rocket project was a student-led effort through Embry-Riddle's Experimental Rocket Propulsion Lab to develop a high-powered rocket with an active stabilization system. It was a chance to get hands-on experience with rocket hardware, structural design, and testing while working alongside a team of about 10 students.",
        ],
      },
      {
        title: "My contributions",
        text: [
          "As a member of the hardware team, I contributed to the design, assembly, and testing of the rocket's active stabilization system, including its canard control surfaces. I also developed structural CAD models in Fusion 360, helped with avionics hardware assembly and soldering, and analyzed experimental test data in MATLAB to support design improvements.",
          "Spectre was one of my earlier opportunities to work with real rocket hardware. It helped me build practical engineering skills and understand how testing and design iterations add up to a working system.",
        ],
      },
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
