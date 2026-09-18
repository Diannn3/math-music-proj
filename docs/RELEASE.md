# Release Shell and Public Metadata

## Public origin

Astro is configured with:

```text
PUBLIC_SITE_URL
```

and falls back to:

```text
https://bifurcate-math-music.vercel.app
```

Production deployment should set the environment variable explicitly even when it matches the fallback.

## Metadata contract

The root page publishes:

- canonical URL
- description
- theme/color-scheme metadata
- Open Graph title/description/URL/image
- 1200×630 OG dimensions
- Twitter summary-large-image metadata
- CreativeWork JSON-LD
- SVG favicon
- Apple touch icon

CI validates both the DOM metadata and the generated PNG dimensions/signature.

## Deterministic social artwork

Source generator:

```text
scripts/generate_social_art.py
```

Generated assets:

```text
public/og-bifurcate.svg
public/og-bifurcate.png
public/favicon.svg
public/apple-touch-icon.png
```

The point field in the social artwork is generated from actual logistic-map iterations. It is not a stock or invented chaos texture.

When regenerating the binary PNG assets, use a reproducible SVG rasterizer and review the source SVG diff first.

## Pre-hydration / no-JavaScript behavior

The React island uses an Astro fallback slot.

Before the interactive client boots, the page still shows:

- project title
- equation
- short mathematical/artistic thesis
- explicit loading status

With JavaScript disabled, the same fallback remains and a `noscript` notice explains which capabilities require scripting.

A Chromium production-browser test launches a separate context with JavaScript disabled and verifies that this content remains usable.

## Release checklist

Before changing the public origin:

1. update `PUBLIC_SITE_URL` in the deployment provider
2. confirm canonical URL in production HTML
3. confirm `og:image` is absolute and publicly accessible
4. run an external social-card debugger if available
5. check favicon and Apple touch icon on real devices
6. rerun CI visual baselines only if the intended layout changed
