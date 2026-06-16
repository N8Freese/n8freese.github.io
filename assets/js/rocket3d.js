// Interactive 3D launch-vehicle viewer (Three.js).
//
// Behaviour (item 8): auto-rotating turntable, NO zoom and NO orbit controls,
// click / tap toggles an exploded assembly view, and a segmented control swaps
// between the full launch stack and the on-orbit refuel & crew config.
// Render loop pauses when the viewer is off-screen to protect mobile battery/perf.

import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './jsm/environments/RoomEnvironment.js';

const root = document.querySelector('[data-rocket]');
const canvas = root && root.querySelector('[data-canvas]');
if (root && canvas) init();

// Split a single fused mesh into N slices along its longest axis, so a model
// that came from one welded STL (the launch vehicle) can still explode.
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
  const meshes = [];
  bands.forEach((band) => {
    if (!band.p.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(band.p, 3));
    if (band.n.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(band.n, 3));
    else g.computeVertexNormals();
    meshes.push(new THREE.Mesh(g, mesh.material));
  });
  return { meshes, axis };
}

function init() {
  const placeholder = root.querySelector('[data-placeholder]');
  const hint = root.querySelector('[data-hint]');
  const segBtns = [].slice.call(root.querySelectorAll('.rocket-viewer__seg button'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FOV = 30;
  const EXPLODE_K = 0.55;    // spread distance relative to each part's offset
  const SOURCES = [
    'assets/rocket/full-launch-vehicle.glb',
    'assets/rocket/stage2-refuel-mated.glb',
  ];

  // ---- renderer / scene / lighting ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.DirectionalLight(0xffffff, 2.2).translateX(4).translateY(8).translateZ(6));
  scene.add(new THREE.HemisphereLight(0xdce0e6, 0x26282c, 0.6));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 5000);

  // A spin pivot turns the upright vehicle about its vertical axis (turntable).
  const spin = new THREE.Group();
  scene.add(spin);

  const loader = new GLTFLoader();
  const models = [null, null];
  let active = 0;
  let explodeTarget = 0;   // 0 assembled, 1 exploded
  let explodeCur = 0;

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
      mat.metalness = 0.85; mat.roughness = 0.4; mat.envMapIntensity = 1.0;
      mat.side = THREE.DoubleSide;   // sliced/open band faces render solid (no see-through flicker)
      mat.needsUpdate = true;
      materials.add(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = o.name || (o.parent && o.parent.name) || '';
      container.add(mesh);
    });

    // If the model is a single fused mesh (the launch vehicle came from one welded
    // STL), slice it into bands along its long axis so the exploded view works too.
    let splitAxis = null;
    if (container.children.length <= 1 && container.children[0]) {
      const split = splitIntoBands(container.children[0], 6);
      if (split.meshes.length > 1) {
        materials.add(container.children[0].material);
        container.clear();
        split.meshes.forEach((b, i) => { b.name = ''; b.userData.bandIndex = i; container.add(b); });
        splitAxis = split.axis;   // sliced model: explode along this axis (+ lateral on some bands)
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

    // Outer stage shells slide aside laterally so inner tanks/engines are visible.
    const isShell = (n) => {
      const toks = String(n || '').toLowerCase().split('_')
        .map((t) => t.replace(/\d+$/, '')).filter(Boolean);
      return toks.includes('stage') && toks.every((t) => t === 'stage' || t === 'refuel');
    };
    let shellIdx = 0;
    container.children.forEach((m) => {
      if (!isShell(m.name)) return;
      const size = m.geometry.boundingBox.getSize(new THREE.Vector3());
      const dia = Math.max(size.x, size.y);
      m.userData.shell = true;
      m.userData.shellShift = (shellIdx++ % 2 === 0 ? -1 : 1) * dia * 1.25;
    });

    const radius = new THREE.Box3().setFromObject(container)
      .getBoundingSphere(new THREE.Sphere()).radius;

    container.rotation.x = -Math.PI / 2; // STEP Z-up → glTF Y-up (vehicle stands upright)
    container.visible = false;
    spin.add(container);
    return { container, radius, materials: [...materials], splitAxis };
  }

  function onLoaded(i, g) {
    models[i] = prepModel(g);
    if (i === active) {
      setActive(active);
      if (placeholder) placeholder.style.display = 'none';
    }
  }
  SOURCES.forEach((url, i) => loader.load(url, (g) => onLoaded(i, g), undefined,
    () => { if (i === 0 && placeholder) placeholder.querySelector('p').textContent = '🚀 3D model unavailable'; }));

  function setOpacity(idx, o) {
    const m = models[idx]; if (!m) return;
    const opaque = o >= 0.999;
    m.container.visible = o > 0.001;
    m.materials.forEach((mat) => { mat.transparent = !opaque; mat.depthWrite = opaque; mat.opacity = o; });
  }

  const tmp = new THREE.Vector3();
  const PERP = { x: 'z', y: 'x', z: 'x' };   // a perpendicular axis for lateral slide
  function poseExplode(idx, f) {
    const m = models[idx]; if (!m) return;
    m.container.children.forEach((p) => {
      if (p.userData.shell) {
        p.position.set(p.userData.shellShift * f, 0, 0);
      } else if (m.splitAxis) {
        // Sliced fused model: spread along the long axis, and have every other band
        // also slide out to the side (alternating directions) so the explosion reads
        // as parts coming apart rather than a uniform stack expansion.
        var a = m.splitAxis, perp = PERP[a];
        tmp.set(0, 0, 0);
        tmp[a] = p.userData.offset[a] * EXPLODE_K * f;
        var i = p.userData.bandIndex || 0;
        if (i % 2 === 1) tmp[perp] = ((i % 4 === 1) ? 1 : -1) * m.radius * 0.8 * f;
        p.position.copy(tmp);
      } else {
        p.position.copy(tmp.copy(p.userData.offset).multiplyScalar(EXPLODE_K * f));
      }
    });
  }

  function placeCamera() {
    const m = models[active]; if (!m) return;
    const vfov = THREE.MathUtils.degToRad(FOV);
    // Pull back further as the model explodes so spread parts stay framed.
    let dist = (m.radius / Math.sin(vfov / 2)) * (1.2 + 1.15 * explodeCur);
    // On portrait/narrow canvases (mobile) widen the framing so nothing clips.
    const aspect = camera.aspect || 1;
    if (aspect < 1) dist /= aspect;
    const elev = THREE.MathUtils.degToRad(16);  // slight top-down 3/4 view
    camera.position.set(0, dist * Math.sin(elev), dist * Math.cos(elev));
    camera.lookAt(0, 0, 0);
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
    if (!reduce) spin.rotation.y += dt * 0.5;          // continuous auto-rotation
    explodeCur += (explodeTarget - explodeCur) * Math.min(dt * 4, 1); // eased explode
    poseExplode(active, explodeCur);
    placeCamera();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
