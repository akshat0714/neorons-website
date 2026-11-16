#!/usr/bin/env python3
"""Build Neorons' permanent brand assets from its original 40 × 40 mark.

Requires Pillow (tested with 11.3). Run from any directory:
    python3 scripts/build-brand-icons.py
    python3 scripts/build-brand-icons.py --check

The circle, hub, six spoke endpoints and 1.6-unit stroke are unchanged.
A solid site-green background and ivory foreground provide contrast on both
light and dark browser chrome. All rasters are independently supersampled
from these same vector coordinates, including each of the four ICO frames.
No fonts, network requests, timestamps or generated artwork are involved.
"""
from __future__ import annotations

import argparse
from io import BytesIO
from math import hypot
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
GREEN = '#425a3d'
IVORY = '#faf8f5'
VIEWBOX = 40
STROKE = 1.6
SUPERSAMPLE = 8
SPOKE_PATH = 'M20 2v9m0 18v9M4.4 11l7.8 4.5m15.6 9L35.6 29M4.4 29l7.8-4.5m15.6-9L35.6 11'
SPOKES = (
    ((20, 2), (20, 11)),
    ((20, 29), (20, 38)),
    ((4.4, 11), (12.2, 15.5)),
    ((27.8, 24.5), (35.6, 29)),
    ((4.4, 29), (12.2, 24.5)),
    ((27.8, 15.5), (35.6, 11)),
)
PNG_SIZES = {
    'images/favicon-96.png': 96,
    'images/favicon-192.png': 192,
    'images/apple-touch-icon.png': 180,
    'images/neorons-logo.png': 512,
}
ICO_SIZES = (16, 32, 48, 64)


def svg(*, logo: bool) -> bytes:
    attrs = 'width="512" height="512" ' if logo else ''
    accessible = 'role="img" aria-label="Neorons"' if logo else 'aria-hidden="true"'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" {attrs}viewBox="0 0 40 40" {accessible}>\n'
        f'  <rect width="40" height="40" fill="{GREEN}"/>\n'
        f'  <circle cx="20" cy="20" r="18" fill="none" stroke="{IVORY}" stroke-width="1.6"/>\n'
        f'  <circle cx="20" cy="20" r="5" fill="{IVORY}"/>\n'
        f'  <path d="{SPOKE_PATH}" fill="none" stroke="{IVORY}" stroke-width="1.6"/>\n'
        '</svg>\n'
    ).encode('utf-8')


def raster(size: int) -> Image.Image:
    """Rasterise the unchanged mark, preserving SVG's centred strokes/butt caps."""
    factor = size * SUPERSAMPLE / VIEWBOX
    image = Image.new('RGB', (size * SUPERSAMPLE, size * SUPERSAMPLE), GREEN)
    draw = ImageDraw.Draw(image)

    def disc(radius: float, fill: str) -> None:
        draw.ellipse(tuple(value * factor for value in (
            20 - radius, 20 - radius, 20 + radius, 20 + radius
        )), fill=fill)

    # SVG's circular stroke is an annulus centred on r=18.
    disc(18 + STROKE / 2, IVORY)
    disc(18 - STROKE / 2, GREEN)
    disc(5, IVORY)
    for (x1, y1), (x2, y2) in SPOKES:
        dx, dy = x2 - x1, y2 - y1
        length = hypot(dx, dy)
        ox, oy = -dy / length * STROKE / 2, dx / length * STROKE / 2
        points = (
            (x1 + ox, y1 + oy), (x2 + ox, y2 + oy),
            (x2 - ox, y2 - oy), (x1 - ox, y1 - oy),
        )
        draw.polygon([(x * factor, y * factor) for x, y in points], fill=IVORY)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def outputs() -> dict[str, bytes]:
    result = {
        'images/favicon.svg': svg(logo=False),
        'images/neorons-logo.svg': svg(logo=True),
    }
    for path, size in PNG_SIZES.items():
        output = BytesIO()
        raster(size).save(output, format='PNG', optimize=False, compress_level=9)
        result[path] = output.getvalue()
    frames = [raster(size) for size in ICO_SIZES]
    output = BytesIO()
    frames[-1].save(output, format='ICO', sizes=[(s, s) for s in ICO_SIZES], append_images=frames[:-1])
    result['favicon.ico'] = output.getvalue()
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify checked-in assets without changing them.')
    args = parser.parse_args()
    mismatches = []
    for relative, content in outputs().items():
        path = ROOT / relative
        if args.check:
            if not path.is_file() or path.read_bytes() != content:
                mismatches.append(relative)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
        print(f'{relative} ({len(content):,} bytes)')
    if mismatches:
        raise SystemExit('Brand assets differ from builder: ' + ', '.join(mismatches))
    print('Brand assets match the deterministic builder.' if args.check else 'Brand assets built.')


if __name__ == '__main__':
    main()
