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
