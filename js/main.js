/**
 * THREE TIMELINES — Main (no ES modules)
 * Self-contained: targets config + timeline logic + A-Frame components.
 * Compatible with A-Frame + MindAR loaded as global scripts.
 */

// ─── TARGET CONFIG ────────────────────────────────────────────────────────────

const ZONE = { PAST: 'past', PRESENT: 'present', FUTURE: 'future' };
const LAYER = { TIMELINE: 'timeline', FACTUAL: 'factual' };

const TARGETS = [
  // ZONA 1 — PASSATO
  { id:'D1', targetIndex:0, label:'Fotografia di famiglia', zone:ZONE.PAST,    layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D1_past.png',    caption:'Alassio, agosto — 1971.' },
    future: { src:'assets/overlays/future/D1_future.png', caption:'La stessa cornice, riparata.' } },

  { id:'D2', targetIndex:1, label:'Calendario da muro', zone:ZONE.PAST,        layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D2_past.png',    caption:'Pranzo da mamma — domenica.' },
    future: { src:'assets/overlays/future/D2_future.png', caption:null } },

  { id:'D3', targetIndex:2, label:'Disegno di Carlo', zone:ZONE.PAST,          layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D3_past.png',    caption:null },
    future: { src:'assets/overlays/future/D3_future.png', caption:'Carlo, pompiere — 1989.' } },

  // ZONA 2 — PRESENTE (dwell non fa nulla; overlay solo via ghiera)
  { id:'D5', targetIndex:3, label:'Post-it 115', zone:ZONE.PRESENT,            layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D5_past.png',    caption:null },
    future: { src:'assets/overlays/future/D5_future.png', caption:null } },

  { id:'D6', targetIndex:4, label:'Diario del padre', zone:ZONE.PRESENT,       layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D6_past.png',    caption:'La casa è troppo piccola. Ma è nostra.' },
    future: { src:'assets/overlays/future/D6_future.png', caption:null } },

  // ZONA 3 — FUTURO
  { id:'D7', targetIndex:5, label:'Libro dei mestieri', zone:ZONE.FUTURE,      layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D7_past.png',    caption:null },
    future: { src:'assets/overlays/future/D7_future.png', caption:null } },

  { id:'D8', targetIndex:6, label:'Vaso di terracotta', zone:ZONE.FUTURE,      layer:LAYER.TIMELINE,
    past:   { src:'assets/overlays/past/D8_past.png',    caption:null },
    future: { src:'assets/overlays/future/D8_future.png', caption:null } },

  // ATTREZZATURA POMPIERI — fattuale
  { id:'F1', targetIndex:7,  layer:LAYER.FACTUAL,
    factual:{ src:'assets/overlays/factual/F1_helmet.png', title:'Elmetto da pompiere',
              body:'Cromwell MK3 · 1968 · acciaio verniciato' } },
  { id:'F2', targetIndex:8,  layer:LAYER.FACTUAL,
    factual:{ src:'assets/overlays/factual/F2_axe.png',    title:'Ascia da pompiere',
              body:'Sfondamento · 1972 · acciaio e frassino' } },
  { id:'F3', targetIndex:9,  layer:LAYER.FACTUAL,
    factual:{ src:'assets/overlays/factual/F3_jacket.png', title:'Giubba protettiva',
              body:'VVF · 1975 · lana trattata' } },

  // INFO CAMION — fattuale
  { id:'T1', targetIndex:10, layer:LAYER.FACTUAL,
    factual:{ src:null, title:'Camion 1', body:'[TBD — dati archivio Fondazione]' } },
  { id:'T2', targetIndex:11, layer:LAYER.FACTUAL,
    factual:{ src:null, title:'Camion 2', body:'[TBD — dati archivio Fondazione]' } },
  { id:'T3', targetIndex:12, layer:LAYER.FACTUAL,
    factual:{ src:null, title:'Camion 3', body:'[TBD — dati archivio Fondazione]' } },

  // GROUND TRIGGER
  { id:'G1', targetIndex:13, zone:ZONE.FUTURE, layer:LAYER.TIMELINE,
    past:   { src:null, caption:null },
    future: { src:'assets/overlays/future/G1_sprout.png', caption:null } },
];

const TARGETS_BY_INDEX = {};
TARGETS.forEach(t => { TARGETS_BY_INDEX[t.targetIndex] = t; });

// ─── TIMELINE STATE ───────────────────────────────────────────────────────────

let dialOverride = null; // null | 'past' | 'future'

function getActiveTimeline(target) {
  if (target.layer === LAYER.FACTUAL) return 'factual';
  if (dialOverride) return dialOverride;
  switch (target.zone) {
    case ZONE.PAST:    return 'past';
    case ZONE.PRESENT: return 'present';
    case ZONE.FUTURE:  return 'future';
    default:           return 'present';
  }
}

function setDial(value) {
  dialOverride = value;
  updateDialLabel(value === 'past' ? '◂ PASSATO' : value === 'future' ? 'FUTURO ▸' : '○');
  // Notify all active target components
  document.querySelectorAll('[timeline-target]').forEach(el => {
    if (el.components && el.components['timeline-target']) {
      el.components['timeline-target'].refresh();
    }
  });
}

// ─── A-FRAME COMPONENT ────────────────────────────────────────────────────────

AFRAME.registerComponent('timeline-target', {
  schema: { targetIndex: { type: 'int', default: 0 } },

  init() {
    this.target     = TARGETS_BY_INDEX[this.data.targetIndex];
    this.dwellTimer = null;
    this.isFound    = false;
    this.overlayEl  = null;
    this.pulseEl    = null;
    this.captionEl  = null;

    if (!this.target) return;

    this._buildOverlay();
    this._buildPulse();

    this.el.addEventListener('targetFound', () => this._onFound());
    this.el.addEventListener('targetLost',  () => this._onLost());
    this.overlayEl.addEventListener('click', () => this._onTap());
  },

  remove() { this._clearDwell(); },

  refresh() { if (this.isFound) this._reveal(); },

  _onFound() {
    this.isFound = true;
    this.pulseEl.setAttribute('visible', true);
    this._startDwell();
    // Debug: show which targetIndex was detected
    const dbg = document.getElementById('debug-label');
    if (dbg && this.target) {
      dbg.textContent = `Target: ${this.data.targetIndex} (${this.target.id}) → zona: ${this.target.zone || 'fattuale'}`;
      dbg.style.display = 'block';
    }
  },

  _onLost() {
    this.isFound = false;
    this.pulseEl.setAttribute('visible', false);
    this._clearDwell();
    this._hide();
    const dbg = document.getElementById('debug-label');
    if (dbg) dbg.style.display = 'none';
  },

  _startDwell() {
    this._clearDwell();
    this.dwellTimer = setTimeout(() => this._reveal(), 2000);
  },

  _clearDwell() {
    if (this.dwellTimer) { clearTimeout(this.dwellTimer); this.dwellTimer = null; }
  },

  _onTap() { this._clearDwell(); this._reveal(); },

  _reveal() {
    const tl = getActiveTimeline(this.target);
    if (tl === 'present') { this._hide(); return; }

    const content = tl === 'factual' ? this.target.factual : this.target[tl];
    if (!content) { this._hide(); return; }

    // Set texture
    if (content.src) {
      this.overlayEl.setAttribute('material', `src: url(${content.src}); transparent: true; opacity: 0.95; shader: flat`);
    } else {
      // Fallback coloured plane
      const colors = { past:'#1a2a18', future:'#2a1f10', factual:'#101820' };
      this.overlayEl.setAttribute('material', `color: ${colors[tl] || '#222'}; opacity: 0.9`);
    }

    // Caption
    const text = content.caption || content.title || null;
    if (text && this.captionEl) {
      this.captionEl.setAttribute('value', text);
      this.captionEl.setAttribute('visible', true);
    } else if (this.captionEl) {
      this.captionEl.setAttribute('visible', false);
    }

    this.overlayEl.setAttribute('visible', true);
  },

  _hide() {
    this.overlayEl.setAttribute('visible', false);
    if (this.captionEl) this.captionEl.setAttribute('visible', false);
  },

  _buildOverlay() {
    const el = document.createElement('a-plane');
    el.setAttribute('position', '0 0.05 0.01');
    el.setAttribute('width', '1');
    el.setAttribute('height', '0.75');
    el.setAttribute('material', 'transparent: true; opacity: 0');
    el.setAttribute('visible', false);
    el.setAttribute('class', 'clickable');
    this.el.appendChild(el);
    this.overlayEl = el;

    // Caption text below overlay
    const cap = document.createElement('a-text');
    cap.setAttribute('position', '0 -0.44 0.02');
    cap.setAttribute('align', 'center');
    cap.setAttribute('width', '0.9');
    cap.setAttribute('color', '#F5F0E6');
    cap.setAttribute('visible', false);
    cap.setAttribute('value', '');
    this.el.appendChild(cap);
    this.captionEl = cap;
  },

  _buildPulse() {
    const el = document.createElement('a-ring');
    el.setAttribute('position', '0 0 0.005');
    el.setAttribute('radius-inner', '0.06');
    el.setAttribute('radius-outer', '0.10');
    el.setAttribute('color', '#C2D3A9');
    el.setAttribute('material', 'transparent: true; opacity: 0.35');
    el.setAttribute('visible', false);
    el.setAttribute('animation', 'property: material.opacity; from: 0.15; to: 0.55; dur: 1200; dir: alternate; loop: true; easing: easeInOutSine');
    this.el.appendChild(el);
    this.pulseEl = el;
  },
});

// ─── DIAL ─────────────────────────────────────────────────────────────────────

function updateDialLabel(text) {
  const el = document.getElementById('dial-label');
  if (el) el.textContent = text;
}

function initDial() {
  const dial = document.getElementById('dial');
  if (!dial) return;
  let startAngle = null;

  function angle(e) {
    const r  = dial.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const t  = e.touches ? e.touches[0] : e;
    return Math.atan2(t.clientY - cy, t.clientX - cx) * 180 / Math.PI;
  }

  function start(e) { startAngle = angle(e); }
  function move(e) {
    if (startAngle === null) return;
    const d = angle(e) - startAngle;
    const knob = document.getElementById('dial-knob');
    if (knob) knob.style.transform = `rotate(${d}deg)`;
    if (d < -20)      setDial('past');
    else if (d > 20)  setDial('future');
    else              setDial(null);
  }
  function end() {
    startAngle = null;
    const knob = document.getElementById('dial-knob');
    if (knob) { knob.style.transition = 'transform 0.3s ease'; knob.style.transform = 'rotate(0deg)'; }
    setTimeout(() => { if (knob) knob.style.transition = ''; }, 300);
  }

  dial.addEventListener('touchstart',  start, { passive: true });
  dial.addEventListener('touchmove',   move,  { passive: true });
  dial.addEventListener('touchend',    end);
  dial.addEventListener('mousedown',   start);
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
    if (dx < -60)      setDial('past');
    else if (dx > 60)  setDial('future');
    startX = null;
  });
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initDial();
  initSwipe();

  document.getElementById('help-btn').addEventListener('click', () =>
    document.getElementById('help-modal').classList.remove('hidden'));
  document.getElementById('help-close').addEventListener('click', () =>
    document.getElementById('help-modal').classList.add('hidden'));

  const scene = document.querySelector('a-scene');
  if (scene) {
    scene.addEventListener('loaded', () => {
      const o = document.getElementById('loading-overlay');
      if (o) { o.style.opacity = '0'; setTimeout(() => o.remove(), 600); }
    });
  }
});