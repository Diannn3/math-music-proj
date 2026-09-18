#!/usr/bin/env python3
"""Generate the deterministic BIFURCATE submission/release manifest."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "bifurcate-release-manifest.json"

INPUTS = [
    "package-lock.json",
    "fixtures/canonical-math-reference.json",
    "src/math/logistic.ts",
    "src/math/lyapunov.ts",
    "src/math/period.ts",
    "src/math/classify.ts",
    "src/composition/chapters.ts",
    "src/composition/generateScore.ts",
    "src/composition/mapping.ts",
    "src/audio/RawAudioEngine.ts",
    "src/audio/MusicalAudioEngine.ts",
    "src/audio/releaseAudio.ts",
    "src/export/provenance.ts",
    "src/visual/visualScore.ts",
    "src/presentation/cues.ts",
]

ASSETS = [
    "public/bifurcate-social.png",
    "public/bifurcate-poster.png",
    "public/favicon.svg",
    "public/site.webmanifest",
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def hashed(paths: list[str]) -> dict[str, str]:
    return {path: sha256(ROOT / path) for path in paths}


def main() -> None:
    math_reference = json.loads(
        (ROOT / "fixtures" / "canonical-math-reference.json").read_text(encoding="utf-8")
    )

    document = {
        "schema": "bifurcate.release-manifest.v1",
        "project": "BIFURCATE — Hearing the Logistic Map",
        "hashAlgorithm": "sha256",
        "canonicalScore": {
            "scoreVersion": "0.1.0",
            "mappingVersion": "1.0.0",
            "equation": "x[n+1] = r*x[n]*(1-x[n])",
            "x0": math_reference["x0"],
            "burnIn": math_reference["burnIn"],
            "tempoBpm": 96,
            "meter": "4/4",
            "bars": 92,
            "durationSeconds": 230,
            "primaryEventCount": 736,
        },
        "canonicalSegments": [
            {
                "id": segment["id"],
                "r": segment["r"],
                "detectedPeriod": segment["detectedPeriod"],
                "expectedRegime": segment["expectedRegime"],
            }
            for segment in math_reference["segments"]
        ],
        "sourceInputs": hashed(INPUTS),
        "releaseAssets": hashed(ASSETS),
        "presentation": {
            "centerpiece": "period-3 window near r=3.83",
            "presenterMode": "?presenter=1 or D",
            "offlinePoster": "public/bifurcate-poster.png",
            "socialImage": "public/bifurcate-social.png",
        },
        "integrity": [
            "The manifest hashes source inputs and release assets; it does not claim a deployed host is valid.",
            "RAW and MUSICALIZED modes use the same canonical mathematical event stream.",
            "Independent Python mathematical references remain the numerical cross-check.",
            "External hosting must pass the separate external-release workflow before being called verified.",
        ],
    }

    OUTPUT.write_text(
        json.dumps(document, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
