#!/usr/bin/env bash
# Build an upload-ready archive without repository or hosting configuration.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Usage: bash scripts/package-release.sh /absolute/path/neorons-website.zip\n' >&2
  exit 2
fi

NEORONS_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 - "$NEORONS_REPO_ROOT" "$1" <<'PY'
import os
from pathlib import Path
import sys
import tempfile
import zipfile

root = Path(sys.argv[1]).resolve()
destination = Path(sys.argv[2]).expanduser().resolve()
if destination.suffix.lower() != '.zip':
    raise SystemExit('The output path must end in .zip')
destination.parent.mkdir(parents=True, exist_ok=True)

# Only public web assets qualify. No .git, deployment files, scripts, source
# templates, credentials, test results, or arbitrary JSON enters the archive.
assets = {
    'css': {'.css'},
    'js': {'.js'},
    'fonts': {'.woff2', '.woff', '.ttf', '.otf'},
    'images': {'.jpg', '.jpeg', '.png', '.svg', '.webp', '.avif', '.gif', '.ico'},
    'vendor': {'.css', '.js', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.woff2', '.woff'},
}
files = list(root.glob('*.html'))
files += [root / name for name in ('robots.txt', 'sitemap.xml', 'site.webmanifest') if (root / name).is_file()]
for directory, extensions in assets.items():
    folder = root / directory
    if folder.exists():
        files += [path for path in folder.rglob('*') if path.is_file() and path.suffix.lower() in extensions]
files = sorted(set(files))
for path in files:
    relative = path.relative_to(root)
    if path.is_symlink() or any((root / Path(*relative.parts[:i])).is_symlink() for i in range(1, len(relative.parts))):
        raise SystemExit(f'Refusing symbolic-link asset: {relative}')
    if any(part.startswith('.') for part in relative.parts):
        raise SystemExit(f'Refusing hidden asset: {relative}')
if root / 'index.html' not in files:
    raise SystemExit('index.html is missing')

fd, temporary_name = tempfile.mkstemp(prefix='.neorons-release-', suffix='.zip', dir=destination.parent)
os.close(fd)
try:
    with zipfile.ZipFile(temporary_name, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in files:
            archive.write(path, arcname=path.relative_to(root).as_posix())
    with zipfile.ZipFile(temporary_name) as archive:
        broken = archive.testzip()
        if broken:
            raise SystemExit(f'Archive validation failed: {broken}')
    os.replace(temporary_name, destination)
finally:
    if os.path.exists(temporary_name):
        os.unlink(temporary_name)
print(f'Packaged {len(files)} public files: {destination}')
print(f'Archive size: {destination.stat().st_size:,} bytes')
PY
