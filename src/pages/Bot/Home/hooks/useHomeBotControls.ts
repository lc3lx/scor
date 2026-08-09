/**
 * Home Start/Pause/Stop never place Binolla orders (Phase 9).
 * Controls are Coming Soon — handlers are no-ops.
 */
export function useHomeBotControls(_homeData: unknown) {
  const noop = async () => {
    /* Coming Soon — no local fake bot run state */
  };

  return {
    handleStart: noop,
    handlePause: noop,
    handleStop: noop,
    handleApply: noop,
    isStartPressed: false,
  };
}
