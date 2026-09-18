#!/usr/bin/env python3
"""Generate deterministic social/favicons from logistic-map points."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PUBLIC.mkdir(parents=True, exist_ok=True)


def logistic_points(
    r_min: float,
    r_max: float,
    samples: int,
    burn_in: int,
    retain: int,
    x0: float = 0.2,
) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    for sample in range(samples):
        ratio = sample / (samples - 1)
        r = r_min + ratio * (r_max - r_min)
        x = x0
        for _ in range(burn_in):
            x = r * x * (1.0 - x)
        for _ in range(retain):
            x = r * x * (1.0 - x)
            points.append((r, x))
    return points


def write_og() -> None:
    width, height = 1200, 630
    plot_left, plot_right = 420, 1160
    plot_top, plot_bottom = 64, 558
    r_min, r_max = 2.7, 4.0
    points = logistic_points(r_min, r_max, 360, 900, 7)

    circles: list[str] = []
    for r, x in points:
        px = plot_left + (r - r_min) / (r_max - r_min) * (plot_right - plot_left)
        py = plot_bottom - x * (plot_bottom - plot_top)
        circles.append(
            f'<circle cx="{px:.2f}" cy="{py:.2f}" r="0.72" fill="#aeb7c5" fill-opacity="0.42"/>'
        )

    chapter_rs = [2.8, 3.2, 3.5, 3.568, 3.72, 3.83, 3.9, 4.0]
    markers = []
    for r in chapter_rs:
        px = plot_left + (r - r_min) / (r_max - r_min) * (plot_right - plot_left)
        markers.append(
            f'<line x1="{px:.2f}" y1="{plot_top}" x2="{px:.2f}" y2="{plot_bottom}" '
            'stroke="#9cb8ff" stroke-opacity="0.08" stroke-width="1"/>'
        )

    title = escape("BIFURCATE")
    subtitle = escape("Hearing the Logistic Map")
    equation = escape("x[n+1] = r · x[n] · (1 − x[n])")
    copy = escape("DETERMINISTIC AUDIOVISUAL COMPOSITION / RAW ↔ MUSICALIZED")

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#0f1115"/>
  <radialGradient id="glow" cx="72%" cy="46%" r="48%">
    <stop offset="0" stop-color="#7fa7ff" stop-opacity="0.09"/>
    <stop offset="1" stop-color="#0f1115" stop-opacity="0"/>
  </radialGradient>
  <rect width="{width}" height="{height}" fill="url(#glow)"/>
  <g>{''.join(markers)}</g>
  <g>{''.join(circles)}</g>
  <line x1="{plot_left}" y1="{plot_bottom}" x2="{plot_right}" y2="{plot_bottom}" stroke="#f1efe8" stroke-opacity="0.13"/>
  <text x="58" y="72" fill="#f1efe8" fill-opacity="0.48" font-family="ui-monospace, monospace" font-size="15" letter-spacing="3">{copy}</text>
  <text x="52" y="218" fill="#f1efe8" font-family="Inter, Arial, sans-serif" font-size="86" font-weight="650" letter-spacing="-5">{title}</text>
  <text x="58" y="260" fill="#f1efe8" fill-opacity="0.67" font-family="Inter, Arial, sans-serif" font-size="25">{subtitle}</text>
  <rect x="58" y="320" width="304" height="52" rx="10" fill="#ffffff" fill-opacity="0.025" stroke="#ffffff" stroke-opacity="0.10"/>
  <text x="77" y="353" fill="#c9d5f4" font-family="ui-monospace, monospace" font-size="18">{equation}</text>
  <text x="58" y="536" fill="#f1efe8" fill-opacity="0.38" font-family="ui-monospace, monospace" font-size="15">EQUILIBRIUM → PERIOD DOUBLING → CHAOS → PERIOD-3 WINDOW → RAW</text>
  <text x="{plot_left}" y="590" fill="#f1efe8" fill-opacity="0.35" font-family="ui-monospace, monospace" font-size="13">r = 2.7</text>
  <text x="{plot_right - 48}" y="590" fill="#f1efe8" fill-opacity="0.35" font-family="ui-monospace, monospace" font-size="13">4.0</text>
</svg>
'''
    (PUBLIC / "og-bifurcate.svg").write_text(svg, encoding="utf-8")


def write_favicon() -> None:
    points = logistic_points(3.0, 4.0, 42, 300, 3)
    dots: list[str] = []
    for r, x in points:
        px = 8 + (r - 3.0) * 48
        py = 58 - x * 50
        dots.append(
            f'<circle cx="{px:.2f}" cy="{py:.2f}" r="0.75" fill="#d7e0f7" fill-opacity="0.82"/>'
        )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="13" fill="#0f1115"/>
  <g>{''.join(dots)}</g>
  <circle cx="55" cy="12" r="3" fill="#9cb8ff"/>
</svg>
'''
    (PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")


def main() -> None:
    write_og()
    write_favicon()
    print("Generated public/og-bifurcate.svg and public/favicon.svg")


if __name__ == "__main__":
    main()
