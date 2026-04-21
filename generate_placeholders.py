"""
generate_placeholders.py
Generates simple PNG placeholder images for each overlay slot.
Run this once so index.html has something to load during development.

Requirements: pip install Pillow
Usage: python generate_placeholders.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = "assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SLOTS = [
    # (filename, bg_color, text, text_color)
    ("d1-past.png",   "#c2d3a9", "D1 · PASSATO\nFoto restaurata\nAlassio, agosto — 1971",   "#303030"),
    ("d1-future.png", "#c72a09", "D1 · FUTURO\nCarlo adulto\ncon la figlia",               "#f5f0e6"),
    ("d3-past.png",   "#c2d3a9", "D3 · PASSATO\nDisegno a pastelli\nLA MIA FAMIGLIA",       "#303030"),
    ("d3-future.png", "#c72a09", "D3 · FUTURO\nCarlo in divisa VVF",                       "#f5f0e6"),
    ("d5-past.png",   "#c2d3a9", "D5 · PASSATO\n115 — Vigili del Fuoco\n1 1 5  1 1 5",     "#303030"),
    ("d5-future.png", "#c72a09", "D5 · FUTURO\nPost-it incorniciato",                      "#f5f0e6"),
    ("d6-past.png",   "#c2d3a9", "D6 · PASSATO\nAnnotazione del padre\n«Vuole fare il pompiere»", "#303030"),
    ("d6-future.png", "#c72a09", "D6 · FUTURO\n«Ho ripiantato il limone.\nCresce.»",        "#f5f0e6"),
    ("d7-past.png",   "#c2d3a9", "D7 · PASSATO\nDa grande farò\npagina del pompiere",       "#303030"),
    ("d7-future.png", "#c72a09", "D7 · FUTURO\nCopia nuova\nbiglietto del museo",           "#f5f0e6"),
    ("d8-past.png",   "#c2d3a9", "D8 · PASSATO\nAlbero di limone\nmarzo 1971",              "#303030"),
    ("d8-future.png", "#c72a09", "D8 · FUTURO\nPrimo frutto giallo",                       "#f5f0e6"),
]

W, H = 512, 512

for filename, bg, text, fg in SLOTS:
    img  = Image.new("RGBA", (W, H), bg)
    draw = ImageDraw.Draw(img)

    # Border
    draw.rectangle([4, 4, W-5, H-5], outline=fg, width=2)

    # Text (centered, multiline)
    lines = text.split("\n")
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 32)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
        font_small = font

    y = H // 2 - len(lines) * 22
    for i, line in enumerate(lines):
        f = font if i == 0 else font_small
        bbox = draw.textbbox((0, 0), line, font=f)
        tw   = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y), line, font=f, fill=fg)
        y += 44 if i == 0 else 30

    path = os.path.join(OUTPUT_DIR, filename)
    img.save(path)
    print(f"  ✓ {path}")

print(f"\nDone — {len(SLOTS)} placeholder images written to ./{OUTPUT_DIR}/")
print("Replace them with real Gemini-generated artwork before testing with visitors.")
