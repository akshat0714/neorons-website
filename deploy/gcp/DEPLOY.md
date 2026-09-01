# Hosting the Neorons website on Google Cloud — developer handoff

**Site type:** pure static site. No build step, no server-side code, no database,
no environment variables. Serving the repository root as-is is a complete
deployment.

- **Source of truth:** https://github.com/akshat0714/neorons-website (public), branch `main`
- **Currently live at:** https://neorons.vercel.app (keep it running until GCP serves the domain, then cut over)
- **Target domain:** neorons.com (+ www redirect). DNS note: neorons.com's A record
  already points to 34.42.116.47 (a GCP address). If you deploy on that same
  frontend, **no DNS change is needed** — only a certificate for the hostname.

## What the site needs from any host (the whole contract)

1. Serve the repo root as static files; `index.html` is the homepage.
2. Serve `404.html` for unknown paths (with a 404 status).
3. HTTPS for `neorons.com` and `www.neorons.com` (redirect www → apex, and HTTP → HTTPS).
4. Response headers — see `nginx.conf` in this folder for the exact set. Two are load-bearing:
   - `Content-Security-Policy` **must include `https://*.basemaps.cartocdn.com` in `img-src`**,
     or the interactive map renders blank (markers with no tiles). This is the
     one we've been bitten by already.
   - Long-cache `/fonts/`, `/images/`, `/vendor/` (immutable assets); short/no-cache
     for `*.html` and `/js/` `/css/` so content edits appear promptly.
5. Correct MIME for `.woff2` (`font/woff2`) — nginx handles this out of the box.
6. **Auto-deploy:** the owners edit via GitHub; today every push to `main` goes
   live in seconds. Please preserve that property (options per architecture below).
   If you skip this, tell the owners clearly that updates become a manual step.

`vercel.json`, `_headers`, and `_redirects` in the repo root are config for other
hosts — ignore them on GCP (but `vercel.json`'s header list is the reference for
point 4).

## Option A — existing nginx/apache VM (recommended if you already run one at 34.42.116.47)

Fastest path, zero DNS work:

1. `git clone https://github.com/akshat0714/neorons-website /var/www/neorons`
2. Drop in the provided `nginx.conf` server block (adjust `root` path), `nginx -t && systemctl reload nginx`
3. Certificate: `certbot --nginx -d neorons.com -d www.neorons.com`
4. Auto-deploy, simplest robust version — a puller cron:
   ```
   */2 * * * * cd /var/www/neorons && git fetch --quiet origin main && git reset --quiet --hard origin/main
   ```
   (Two-minute latency, no webhooks to secure. A push-triggered webhook is nicer
   if you prefer; nothing in the site requires it.)

## Option B — Cloud Run (managed, scales to zero)

Uses the provided `Dockerfile` (nginx-alpine serving the repo with the same headers).

```bash
gcloud run deploy neorons-website \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
gcloud beta run domain-mappings create --service neorons-website --domain neorons.com --region asia-south1
```

- Domain mapping requires DNS changes at the registrar (unlike Option A), and
  Cloud Run domain mappings hand out new records — coordinate with whoever holds
  the GoDaddy account.
- Auto-deploy: connect the GitHub repo in a Cloud Build trigger with the provided
  `cloudbuild.yaml` (build on push to `main`, deploy to the same service).

## Option C — Cloud Storage bucket + HTTPS Load Balancer + Cloud CDN

The classic GCP static pattern. Works fine, but note:

- Buckets can't send custom headers; attach the security headers (incl. the CSP
  from `nginx.conf`) via a **custom response-header policy on the load balancer's
  backend bucket**, or accept losing them (the map's CSP requirement then
  disappears too, since no CSP is sent at all — acceptable, just less hardened).
- 404: set `errorPage` to `404.html` in the bucket website config.
- Auto-deploy: Cloud Build trigger on `main` running
  `gsutil -m rsync -r -d -x "\.git|deploy" . gs://YOUR_BUCKET`.
- Managed certificate on the LB for neorons.com + www.

## Cutover checklist (whoever flips it)

1. GCP serving and reachable (test via the LB IP / Cloud Run URL / VM with
   `curl -H "Host: neorons.com" https://<ip> -k`).
2. Certificate valid for neorons.com and www.
3. Confirm the map renders (tiles load) and the contact form opens a mail draft.
4. If DNS changed at all: lower TTL first, then switch, then verify globally.
5. Tell the site owners it's live at neorons.com — the site's internal canonical/
   og/sitemap URLs still say `neorons.vercel.app` and will be updated in one
   commit after cutover is confirmed.
6. Only after neorons.com is verified: the Vercel project can be paused or kept
   as staging (owners' call). Do not take Vercel down before cutover — it is the
   only live copy today.

## Contact

Site owners: Akshat Agarwal (neoronsai@gmail.com), co-founders Avinash Amanchi
and Abhinav Gangadari. Repo access: public; PRs/pushes to `main` deploy the site.
