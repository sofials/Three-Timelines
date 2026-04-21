/**
 * THREE TIMELINES — MindAR + Three.js (ES Module)
 * Prototype: single target D1 (fotografia di famiglia)
 * Overlay persists in world space when marker is lost.
 */

import * as THREE from 'three';

// ─── CONFIG ───────────────────────────────────────────────────────────────────

// For the physical card test: compile ONLY your card photo → test_d1.mind
// When ready for all 14: switch back to assets/markers/all_targets.mind
const MIND_FILE = 'assets/markers/test_d1.mind';
const DWELL_MS  = 1500;

const TARGETS = [
  {
    targetIndex: 0,
    id: 'D1',
    zone: 'past',
    past:   { src: 'assets/overlays/past/D1_past.png',     caption: 'Alassio, agosto — 1971.' },
    future: { src: 'assets/overlays/future/D1_future.png', caption: 'La stessa cornice, riparata.' },
  },
];

// ─── TIMELINE STATE ───────────────────────────────────────────────────────────

let dialOverride = null;

function getTimeline(target) {
  if (dialOverride) return dialOverride;
  return target.zone;
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────

window.addEventListener('load', async () => {

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: MIND_FILE,
    maxTrack: 1,
    filterMinCF: 0.001,
    filterBeta: 1000,
    missTolerance: 5,
    warmupTolerance: 5,
  });

  const { renderer, scene, camera } = mindarThree;
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  const textureLoader = new THREE.TextureLoader();
  const worldMeshes   = new Map();
  const states        = [];

  for (const target of TARGETS) {
    const anchor   = mindarThree.addAnchor(target.targetIndex);
    const geometry = new THREE.PlaneGeometry(1, 0.75);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.3, 0);
    mesh.visible = false;
    anchor.group.add(mesh);

    const state = { anchor, mesh, target, dwellTimer: null, isRevealed: false,
                    lastMatrix: null, currentSrc: null };
    states.push(state);

    anchor.onTargetFound = () => {
      debug(`Found: ${target.id} · ${target.zone}`);
      // Update last known world matrix every frame while visible
      state.lastMatrix = anchor.group.matrixWorld.clone();

      if (state.isRevealed) {
        removeWorldMesh(state);
        anchor.group.add(mesh);
        mesh.visible = true;
      } else {
        startDwell(state);
      }
    };

    anchor.onTargetLost = () => {
      debug('');
      clearDwell(state);
      if (state.isRevealed) persistInWorld(state);
    };
  }

  // Tap anywhere on screen to reveal immediately
  renderer.domElement.addEventListener('click', () => {
    const active = states.find(s => s.anchor.group.visible && !s.isRevealed);
    if (active) { clearDwell(active); reveal(active); }
  });

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    // Keep lastMatrix fresh while marker is tracked
    states.forEach(s => {
      if (s.anchor.group.visible) {
        s.lastMatrix = s.anchor.group.matrixWorld.clone();
      }
    });
    renderer.render(scene, camera);
  });

  // Hide loading screen
  const lo = document.getElementById('loading-overlay');
  if (lo) { lo.style.opacity = '0'; setTimeout(() => lo.remove(), 600); }

  // ── Dwell ──────────────────────────────────────────────────────────────────

  function startDwell(state) {
    clearDwell(state);
    state.dwellTimer = setTimeout(() => reveal(state), DWELL_MS);
  }

  function clearDwell(state) {
    if (state.dwellTimer) { clearTimeout(state.dwellTimer); state.dwellTimer = null; }
  }

  // ── Reveal ─────────────────────────────────────────────────────────────────

  function reveal(state) {
    const tl = getTimeline(state.target);
    if (tl === 'present') return;

    const content = state.target[tl];
    if (!content?.src) return;

    if (state.currentSrc !== content.src) {
      state.currentSrc = content.src;
      textureLoader.load(
        content.src,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          state.mesh.material.map     = tex;
          state.mesh.material.opacity = 0.95;
          state.mesh.material.needsUpdate = true;
        },
        undefined,
        (err) => debug(`Texture error: ${err}`)
      );
    } else {
      state.mesh.material.opacity = 0.95;
      state.mesh.material.needsUpdate = true;
    }

    state.mesh.visible = true;
    state.isRevealed   = true;
    debug(`Revealed: ${state.target.id} · ${tl}`);
  }

  // ── Persist in world space ─────────────────────────────────────────────────

  function persistInWorld(state) {
    if (!state.lastMatrix) return;
    removeWorldMesh(state);

    const wm = new THREE.Mesh(
      state.mesh.geometry,
      state.mesh.material.clone()
    );

    // World position = anchor world matrix × local offset
    const offset   = new THREE.Vector3(0, 0.3, 0);
    const worldPos = offset.applyMatrix4(state.lastMatrix);
    wm.position.copy(worldPos);

    // Copy orientation from anchor
    const worldQuat = new THREE.Quaternion();
    state.lastMatrix.decompose(new THREE.Vector3(), worldQuat, new THREE.Vector3());
    wm.quaternion.copy(worldQuat);

    wm.visible = true;
    scene.add(wm);
    worldMeshes.set(state, wm);

    state.mesh.visible = false;
  }

  function removeWorldMesh(state) {
    const wm = worldMeshes.get(state);
    if (wm) { scene.remove(wm); worldMeshes.delete(state); }
  }

});

// ─── DIAL ─────────────────────────────────────────────────────────────────────

function setDial(value) {
  dialOverride = value;
  const el = document.getElementById('dial-label');
  if (el) el.textContent = value === 'past' ? '◂ PASSATO' : value === 'future' ? 'FUTURO ▸' : '○';
}

function initDial() {
  const dial = document.getElementById('dial');
  if (!dial) return;
  let startAngle = null;

  function angle(e) {
    const r = dial.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const t = e.touches ? e.touches[0] : e;
    return Math.atan2(t.clientY - cy, t.clientX - cx) * 180 / Math.PI;
  }
  const start = e => { startAngle = angle(e); };
  const move  = e => {
    if (startAngle === null) return;
    const d = angle(e) - startAngle;
    const knob = document.getElementById('dial-knob');
    if (knob) knob.style.transform = `rotate(${d}deg)`;
    if (d < -20) setDial('past');
    else if (d > 20) setDial('future');
    else setDial(null);
  };
  const end = () => {
    startAngle = null;
    const knob = document.getElementById('dial-knob');
    if (knob) {
      knob.style.transition = 'transform 0.3s ease';
      knob.style.transform  = 'rotate(0deg)';
      setTimeout(() => { knob.style.transition = ''; }, 300);
    }
  };

  dial.addEventListener('touchstart',    start, { passive: true });
  dial.addEventListener('touchmove',     move,  { passive: true });
  dial.addEventListener('touchend',      end);
  dial.addEventListener('mousedown',     start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup',   end);
}

// ─── SWIPE ────────────────────────────────────────────────────────────────────

function initSwipe() {
  let startX = null;
  document.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -60) setDial('past');
    else if (dx > 60) setDial('future');
    startX = null;
  });
}

// ─── DEBUG ────────────────────────────────────────────────────────────────────

function debug(msg) {
  const el = document.getElementById('debug-label');
  if (!el) return;
  if (msg) { el.textContent = msg; el.style.display = 'block'; }
  else el.style.display = 'none';
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initDial();
  initSwipe();
  document.getElementById('help-btn').addEventListener('click',  () =>
    document.getElementById('help-modal').classList.remove('hidden'));
  document.getElementById('help-close').addEventListener('click', () =>
    document.getElementById('help-modal').classList.add('hidden'));
});
