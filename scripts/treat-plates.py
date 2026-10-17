#!/usr/bin/env python3
"""ORBYT plate treatment — turn the user's downloaded references into branded plates.

Pipeline per plate:
  1. auto-contrast + slight desaturation
  2. ember duotone (void black -> ember orange -> warm highlight)
  3. film grain overlay
  4. soft vignette
Output: public/images/plates/<name>.jpg
"""
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter
from pathlib import Path
import random

SRC = Path("/home/z/my-project/public/images/brand")
DST = Path("/home/z/my-project/public/images/plates")
DST.mkdir(parents=True, exist_ok=True)

VOID = (11, 10, 8)        # #0B0A08
EMBER_MID = (122, 46, 14) # deep rust mid-tone
HIGHLIGHT = (255, 176, 92) # warm ember highlight

def grain(img, opacity=0.10):
    w, h = img.size
    noise = Image.effect_noise((w, h), 42).convert("L")
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(img, noise_rgb, opacity)

def vignette(img, strength=0.32):
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-w * 0.28, -h * 0.28, w * 1.28, h * 1.28), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) // 6))
    black = Image.new("RGB", (w, h), VOID)
    return Image.composite(img, black, mask.point(lambda p: int(255 - (255 - p) * strength)))

def treat(name, grain_op=0.10, vig=0.32):
    src = SRC / f"{name}.jpg"
    img = Image.open(src).convert("RGB")
    img = ImageOps.autocontrast(img, cutoff=1)
    img = ImageEnhance.Color(img).enhance(0.55)      # pull back color
    img = ImageEnhance.Contrast(img).enhance(1.12)
    gray = ImageOps.grayscale(img)
    duo = ImageOps.colorize(gray, black=VOID, white=HIGHLIGHT, mid=EMBER_MID)
    duo = grain(duo, grain_op)
    duo = vignette(duo, vig)
    out = DST / f"{name}.jpg"
    duo.save(out, quality=88)
    print(f"OK {out.name} {duo.size}")

PLATES = {
    "beacon": dict(),
    "ember": dict(),
    "control": dict(),
    "skyline": dict(),
    "signal-lost": dict(grain_op=0.06, vig=0.20),
    "invite": dict(),
    "keycaps": dict(),
    "posters": dict(),
}

for name, kw in PLATES.items():
    treat(name, **kw)
print("ALL PLATES TREATED")
