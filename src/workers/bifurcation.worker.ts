import { BIFURCATION_R_MAX, BIFURCATION_R_MIN, rToNdc, xToNdc } from '../visual/coordinates';

type BuildRequest = {
  type: 'build';
  rSamples: number;
  burnIn: number;
  retain: number;
  x0: number;
};

type ProgressResponse = {
  type: 'progress';
  progress: number;
};

type CompleteResponse = {
  type: 'complete';
  x: Float32Array;
  y: Float32Array;
  pointCount: number;
};

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (message: MessageEvent<BuildRequest>) => {
  if (message.data.type !== 'build') return;

  const { rSamples, burnIn, retain, x0 } = message.data;
  const pointCount = rSamples * retain;
  const xCoords = new Float32Array(pointCount);
  const yCoords = new Float32Array(pointCount);
  let cursor = 0;

  for (let sample = 0; sample < rSamples; sample += 1) {
    const ratio = rSamples === 1 ? 0 : sample / (rSamples - 1);
    const r = BIFURCATION_R_MIN + ratio * (BIFURCATION_R_MAX - BIFURCATION_R_MIN);
    let x = x0;

    for (let i = 0; i < burnIn; i += 1) {
      x = r * x * (1 - x);
    }

    for (let i = 0; i < retain; i += 1) {
      x = r * x * (1 - x);
      xCoords[cursor] = rToNdc(r);
      yCoords[cursor] = xToNdc(x);
      cursor += 1;
    }

    if (sample % 128 === 0) {
      const response: ProgressResponse = { type: 'progress', progress: sample / rSamples };
      ctx.postMessage(response);
    }
  }

  const response: CompleteResponse = { type: 'complete', x: xCoords, y: yCoords, pointCount };
  ctx.postMessage(response, [xCoords.buffer, yCoords.buffer]);
};
