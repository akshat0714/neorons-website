# Update the existing neorons.com website

The website is static HTML, CSS, JavaScript, fonts, and images. There is no build
step or database migration. This procedure replaces website content while
preserving the VM's existing nginx configuration, certificates, and DNS.

On 26 October 2026 (Pacific time), `https://neorons.com/` returned
`Server: nginx/1.22.1`; `https://neorons.vercel.app/` separately returned Vercel
headers. A successful GitHub push does **not** prove that the GCP VM updated.
Verify the production domain after deploying.

## 1. Open the VM and identify the live directory

In Google Cloud Console, use the existing Neorons account, search for **VM
instances**, select the **neorons** instance, and click **SSH**. Complete sign-in
and two-step verification through the account's normal process. Never paste
passwords or verification codes into repository files.

```sh
sudo systemctl status nginx --no-pager
sudo nginx -T
```

In the printed configuration, find the `server` block for `neorons.com` and its
effective `root`. Follow any included configuration. If it uses `alias`,
`proxy_pass`, or a container instead, ask the hosting maintainer to identify the
actual static document directory before using the commands below. Do not assume
that the example `/var/www/neorons` in the old deployment guide is the live path.

Set the verified path, and confirm that it contains the currently served site:

```sh
NEORONS_WEB_ROOT='/replace/with/the/verified/nginx/root'
NEORONS_WEB_ROOT="$(readlink -f "$NEORONS_WEB_ROOT")"
test -n "$NEORONS_WEB_ROOT" && test "$NEORONS_WEB_ROOT" != / && test -f "$NEORONS_WEB_ROOT/index.html" || exit 1
sudo ls -ld "$NEORONS_WEB_ROOT"
sudo head -n 15 "$NEORONS_WEB_ROOT/index.html"
```

If an automatic deployment job already manages this directory, coordinate this
update with that job so it does not overwrite the manual release. Do not change
the existing job without understanding its source and release policy.

## 2. Back up the site before changing it

Keep the backup outside the public web directory. The archive preserves the
existing files for rollback; it is not served by nginx.

```sh
NEORONS_RELEASE_TIME="$(date -u +%Y%m%dT%H%M%SZ)"
NEORONS_BACKUP="/var/backups/neorons-site/$NEORONS_RELEASE_TIME.tar.gz"
sudo install -d -m 700 /var/backups/neorons-site
sudo tar -czpf "$NEORONS_BACKUP" -C "$NEORONS_WEB_ROOT" .
sudo tar -tzf "$NEORONS_BACKUP" >/dev/null
printf 'Backup: %s\n' "$NEORONS_BACKUP"
```

Keep this SSH session open so the variables remain available. Save the backup
path in your deployment notes before closing the session.

## 3. Prepare the new files

Choose **one** option. Both stage the release outside the live directory.

### Option A: use the supplied upload-ready ZIP

Use the SSH window's **Upload file** action to upload `neorons-website.zip`.
Set its actual uploaded path below. The ZIP has `index.html` at its root, not
inside another folder.

```sh
NEORONS_ZIP="$HOME/neorons-website.zip"
NEORONS_STAGE="$(mktemp -d /tmp/neorons-release.XXXXXX)"
python3 - "$NEORONS_ZIP" "$NEORONS_STAGE" <<'PY'
from pathlib import Path
import sys
import zipfile

archive_path, staging_path = map(Path, sys.argv[1:])
with zipfile.ZipFile(archive_path) as archive:
    bad = archive.testzip()
    if bad:
        raise SystemExit('ZIP failed its integrity check')
    for member in archive.infolist():
        path = Path(member.filename)
        if path.is_absolute() or '..' in path.parts or any(p.startswith('.') for p in path.parts):
            raise SystemExit('ZIP contains an unsafe path')
    archive.extractall(staging_path)
if not (staging_path / 'index.html').is_file():
    raise SystemExit('index.html is missing from the ZIP root')
PY
```

### Option B: obtain the updated release from GitHub

Clone to a new temporary directory. This avoids a destructive reset or changing
uncommitted server edits. Record the exact commit used. If the website changes
are on a release branch rather than `main`, replace `main` with that branch name
or the supplied commit SHA.

```sh
NEORONS_SOURCE="$(mktemp -d /tmp/neorons-source.XXXXXX)"
git clone --quiet https://github.com/akshat0714/neorons-website.git "$NEORONS_SOURCE"
git -C "$NEORONS_SOURCE" checkout --detach main
git -C "$NEORONS_SOURCE" rev-parse HEAD
NEORONS_ZIP="$(mktemp /tmp/neorons-release.XXXXXX.zip)"
bash "$NEORONS_SOURCE/scripts/package-release.sh" "$NEORONS_ZIP"
NEORONS_STAGE="$(mktemp -d /tmp/neorons-release.XXXXXX)"
python3 -m zipfile -e "$NEORONS_ZIP" "$NEORONS_STAGE"
```

## 4. Copy the static files into the live directory

Inspect the staged homepage and file list first. The package must contain only
public website files. It must not contain `.git`, account credentials, nginx
configuration, or a surrounding project directory.

```sh
test -f "$NEORONS_STAGE/index.html" || exit 1
find "$NEORONS_STAGE" -maxdepth 2 -type f
head -n 15 "$NEORONS_STAGE/index.html"
sudo nginx -t
sudo rsync -rt --chmod=D755,F644 "$NEORONS_STAGE/" "$NEORONS_WEB_ROOT/"
```

This is an overlay without `--delete`: it does not remove unrelated server files
or alter deployment settings. Old unused static files may remain. Updating static
content does not require restarting or reloading nginx. Do **not** replace
`/etc/nginx`, run certificate setup again, or change DNS for this content update.

## 5. Verify the live website

```sh
sudo nginx -t
sudo systemctl status nginx --no-pager
curl -fsSI https://neorons.com/
curl -fsS https://neorons.com/ -o /tmp/neorons-live-check.html
cmp "$NEORONS_STAGE/index.html" /tmp/neorons-live-check.html
curl -fsSI https://neorons.com/india.html
curl -fsSI https://neorons.com/programs.html
```

`cmp` exits successfully with no output when the live homepage matches the
release. If a proxy changes whitespace, inspect the visible text and compare a
distinctive new heading instead. If the old page remains, inspect the actual
document root and any CDN/deployment job before retrying. Do not claim success
from the GitHub commit alone.

Open `https://neorons.com/` in a browser and check the desktop and mobile menus,
India programme filters/details, contact links, and donation destination. Hard
refresh if the browser has cached older CSS or images.

## Rollback

Restore the saved site content if the release needs to be reverted:

```sh
test -f "$NEORONS_BACKUP" || exit 1
sudo tar -xzpf "$NEORONS_BACKUP" -C "$NEORONS_WEB_ROOT"
sudo nginx -t
curl -fsSI https://neorons.com/
```

This restores prior versions of existing files. Newly introduced pages can remain
on disk but will no longer be linked from the restored homepage. To remove them,
compare the release manifest with the backup and remove only the new public
files after review; never delete the document root or server configuration.
