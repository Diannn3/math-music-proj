#!/usr/bin/env python3
"""Generate BIFURCATE release artwork using only Python's standard library.

The raster field is computed directly from the logistic map. No random numbers,
stock imagery, or image-generation model is used.
"""

from __future__ import annotations

import binascii
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

BG = (15, 17, 21)
POINT = (136, 151, 177)
COOL = (156, 184, 255)
WARM = (255, 145, 124)


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", binascii.crc32(kind + data) & 0xFFFFFFFF)
    )


def encode_rgb_png(width: int, height: int, pixels: bytearray) -> bytes:
    raw = bytearray()
    row_bytes = width * 3
    for y in range(height):
        raw.append(0)
        start = y * row_bytes
        raw.extend(pixels[start : start + row_bytes])

    return (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(
            b"IHDR",
            struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0),
        )
        + png_chunk(b"IDAT", zlib.compress(bytes(raw), level=9))
        + png_chunk(b"IEND", b"")
    )


def blend(pixels: bytearray, width: int, height: int, x: int, y: int, rgb: tuple[int, int, int], alpha: float) -> None:
    if x < 0 or y < 0 or x >= width or y >= height:
        return

    offset = (y * width + x) * 3
    for channel in range(3):
        current = pixels[offset + channel]
        target = rgb[channel]
        pixels[offset + channel] = max(
            0,
            min(255, round(current * (1.0 - alpha) + target * alpha)),
        )


def logistic_field(
    width: int,
    height: int,
    r_samples: int,
    burn_in: int,
    retain: int,
    margin_x: int,
    margin_top: int,
    margin_bottom: int,
) -> bytearray:
    pixels = bytearray(BG * (width * height))
    r_min = 2.7
    r_max = 4.0

    plot_left = margin_x
    plot_right = width - margin_x - 1
    plot_top = margin_top
    plot_bottom = height - margin_bottom - 1

    for sample in range(r_samples):
        r = r_min + (r_max - r_min) * sample / (r_samples - 1)
        x = 0.2

        for _ in range(burn_in):
            x = r * x * (1.0 - x)

        px = round(plot_left + (r - r_min) / (r_max - r_min) * (plot_right - plot_left))

        for _ in range(retain):
            x = r * x * (1.0 - x)
            py = round(plot_bottom - x * (plot_bottom - plot_top))
            blend(pixels, width, height, px, py, POINT, 0.48)

    chapter_r = (2.8, 3.2, 3.5, 3.55, 3.568, 3.5698, 3.72, 3.83, 3.9, 4.0)
    for r in chapter_r:
        px = round(plot_left + (r - r_min) / (r_max - r_min) * (plot_right - plot_left))
        color = COOL if abs(r - 3.83) < 1e-9 else WARM if r >= 3.72 else POINT
        for py in range(plot_top, plot_bottom + 1):
            if py % 3 == 0:
                blend(pixels, width, height, px, py, color, 0.20)

    return pixels


def write_png(name: str, width: int, height: int, r_samples: int, retain: int) -> None:
    pixels = logistic_field(
        width=width,
        height=height,
        r_samples=r_samples,
        burn_in=900,
        retain=retain,
        margin_x=max(28, width // 24),
        margin_top=max(34, height // 8),
        margin_bottom=max(30, height // 11),
    )
    path = PUBLIC / name
    path.write_bytes(encode_rgb_png(width, height, pixels))
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")


def write_favicon() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="#0f1115"/>
<path d="M10 13v38M10 32h13M23 32c9 0 11-16 20-16M23 32c9 0 11 16 20 16M43 16c5 0 7-7 11-7M43 16c5 0 7 7 11 7M43 48c5 0 7-7 11-7M43 48c5 0 7 7 11 7" fill="none" stroke="#9cb8ff" stroke-width="2.4" stroke-linecap="round"/>
</svg>
"""
    (PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")


def write_manifest() -> None:
    manifest = """{
  "name": "BIFURCATE — Hearing the Logistic Map",
  "short_name": "BIFURCATE",
  "description": "A deterministic audiovisual composition built from the logistic map.",
  "display": "standalone",
  "background_color": "#0f1115",
  "theme_color": "#0f1115",
  "start_url": "/",
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
"""
    (PUBLIC / "site.webmanifest").write_text(manifest, encoding="utf-8")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    write_png("bifurcate-social.png", 1200, 630, 3000, 40)
    write_png("bifurcate-poster.png", 1600, 1200, 3600, 56)
    write_favicon()
    write_manifest()


if __name__ == "__main__":
    main()
