// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Swap in the 3D model viewer once the GLB exists.
// Until then, the placeholder in #rocket-viewer stays visible.
(function () {
  var GLB = 'assets/rocket/full-launch-vehicle.glb';
  var host = document.getElementById('rocket-viewer');
  if (!host) return;

  fetch(GLB, { method: 'HEAD' })
    .then(function (res) {
      if (!res.ok) return; // no model yet — keep placeholder
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', GLB);
      mv.setAttribute('alt', 'AE 441 Senior Design launch vehicle');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('shadow-intensity', '1');
      mv.setAttribute('exposure', '1');
      mv.setAttribute('camera-orbit', '45deg 75deg 105%');
      host.replaceChildren(mv);
    })
    .catch(function () { /* offline / file:// — keep placeholder */ });
})();
