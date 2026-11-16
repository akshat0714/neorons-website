#!/usr/bin/env python3
"""Validate local sitemap metadata and identity markup, without network requests.

Run from any directory: python3 scripts/check-seo.py
Use --root PATH to check an unpacked release instead of this checkout.
This checks structure and consistency, not search ranking or factual claims.
"""
import argparse
from collections import defaultdict
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.titles, self.descriptions, self.canonicals = [], [], []
        self.robots, self.jsonld = [], []
        self.icons = []
        self.in_head = False
        self.title_parts = self.json_parts = None
        self.feed(source)
        self.close()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "head":
            self.in_head = True
        if self.in_head:
            if tag == "title":
                self.title_parts = []
            if tag == "meta":
                name = attrs.get("name", "").lower()
                content = attrs.get("content", "")
                if name == "description":
                    self.descriptions.append(content)
                if name in {"robots", "googlebot", "googlebot-news"}:
                    self.robots.append(content)
            if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
                self.canonicals.append(attrs.get("href", ""))
            if tag == "link" and "icon" in attrs.get("rel", "").lower().split():
                self.icons.append(attrs)
        if tag == "script" and attrs.get("type", "").split(";")[0].strip().lower() == "application/ld+json":
            self.json_parts = []

    def handle_data(self, data):
        if self.title_parts is not None:
            self.title_parts.append(data)
        if self.json_parts is not None:
            self.json_parts.append(data)

    def handle_endtag(self, tag):
        if tag == "title" and self.title_parts is not None:
            self.titles.append("".join(self.title_parts))
            self.title_parts = None
        if tag == "script" and self.json_parts is not None:
            self.jsonld.append("".join(self.json_parts))
            self.json_parts = None
        if tag == "head":
            self.in_head = False


def normalized(text):
    return " ".join(text.split()).casefold()


def types(node):
    value = node.get("@type", [])
    values = value if isinstance(value, list) else [value]
    return {item.rsplit("/", 1)[-1] for item in values if isinstance(item, str)}


def objects(value):
    """Visit definitions, embedded entities and reference stubs in JSON-LD."""
    if isinstance(value, dict):
        yield value
        for key, child in value.items():
            if key != "@context":
                yield from objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from objects(child)


def reject_json_constant(value):
    raise ValueError(f"invalid JSON constant {value}")


def png_dimensions(path):
    """Read only the PNG signature and complete first IHDR chunk."""
    with path.open("rb") as asset:
        header = asset.read(33)
    if len(header) != 33 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[8:16] != b"\x00\x00\x00\rIHDR":
        raise ValueError("not a PNG with a complete IHDR header")
    width, height = struct.unpack(">II", header[16:24])
    if not width or not height:
        raise ValueError("PNG dimensions must be positive")
    return width, height


def check_ico_header(path):
    """Check the ICO directory and frame bounds without decoding pixels."""
    with path.open("rb") as asset:
        header = asset.read(6)
        if len(header) != 6:
            raise ValueError("truncated ICO header")
        reserved, kind, count = struct.unpack("<HHH", header)
        if reserved != 0 or kind != 1 or not count:
            raise ValueError("not an ICO file with image entries")
        directory = asset.read(count * 16)
    if len(directory) != count * 16:
        raise ValueError("truncated ICO image directory")
    size = path.stat().st_size
    for position in range(0, len(directory), 16):
        length, offset = struct.unpack("<II", directory[position + 8:position + 16])
        if not length or offset < 6 + count * 16 or offset + length > size:
            raise ValueError("ICO image entry points outside the file")


def validate(root):
    root = root.resolve()
    errors, pages, definitions, page_nodes = [], {}, defaultdict(list), defaultdict(list)
    references = []

    def fail(label, message):
        errors.append(f"{label}: {message}")

    try:
        sitemap = ET.parse(root / "sitemap.xml")
        if sitemap.getroot().tag.rsplit("}", 1)[-1] != "urlset":
            raise ValueError("expected a urlset")
        locations = [element.text or "" for element in sitemap.iter() if element.tag.rsplit("}", 1)[-1] == "loc"]
        if not locations:
            raise ValueError("no URL entries")
    except (OSError, ET.ParseError, ValueError) as exc:
        return [f"sitemap.xml: {exc}"], 0, 0

    home_urls = [url for url in locations if urlsplit(url).path in {"", "/"}]
    if len(home_urls) != 1:
        return ["sitemap.xml: expected exactly one homepage URL"], 0, 0
    home = home_urls[0]
    origin = urlsplit(home).netloc
    founder_url = urljoin(home, "akshat-agarwal.html")
    robots = RobotFileParser()
    try:
        robots.parse((root / "robots.txt").read_text(encoding="utf-8").splitlines())
    except FileNotFoundError:
        robots.parse([])
    except (OSError, UnicodeError) as exc:
        fail("robots.txt", str(exc))
        robots.parse([])

    def local_asset(reference, label):
        if not isinstance(reference, str) or not reference.strip():
            fail(label, "expected a nonempty local asset URL")
            return None
        asset_url = urljoin(home, reference)
        parsed = urlsplit(asset_url)
        if parsed.scheme != "https" or parsed.netloc != origin or parsed.fragment:
            fail(label, "asset must resolve to this site's HTTPS origin without a fragment")
            return None
        path = (root / unquote(parsed.path).lstrip("/")).resolve()
        if not path.is_relative_to(root) or not path.is_file():
            fail(label, f"local asset is missing or outside the site: {reference}")
            return None
        if not robots.can_fetch("Googlebot-Image", asset_url):
            fail(label, f"robots.txt blocks Googlebot-Image from {reference}")
        return path

    seen_urls, unique_metadata = set(), {"title": {}, "description": {}}

    for url in locations:
        if url in seen_urls:
            fail("sitemap.xml", f"duplicate URL: {url}")
            continue
        seen_urls.add(url)
        parsed = urlsplit(url)
        if parsed.scheme != "https" or not parsed.netloc or parsed.netloc != origin or parsed.query or parsed.fragment:
            fail("sitemap.xml", f"expected an absolute HTTPS canonical URL on {origin}: {url}")
            continue
        path = (root / unquote(parsed.path).lstrip("/")).resolve()
        if not path.is_relative_to(root):
            fail("sitemap.xml", f"URL escapes the site directory: {url}")
            continue
        if path.is_dir():
            path /= "index.html"
        label = str(path.relative_to(root))
        try:
            if path.suffix.lower() != ".html":
                raise ValueError("sitemap URL must identify an HTML page")
            page = Page(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, ValueError) as exc:
            fail(label, str(exc))
            continue
        pages[url] = page
        for field, values in (("title", page.titles), ("description", page.descriptions)):
            if len(values) != 1 or not values[0].strip():
                fail(label, f"expected one nonempty {field} in head, found {len(values)}")
            elif normalized(values[0]) in unique_metadata[field]:
                fail(label, f"duplicate {field} (also {unique_metadata[field][normalized(values[0])]})")
            else:
                unique_metadata[field][normalized(values[0])] = label
        if page.canonicals != [url]:
            fail(label, f"expected exactly one canonical matching sitemap URL {url}; found {page.canonicals}")
        for directive in page.robots:
            if {"noindex", "none"} & set(re.split(r"[\s,]+", directive.lower())):
                fail(label, "indexed sitemap page has a noindex robots directive")
        for number, block in enumerate(page.jsonld, 1):
            try:
                data = json.loads(block, parse_constant=reject_json_constant)
                if not isinstance(data, (dict, list)):
                    raise ValueError("expected a JSON object or array")
            except (json.JSONDecodeError, ValueError) as exc:
                fail(label, f"invalid JSON-LD block {number}: {exc}")
                continue
            for node in objects(data):
                node_type = node.get("@type", [])
                if not isinstance(node_type, str) and not (isinstance(node_type, list) and all(isinstance(item, str) for item in node_type)):
                    fail(label, "JSON-LD @type must be a string or an array of strings")
                node_types = types(node)
                if "SearchAction" in node_types:
                    fail(label, "SearchAction is not supported: this site has no search feature")
                identifier = node.get("@id")
                if "@id" in node and (not isinstance(identifier, str) or not identifier.strip()):
                    fail(label, "JSON-LD @id must be a nonempty URL string")
                    continue
                if node_types & {"Person", "Organization", "WebSite", "ProfilePage"} and not identifier:
                    fail(label, "identity entity needs a stable @id: " + ", ".join(sorted(node_types)))
                if not identifier:
                    continue
                resolved = urljoin(url, identifier)
                if urlsplit(resolved).scheme not in {"http", "https"}:
                    fail(label, f"JSON-LD identity @id must resolve to an HTTP(S) URL: {identifier}")
                if set(node) <= {"@id"}:
                    references.append((label, resolved))
                else:
                    definitions[resolved].append((url, node))
                    page_nodes[url].append((resolved, node))

    for label, identifier in references:
        if urlsplit(identifier).netloc == origin and identifier not in definitions:
            fail(label, f"unresolved local JSON-LD reference: {identifier}")
    for identifier, entries in definitions.items():
        entity_types = set().union(*(types(node) & {"Person", "Organization", "WebSite", "ProfilePage"} for _, node in entries))
        if len(entity_types) > 1:
            fail("JSON-LD", f"one @id is reused for different identity types: {identifier}")
        names = {normalized(node["name"]) for _, node in entries if isinstance(node.get("name"), str)}
        if len(names) > 1:
            fail("JSON-LD", f"inconsistent names for shared @id: {identifier}")

    def find(page_url, kind, wanted_id=None):
        matches = [(identifier, node) for identifier, node in page_nodes[page_url] if kind in types(node) and (wanted_id is None or identifier == wanted_id)]
        if len(matches) != 1:
            detail = f" for {wanted_id}" if wanted_id else ""
            fail(page_url, f"expected one {kind} definition with @id{detail}, found {len(matches)}")
            return None
        return matches[0]

    def links(page_url, node, key):
        value = node.get(key, [])
        values = value if isinstance(value, list) else [value]
        return {urljoin(page_url, item["@id"]) for item in values if isinstance(item, dict) and isinstance(item.get("@id"), str)}

    organization, website = (find(home, kind) for kind in ("Organization", "WebSite"))
    if website and (not isinstance(website[1].get("name"), str) or not website[1]["name"].strip()):
        fail("index.html", "WebSite.name must be nonempty")
    if home in pages:
        if not robots.can_fetch("Googlebot", home):
            fail("index.html", "robots.txt blocks Googlebot from the homepage")
        png_icons = 0
        for icon in pages[home].icons:
            reference = icon.get("href") or ""
            extension = Path(urlsplit(reference).path).suffix.lower()
            if extension not in {".png", ".ico"}:
                continue
            label = "index.html favicon"
            asset = local_asset(reference, label)
            if asset is None:
                continue
            try:
                if extension == ".ico":
                    check_ico_header(asset)
                else:
                    width, height = png_dimensions(asset)
                    if width != height or width < 49:
                        raise ValueError(f"PNG favicon must be square and larger than 48px; found {width}x{height}")
                    png_icons += 1
            except (OSError, ValueError, struct.error) as exc:
                fail(label, f"{reference}: {exc}")
        if not png_icons:
            fail("index.html", "expected a rel=icon link to a local square PNG larger than 48px")
    if organization:
        logo = organization[1].get("logo")
        reference = (logo.get("contentUrl") or logo.get("url")) if isinstance(logo, dict) else logo
        asset = local_asset(reference, "Organization.logo")
        if asset:
            try:
                if asset.suffix.lower() != ".png":
                    raise ValueError("expected a local PNG logo")
                width, height = png_dimensions(asset)
                if min(width, height) < 112:
                    raise ValueError(f"logo must be at least 112x112px; found {width}x{height}")
                if isinstance(logo, dict):
                    for key, actual in (("width", width), ("height", height)):
                        if key in logo and logo[key] != actual:
                            fail("Organization.logo", f"declared {key} must match the PNG's actual {key} ({actual})")
            except (OSError, ValueError, struct.error) as exc:
                fail("Organization.logo", str(exc))
    profile = find(founder_url, "ProfilePage")
    person = founder = None
    if profile:
        main_ids = links(founder_url, profile[1], "mainEntity")
        if len(main_ids) != 1:
            fail("akshat-agarwal.html", "ProfilePage.mainEntity must identify exactly one Person by @id")
        else:
            main_id = next(iter(main_ids))
            founder = find(founder_url, "Person", main_id)
            person = find(home, "Person", main_id)
    if founder_url not in pages:
        fail("sitemap.xml", "founder profile must be an existing indexed sitemap page")
    if organization and website:
        if organization[0] not in links(home, website[1], "publisher"):
            fail("index.html", "WebSite.publisher must reference the homepage Organization")
    if organization and person:
        if person[0] not in links(home, organization[1], "founder"):
            fail("index.html", "Organization.founder must reference the homepage Person")
        if organization[0] not in links(home, person[1], "worksFor") | links(home, person[1], "affiliation"):
            fail("index.html", "Person.worksFor or affiliation must reference the homepage Organization")
    if profile and founder and founder[0] not in links(founder_url, profile[1], "mainEntity"):
        fail("akshat-agarwal.html", "ProfilePage.mainEntity must reference its Person")
    if person and founder and person[0] != founder[0]:
        fail("akshat-agarwal.html", "founder Person @id must match the homepage Person @id")
    for page_url, item, expected_url in ((home, organization, home), (home, website, home), (founder_url, profile, founder_url), (founder_url, founder, founder_url)):
        if item and item[1].get("url") != expected_url:
            fail(page_url, f"{', '.join(sorted(types(item[1])))}.url must match {expected_url}")
    return errors, len(pages), sum(len(page.jsonld) for page in pages.values())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1], help="site directory containing sitemap.xml")
    args = parser.parse_args()
    errors, page_count, graph_count = validate(args.root.resolve())
    if errors:
        print("SEO checks failed:\n" + "\n".join("- " + error for error in errors))
        return 1
    print(f"SEO checks passed: {page_count} indexed pages, {graph_count} JSON-LD blocks; metadata and identity links are consistent.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
