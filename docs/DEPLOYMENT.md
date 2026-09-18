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
