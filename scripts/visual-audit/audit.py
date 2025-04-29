#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow"]
# ///

import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont  # type: ignore[import-not-found]

PHI = 1.6180339887

GOLD = (255, 215, 0, 180)
BLUE = (0, 120, 255, 180)
RED = (255, 0, 0, 100)
ORANGE = (255, 140, 0, 150)
LEGEND_BG = (0, 0, 0, 180)
LEGEND_TEXT = (255, 255, 255, 255)


def take_screenshot(url: str, output: Path, width: int, height: int, full_page: bool) -> Path:
    dest = output / "original.png"
    cmd = [
        "npx", "playwright", "screenshot",
        "--viewport-size", f"{width},{height}",
    ]
    if full_page:
        cmd.append("--full-page")
    cmd.extend([url, str(dest)])

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"Screenshot failed:\n{e.stderr}", file=sys.stderr)
        print("\nTry installing browsers: npx playwright install chromium", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("npx not found. Ensure Node.js is installed and on PATH.", file=sys.stderr)
        sys.exit(1)

    return dest


def draw_golden_ratio(img: Image.Image) -> Image.Image:
    overlay = img.copy()
    draw = ImageDraw.Draw(overlay)
    w, h = overlay.size

    vx1, vx2 = w / PHI, w - w / PHI
    hy1, hy2 = h / PHI, h - h / PHI

    for x in (vx1, vx2):
        draw.line([(x, 0), (x, h)], fill=GOLD, width=2)
    for y in (hy1, hy2):
        draw.line([(0, y), (w, y)], fill=GOLD, width=2)

    return overlay


def draw_thirds(draw: ImageDraw.ImageDraw, w: int, h: int):
    for i in (1, 2):
        x = w * i / 3
        draw.line([(x, 0), (x, h)], fill=BLUE, width=2)
    for i in (1, 2):
        y = h * i / 3
        draw.line([(0, y), (w, y)], fill=BLUE, width=2)


def draw_center(draw: ImageDraw.ImageDraw, w: int, h: int):
    draw.line([(w / 2, 0), (w / 2, h)], fill=RED, width=1)
    draw.line([(0, h / 2), (w, h / 2)], fill=RED, width=1)


def draw_golden_spiral(draw: ImageDraw.ImageDraw, w: int, h: int):
    x, y = 0.0, 0.0
    rw, rh = float(w), float(h)

    for i in range(12):
        side = min(rw, rh)
        if side < 1:
            break

        d = side * 2
        step = i % 4

        if step == 0:
            bbox = [x, y, x + d, y + d]
            start_angle, end_angle = 180, 270
            x += side
            rw -= side
        elif step == 1:
            bbox = [x + rw - d, y, x + rw, y + d]
            start_angle, end_angle = 270, 360
            y += side
            rh -= side
        elif step == 2:
            bbox = [x + rw - d, y + rh - d, x + rw, y + rh]
            start_angle, end_angle = 0, 90
            rw -= side
        elif step == 3:
            bbox = [x, y + rh - d, x + d, y + rh]
            start_angle, end_angle = 90, 180
            rh -= side

        draw.arc(bbox, start_angle, end_angle, fill=ORANGE, width=3)


def draw_legend(draw: ImageDraw.ImageDraw, w: int, h: int):
    entries = [
        (GOLD, "Golden Ratio"),
        (BLUE, "Rule of Thirds"),
        (RED, "Center"),
        (ORANGE, "Golden Spiral"),
    ]

    try:
        font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans.ttf", 12)
    except (OSError, IOError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
        except (OSError, IOError):
            font = ImageFont.load_default()

    line_h = 18
    swatch_w = 20
    padding = 8
    box_w = swatch_w + padding + 120
    box_h = len(entries) * line_h + padding * 2

    bx = w - box_w - 10
    by = h - box_h - 10

    draw.rectangle([bx, by, bx + box_w, by + box_h], fill=LEGEND_BG)

    for i, (color, label) in enumerate(entries):
        ly = by + padding + i * line_h
        lx = bx + padding
        opaque = (color[0], color[1], color[2], 255)
        draw.line([(lx, ly + 7), (lx + swatch_w, ly + 7)], fill=opaque, width=2)
        draw.text((lx + swatch_w + 6, ly - 1), label, fill=LEGEND_TEXT, font=font)


def generate_overlays(original_path: Path, output: Path) -> list[Path]:
    img = Image.open(original_path).convert("RGBA")
    w, h = img.size

    golden = draw_golden_ratio(img)
    golden_path = output / "golden-ratio.png"
    golden.save(golden_path)

    full = img.copy()
    draw = ImageDraw.Draw(full)
    draw_golden_ratio_lines(draw, w, h)
    draw_thirds(draw, w, h)
    draw_center(draw, w, h)
    draw_golden_spiral(draw, w, h)
    draw_legend(draw, w, h)
    full_path = output / "full-overlay.png"
    full.save(full_path)

    return [original_path, golden_path, full_path]


def draw_golden_ratio_lines(draw: ImageDraw.ImageDraw, w: int, h: int):
    vx1, vx2 = w / PHI, w - w / PHI
    hy1, hy2 = h / PHI, h - h / PHI
    for x in (vx1, vx2):
        draw.line([(x, 0), (x, h)], fill=GOLD, width=2)
    for y in (hy1, hy2):
        draw.line([(0, y), (w, y)], fill=GOLD, width=2)


def main():
    parser = argparse.ArgumentParser(description="Visual composition audit via overlay grids")
    parser.add_argument("url", help="URL to screenshot")
    parser.add_argument("--width", type=int, default=1920, help="Viewport width")
    parser.add_argument("--height", type=int, default=1080, help="Viewport height")
    parser.add_argument("--output", type=str, default="/tmp/visual-audit/", help="Output directory")
    parser.add_argument("--full-page", action="store_true", help="Capture full scrollable page")
    args = parser.parse_args()

    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)

    print(f"Capturing {args.url} at {args.width}x{args.height}...")
    original = take_screenshot(args.url, output, args.width, args.height, args.full_page)
    print(f"Screenshot saved: {original}")

    print("Generating overlays...")
    paths = generate_overlays(original, output)

    print("\nGenerated files:")
    for p in paths:
        print(f"  {p}")


if __name__ == "__main__":
    main()
