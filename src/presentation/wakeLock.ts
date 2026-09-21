export type ScreenWakeLockSentinel = {
  release: () => Promise<void>;
  addEventListener?: (type: 'release', listener: () => void) => void;
};

export type WakeLockNavigator = {
  wakeLock?: {
    request: (type: 'screen') => Promise<ScreenWakeLockSentinel>;
  };
};

export async function requestScreenWakeLock(
  source: WakeLockNavigator,
): Promise<ScreenWakeLockSentinel | null> {
  if (!source.wakeLock) return null;

  try {
    return await source.wakeLock.request('screen');
  } catch {
    // Wake Lock is an enhancement only. Browsers may reject it because of
    // visibility, permissions, battery policy, or unsupported environments.
    return null;
  }
}

export async function releaseScreenWakeLock(
  sentinel: ScreenWakeLockSentinel | null,
): Promise<void> {
  if (!sentinel) return;

  try {
    await sentinel.release();
  } catch {
    // Releasing an already-released sentinel should not affect playback.
  }
}
