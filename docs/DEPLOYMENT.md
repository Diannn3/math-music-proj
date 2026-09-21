# Deployment Contract

BIFURCATE is a static Astro application. No backend, database, or serverless runtime is required for the current release.

## Build

```text
Node.js 22
npm ci
npm run build
output: dist/
```

The dependency graph is locked by `package-lock.json`.

## Canonical URL

The page reads `PUBLIC_SITE_URL` at build time.

When it is present:

- `rel=canonical` is emitted
- `og:url` is emitted
- social image metadata becomes absolute

When it is absent, the application deliberately omits canonical/OG URL metadata rather than inventing a deployment hostname.

## Deployment requirements

A release host must preserve:

- HTTPS
- static Web Worker/module assets
- WebGL/Web Audio browser APIs
- downloadable Blob URLs generated client-side
- long-lived caching only for hashed `/_astro/` assets
- shorter caching for named poster/social assets

## Security headers

The Vercel configuration currently sets:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

A strict Content Security Policy is intentionally **not** being guessed into the release. It should only be added after deriving the actual production asset/worker/audio requirements and testing it through the full browser matrix.

## Post-deploy verification

A release candidate is not complete until an external HTTPS deployment passes:

1. HTTP 200 for `/`
2. social PNG / poster / manifest / favicon retrieval
3. no-JS fallback
4. WebGL field or explicit fallback
5. Web Audio unlock
6. RAW ↔ MUSICALIZED switch
7. period-3 chapter navigation
8. Explore Mode
9. JSON/MIDI downloads
10. static security/cache headers

The deployment URL must then be tested from a separate browser/device when possible.


## Current external-host status

The application build and deployment artifact are verified. External hosting is currently an **account/provider configuration step**, not an application defect.

Observed provider behavior during the release-candidate pass:

### Vercel

Two direct-file preview deployments were accepted by the connector and returned HTTP 200, but the served response body was empty. Because an independent GitHub runner could not find the BIFURCATE markup, these deployments are **not** considered valid release candidates.

Do not treat an HTTP 200 alone as deployment success. The manual external workflow requires non-empty BIFURCATE HTML plus real browser interaction.

### GitHub Pages

The Pages workflow successfully passed:

- locked install
- independent Python mathematical verification
- deterministic artwork verification
- unit tests
- Astro diagnostics
- production build

Publication stopped only at repository Pages configuration. The GitHub integration does not have permission to create/enable the Pages site.

To use GitHub Pages:

1. Open repository **Settings → Pages**.
2. Enable Pages and select **GitHub Actions** as the source.
3. Run **Deploy release candidate to GitHub Pages** manually.
4. Run **Verify external release candidate** with the resulting HTTPS URL.

### Netlify

A Netlify project named `bifurcate-logistic-map` was created successfully. The connected Netlify deployment operation requires an authenticated CLI handoff for uploading the site bytes. The connector can prepare that command but does not itself execute the local CLI upload.

The project/site ID is intentionally not required by application code.

## Manual external verification

The workflow:

```text
Verify external release candidate
```

is manual by design.

It requires one input:

```text
release_url = https://...
```

The workflow rejects non-HTTPS hosts and verifies:

1. non-empty BIFURCATE HTML
2. security headers
3. static release assets
4. WebGL field or explicit fallback
5. Web Audio unlock
6. RAW mode
7. period-3 chapter navigation
8. Explore Mode
9. provenance JSON download
10. MIDI download
11. JavaScript-disabled fallback

Normal CI never depends on an external host.
