/**
 * THREE TIMELINES — Main
 * A-Frame + MindAR integration.
 * Registers all custom components and wires up interactions.
 */

import { targets, targetsByIndex } from './targets.js';
import { getActiveTimeline, setDialOverride, subscribe } from './timeline.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DWELL_MS      = 2000;    // ms to hold gaze to trigger reveal
const PULSE_MIN     = 0.15;    // minimum pulse opacity
const PULSE_MAX     = 0.55;    // maximum pulse opacity at closest distance
const FADE_DURATION = 400;     // ms for overlay fade in/out

// ─── A-Frame: timeline-target component ───────────────────────────────────────
// Attach to every <a-entity mindar-image-target> in the scene.
// Handles: pulse, dwell, tap, overlay display.

AFRAME.registerComponent('timeline-target', {
  schema: {
    targetIndex: { type: 'int', default: 0 },
  },

  init() {
    const target = targetsByIndex[this.data.targetIndex];
    if (!target) return;

    this.target     = target;
    this.dwellTimer = null;
    this.visible    = false;
    this.overlayEl  = null;

    // Build overlay plane (hidden by default)
    this.overlayEl = this._buildOverlay();
    this.el.appendChild(this.overlayEl);

    // Pulse ring
    this.pulseEl = this._buildPulse();
    this.el.appendChild(this.pulseEl);

    // Events from MindAR
    this.el.addEventListener('targetFound', () => this._onFound());
    this.el.addEventListener('targetLost',  () => this._onLost());

    // Tap on overlay plane
    this.overlayEl.addEventListener('click', () => this._onTap());

    // React to dial changes
    this._unsubscribe = subscribe(() => this._refresh());
  },

  remove() {
    if (this._unsubscribe) this._unsubscribe();
    this._clearDwell();
  },

  // ── Target found ────────────────────────────────────────────────────────────

  _onFound() {
    this.visible = true;
    this.pulseEl.setAttribute('visible', true);
    this._startDwell();
    this._refresh();
  },

  _onLost() {
    this.visible = false;
    this.pulseEl.setAttribute('visible', false);
    this._clearDwell();
    this._hideOverlay();
  },

  // ── Dwell ───────────────────────────────────────────────────────────────────

  _startDwell() {
    this._clearDwell();
    this.dwellTimer = setTimeout(() => this._reveal(), DWELL_MS);
  },

  _clearDwell() {
    if (this.dwellTimer) {
      clearTimeout(this.dwellTimer);
      this.dwellTimer = null;
    }
  },

  // ── Tap ─────────────────────────────────────────────────────────────────────

  _onTap() {
    this._clearDwell();
    this._reveal();
  },

  // ── Reveal / hide overlay ────────────────────────────────────────────────────

  _reveal() {
    const timeline = getActiveTimeline(this.target);

    if (timeline === 'present') {
      // Present = physical state; no overlay
      this._hideOverlay();
      return;
    }

    const content = timeline === 'factual'
      ? this.target.factual
      : this.target[timeline];  // target.past or target.future

    if (!content) {
      this._hideOverlay();
      return;
    }

    this._applyContent(content, timeline);
    this._showOverlay();
  },

  _refresh() {
    // Called when dial changes; re-render if currently visible
    if (this.visible) this._reveal();
  },

  _applyContent(content, timeline) {
    const el = this.overlayEl;

    if (content.type === 'card' || content.type === 'image') {
      // Update texture src if provided
      if (content.src) {
        el.setAttribute('material', `src: ${content.src}; transparent: true; opacity: 0`);
      } else {
        // Fallback: coloured plane with title text (for TBD truck cards)
        el.setAttribute('material', `color: #1a1a1a; opacity: 0`);
        this._setCaption(content.title || '');
      }
    }

    if (content.type === 'animation') {
      if (content.src) {
        el.setAttribute('material', `src: ${content.src}; transparent: true; opacity: 0`);
      }
    }

    // Caption
    if (content.caption) {
      this._setCaption(content.caption);
    }

    // Colour tint by timeline for placeholder mode
    const tints = { past: '#C2D3A9', future: '#F5F0E6', factual: '#ffffff' };
    if (!content.src) {
      el.setAttribute('material', `color: ${tints[timeline] || '#ffffff'}; opacity: 0`);
    }
  },

  _showOverlay() {
    const el = this.overlayEl;
    el.setAttribute('visible', true);
    // Fade in via animation component
    el.setAttribute('animation__fadein', {
      property: 'material.opacity',
      to: 0.92,
      dur: FADE_DURATION,
      easing: 'easeInQuad',
    });
  },

  _hideOverlay() {
    const el = this.overlayEl;
    el.setAttribute('animation__fadeout', {
      property: 'material.opacity',
      to: 0,
      dur: FADE_DURATION,
      easing: 'easeOutQuad',
    });
    setTimeout(() => el.setAttribute('visible', false), FADE_DURATION);
  },

  // ── Builders ─────────────────────────────────────────────────────────────────

  _buildOverlay() {
    const el = document.createElement('a-plane');
    el.setAttribute('position', '0 0 0.01');
    el.setAttribute('width',  '1');
    el.setAttribute('height', '0.75');
    el.setAttribute('material', 'transparent: true; opacity: 0');
    el.setAttribute('visible', false);
    el.setAttribute('class', 'clickable');
    return el;
  },

  _buildPulse() {
    const el = document.createElement('a-ring');
    el.setAttribute('position', '0 0 0.005');
    el.setAttribute('radius-inner', '0.08');
    el.setAttribute('radius-outer', '0.12');
    el.setAttribute('color', '#C2D3A9');   // Tea Green
    el.setAttribute('material', 'transparent: true; opacity: 0.3');
    el.setAttribute('visible', false);
    // Looped pulse animation
    el.setAttribute('animation', {
      property: 'material.opacity',
      from: PULSE_MIN,
      to: PULSE_MAX,
      dur: 1200,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
    return el;
  },

  _setCaption(text) {
    // Find or create caption text entity
    let cap = this.el.querySelector('.caption');
    if (!cap) {
      cap = document.createElement('a-text');
      cap.classList.add('caption');
      cap.setAttribute('position', '0 -0.45 0.02');
      cap.setAttribute('align', 'center');
      cap.setAttribute('width', '0.9');
      cap.setAttribute('color', '#F5F0E6');
      cap.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
      this.el.appendChild(cap);
    }
    cap.setAttribute('value', text);
  },
});

// ─── A-Frame: sprout-animation component (G1) ─────────────────────────────────

AFRAME.registerComponent('sprout-animation', {
  init() {
    // Simple scale breathing for the sprout plane
    this.el.setAttribute('animation__breathe', {
      property: 'scale',
      from: '1 1 1',
      to: '1.04 1.08 1',
      dur: 2000,
      dir: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    });
  },
});

// ─── Rotary Dial UI ───────────────────────────────────────────────────────────
// Implemented as a 2D HTML overlay on top of the canvas.
// Drag/rotate gesture → calls setDialOverride().

function initDial() {
  const dial     = document.getElementById('dial');
  const dialKnob = document.getElementById('dial-knob');
  if (!dial) return;

  let startAngle   = null;
  let currentAngle = 0;
  const DEADZONE   = 20;  // degrees before registering a direction

  function getAngle(e) {
    const rect   = dial.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const touch  = e.touches ? e.touches[0] : e;
    return Math.atan2(touch.clientY - cy, touch.clientX - cx) * (180 / Math.PI);
  }

  function onStart(e) {
    startAngle = getAngle(e);
  }

  function onMove(e) {
    if (startAngle === null) return;
    const angle = getAngle(e);
    const delta = angle - startAngle;

    // Rotate knob visually
    dialKnob.style.transform = `rotate(${delta}deg)`;

    if (delta < -DEADZONE) {
      setDialOverride('past');
      updateDialLabel('◂ PASSATO');
    } else if (delta > DEADZONE) {
      setDialOverride('future');
      updateDialLabel('FUTURO ▸');
    } else {
      setDialOverride(null);
      updateDialLabel('○');
    }
  }

  function onEnd() {
    startAngle = null;
    // Spring back
    dialKnob.style.transition = 'transform 0.3s ease';
    dialKnob.style.transform  = 'rotate(0deg)';
    setTimeout(() => dialKnob.style.transition = '', 300);
  }

  dial.addEventListener('touchstart',  onStart, { passive: true });
  dial.addEventListener('touchmove',   onMove,  { passive: true });
  dial.addEventListener('touchend',    onEnd);
  dial.addEventListener('mousedown',   onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onEnd);
}

function updateDialLabel(text) {
  const label = document.getElementById('dial-label');
  if (label) label.textContent = text;
}

// ─── Swipe override (horizontal) ─────────────────────────────────────────────

function initSwipe() {
  let startX = null;
  const THRESHOLD = 60;  // px

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -THRESHOLD) {
      setDialOverride('past');
      updateDialLabel('◂ PASSATO');
    } else if (dx > THRESHOLD) {
      setDialOverride('future');
      updateDialLabel('FUTURO ▸');
    }
    startX = null;
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initDial();
  initSwipe();
});
