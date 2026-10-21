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
    id: "lunar-mission",
    order: 1,
    title: "COPE: Two-Stage Methalox Crewed Lunar Vehicle",
    category: "Senior capstone · Project & Systems Lead · Embry-Riddle",
    tagline:
      "A two-stage, orbitally refueled LOX/CH₄ launch vehicle that takes three crew to the lunar surface and back. I lead the six-person team and own the engine design, CFD, turbomachinery, thrust vector control, mass properties, and all of the Onshape CAD, through PDR and CDR.",
    period: "Jan 2026 – Present",
    role: "Project & Systems Lead",
    tags: ["Onshape", "OpenFOAM", "NASA CEA", "MATLAB", "CATIA V5"],
    thumb: "assets/img/lunar-mission-cover.png",
    accent: "#ff9a3c",
    stats: [
      { n: "19.5", u: "km/s", l: "Mission ΔV, 19,505 m/s delivered" },
      { n: "95", u: "m", l: "Vehicle height · 6.9 m diameter" },
      { n: "1.43", u: "Mkg", l: "Liftoff mass · T/W 1.43" },
      { n: "11", u: "engines", l: "8 on Stage 1 · 3 on Stage 2" },
      { n: "2.51", u: "MN", l: "Sea-level thrust per engine" },
    ],
    links: [],
    tools: [
      "NASA CEA", "OpenFOAM (rhoCentralFoam) + ParaView", "MATLAB", "Onshape + FeatureScript",
      "CATIA V5", "Fusion 360", "Requirements / WBS (MIL-STD-881F)", "Trade studies", "Python (CAD automation, report build)",
    ],
    sections: [
      {
        title: "The mission",
        text: [
          "COPE (Crewed Operations for Planetary Exploration) is our two-semester capstone at Embry-Riddle. The vehicle is a two-stage LOX/methane launch vehicle: Stage 1 puts Stage 2 and an Orion-class capsule into low Earth orbit, tanker flights (the same Stage 2 with the capsule swapped for propellant) refuel it, and Stage 2 then does trans-lunar injection, halo-orbit insertion, lunar landing and liftoff, and trans-Earth injection. Three astronauts and a 5,000 kg payload, 19.5 km/s total ΔV, 95 m tall, 6.9 m diameter, 1.43 million kg at liftoff.",
          "I am the project and systems lead on a team of six. In the spring we took it through Preliminary Design Review; in October 2026 we delivered the Critical Design Review. Both reports are linked at the bottom of this page, and the homepage has the interactive stack, both engines in 3D, and a live flow model of the nozzles.",
        ],
        gallery: [
          { model: "assets/rocket/full-launch-vehicle.glb", feature: true, caption: "Full launch stack (drag to rotate)" },
        ],
        note: {
          text: "Explode the stack, orbit the engines, and run the nozzle flow on the homepage.",
          label: "Open the interactive section",
          href: "index.html#rocket",
        },
      },
      {
        title: "Preliminary design (spring 2026)",
        text: [
          "PDR was about getting the architecture to close. I wrote the MATLAB vehicle-sizing model, iterating the rocket equation across both stages and the refueling scheme until the mass fractions and ΔV split worked, ran LOX/CH₄ combustion cases in NASA CEA to set engine Isp and sizing assumptions, and ran the team's trade studies across propulsion, structures, GNC, and thermal. I also built the full launch-vehicle assembly in CATIA V5 and Fusion 360 with a parts breakdown for each stage. The sizing script below is the one that set the baseline the CDR was built on.",
        ],
        code: {
          title: "AE441_PDR.m",
          src: "assets/code/cope-vehicle-sizing.m",
          lang: "MATLAB",
          caption: "Vehicle sizing: two-stage LOX/CH₄ staging, tanker kit, tank geometry, and ΔV budget (MATLAB).",
        },
      },
      {
        title: "Critical design (fall 2026): what I owned",
        text: [
          "At CDR every requirement from the system level down to WBS level 4 had to have an analysis result and a status. I wrote the requirements tables and the work breakdown structure (numbered to MIL-STD-881F), and I was the only one working on the engine operating point, the nozzle contours and CFD, the turbopumps, injectors, and preburners, the feed ducts, thrust vector control, mass properties and the inertia matrices, the COTS and TRL assessment, and all of the Onshape CAD and dimensioned drawings. Teammates owned the regenerative cooling analysis and the structures, and the cycle balance was shared. Because I was also the systems lead, integrating all of it into one consistent design was my job.",
          "Everything below is from the CDR report. All level-4 requirements closed as met, with the two engine thrust allocations met within the 5% tolerance.",
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
          "I designed both bells as 80% Rao contours from a 132.3 mm throat: a contraction ratio of 2.5, L* of 1.10 m, 1.674 m and 2.646 m exit diameters, exit Mach 4.19 and 4.90. Then I set up each nozzle as an axisymmetric inviscid case in OpenFOAM (rhoCentralFoam), initialized from the CEA throat conditions and run until thrust settled.",
          "The CFD thrust coefficient came out just under CEA's (1.944 against 1.960 for Stage 1), and that ratio is the nozzle efficiency used in the operating-point numbers above. The Stage 1 exit pressure of 70.5 kPa gives a pe/pa of 0.70 at sea level, well above the 0.40 separation screen, so the ε = 40 bell is safe to start on the pad. I also ran the exhaust plume for both engines to look at the shock structure downstream of the exit.",
        ],
        table: {
          head: ["Parameter", "S1 CFD", "S1 CEA", "S2 CFD", "S2 CEA"],
          rows: [
            ["Mass flow [kg/s]", "759.6", "756.8", "775.0", "772.9"],
            ["Vacuum thrust [MN]", "2.730", "2.752", "2.915", "2.929"],
            ["Vacuum Cf", "1.9439", "1.9597", "2.0319", "2.0417"],
            ["Vacuum Isp (ideal c*) [s]", "366.4", "370.8", "383.5", "386.4"],
            ["Exit pressure [kPa]", "70.5", "64.6", "24.0", "20.0"],
          ],
        },
        gallery: [
          { src: "assets/img/cope/nozzle-contours.jpg", fit: "contain", caption: "Rao 80% bell contours, Stage 1 (ε = 40) and Stage 2 (ε = 100), MATLAB" },
          { src: "assets/img/cope/nozzle-flow-1d.jpg", fit: "contain", caption: "Quasi-1D Mach, pressure, and temperature along both contours (the same solution the homepage flow model plays)" },
          { src: "assets/img/cope/s1-nozzle-mach.jpg", fit: "contain", caption: "Stage 1 nozzle Mach number, OpenFOAM axisymmetric case" },
          { src: "assets/img/cope/s2-nozzle-mach.jpg", fit: "contain", caption: "Stage 2 nozzle Mach number" },
          { src: "assets/img/cope/s1-plume-ma.jpg", wide: true, fit: "contain", caption: "Stage 1 exhaust plume Mach number contours (sea level)" },
          { src: "assets/img/cope/s1-plume-p.jpg", fit: "contain", caption: "Stage 1 plume pressure" },
          { src: "assets/img/cope/s1-plume-t.jpg", fit: "contain", caption: "Stage 1 plume temperature" },
          { src: "assets/img/cope/s2-plume-ma.jpg", fit: "contain", caption: "Stage 2 (ε = 100) plume Mach number" },
          { src: "assets/img/cope/s1-thrust-chamber-render.jpg", fit: "contain", dark: true, caption: "Stage 1 thrust chamber in Onshape: GRCop-42 liner, closeout jacket, coolant manifolds" },
        ],
      },
      {
        title: "Thermal analysis and regenerative cooling",
        text: [
          "The chamber liner sees up to 144 MW/m² at the throat, so the whole bell is regeneratively cooled with the methane. The model marches along the contour: Bartz for the gas-side coefficient, conduction through a 0.28 mm hot wall, Dittus-Boelter on the coolant side with CoolProp methane properties, and a fin correction for the channel ribs. Three parallel branches split the methane 35 / 30 / 35% between the chamber, the inner nozzle, and the extension, and their outlets are pressure-balanced before the heated methane goes to the preburners.",
          "A weighted trade (thermal conductivity and temperature capability at 0.30 each) picked GRCop-42 over CuCrZr, NASA HR-1, and Inconel 718 for the liner. With 1,600 channels per branch and the coupled cycle, the peak hot-wall temperature is 797 K on Stage 1 and 801 K on Stage 2 against the 1,000 K limit, and the 5.1 to 5.4 MPa jacket pressure drop is what the pump discharge pressures in the cycle balance have to cover.",
        ],
        table: {
          head: ["Parameter", "Stage 1", "Stage 2"],
          rows: [
            ["Peak heat flux [MW/m²]", "144.1", "146.3"],
            ["Peak hot-wall temperature [K]", "797", "801"],
            ["Cooling jacket pressure drop [MPa]", "5.14", "5.36"],
            ["Mixed coolant outlet temperature [K]", "381", "412"],
            ["Total heat load [MW]", "144", "165"],
            ["Regeneratively cooled area [m²]", "8.5", "21.7"],
          ],
        },
        code: {
          title: "regen_cooling_CDR.m",
          src: "assets/code/cope-regen-cooling.m",
          lang: "MATLAB",
          caption: "Regenerative cooling model: Bartz gas side, wall conduction, three coolant branches marched along the contour with a methane property table.",
        },
        gallery: [
          { src: "assets/img/cope/regen-profiles.jpg", wide: true, fit: "contain", caption: "Heat flux, wall temperatures, coolant temperature and pressure along the Stage 1 and Stage 2 contours" },
          { src: "assets/img/cope/regen-material-trade.jpg", fit: "contain", caption: "Liner material screening: GRCop-42 is the only candidate with margin at these heat fluxes" },
          { src: "assets/img/cope/regen-stage1-team.jpg", fit: "contain", caption: "Stage 1 cooling solution coupled into the cycle" },
        ],
      },
      {
        title: "Engine cycle balance",
        text: [
          "The full-flow staged-combustion cycle was solved as a pressure and power balance: pump discharge pressures of 51.2 MPa (CH₄) and 45.4 MPa (LOX) on Stage 1, the methane through the cooling jacket, both propellants into a fuel-rich (O/F 0.25) and an oxidizer-rich (O/F 50) preburner, each turbine expanding to the 1.20 Pc injector inlet, and a 20% injector drop down to chamber pressure. Each preburner pressure was solved so its turbine delivers at least 10% more power than its pump needs, with the regen-heated methane enthalpy included in the preburner temperatures.",
          "On Stage 2 the pump discharge pressures were iterated with the cooling model instead of fixed. The remaining open trade is the preburner mixture ratios: the heated methane pushes the fuel-rich preburner to 1,010 K against a 1,000 K turbine-inlet assumption, which a small O/F change would clear.",
        ],
        table: {
          head: ["Station [MPa]", "Stage 1", "Stage 2"],
          rows: [
            ["CH₄ pump discharge / jacket inlet", "51.20", "50.90"],
            ["Cooling-jacket outlet", "46.06", "45.54"],
            ["LOX pump discharge", "45.40", "45.54"],
            ["Fuel-rich preburner", "40.60", "41.22"],
            ["Oxidizer-rich preburner", "41.87", "42.79"],
            ["Turbine outlet / injector inlet (1.20 Pc)", "30.64", "31.30"],
            ["Chamber pressure", "25.53", "26.08"],
          ],
        },
        bullets: [
          "Pump shaft power 25.8 MW (CH₄) and 29.6 MW (LOX); turbines 28.4 MW and 32.6 MW, a 10% margin on both sides of both stages.",
          "Preburner gas: 1,010 K fuel-rich, 858 K ox-rich on Stage 1; turbine pressure ratios 1.33 and 1.37.",
        ],
        code: {
          title: "AE451_Stage1_FFSC_with_regen_FIXED.m",
          src: "assets/code/cope-stage1-ffsc-cycle.m",
          lang: "MATLAB",
          caption: "Stage 1 FFSC cycle balance with the regenerative jacket coupled into the methane path and both preburner pressures solved for the 10% turbine margin.",
        },
        gallery: [
          { src: "assets/img/cope/cycle-power-balance.jpg", fit: "contain", caption: "Stage 1 turbine power against pump demand across preburner pressure" },
          { src: "assets/img/cope/cycle-pb-temps.jpg", fit: "contain", caption: "Preburner temperature against mixture ratio for the fuel-rich and ox-rich sides" },
        ],
      },
      {
        title: "Turbopumps, injector, and preburners",
        text: [
          "The pumps are common to both engines and sized at the Stage 1 point from the cycle balance. The methane pump is a two-stage impeller running 11,162 rpm at 25.8 MW with 12,259 m of head; the LOX pump is single-stage, 7,131 rpm, 29.6 MW. Inducers were sized for cavitation margin at the design inlet pressures (NPSH available over critical of 1.12 for methane and 1.26 for LOX, against a 1.10 requirement), and the feed system actually delivers more than that in flight.",
          "The main injector is a gas-gas coaxial design, since both propellants arrive as preburner gas: 130 elements in seven rings, ox-rich gas through the center post, fuel-rich gas around it, with a pressure drop of 20% of chamber pressure. The fuel-rich preburner runs at O/F 0.25 and 40.6 MPa (1,010 K) with 19 elements, the ox-rich preburner at O/F 50 and 41.9 MPa (858 K) with 37.",
        ],
        table: {
          head: ["Turbopump", "Fuel (CH₄)", "Oxidizer (LOX)"],
          rows: [
            ["Volume flow [m³/s]", "0.405", "0.526"],
            ["Head [m] · shaft speed [rpm]", "12,259 · 11,162", "4,023 · 7,131"],
            ["Shaft power [MW]", "25.78", "29.60"],
            ["Impeller stages · outlet diameter [mm]", "2 · 559", "1 · 701"],
            ["Impeller tip speed [m/s]", "327", "262"],
            ["Inducer tip / hub diameter [mm]", "186 / 56", "236 / 71"],
            ["NPSH available / critical [m]", "45.6 / 40.8", "22.5 / 17.8"],
            ["Turbine diameter [mm] · power [MW]", "449 · 28.35", "446 · 32.56"],
          ],
        },
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
        title: "Feed system and engine ducts",
        text: [
          "One LOX and one methane duct per engine, sized for 9 m/s (10% under the 10 m/s requirement) and rounded up to the next 5 mm: 275 / 240 mm on Stage 1 and 280 / 245 mm on Stage 2. The pump-inlet pressure budget was then checked at liftoff, Stage 2 ignition, post-refuel TLI ignition, and burnout of each stage, from tank ullage plus the propellant head under the axial load factor minus the fitting losses. The lowest delivered inlet pressures (0.401 MPa LOX at burnout, 0.392 MPa methane at post-refuel ignition) clear the 0.351 and 0.285 MPa design inlets, so the extra pressure is cavitation margin.",
        ],
      },
      {
        title: "Thrust vector control",
        text: [
          "I traded gimbal-plus-electromechanical actuators against hydraulic actuation, differential throttling, and jet vanes, and went with gimbals and EMAs on every engine. To size them I wrote an ascent simulation (gravity turn, US-76 atmosphere, 4 g throttle schedule, shooting solver to a 200 km circular orbit) to find max-q: 35 kPa at 10.7 km and Mach 1.45. With a 1.5× disturbance-moment factor the Stage 1 engines need 5.05° at max-q and 6.47° with an outer engine out; Stage 2 needs 3.89° for an engine-out case at TLI. That set a common ±6° gimbal for both stages, with differential throttling of the opposite engine covering the Stage 1 engine-out case.",
        ],
        bullets: [
          "Actuator force 160 kN (Stage 1) and 257 kN (Stage 2) including a 25% force margin, ±63 mm stroke, 0.105 m/s rate.",
          "22 kW and 36 kW electrical per actuator; 358 kW and 215 kW peak TVC bus power per stage, on dedicated battery packs.",
          "Gimbal pin 65 / 70 mm, actuator moment arm 600 mm; Moog MEMA-class actuators carried as COTS.",
        ],
        code: {
          title: "Detail_Ascent.m",
          src: "assets/code/cope-ascent.m",
          lang: "MATLAB",
          caption: "Planar ascent with a shooting solver on the kick angle and Stage 2 linear-tangent steering; its max-q point sizes the TVC.",
        },
        gallery: [
          { src: "assets/img/cope/s1-tvc.png", fit: "contain", caption: "Stage 1 gimbal and TVC: thrust-structure ring, gimbal cross, two EMAs, injector-dome interface" },
          { src: "assets/img/cope/s1-tvc-render.jpg", fit: "contain", dark: true, caption: "TVC assembly on the Stage 1 engine" },
          { src: "assets/img/cope/tvc-authority.jpg", fit: "contain", caption: "Required gimbal deflection vs angle of attack at max-q, nominal and engine-out" },
          { src: "assets/img/cope/ascent-profiles.jpg", fit: "contain", caption: "Ascent simulation: altitude, velocity, dynamic pressure, and acceleration vs time" },
        ],
      },
      {
        title: "Structures and loads",
        text: [
          "The tanks were sized from the propellant masses at a 95% fill fraction on the common 6.9 m diameter: 665 and 514 m³ on Stage 1, 569 and 439 m³ on Stage 2, with a 4.70 m interstage to clear the 4.08 m Stage 2 thrust chamber. Stacking the engine sections, tanks, interstage, and the 20.4 m Orion crew and abort system gives 94.93 m against the 95 m requirement. The interstage and capsule adapter were checked at liftoff, Stage 1 burnout, and Stage 2 flight; the worst case is the end of the Stage 1 burn at 43 m/s², 15.43 MN through the interstage and 178 MPa in its 4 mm wall against the 180 MPa limit.",
        ],
        gallery: [
          { src: "assets/img/cope/struct-vmp.jpg", fit: "contain", caption: "Shear, moment, and axial load distribution along the vehicle at max-q" },
          { src: "assets/img/cope/struct-maxq-forces.jpg", fit: "contain", caption: "Station loads at max-q" },
          { src: "assets/img/cope/tanks.png", fit: "contain", caption: "Stage 1 and Stage 2 propellant tanks" },
        ],
      },
      {
        title: "Mass properties and inertia",
        text: [
          "Engine masses were built bottom-up by component with a 5 to 20% mass growth allowance depending on maturity. The Stage 1 engine came out at 2,688 kg against a 2,800 kg allocation and the Stage 2 engine at 3,106 kg against 3,300 kg. Rolled up with the feed system, pressurization, and TVC hardware, the dry propulsion system is 41.8 t with its CG 16.34 m above the Stage 1 exit plane. I calculated the inertia tensor per stage and for the whole propulsion system by combining each component's own inertia through the parallel-axis theorem, so the off-diagonal terms come from the actual layout rather than an assumed symmetric system.",
        ],
        table: {
          head: ["System", "MEV [kg]", "X_CG [m]", "Ixx / Iyy / Izz [kg·m²]"],
          rows: [
            ["Stage 1 engine", "2,688", "1.37", "1,075 / 1,790 / 2,069"],
            ["Stage 2 engine", "3,106", "1.71", "1,713 / 4,930 / 5,228"],
            ["Stage 1 propulsion, dry", "29,102", "3.23", "152,347 / 799,027 / 801,186"],
            ["Stage 2 propulsion, dry", "12,717", "46.32", "51,013 / 322,852 / 323,717"],
            ["Entire propulsion system", "41,819", "16.34", "203,362 / 17.55M / 17.56M"],
          ],
        },
        gallery: [
          { src: "assets/img/cope/mass-breakdown.jpg", wide: true, fit: "contain", caption: "Engine component mass breakdown, CBE plus MGA, Stage 1 and Stage 2" },
        ],
      },
      {
        title: "COTS and technology readiness",
        text: [
          "Every item that we are not designing ourselves was assigned a supplier, a part family, and a TRL, from the Orion-class capsule and launch abort motor down to the turbopump hybrid bearings, cryogenic ball valves, igniters, flex joints, separation joints, pressure transducers, star trackers, and the TVC actuators and their batteries. The lowest-TRL items in the architecture are the orbital cryogenic propellant transfer and the GRCop-42 additively manufactured liner, and both carry a maturation plan in the report.",
        ],
      },
      {
        title: "Engine CAD and drawings",
        text: [
          "The engines were built natively in Onshape, parametrically: the thrust chamber is revolved from the exported Rao contour with the cooled wall, and the turbopumps and TVC are custom FeatureScript features driven by the dimensions from the sizing scripts, so the CAD regenerated whenever an analysis number changed. Each turbopump is 49 parts with materials assigned (Ti-6Al-4V, Inconel 718, 440C with Si₃N₄ bearings): bolted inlet, discharge, and hot-gas flanges, labyrinth seal, keyed shaft, shrouded turbine. The TVC is a 14-part connected load path from the thrust-structure ring through the gimbal cross to the injector dome, with the two actuators pinned at both ends.",
          "From those models I produced the dimensioned drawing set for the appendix: engine assemblies, thrust chambers and liners, turbopumps with impeller, inducer, turbine rotor, and shaft sheets, main injectors, preburners, gimbal and TVC, and the propellant tanks. The 3D models below are the layout-level engine assemblies; the full detail is in the Onshape document and the drawings.",
        ],
        gallery: [
          { model: "assets/rocket/cope-s1-engine.glb", feature: true, caption: "Stage 1 engine assembly, ε = 40: thrust chamber, injector dome, gimbal, turbopumps, preburners (drag to rotate)" },
          { model: "assets/rocket/cope-s2-engine.glb", feature: true, caption: "Stage 2 engine assembly, ε = 100 (drag to rotate)" },
          { src: "assets/img/cope/s1-engine.png", fit: "contain", dark: true, caption: "Stage 1 engine render" },
          { src: "assets/img/cope/s2-engine.png", fit: "contain", dark: true, caption: "Stage 2 engine render" },
          { src: "assets/img/cope/drawing-s1-engine.jpg", wide: true, fit: "contain", caption: "COPE-ENG-001, Stage 1 engine assembly drawing" },
          { src: "assets/img/cope/drawing-s2-engine.jpg", fit: "contain", caption: "COPE-ENG-002, Stage 2 engine assembly" },
          { src: "assets/img/cope/drawing-s1-thrust-chamber.jpg", fit: "contain", caption: "COPE-TC-001, Stage 1 thrust chamber" },
          { src: "assets/img/cope/drawing-fuel-turbopump.jpg", fit: "contain", caption: "COPE-TP-001, methane turbopump" },
          { src: "assets/img/cope/drawing-fuel-turbine.jpg", fit: "contain", caption: "COPE-TB-001, fuel turbine" },
          { src: "assets/img/cope/drawing-s1-injector.jpg", fit: "contain", caption: "COPE-INJ-001, Stage 1 main injector" },
          { src: "assets/img/cope/drawing-fr-preburner.jpg", fit: "contain", caption: "COPE-PB-001, fuel-rich preburner" },
          { src: "assets/img/cope/drawing-s1-tvc.jpg", fit: "contain", caption: "COPE-TVC-001, Stage 1 gimbal and TVC" },
          { src: "assets/img/cope/drawing-s1-lox-tank.jpg", fit: "contain", caption: "COPE-TK-001, Stage 1 LOX tank" },
        ],
      },
    ],
    docs: [
      {
        label: "Critical Design Review (PDF)",
        src: "assets/AE451-CDR.pdf",
        blurb: "Full CDR report (October 2026): requirements to WBS level 4, engine operating point, nozzle and CFD, regenerative cooling, cycle balance, turbomachinery, feed, TVC, structures, mass properties, COTS and TRL, and the drawing appendix.",
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
    id: "collins-avionics",
    order: 2,
    title: "Avionic Systems Development",
    category: "Systems Engineering Intern · Collins Aerospace",
    tagline:
      "Test automation, requirements verification, and benchmarking of an internal AI test-case generation tool for transponder products.",
    period: "May 2026 – Present",
    role: "Systems Engineering Intern",
    tags: ["Python", "Requirements verification", "Jama", "GitLab", "AI evaluation"],
    thumb: "assets/img/logos/collins.svg",
    thumbStyle: "logo",
    accent: "#4d8dff",
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
    accent: "#22c3a6",
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
    accent: "#4d8dff",
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
    accent: "#ff8a4d",
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
    accent: "#ff8a4d",
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
