import { generateParameterPortrait, type ParameterPortrait } from '../composition';

type ExploreRequest = {
  type: 'portrait';
  requestId: number;
  r: number;
  x0: number;
  bars: number;
};

type ExploreSuccess = {
  type: 'portrait';
  requestId: number;
  portrait: ParameterPortrait;
};

type ExploreFailure = {
  type: 'error';
  requestId: number;
  message: string;
};

type WorkerContext = {
  onmessage: ((message: MessageEvent<ExploreRequest>) => void) | null;
  postMessage: (message: ExploreSuccess | ExploreFailure) => void;
};

const ctx = self as unknown as WorkerContext;

ctx.onmessage = (message) => {
  const request = message.data;
  if (request.type !== 'portrait') return;

  try {
    const portrait = generateParameterPortrait(request.r, request.x0, request.bars);
    ctx.postMessage({
      type: 'portrait',
      requestId: request.requestId,
      portrait,
    });
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
