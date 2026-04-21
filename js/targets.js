/**
 * THREE TIMELINES — Target Configuration
 * Area 6 — Eroi su Ruote — Museo Marazzato
 *
 * 14 AR targets:
 *   7 domestic objects  → timeline layer (Past / Future overlay)
 *   3 firefighter equip → factual layer
 *   3 truck info panels → factual layer
 *   1 ground trigger    → timeline layer (sprout animation)
 *
 * targetIndex matches the order of imageTargetSrc entries in the .mind file.
 * Keep this file in sync with the compiled .mind file order.
 */

export const ZONE = {
  PAST:    'past',
  PRESENT: 'present',
  FUTURE:  'future',
};

export const LAYER = {
  TIMELINE: 'timeline',   // responds to zone + rotary dial
  FACTUAL:  'factual',    // always shows its single overlay, ignores zone/dial
};

export const targets = [
  // ─── ZONA CAMION 1 — default PASSATO ────────────────────────────────────────
  {
    id: 'D1',
    targetIndex: 0,
    label: 'Fotografia di famiglia',
    zone: ZONE.PAST,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D1_past.png',
      caption: 'Alassio, agosto — 1971.',
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D1_future.png',
      caption: 'La stessa cornice, riparata.',
    },
  },
  {
    id: 'D2',
    targetIndex: 1,
    label: 'Calendario da muro',
    zone: ZONE.PAST,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D2_past.png',
      caption: 'Pranzo da mamma — domenica.',
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D2_future.png',
      caption: null,
    },
  },
  {
    id: 'D3',
    targetIndex: 2,
    label: 'Disegno di Carlo',
    zone: ZONE.PAST,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D3_past.png',
      caption: null,
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D3_future.png',
      caption: 'Carlo, pompiere — 1989.',   // Carlo in VVF uniform
    },
  },

  // ─── ZONA CAMION 2 — default PRESENTE ───────────────────────────────────────
  // Present = physical state; dwell in this zone reveals NO overlay
  {
    id: 'D5',
    targetIndex: 3,
    label: 'Post-it 115',
    zone: ZONE.PRESENT,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D5_past.png',
      caption: null,
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D5_future.png',
      caption: null,
    },
  },
  {
    id: 'D6',
    targetIndex: 4,
    label: 'Diario del padre',
    zone: ZONE.PRESENT,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D6_past.png',
      caption: 'La casa è troppo piccola. Ma è nostra.',
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D6_future.png',
      caption: null,
    },
  },

  // ─── ZONA CAMION 3 — default FUTURO ─────────────────────────────────────────
  {
    id: 'D7',
    targetIndex: 5,
    label: 'Libro dei mestieri',
    zone: ZONE.FUTURE,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D7_past.png',
      caption: null,
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D7_future.png',
      caption: null,
    },
  },
  {
    id: 'D8',
    targetIndex: 6,
    label: 'Vaso di terracotta',
    zone: ZONE.FUTURE,
    layer: LAYER.TIMELINE,
    past: {
      type: 'image',
      src: 'assets/overlays/past/D8_past.png',
      caption: null,                         // lemon plant on windowsill
    },
    future: {
      type: 'image',
      src: 'assets/overlays/future/D8_future.png',
      caption: null,                         // lemon replanted
    },
  },

  // ─── FIREFIGHTER EQUIPMENT — factual layer ───────────────────────────────────
  {
    id: 'F1',
    targetIndex: 7,
    label: 'Elmetto',
    zone: ZONE.PAST,     // physically on Truck 1; zone irrelevant for factual
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: 'assets/overlays/factual/F1_helmet.png',
      title: 'Elmetto da pompiere',
      body: 'Modello Cromwell MK3 · Anno di emissione: 1968 · Materiale: acciaio verniciato · Indossato durante le operazioni di salvataggio.',
    },
  },
  {
    id: 'F2',
    targetIndex: 8,
    label: 'Ascia',
    zone: ZONE.PRESENT,
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: 'assets/overlays/factual/F2_axe.png',
      title: 'Ascia da pompiere',
      body: 'Ascia da sfondamento · Anno: 1972 · Acciaio forgiato, manico in frassino · Usata per aprire varchi in strutture compromesse.',
    },
  },
  {
    id: 'F3',
    targetIndex: 9,
    label: 'Giubba',
    zone: ZONE.FUTURE,
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: 'assets/overlays/factual/F3_jacket.png',
      title: 'Giubba protettiva',
      body: 'Giubba VVF · Anno: 1975 · Fibra di lana trattata, foderata in cotone · Protezione termica fino a 200°C.',
    },
  },

  // ─── TRUCK INFO PANELS — factual layer ──────────────────────────────────────
  {
    id: 'T1',
    targetIndex: 10,
    label: 'Info Camion 1',
    zone: ZONE.PAST,
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: null,
      title: 'Camion 1 — [TBD: modello]',
      body: '[TBD — in attesa dati archivio Fondazione Marazzato · Gioia]',
    },
  },
  {
    id: 'T2',
    targetIndex: 11,
    label: 'Info Camion 2',
    zone: ZONE.PRESENT,
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: null,
      title: 'Camion 2 — [TBD: modello]',
      body: '[TBD — in attesa dati archivio Fondazione Marazzato · Gioia]',
    },
  },
  {
    id: 'T3',
    targetIndex: 12,
    label: 'Info Camion 3',
    zone: ZONE.FUTURE,
    layer: LAYER.FACTUAL,
    factual: {
      type: 'card',
      src: null,
      title: 'Camion 3 — [TBD: modello]',
      body: '[TBD — in attesa dati archivio Fondazione Marazzato · Gioia]',
    },
  },

  // ─── GROUND TRIGGER — G1 ────────────────────────────────────────────────────
  {
    id: 'G1',
    targetIndex: 13,
    label: 'Crepa a pavimento — germoglio',
    zone: ZONE.FUTURE,      // threshold toward Area 7; default = Future
    layer: LAYER.TIMELINE,
    past: {
      type: 'animation',
      src: null,             // no past state for G1
      caption: null,
    },
    future: {
      type: 'animation',
      src: 'assets/overlays/future/G1_sprout.png',  // sprite sheet or looped PNG
      caption: null,
    },
  },
];

/**
 * Quick lookup by targetIndex (used by the A-Frame event handlers)
 */
export const targetsByIndex = Object.fromEntries(
  targets.map(t => [t.targetIndex, t])
);
