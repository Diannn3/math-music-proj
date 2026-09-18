/**
 * Release budgets are CI guardrails, not universal guarantees for every device.
 * They are intentionally generous enough for shared GitHub runners while still
 * catching large regressions such as main-thread orbit generation or accidental
 * multi-million-point rendering.
 */
export const RELEASE_PERFORMANCE_BUDGETS = {
  desktop: {
    headingVisibleMs: 3500,
    orbitFieldReadyMs: 12000,
    instrumentSwitchMs: 750,
    explorePortraitMs: 1200,
  },
  mobile: {
    headingVisibleMs: 4000,
    orbitFieldReadyMs: 10000,
    instrumentSwitchMs: 900,
  },
} as const;

export type ReleasePerformanceBudgets = typeof RELEASE_PERFORMANCE_BUDGETS;
