# Search visibility · November 15, 2026

## Implemented

- Dedicated `akshat-agarwal.html` profile with his name, existing portrait, role, substantive biography, and links to SB 1318 and the five federal proposals.
- Natural profile links from Home, About, Media, Organisation profile and Impact.
- Descriptive Home, About and Impact titles/descriptions; visible advocacy copy matches the qualified metadata.
- Linked JSON-LD `WebSite`, `Organization`, `Person` and page entities on four pages. The founder page is a `ProfilePage` with Akshat as its `mainEntity`. The other cofounders retain separate identities. No unverified social profiles, official legislative authorship, ratings or fictitious search action are included.
- Canonical HTTPS URLs, an updated sitemap containing 13 indexable pages, and genuine modification dates for changed content.
- Dedicated 512px vector organisation logo using the existing Neorons symbol.
- `scripts/check-seo.py` validates sitemap metadata, canonical URLs and identity markup. `scripts/check-site.py` validates local assets and links.

## Google setup and scope

The existing DNS record automatically verified `https://neorons.com/` in Google Search Console for `admin@neorons.com`. No DNS or account permissions were changed manually. Submit the sitemap and request indexing for Home, the founder profile and Impact after the release is publicly accessible; record the actual results in the workspace release manifest.

The HTTP apex previously returned 200. A separately backed-up nginx configuration change redirects apex HTTP and www HTTP directly to HTTPS apex, preserving the path and query string. The API subdomain and HTTPS application configuration are outside this change.

Search Console requests are discovery signals. Google decides whether, when and where a page appears. No ranking, first position or universal appearance is guaranteed. Do not use purchased links, doorway pages, hidden keywords, invented endorsements or repeated submission loops.

## Sources

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: Organisation structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google: ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google: permanent redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: building and submitting a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: requesting recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)

Legislative attribution and primary sources are recorded in `advocacy-sources.md`. Official records verify enacted/introduced status; Neorons supplies the account of Akshat’s drafting contribution.

## November 16, 2026 · logo and public identity

Google Search Console now reports the submitted sitemap as Success, with all 13 pages discovered. The earlier fetch status resolved without changing the valid XML.

The previous favicon declaration was SVG only. Google’s current [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search) lists supported raster formats. Every regular page now declares a stable 96×96 PNG icon, a root ICO fallback, and a 180×180 Apple touch icon. The manifest supplies 192×192 and 512×512 PNG icons. The original neuron geometry is preserved, with the site’s green and ivory palette for contrast. `scripts/build-brand-icons.py` reproducibly renders all variants; `--check` verifies exact output. The release packager now includes root `favicon.ico`.

The existing WebSite entity retains Neorons as its preferred name with Neorons Inc. as an alternate. Organization.logo points to the matching 512×512 PNG. Existing identity entities are updated rather than duplicated; the founder has one independently matched KidsRights sameAs URL. PNG/ICO dimensions, structure, local crawlability and logo declarations are covered by the SEO validator.

This configures eligible assets and clear identity signals. Google chooses favicon, site-name and knowledge-panel display; no new panel, logo display time or ranking is guaranteed. Request recrawling after deployment and record actual responses in the workspace release manifest.
