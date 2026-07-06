#!/usr/bin/env bash
# Strip EXIF/GPS metadata from all images in images/
# Usage: bash scripts/strip-exif.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Stripping EXIF metadata from images..."
for img in images/*.jpg images/*.jpeg images/*.png 2>/dev/null; do
  [ -f "$img" ] || continue
  # Re-export strips metadata on macOS
  sips -s format jpeg -s formatOptions 80 "$img" --out "$img" >/dev/null 2>&1 && \
    echo "  Stripped: $img"
done

echo "Done. Verify with: mdls -name kMDItemGPSCoordinates images/<file>"
