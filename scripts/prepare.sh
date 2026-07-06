#!/usr/bin/env bash
# One-time preparation: optimize images and download fonts.
# Usage: bash scripts/prepare.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# --- EXIF stripping ---
bash scripts/strip-exif.sh

# --- Image resizing ---
echo "Resizing images..."
# Hero: max 1600px wide
sips --resampleWidth 1600 images/hero.jpg 2>/dev/null && echo "  Resized: hero.jpg"

# All others: max 1200px wide
for img in images/*.jpg; do
  [ "$(basename "$img")" = "hero.jpg" ] && continue
  [ -f "$img" ] || continue
  width=$(sips -g pixelWidth "$img" | tail -1 | awk '{print $2}')
  if [ "$width" -gt 1200 ] 2>/dev/null; then
    sips --resampleWidth 1200 "$img" 2>/dev/null && echo "  Resized: $img"
  fi
done

# --- WebP conversion (if cwebp available) ---
if command -v cwebp &>/dev/null; then
  echo "Converting to WebP..."
  for img in images/*.jpg; do
    [ -f "$img" ] || continue
    webp="${img%.jpg}.webp"
    cwebp -q 75 "$img" -o "$webp" 2>/dev/null && echo "  Created: $webp"
  done
else
  echo "Skipping WebP conversion (cwebp not found). Install: brew install webp"
fi

echo "Done."
