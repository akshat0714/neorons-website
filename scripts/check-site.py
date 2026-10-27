#!/usr/bin/env python3
"""Dependency-free checks for the public static site. No network requests."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"neorons.com", "www.neorons.com"}
BAD_DONATION_URL = "https://gofund.me/e0e99c1d"
errors = []
checked_references = 0


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs = path, [], []
        self.tags = Counter()
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        self.tags[tag] += 1
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for key in ("href", "src", "poster"):
            if attrs.get(key):
                self.refs.append(attrs[key])
        if tag == "meta" and attrs.get("property") == "og:image":
            self.refs.append(attrs.get("content", ""))
        if attrs.get("srcset"):
            self.refs.extend(item.strip().split()[0] for item in attrs["srcset"].split(",") if item.strip())
        if tag == "img" and "alt" not in attrs:
            fail(self.path, "image has no alt attribute: " + attrs.get("src", "(no src)"))
        if tag == "a" and attrs.get("target") == "_blank" and "noopener" not in attrs.get("rel", "").split():
            fail(self.path, "new-tab link lacks noopener: " + attrs.get("href", ""))


def fail(path, message):
    errors.append(f"{path.relative_to(ROOT)}: {message}")


def check_reference(source, reference):
    global checked_references
    checked_references += 1
    if not reference:
        fail(source, "empty asset reference")
        return
    parsed = urlsplit(reference)
    if parsed.scheme == "tel":
        fail(source, "phone links are not enabled for this release: " + reference)
        return
    if reference.rstrip("/") == BAD_DONATION_URL:
        fail(source, "known invalid GoFundMe link is published")
        return
    if parsed.scheme and parsed.scheme not in {"http", "https"}:
        return
    if parsed.netloc and parsed.netloc not in SITE_HOSTS:
        return
    if not parsed.path:
        target = ROOT / "index.html" if parsed.netloc else source
    elif parsed.path.startswith("/") or parsed.netloc:
        target = ROOT / unquote(parsed.path).lstrip("/")
    else:
        target = source.parent / unquote(parsed.path)
    target = target.resolve()
    if target.is_dir():
        target /= "index.html"
    if not target.is_file():
        fail(source, "missing local file: " + reference)
    elif parsed.fragment and target in pages and unquote(parsed.fragment) not in pages[target].ids:
        fail(source, "missing anchor: " + reference)


pages = {path: Page(path) for path in sorted(ROOT.glob("*.html"))}
if ROOT / "index.html" not in pages:
    errors.append("index.html is missing")
for path, page in pages.items():
    for element_id, count in Counter(page.ids).items():
        if count > 1:
            fail(path, "duplicate id: " + element_id)
    for tag in ("h1", "main"):
        if page.tags[tag] != 1:
            fail(path, f"expected one {tag}, found {page.tags[tag]}")
    if BAD_DONATION_URL in path.read_text(encoding="utf-8"):
        fail(path, "known invalid GoFundMe URL remains in public HTML")
    for reference in page.refs:
        check_reference(path, reference)

for path in sorted((ROOT / "css").rglob("*.css")):
    for reference in re.findall(r"url\(\s*['\"]?([^)'\"]+)", path.read_text(encoding="utf-8")):
        check_reference(path, reference.strip())

manifest_path = ROOT / "site.webmanifest"
try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for icon in manifest.get("icons", []):
        check_reference(manifest_path, icon["src"])
except (OSError, ValueError, KeyError) as exc:
    fail(manifest_path, "invalid manifest: " + str(exc))

sitemap_path = ROOT / "sitemap.xml"
try:
    for element in ET.parse(sitemap_path).iter():
        if element.tag.rsplit("}", 1)[-1] == "loc":
            check_reference(sitemap_path, element.text or "")
except (OSError, ET.ParseError) as exc:
    fail(sitemap_path, "invalid sitemap: " + str(exc))

if errors:
    print("Static site checks failed:\n" + "\n".join("- " + error for error in errors))
    sys.exit(1)
print(f"Static site checks passed: {len(pages)} pages, {checked_references} references; no published phone or invalid donation links.")
