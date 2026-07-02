// Interactive 3D launch-vehicle viewer (Three.js).
//
// Behaviour: auto-rotating turntable, NO zoom and NO orbit controls,
// click / tap toggles an exploded assembly view, and a segmented control swaps
// between the full launch stack and the on-orbit refuel & crew config.
// Render loop pauses when the viewer is off-screen to protect mobile battery/perf.
//
// Exploded view: models with real part nodes explode part-by-part. A model that
// arrives as ONE welded mesh (the launch vehicle came from a single fused STL) is
// first split into connected components (true disjoint pieces: stages, fins,
// engines), and only falls back to slicing into axial bands when the geometry is
// genuinely one connected solid. Parts separate along the vehicle's long axis
// with a gentle radial spread, which reads like a proper engineering exploded view.

import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './jsm/environments/RoomEnvironment.js';

const root = document.querySelector('[data-rocket]');
const canvas = root && root.querySelector('[data-canvas]');
if (root && canvas) init();

/* ---- geometry splitting ---------------------------------------------------
 * Both splitters return plain { p:[], n:[] } triangle soups so the caller can
 * build BufferGeometries the same way. */

// Canonical vertex ids: weld duplicated vertices by quantized position so
// connectivity survives STL-style duplicated corners.
function canonicalIds(geo) {
  const pos = geo.attributes.position;
  const bb = geo.boundingBox;
  const eps = bb.getSize(new THREE.Vector3()).length() * 1e-5 || 1e-6;
  const map = new Map();
  const ids = new Uint32Array(pos.count);
  let next = 0;
  for (let i = 0; i < pos.count; i++) {
    const key = Math.round(pos.getX(i) / eps) + ',' +
                Math.round(pos.getY(i) / eps) + ',' +
                Math.round(pos.getZ(i) / eps);
    let id = map.get(key);
    if (id === undefined) { id = next++; map.set(key, id); }
    ids[i] = id;
  }
  return { ids, uniqueCount: next };
}

// Split a mesh into its connected components (union-find over shared vertices).
// Small shards are merged into the nearest large component so the exploded view
// never scatters loose slivers. Returns null when the mesh is one solid piece.
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
  for (let t = 0; t < triCount; t++) {
    union(vid(t, 0), vid(t, 1));
    union(vid(t, 0), vid(t, 2));
  }

  // group triangles by component root
  const groups = new Map();
  for (let t = 0; t < triCount; t++) {
    const r = find(vid(t, 0));
    let g = groups.get(r);
    if (!g) { g = []; groups.set(r, g); }
    g.push(t);
  }
  if (groups.size < 2) return null;

  // build raw components with centroids
  const a = new THREE.Vector3();
  function soupFrom(tris) {
    const p = [], n = [], cen = new THREE.Vector3();
    tris.forEach((t) => {
      for (let k = 0; k < 3; k++) {
        const i = index ? index.getX(t * 3 + k) : t * 3 + k;
        a.fromBufferAttribute(pos, i);
        p.push(a.x, a.y, a.z); cen.add(a);
        if (nor) n.push(nor.getX(i), nor.getY(i), nor.getZ(i));
      }
    });
    cen.divideScalar(tris.length * 3);
    return { p, n, cen, tris: tris.length };
  }
  const comps = [...groups.values()].map(soupFrom).sort((x, y) => y.tris - x.tris);

  // keep substantial pieces as parts; fold slivers into the nearest kept part
  const MIN_TRIS = Math.max(150, triCount * 0.002);
  const MAX_PARTS = 12;
  const kept = comps.filter((s, i) => i < MAX_PARTS && s.tris >= MIN_TRIS);
  if (kept.length < 2) return null;
  comps.forEach((s) => {
    if (kept.includes(s)) return;
    let best = kept[0], bd = Infinity;
    kept.forEach((k) => { const d = k.cen.distanceToSquared(s.cen); if (d < bd) { bd = d; best = k; } });
    for (let i = 0; i < s.p.length; i++) best.p.push(s.p[i]);
    for (let i = 0; i < s.n.length; i++) best.n.push(s.n[i]);
  });
  return kept;
}

// Fallback for a genuinely one-piece solid: slice into N bands along the long
// axis. Explode motion is purely axial so the cut faces never gape sideways.
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
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
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

function init() {
  const placeholder = root.querySelector('[data-placeholder]');
  const hint = root.querySelector('[data-hint]');
  const segBtns = [].slice.call(root.querySelectorAll('.rocket-viewer__seg button'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FOV = 30;
  const EXPLODE_K = 0.55;    // axial spread relative to each part's offset
  const RADIAL_K = 0.30;     // gentle sideways separation for off-axis parts
  const SOURCES = [
    'assets/rocket/full-launch-vehicle.glb',
    'assets/rocket/stage2-refuel-mated.glb',
  ];

  // ---- renderer / scene / lighting ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // studio-style three-point setup: warm key, cool rim, soft ambient fill
  const key = new THREE.DirectionalLight(0xfff4e8, 1.5);
  key.position.set(5, 8, 6);
  const rim = new THREE.DirectionalLight(0xdbe6ff, 0.9);
  rim.position.set(-6, 4, -7);
  scene.add(key, rim, new THREE.HemisphereLight(0xdce0e6, 0x1a1c20, 0.55));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 5000);

  // A spin pivot turns the upright vehicle about its vertical axis (turntable).
  const spin = new THREE.Group();
  scene.add(spin);

  // soft fake contact shadow (radial-gradient disc, no shadow-map cost)
  const shadow = (() => {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 256;
    const ctx = cnv.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,.40)');
    g.addColorStop(0.55, 'rgba(0,0,0,.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  })();

  const loader = new GLTFLoader();
  const models = [null, null];
  let active = 0;
  let explodeTarget = 0;   // 0 assembled, 1 exploded
  let explodeCur = 0;

  function polishMaterial(mat) {
    mat.metalness = 0.55;
    mat.roughness = 0.35;
    mat.envMapIntensity = 1.15;
    mat.side = THREE.DoubleSide;   // sliced/open CAD faces render solid
    mat.needsUpdate = true;
  }

  function prepModel(gltf) {
    const src = gltf.scene;
    src.updateMatrixWorld(true);
    const container = new THREE.Group();
    const materials = new Set();

    // Flatten: bake each mesh's world transform into geometry, reparent into one group.
    src.traverse((o) => {
      if (!o.isMesh) return;
      o.updateWorldMatrix(true, false);
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      const mat = o.material;
      polishMaterial(mat);
      materials.add(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = o.name || (o.parent && o.parent.name) || '';
      container.add(mesh);
    });

    // A single fused mesh can't explode as-is. Prefer true connected components
    // (real disjoint pieces); fall back to axial band slices for one-piece solids.
    if (container.children.length <= 1 && container.children[0]) {
      const fused = container.children[0];
      const soups = splitByComponents(fused) || splitIntoBands(fused, 6);
      if (soups.length > 1) {
        container.clear();
        soups.forEach((s) => container.add(soupToMesh(s, fused.material)));
      }
    }

    // Recenter on origin and store each part's explode direction.
    const box = new THREE.Box3().setFromObject(container);
    const center = box.getCenter(new THREE.Vector3());
    container.children.forEach((m) => m.geometry.translate(-center.x, -center.y, -center.z));
    container.children.forEach((m) => {
      m.geometry.computeBoundingBox();
      m.userData.offset = m.geometry.boundingBox.getCenter(new THREE.Vector3());
    });

    // Long axis of the assembled vehicle (in geometry space, before upright rotation).
    const size = box.getSize(new THREE.Vector3());
    const axis = size.x >= size.y && size.x >= size.z ? 'x' : (size.y >= size.z ? 'y' : 'z');

    // Outer stage shells slide aside laterally so inner tanks/engines are visible.
    const isShell = (n) => {
      const toks = String(n || '').toLowerCase().split('_')
        .map((t) => t.replace(/\d+$/, '')).filter(Boolean);
      return toks.includes('stage') && toks.every((t) => t === 'stage' || t === 'refuel');
    };
    let shellIdx = 0;
    container.children.forEach((m) => {
      if (!isShell(m.name)) return;
      const s = m.geometry.boundingBox.getSize(new THREE.Vector3());
      const dia = Math.max(s.x, s.y);
      m.userData.shell = true;
      m.userData.shellShift = (shellIdx++ % 2 === 0 ? -1 : 1) * dia * 1.1;
    });

    const radius = new THREE.Box3().setFromObject(container)
      .getBoundingSphere(new THREE.Sphere()).radius;

    // Stand the vehicle upright: rotate whichever axis is the long axis onto world +Y.
    if (axis === 'z') container.rotation.x = -Math.PI / 2;
    else if (axis === 'x') container.rotation.z = Math.PI / 2;
    container.visible = false;
    spin.add(container);

    // Ground extent (world Y) for the contact shadow, measured upright.
    container.updateMatrixWorld(true);
    const upright = new THREE.Box3().setFromObject(container);
    const minY = upright.min.y;
    const footprint = Math.max(upright.max.x - upright.min.x, upright.max.z - upright.min.z);

    return { container, radius, materials: [...materials], axis, minY, footprint };
  }

  function onLoaded(i, g) {
    models[i] = prepModel(g);
    if (i === active) {
      setActive(active);
      if (placeholder) placeholder.style.display = 'none';
    }
  }
  SOURCES.forEach((url, i) => loader.load(url, (g) => onLoaded(i, g), undefined,
    () => { if (i === 0 && placeholder) placeholder.querySelector('p').textContent = '3D model unavailable'; }));

  function setOpacity(idx, o) {
    const m = models[idx]; if (!m) return;
    const opaque = o >= 0.999;
    m.container.visible = o > 0.001;
    m.materials.forEach((mat) => { mat.transparent = !opaque; mat.depthWrite = opaque; mat.opacity = o; });
  }

  const tmp = new THREE.Vector3();
  function poseExplode(idx, f) {
    const m = models[idx]; if (!m) return;
    const axis = m.axis;
    m.container.children.forEach((p) => {
      if (p.userData.shell) {
        p.position.set(p.userData.shellShift * f, 0, 0);
        return;
      }
      // Dominant axial spread with a gentle radial separation for off-axis parts
      // (fins, boosters, clustered engines) so nothing overlaps or jumps sideways.
      const o = p.userData.offset;
      tmp.copy(o);
      tmp[axis] = 0;
      tmp.multiplyScalar(RADIAL_K * f);
      tmp[axis] = o[axis] * EXPLODE_K * f;
      p.position.copy(tmp);
    });
  }

  function placeCamera() {
    const m = models[active]; if (!m) return;
    const vfov = THREE.MathUtils.degToRad(FOV);
    // Pull back further as the model explodes so spread parts stay framed.
    let dist = (m.radius / Math.sin(vfov / 2)) * (1.18 + 0.85 * explodeCur);
    // On portrait/narrow canvases (mobile) widen the framing so nothing clips.
    const aspect = camera.aspect || 1;
    if (aspect < 1) dist /= aspect;
    const elev = THREE.MathUtils.degToRad(14);  // slight top-down 3/4 view
    camera.position.set(0, dist * Math.sin(elev), dist * Math.cos(elev));
    camera.lookAt(0, 0, 0);
  }

  function placeShadow() {
    const m = models[active]; if (!m) return;
    shadow.visible = true;
    shadow.position.y = m.minY * (1 + EXPLODE_K * explodeCur) - m.radius * 0.02;
    const s = m.footprint * (1.9 + 0.5 * explodeCur);
    shadow.scale.set(s, s, 1);
    shadow.material.opacity = 1 - 0.35 * explodeCur;
  }

  function setActive(idx) {
    active = idx;
    explodeTarget = 0; // reset to assembled when switching vehicles
    setOpacity(idx === 0 ? 1 : 0, 0);
    setOpacity(idx, 1);
    segBtns.forEach((b, j) => {
      b.classList.toggle('is-active', j === idx);
      b.setAttribute('aria-selected', j === idx);
    });
  }

  // ---- interactions: click/tap to explode, segmented control to switch ----
  let hinted = false;
  function toggleExplode() {
    if (!models[active]) return;
    explodeTarget = explodeTarget > 0.5 ? 0 : 1;
    if (!hinted && hint) { hint.classList.add('is-hidden'); hinted = true; }
  }
  canvas.addEventListener('click', toggleExplode);
  segBtns.forEach((b) => b.addEventListener('click', () => {
    const idx = +b.getAttribute('data-model');
    if (models[idx]) setActive(idx);
  }));

  // ---- resize ----
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
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
    if (!visible || !models[active]) return;
    resize();
    if (!reduce) spin.rotation.y += dt * 0.35;         // continuous auto-rotation
    explodeCur += (explodeTarget - explodeCur) * Math.min(dt * 4, 1); // eased explode
    if (Math.abs(explodeTarget - explodeCur) < 0.001) explodeCur = explodeTarget;
    poseExplode(active, explodeCur);
    placeCamera();
    placeShadow();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
