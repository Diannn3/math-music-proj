export type LogisticConfig = {
  r: number;
  x0: number;
  burnIn?: number;
  count: number;
};

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

export function validateLogisticInputs(r: number, x: number): void {
  assertFinite('r', r);
  assertFinite('x', x);

  if (r < 0 || r > 4) {
    throw new RangeError('r must lie in [0, 4] for the canonical logistic-map implementation.');
  }

  if (x < 0 || x > 1) {
    throw new RangeError('x must lie in [0, 1].');
  }
}

export function logisticStep(x: number, r: number): number {
  validateLogisticInputs(r, x);
  const next = r * x * (1 - x);

  if (next < -Number.EPSILON || next > 1 + Number.EPSILON) {
    throw new RangeError(`logistic step escaped [0, 1]: ${next}`);
  }

  return Math.min(1, Math.max(0, next));
}

export function generateOrbit({
  r,
  x0,
  burnIn = 0,
  count,
}: LogisticConfig): Float64Array {
  validateLogisticInputs(r, x0);

  if (!Number.isInteger(burnIn) || burnIn < 0) {
    throw new RangeError('burnIn must be a non-negative integer.');
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('count must be a positive integer.');
  }

  let x = x0;

  for (let i = 0; i < burnIn; i += 1) {
    x = logisticStep(x, r);
  }

  const orbit = new Float64Array(count);
  for (let i = 0; i < count; i += 1) {
    x = logisticStep(x, r);
    orbit[i] = x;
  }

  return orbit;
}

export function logisticDerivative(x: number, r: number): number {
  validateLogisticInputs(r, x);
  return r * (1 - 2 * x);
}
