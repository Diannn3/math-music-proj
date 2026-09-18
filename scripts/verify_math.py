#!/usr/bin/env python3
"""Independent numerical verifier for BIFURCATE's canonical logistic-map references.

This script intentionally does not import the TypeScript implementation, generated
JSON provenance, or any application bundle. It recomputes the canonical references
with Python's binary64 float and compares them to the frozen fixture.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Iterable, Optional

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "fixtures" / "canonical-math-reference.json"


def logistic_step(x: float, r: float) -> float:
    return r * x * (1.0 - x)


def generate_orbit(r: float, x0: float, burn_in: int, count: int) -> list[float]:
    x = x0
    for _ in range(burn_in):
        x = logistic_step(x, r)

    values: list[float] = []
    for _ in range(count):
        x = logistic_step(x, r)
        values.append(x)
    return values


def estimate_lyapunov(values: Iterable[float], r: float) -> float:
    samples = list(values)
    if not samples:
        raise ValueError("Lyapunov estimate requires at least one sample")

    terms: list[float] = []
    for x in samples:
        derivative = abs(r * (1.0 - 2.0 * x))
        if derivative == 0.0:
            return float("-inf")
        terms.append(math.log(derivative))
    return math.fsum(terms) / len(terms)


def detect_period(
    values: list[float],
    max_period: int,
    tolerance: float,
    repetitions: int,
) -> Optional[int]:
    largest = min(max_period, len(values) // repetitions)
    for period in range(1, largest + 1):
        start = len(values) - period * repetitions
        comparison_start = start + period
        if all(
            abs(values[index] - values[index - period]) <= tolerance
            for index in range(comparison_start, len(values))
        ):
            return period
    return None


def assert_close(actual: float, expected: float, tolerance: float, label: str) -> None:
    if not math.isclose(actual, expected, rel_tol=0.0, abs_tol=tolerance):
        raise AssertionError(
            f"{label}: expected {expected:.17g}, got {actual:.17g}; "
            f"|delta|={abs(actual - expected):.3e}"
        )


def main() -> None:
    reference = json.loads(FIXTURE.read_text(encoding="utf-8"))

    assert reference["schema"] == "bifurcate.math-reference.v1"
    assert reference["generator"] == "independent-python-binary64"

    x0 = float(reference["x0"])
    burn_in = int(reference["burnIn"])
    count = int(reference["classificationCount"])
    period_config = reference["period"]

    print(
        f"BIFURCATE independent verifier: x0={x0}, burn-in={burn_in}, "
        f"classification samples={count}"
    )

    for segment in reference["segments"]:
        r = float(segment["r"])
        orbit = generate_orbit(r, x0, burn_in, count)
        detected = detect_period(
            orbit,
            int(period_config["maxPeriod"]),
            float(period_config["tolerance"]),
            int(period_config["repetitions"]),
        )
        lam = estimate_lyapunov(orbit, r)

        if detected != segment["detectedPeriod"]:
            raise AssertionError(
                f"{segment['id']}: period expected {segment['detectedPeriod']}, got {detected}"
            )

        # fsum may differ by a few ULP from a sequential JS/Python sum, so the
        # fixture-level Lyapunov tolerance is deliberately numerical, not exact-bit.
        assert_close(lam, float(segment["lambda"]), 5e-13, f"{segment['id']} lambda")

        for index, expected in enumerate(segment["orbitHead"]):
            assert_close(
                orbit[index],
                float(expected),
                2e-15,
                f"{segment['id']} orbitHead[{index}]",
            )

        for index, expected in enumerate(segment["scoreHead"]):
            assert_close(
                orbit[index + 1],
                float(expected),
                2e-15,
                f"{segment['id']} scoreHead[{index}]",
            )

        regime = "periodic" if detected is not None and lam < 1e-3 else "chaotic" if lam > 1e-3 else "transition-or-unresolved"
        if regime != segment["expectedRegime"]:
            raise AssertionError(
                f"{segment['id']}: regime expected {segment['expectedRegime']}, got {regime}"
            )

        print(
            f"  {segment['id']:<13} r={r:<7g} "
            f"period={str(detected):<4} lambda={lam:+.12f} {regime}"
        )

    fixed_point = 1.0 - 1.0 / 2.8
    assert_close(
        reference["segments"][0]["orbitHead"][0],
        fixed_point,
        2e-15,
        "r=2.8 analytical fixed point",
    )

    r4 = next(segment for segment in reference["segments"] if segment["id"] == "limit")
    if abs(float(r4["lambda"]) - math.log(2.0)) > 0.01:
        raise AssertionError(
            "r=4 finite Lyapunov estimate is unexpectedly far from ln(2)"
        )

    print("PASS: independent Python references match the frozen canonical fixture.")


if __name__ == "__main__":
    main()
