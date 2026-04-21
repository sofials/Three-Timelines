# Three Timelines — Setup & Development Guide
Area 6 — Eroi su Ruote — Museo Marazzato

---

## Project structure

```
three-timelines/
├── index.html              ← Entry point (PWA)
├── manifest.json           ← PWA manifest
├── css/
│   └── ui.css              ← All UI styling
├── js/
│   ├── main.js             ← A-Frame components, dial, swipe, boot
│   ├── targets.js          ← All 14 AR targets + content config
│   └── timeline.js         ← Zone logic, dial state, pub/sub
└── assets/
    ├── markers/
    │   └── all_targets.mind  ← Compiled MindAR marker file (you generate this)
    ├── overlays/
    │   ├── past/             ← D1–D8 Past overlay images
    │   ├── future/           ← D1–D8 Future + G1 sprout
    │   └── factual/          ← F1–F3 equipment images
    └── icons/
        ├── icon-192.png
        └── icon-512.png
```

---

## Step 1 — Install dev tools (one-time)

```bash
npm install -g live-server
# ngrok: download from https://ngrok.com and add to PATH
```

---

## Step 2 — Compile the .mind marker file

Use the MindAR browser compiler (no install needed):
**https://hiukim.github.io/mind-ar-js-doc/tools/compile**

Upload your 14 marker images IN THIS EXACT ORDER — the order IS the targetIndex:

| targetIndex | ID  | Object                  |
|-------------|-----|-------------------------|
| 0           | D1  | Fotografia di famiglia  |
| 1           | D2  | Calendario da muro      |
| 2           | D3  | Disegno di Carlo        |
| 3           | D5  | Post-it 115             |
| 4           | D6  | Diario del padre        |
| 5           | D7  | Libro dei mestieri      |
| 6           | D8  | Vaso di terracotta      |
| 7           | F1  | Elmetto                 |
| 8           | F2  | Ascia                   |
| 9           | F3  | Giubba                  |
| 10          | T1  | Fiancata Camion 1       |
| 11          | T2  | Fiancata Camion 2       |
| 12          | T3  | Fiancata Camion 3       |
| 13          | G1  | Placca a pavimento      |

Save the output as `assets/markers/all_targets.mind`.

Marker image requirements: high contrast, asymmetric, no pure text,
no symmetric geometric patterns, minimum 300×300 px.

---

## Step 3 — Prepare overlay images

Transparent PNGs, recommended 1024×768 px (4:3).

Naming — must match exactly:
```
assets/overlays/past/D1_past.png  ... D8_past.png
assets/overlays/future/D1_future.png ... D8_future.png
assets/overlays/future/G1_sprout.png
assets/overlays/factual/F1_helmet.png
assets/overlays/factual/F2_axe.png
assets/overlays/factual/F3_jacket.png
```

For early testing: use solid-colour placeholder PNGs.

---

## Step 4 — Run locally

```bash
cd three-timelines
live-server --https
# Open https://localhost:8080 in Chrome
```

---

## Step 5 — Test on phone

```bash
# Terminal 1: live-server --https
# Terminal 2: ngrok http 8080
# Open the ngrok https URL on your phone
```

iOS: Safari. Android: Chrome. Both require camera permission.

---

## Step 6 — Deploy for team

Push to GitHub → enable GitHub Pages (root of main branch).
Or drag folder to https://app.netlify.com/drop

---

## Adding content

To update an overlay image: replace the PNG file. No code change needed.

To update truck factual card text (Gioia's data):
Open js/targets.js → find T1/T2/T3 entries → replace [TBD] strings.

To add a caption: in targets.js, set caption: "your text" on the relevant entry.

---

## TBD / Blockers

| Item | Owner | Status |
|------|-------|--------|
| Truck models + data (T1–T3) | Gioia | Waiting — Fondazione archive |
| Children's book title (D7) | Sofia | Open |
| Plinth design | Yagmur | In progress |
| Lighting per zone | Paganelli | To be confirmed |

---

## Design rules — do not change without team discussion

- Present = no overlay. Physical object IS the Present. Never add a Present AR layer.
- Factual targets (T1–T3, F1–F3) ignore the dial and zone. Always show their single card.
- No firefighter figures. Equipment only.
- No audio. Experience is silent.
- G1 is timeline layer (responds to dial), not factual.
