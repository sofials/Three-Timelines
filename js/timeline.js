/**
 * THREE TIMELINES — Timeline System
 * Manages active timeline per target, zone defaults, rotary dial, swipe override.
 */

import { ZONE, LAYER } from './targets.js';

// ─── State ────────────────────────────────────────────────────────────────────

let dialOverride = null;   // null | 'past' | 'future'  (from rotary dial / swipe)

const listeners = [];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the active timeline for a given target object.
 * FACTUAL targets always return 'factual'.
 * TIMELINE targets: dial override > zone default.
 */
export function getActiveTimeline(target) {
  if (target.layer === LAYER.FACTUAL) return 'factual';

  if (dialOverride) return dialOverride;

  // zone default
  switch (target.zone) {
    case ZONE.PAST:    return 'past';
    case ZONE.PRESENT: return 'present';   // = no overlay; physical state
    case ZONE.FUTURE:  return 'future';
    default:           return 'present';
  }
}

/**
 * Set dial override. Pass null to reset to zone-driven behaviour.
 * @param {'past'|'future'|null} value
 */
export function setDialOverride(value) {
  dialOverride = value;
  emit({ type: 'dialChange', value });
}

export function getDialOverride() {
  return dialOverride;
}

/**
 * Subscribe to timeline state changes.
 * Callback receives { type: 'dialChange', value }
 */
export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function emit(event) {
  listeners.forEach(fn => fn(event));
}
