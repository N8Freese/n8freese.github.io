// Interactive 3D viewer for the COPE hardware (Three.js).
//
// Four models share one canvas: the full launch stack, the on-orbit refuel &
// crew configuration, and the Stage 1 and Stage 2 engine assemblies. The
// visitor can drag to orbit (auto-rotation resumes after a pause), click or
// tap to explode the assembly, and switch models with the segmented control.
// Render loop pauses when the viewer is off-screen.
//
// Materials: the engine GLBs carry per-part PBR materials from the STEP
// conversion (graphite thrust chamber, steel pumps, Inconel preburners). The
// refuel model has named parts and is painted by name. The launch vehicle
// arrives as ONE welded mesh, so it is split into connected components and
// each piece is classified by its size and position (shell, tank, engine,
// ring, capsule) and painted to match: blue LOX, amber CH4, graphite engines,
// white structure, black bands.

import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './jsm/environments/RoomEnvironment.js';

const root = document.querySelector('[data-rocket]');
const canvas = root && root.querySelector('[data-canvas]');
if (root && canvas) init();

/* ---- palette ------------------------------------------------------------ */
const PAINT = {
  shell:    { color: 0xe9eaee, metalness: 0.15, roughness: 0.55 },
  band:     { color: 0x16181d, metalness: 0.35, roughness: 0.6 },
  inner:    { color: 0xb3b9c4, metalness: 0.6, roughness: 0.45 },
  lox:      { color: 0x8fb8e0, metalness: 0.35, roughness: 0.4 },
  ch4:      { color: 0xd9a441, metalness: 0.35, roughness: 0.4 },
  engine:   { color: 0x33363d, metalness: 0.75, roughness: 0.38 },
  capsule:  { color: 0xe9eaee, metalness: 0.2, roughness: 0.5 },
  shield:   { color: 0x4a3f36, metalness: 0.3, roughness: 0.7 },
  misc:     { color: 0x8c929c, metalness: 0.6, roughness: 0.5 },
};
function mat(key) {
  const p = PAINT[key] || PAINT.misc;
  const m = new THREE.MeshStandardMaterial({ color: p.color, metalness: p.metalness, roughness: p.roughness });
  m.envMapIntensity = 1.1;
  m.side = THREE.DoubleSide;
  return m;
}

/* ---- geometry splitting ---------------------------------------------------
 * Both splitters return plain { p:[], n:[] } triangle soups. */
function canonicalIds(geo) {
  const pos = geo.attributes.position;
  const bb = geo.boundingBox;
  const eps = bb.getSize(new THREE.Vector3()).length() * 1e-5 || 1e-6;
  const map = new Map();
  const ids = new Uint32Array(pos.count);
  let next = 0;
  for (let i = 0; i < pos.count; i++) {
    const key = Math.round(pos.getX(i) / eps) + ',' + Math.round(pos.getY(i) / eps) + ',' + Math.round(pos.getZ(i) / eps);
    let id = map.get(key);
    if (id === undefined) { id = next++; map.set(key, id); }
    ids[i] = id;
  }
  return { ids, uniqueCount: next };
}

function splitByComponents(mesh) {
  const geo = mesh.geometry;
  geo.computeBoundingBox();
  const pos = geo.attributes.position, nor = geo.attributes.normal, index = geo.index;
  const triCount = index ? index.count / 3 : pos.count / 3;
  const { ids, uniqueCount } = canonicalIds(geo);
  const parent = new Uint32Array(uniqueCount);
  for (let i = 0; i < uniqueCount; i++) parent[i] = i;
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { a = find(a); b = find(b); if (a !== b) parent[b] = a; }
  const vid = (t, k) => ids[index ? index.getX(t * 3 + k) : t * 3 + k];
  for (let t = 0; t < triCount; t++) { union(vid(t, 0), vid(t, 1)); union(vid(t, 0), vid(t, 2)); }
  const groups = new Map();
  for (let t = 0; t < triCount; t++) {
    const r = find(vid(t, 0));
    let g = groups.get(r);
    if (!g) { g = []; groups.set(r, g); }
    g.push(t);
  }
  if (groups.size < 2) return null;
  const a = new THREE.Vector3();
  function soupFrom(tris) {
    const p = [], n = [], cen = new THREE.Vector3();
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    tris.forEach((t) => {
      for (let k = 0; k < 3; k++) {
        const i = index ? index.getX(t * 3 + k) : t * 3 + k;
        a.fromBufferAttribute(pos, i);
        p.push(a.x, a.y, a.z); cen.add(a); min.min(a); max.max(a);
        if (nor) n.push(nor.getX(i), nor.getY(i), nor.getZ(i));
      }
    });
    cen.divideScalar(tris.length * 3);
    return { p, n, cen, min, max, diag: min.distanceTo(max) };
  }
  const comps = [...groups.values()].map(soupFrom).sort((x, y) => y.diag - x.diag);
  const modelDiag = geo.boundingBox.min.distanceTo(geo.boundingBox.max);
  // absorb near-coincident shells (a tank's inner + outer wall) into one part
  const merged = [];
  comps.forEach((s) => {
    const twin = merged.find((k) => k.cen.distanceTo(s.cen) < modelDiag * 0.01 && Math.abs(k.diag - s.diag) < Math.max(k.diag, s.diag) * 0.2);
    if (twin) {
      for (let i = 0; i < s.p.length; i++) twin.p.push(s.p[i]);
      for (let i = 0; i < s.n.length; i++) twin.n.push(s.n[i]);
      twin.min.min(s.min); twin.max.max(s.max);
    } else merged.push(s);
  });
  const MIN_DIAG = modelDiag * 0.02;
  const MAX_PARTS = 40;
  const kept = merged.filter((s, i) => i < MAX_PARTS && s.diag >= MIN_DIAG);
  if (kept.length < 2) return null;
  merged.forEach((s) => {
    if (kept.includes(s)) return;
    let best = kept[0], bd = Infinity;
    kept.forEach((k) => { const d = k.cen.distanceToSquared(s.cen); if (d < bd) { bd = d; best = k; } });
    for (let i = 0; i < s.p.length; i++) best.p.push(s.p[i]);
    for (let i = 0; i < s.n.length; i++) best.n.push(s.n[i]);
  });
  return kept;
}

function splitIntoBands(mesh, N) {
  const geo = mesh.geometry;
  geo.computeBoundingBox();
  const bb = geo.boundingBox, size = new THREE.Vector3();
  bb.getSize(size);
  const axis = size.x >= size.y && size.x >= size.z ? 'x' : (size.y >= size.z ? 'y' : 'z');
  const lo = bb.min[axis], span = size[axis] || 1;
  const pos = geo.attributes.position, nor = geo.attributes.normal, index = geo.index;
  const triCount = index ? index.count / 3 : pos.count / 3;
  const bands = Array.from({ length: N }, () => ({ p: [], n: [] }));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3, i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1, i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    let bi = Math.floor((((a[axis] + b[axis] + c[axis]) / 3 - lo) / span) * N);
    bi = bi < 0 ? 0 : bi >= N ? N - 1 : bi;
    const band = bands[bi], idx = [i0, i1, i2], v = [a, b, c];
    for (let k = 0; k < 3; k++) {
      band.p.push(v[k].x, v[k].y, v[k].z);
      if (nor) band.n.push(nor.getX(idx[k]), nor.getY(idx[k]), nor.getZ(idx[k]));
    }
  }
  return bands.filter((band) => band.p.length);
}

function soupToMesh(soup, material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(soup.p, 3));
  if (soup.n && soup.n.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(soup.n, 3));
  else g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}

/* ---- paint rules --------------------------------------------------------- */
// Launch vehicle: classify each split component by its size and position.
function paintVehicleParts(parts, axis) {
  const lat = ['x', 'y', 'z'].filter((ax) => ax !== axis);
  let lo = Infinity, hi = -Infinity, R = 0;
  const info = parts.map((m) => {
    const bb = m.geometry.boundingBox;
    const rad = Math.max(bb.max[lat[0]] - bb.min[lat[0]], bb.max[lat[1]] - bb.min[lat[1]]) / 2;
    lo = Math.min(lo, bb.min[axis]); hi = Math.max(hi, bb.max[axis]); R = Math.max(R, rad);
    return { m, rad, lo: bb.min[axis], hi: bb.max[axis], len: bb.max[axis] - bb.min[axis] };
  });
  const H = hi - lo;
  const shells = info.filter((p) => p.rad > 0.95 * R && p.len > 0.15 * H);
  shells.forEach((p) => { p.kind = 'shell'; });
  info.forEach((p) => {
    if (p.kind) return;
    if (p.rad > 0.97 * R) { p.kind = 'shell'; return; }                  // rings, interstage, adapters, fairings: structure
    if (p.rad < 0.35 * R && p.len > 0.015 * H && p.len < 0.06 * H) { p.kind = 'engine'; return; } // engine bells (base cluster and stage 2)
    if (p.rad < 0.35 * R) { p.kind = 'misc'; return; }
    // inner part: hosted by a shell that covers most of its length?
    const host = shells.find((s) => Math.min(s.hi, p.hi) - Math.max(s.lo, p.lo) > 0.5 * p.len);
    if (host) { p.host = host; p.kind = 'inner'; }
    else p.kind = p.len > 0.08 * H ? 'capsule' : (p.lo > lo + 0.5 * H ? 'shield' : 'shell');
  });
  // within each shell: the longest inner part is the tank structure; the rest
  // are propellant tanks, painted LOX (lower) / CH4 (upper)
  shells.forEach((s) => {
    const inner = info.filter((p) => p.host === s).sort((a, b) => b.len - a.len);
    if (!inner.length) return;
    inner[0].kind = 'inner';
    const shellLen = s.hi - s.lo;
    const tanks = inner.slice(1).filter((p) => p.len > 0.25 * shellLen).sort((a, b) => a.lo - b.lo);
    tanks.forEach((t, i) => { t.kind = i % 2 === 0 ? 'lox' : 'ch4'; t.tank = true; });
  });
  // explode groups: stage 1, stage 2, crew section. Each stage moves as one unit so
  // tanks, engines and fairings stay inside their stage.
  const ordered = shells.slice().sort((a, b) => a.lo - b.lo);
  const cut1 = ordered.length > 1 ? (ordered[0].hi + ordered[1].lo) / 2 : lo + H / 3;
  const cut2 = ordered.length > 1 ? ordered[ordered.length - 1].hi + 0.01 * H : lo + 2 * H / 3;
  info.forEach((p) => {
    const c = (p.lo + p.hi) / 2;
    p.m.userData.cluster = c < cut1 ? 0 : (c < cut2 ? 1 : 2);
    p.m.material = mat(p.kind); p.m.name = p.kind;
    if (p.tank || p.kind === 'inner') {
      // coincident tank/shell surfaces flicker; pull internals in by 1.5% radially
      const c = p.m.geometry.boundingBox.getCenter(new THREE.Vector3());
      const sc = new THREE.Vector3(0.97, 0.97, 0.97); sc[axis] = 1;
      p.m.geometry.translate(-c.x, -c.y, -c.z); p.m.geometry.scale(sc.x, sc.y, sc.z); p.m.geometry.translate(c.x, c.y, c.z);
    }
  });
}
// Refuel & crew model: parts are named in the GLB.
function paintByName(mesh) {
  const n = String(mesh.name || '').toLowerCase();
  let key = 'shell';
  if (n.includes('lox')) key = 'lox';
  else if (n.includes('meth')) key = 'ch4';
  else if (n.includes('heat')) key = 'shield';
  else if (n.includes('engine bay')) key = 'band';
  else if (n.includes('engine')) key = 'engine';
  else if (n.includes('adapter')) key = 'band';
  else if (n.includes('avionics')) key = 'inner';
  else if (n.includes('capsule')) key = 'capsule';
  mesh.material = mat(key);
}

function init() {
  const placeholder = root.querySelector('[data-placeholder]');
  const hint = root.querySelector('[data-hint]');
  const specBox = root.querySelector('[data-spec]');
  const legend = root.querySelector('[data-legend]');
  const segBtns = [].slice.call(root.querySelectorAll('.rocket-viewer__seg button'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FOV = 30;
  const EXPLODE_K = 0.48;
  const RADIAL_K = 0.34;
  const SOURCES = [
    { url: 'assets/rocket/full-launch-vehicle.glb', kind: 'vehicle', name: 'COPE launch vehicle',
      spec: ['95 m · 6.9 m dia · 1.43 Mkg at liftoff', '8 + 3 LOX/CH₄ FFSC engines', '19.5 km/s mission ΔV'] },
    { url: 'assets/rocket/stage2-refuel-mated.glb', kind: 'refuel', name: 'Stage 2 · refuel & crew',
      spec: ['Tanker Stage 2 mated to the crew stack', '792 t propellant after refuel', 'TLI · lunar landing · return'] },
    { url: 'assets/rocket/cope-s1-engine.glb?v=3', kind: 'engine', name: 'Stage 1 engine · ε = 40',
      spec: ['Pc 25.53 MPa · O/F 3.5 · Rt 132.3 mm', '2.51 MN sea level · Isp 331 s', '2688 kg · gimbal ±6°'] },
    { url: 'assets/rocket/cope-s2-engine.glb?v=3', kind: 'engine', name: 'Stage 2 engine · ε = 100',
      spec: ['Pc 26.08 MPa · De 2.646 m', '2.91 MN vacuum · Isp 376 s', '3106 kg · gimbal ±6°'] },
  ];

  // ---- renderer / scene / lighting ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xfff1e0, 1.6); key.position.set(5, 8, 6);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 1.0); rim.position.set(-6, 4, -7);
  const fill = new THREE.DirectionalLight(0xffb070, 0.35); fill.position.set(0, -6, 3);
  scene.add(key, rim, fill, new THREE.HemisphereLight(0xdce0e6, 0x1a1c20, 0.5));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 5000);
  const spin = new THREE.Group();
  scene.add(spin);

  // soft fake contact shadow
  const shadow = (() => {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 256;
    const ctx = cnv.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(0.55, 'rgba(0,0,0,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2; mesh.visible = false;
    scene.add(mesh);
    return mesh;
  })();

  const loader = new GLTFLoader();
  const models = SOURCES.map(() => null);
  let hinted = false;
  let active = 0;
  let explodeTarget = 0, explodeCur = 0;

  function prepModel(gltf, src) {
    const scn = gltf.scene;
    scn.updateMatrixWorld(true);
    const container = new THREE.Group();
    const materials = new Set();

    scn.traverse((o) => {
      if (!o.isMesh) return;
      o.updateWorldMatrix(true, false);
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      const mesh = new THREE.Mesh(geo, o.material);
      mesh.name = o.name || (o.parent && o.parent.name) || '';
      container.add(mesh);
    });

    // one welded mesh: split into components (or bands as a last resort)
    if (container.children.length <= 1 && container.children[0]) {
      const fused = container.children[0];
      const soups = splitByComponents(fused) || splitIntoBands(fused, 6);
      if (soups.length > 1) {
        container.clear();
        soups.forEach((s) => container.add(soupToMesh(s, fused.material)));
      }
    }

    // recenter + per-part explode offsets
    const box = new THREE.Box3().setFromObject(container);
    const center = box.getCenter(new THREE.Vector3());
    container.children.forEach((m) => m.geometry.translate(-center.x, -center.y, -center.z));
    container.children.forEach((m) => {
      m.geometry.computeBoundingBox();
      m.userData.offset = m.geometry.boundingBox.getCenter(new THREE.Vector3());
    });
    const size = box.getSize(new THREE.Vector3());
    const axis = size.x >= size.y && size.x >= size.z ? 'x' : (size.y >= size.z ? 'y' : 'z');

    // paint
    if (src.kind === 'vehicle') paintVehicleParts(container.children, axis);
    else if (src.kind === 'refuel') container.children.forEach(paintByName);
    else container.children.forEach((m) => {
      // engine GLBs carry their own PBR colours from the STEP conversion; tune the
      // finish here so the graphite bell reads dark instead of as chrome
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      // material classes (copper liner, Inconel, steel, titanium, graphite) are baked into the GLB at export
      const src0 = m.material;
      const mm = new THREE.MeshStandardMaterial({
        color: src0.color ? src0.color.clone() : 0xb8bfc9,
        metalness: src0.metalness != null ? src0.metalness : 0.7,
        roughness: src0.roughness != null ? src0.roughness : 0.45,
      });
      mm.envMapIntensity = 0.85; mm.side = THREE.DoubleSide; mm.flatShading = false;
      m.material = mm;
    });
    container.children.forEach((m) => materials.add(m.material));

    // outer stage shells (refuel model) slide aside so the internals show
    const isShell = (n) => {
      const toks = String(n || '').toLowerCase().split('_').map((t) => t.replace(/\d+$/, '')).filter(Boolean);
      return toks.includes('stage') && toks.every((t) => t === 'stage' || t === 'refuel');
    };
    let shellIdx = 0;
    container.children.forEach((m) => {
      if (src.kind !== 'refuel' || !isShell(m.name)) return;
      const s = m.geometry.boundingBox.getSize(new THREE.Vector3());
      m.userData.shell = true;
      m.userData.shellShift = (shellIdx++ % 2 === 0 ? -1 : 1) * Math.max(s.x, s.y) * 1.1;
    });

    // nested internals slide out sideways so they are visible in the explode
    if (src.kind !== 'vehicle' && !container.children.some((m) => m.userData.shell)) {
      const lat = ['x', 'y', 'z'].filter((ax) => ax !== axis);
      const info = container.children.map((m) => {
        const bb = m.geometry.boundingBox;
        const rad = Math.max(bb.max[lat[0]] - bb.min[lat[0]], bb.max[lat[1]] - bb.min[lat[1]]) / 2;
        return { m, lo: bb.min[axis], hi: bb.max[axis], rad, side: 1 };
      });
      info.forEach((part) => {
        const span = part.hi - part.lo || 1;
        let host = null;
        info.forEach((b) => {
          if (b === part || b.rad <= part.rad * 1.05) return;
          if (Math.min(part.hi, b.hi) - Math.max(part.lo, b.lo) < 0.6 * span) return;
          if (!host || b.rad < host.rad) host = b;
        });
        if (host && part.rad > 0.5 * host.rad) {
          const s = host.side * host.rad * 3.1 * Math.SQRT1_2;
          part.m.userData.latA = lat[0]; part.m.userData.latB = lat[1];
          part.m.userData.latShiftA = s; part.m.userData.latShiftB = s;
          host.side = -host.side;
        }
      });
      let top = null;
      container.children.forEach((m) => { if (!top || m.userData.offset[axis] > top.userData.offset[axis]) top = m; });
      if (top && src.kind === 'vehicle') top.userData.axialBoost = 1.35;
    }

    const radius = new THREE.Box3().setFromObject(container).getBoundingSphere(new THREE.Sphere()).radius;
    if (axis === 'z') container.rotation.x = -Math.PI / 2;
    else if (axis === 'x') container.rotation.z = Math.PI / 2;
    container.visible = false;
    spin.add(container);
    container.updateMatrixWorld(true);
    const upright = new THREE.Box3().setFromObject(container);
    const minY = upright.min.y;
    const footprint = Math.max(upright.max.x - upright.min.x, upright.max.z - upright.min.z);
    const height = size[axis];
    return { container, radius, materials: [...materials], axis, minY, footprint, src, height };
  }

  function onLoaded(i, g) {
    models[i] = prepModel(g, SOURCES[i]);
    if (i === active) { setActive(active); if (placeholder) placeholder.style.display = 'none'; }
  }
  // load the first model now; the rest lazily on first use
  function load(i) {
    if (models[i] || models[i] === 'loading') return;
    models[i] = 'loading';
    loader.load(SOURCES[i].url, (g) => onLoaded(i, g), undefined,
      () => { models[i] = null; if (i === active && placeholder) placeholder.querySelector('p').textContent = '3D model unavailable'; });
  }
  load(0);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
  idle(() => { load(1); load(2); load(3); });

  function ready(i) { return models[i] && models[i] !== 'loading'; }

  function setOpacity(idx, o) {
    if (!ready(idx)) return;
    const m = models[idx];
    const opaque = o >= 0.999;
    m.container.visible = o > 0.001;
    m.materials.forEach((mt) => { mt.transparent = !opaque; mt.depthWrite = opaque; mt.opacity = o; });
  }

  const tmp = new THREE.Vector3();
  function poseExplode(idx, f) {
    if (!ready(idx)) return;
    const m = models[idx], axis = m.axis;
    m.container.children.forEach((p) => {
      if (p.userData.shell) { p.position.set(p.userData.shellShift * f, 0, 0); return; }
      if (p.userData.cluster != null) {
        // whole stages separate along the long axis: stage 1 down, crew section up
        tmp.set(0, 0, 0);
        tmp[axis] = (p.userData.cluster - 1) * 0.16 * m.height * f;
        p.position.copy(tmp);
        return;
      }
      const o = p.userData.offset;
      tmp.copy(o); tmp[axis] = 0; tmp.multiplyScalar(RADIAL_K * f);
      tmp[axis] = o[axis] * EXPLODE_K * (p.userData.axialBoost || 1) * f;
      if (p.userData.latShiftA) { tmp[p.userData.latA] += p.userData.latShiftA * f; tmp[p.userData.latB] += p.userData.latShiftB * f; }
      p.position.copy(tmp);
    });
  }

  // ---- camera: zoomed out a touch more than a tight fit, with user orbit ----
  let elevDeg = 14, userYaw = 0;
  function placeCamera() {
    if (!ready(active)) return;
    const m = models[active];
    const vfov = THREE.MathUtils.degToRad(FOV);
    const aspect = camera.aspect || 1;
    const hHalf = Math.atan(Math.tan(vfov / 2) * aspect);
    const useHalf = Math.min(vfov / 2, hHalf);
    const zoomOut = m.src.kind === 'engine' ? 1.2 : 1.45;
    const explodeZoom = m.src.kind === 'vehicle' ? 0.38 : 0.28;
    let dist = (m.radius / Math.sin(useHalf)) * (zoomOut + explodeZoom * explodeCur);
    const portraitMax = m.radius / Math.sin(vfov / 2) * 1.7 * (1 + explodeCur * 0.3);
    if (dist > portraitMax) dist = portraitMax;
    const elev = THREE.MathUtils.degToRad(elevDeg);
    camera.position.set(0, dist * Math.sin(elev), dist * Math.cos(elev));
    camera.lookAt(0, 0, 0);
  }
  function placeShadow() {
    if (!ready(active)) return;
    const m = models[active];
    shadow.visible = true;
    shadow.position.y = m.minY * (1 + EXPLODE_K * explodeCur) - m.radius * 0.02;
    const s = m.footprint * (1.9 + 0.5 * explodeCur);
    shadow.scale.set(s, s, 1);
    shadow.material.opacity = 1 - 0.35 * explodeCur;
  }

  function setActive(idx) {
    active = idx;
    explodeTarget = 0;
    models.forEach((m, j) => { if (ready(j)) setOpacity(j, j === idx ? 1 : 0); });
    segBtns.forEach((b, j) => { b.classList.toggle('is-active', j === idx); b.setAttribute('aria-selected', j === idx); });
    if (specBox) {
      specBox.textContent = '';
      const b = document.createElement('b'); b.textContent = SOURCES[idx].name; specBox.appendChild(b);
      SOURCES[idx].spec.forEach((line) => { specBox.appendChild(document.createTextNode(line)); specBox.appendChild(document.createElement('br')); });
    }
    if (legend) legend.style.display = SOURCES[idx].kind === 'engine' ? 'none' : '';
    if (hint) { hint.textContent = SOURCES[idx].kind === 'engine' ? 'Drag to orbit' : 'Drag to orbit · click to explode'; hint.classList.remove('is-hidden'); hinted = false; }
    if (placeholder) {
      if (ready(idx)) placeholder.style.display = 'none';
      else { placeholder.style.display = ''; placeholder.querySelector('p').textContent = 'Loading 3D model…'; load(idx); }
    }
  }

  // ---- interactions: drag to orbit, click/tap to explode, segmented control ----
  function toggleExplode() {
    if (!ready(active) || SOURCES[active].kind === 'engine') return;
    explodeTarget = explodeTarget > 0.5 ? 0 : 1;
    if (!hinted && hint) { hint.classList.add('is-hidden'); hinted = true; }
  }
  let dragging = false, moved = 0, lastX = 0, lastY = 0, idleT = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
    canvas.classList.add('is-dragging'); canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    spin.rotation.y += dx * 0.01;
    elevDeg = Math.max(-10, Math.min(55, elevDeg - dy * 0.25));
    idleT = 0;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false; canvas.classList.remove('is-dragging');
    if (moved < 6) toggleExplode();
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExplode(); } });
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Interactive 3D model. Drag to orbit, press Enter to explode the assembly.');

  segBtns.forEach((b) => b.addEventListener('click', () => { setActive(+b.getAttribute('data-model')); }));

  // ---- resize ----
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // ---- render loop (only while the viewer is on screen) ----
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(root);

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!visible || !ready(active)) return;
    resize();
    idleT += dt;
    if (!reduce && !dragging && idleT > 2.5) spin.rotation.y += dt * 0.3;
    explodeCur += (explodeTarget - explodeCur) * Math.min(dt * 4, 1);
    if (Math.abs(explodeTarget - explodeCur) < 0.001) explodeCur = explodeTarget;
    poseExplode(active, explodeCur);
    placeCamera();
    placeShadow();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  setActive(0);
}
