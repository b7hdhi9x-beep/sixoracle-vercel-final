import { useState, useEffect, useCallback } from "react";

interface ResetInfo {
  dailyResetsAt: string;
  timeUntilDailyReset: string;
  millisecondsUntilDailyReset: number;
  currentDateJST?: string;
}

interface UseResetCountdownOptions {
  /** Initial reset info from API */
  initialResetInfo?: ResetInfo | null;
  /** Update interval in milliseconds (default: 60000 = 1 minute) */
  updateInterval?: number;
  /** Callback when countdown reaches zero */
  onReset?: () => void;
}

interface UseResetCountdownReturn {
  /** Formatted time string like "5時間23分" */
  timeUntilReset: string;
  /** Milliseconds until reset */
  millisecondsUntilReset: number;
  /** Whether the countdown is active */
  isActive: boolean;
  /** Force refresh the countdown from server time */
  refresh: (resetInfo: ResetInfo) => void;
}

/**
 * Hook for displaying countdown to next daily reset (midnight JST)
 * 
 * Usage:
 * ```tsx
 * const { data } = trpc.subscription.getStatus.useQuery();
 * const { timeUntilReset } = useResetCountdown({
 *   initialResetInfo: data?.resetInfo,
 *   onReset: () => refetch(),
 * });
 * 
 * return <span>次回リセットまで: {timeUntilReset}</span>;
 * ```
 */
export function useResetCountdown({
  initialResetInfo,
  updateInterval = 60000, // 1 minute
  onReset,
}: UseResetCountdownOptions = {}): UseResetCountdownReturn {
  const [millisecondsUntilReset, setMillisecondsUntilReset] = useState<number>(
    initialResetInfo?.millisecondsUntilDailyReset ?? 0
  );
  const [targetTime, setTargetTime] = useState<number | null>(
    initialResetInfo?.dailyResetsAt 
      ? new Date(initialResetInfo.dailyResetsAt).getTime() 
      : null
  );

  // Update from server data
  const refresh = useCallback((resetInfo: ResetInfo) => {
    const newTargetTime = new Date(resetInfo.dailyResetsAt).getTime();
    setTargetTime(newTargetTime);
    setMillisecondsUntilReset(Math.max(0, newTargetTime - Date.now()));
  }, []);

  // Initialize from props
  useEffect(() => {
    if (initialResetInfo) {
      refresh(initialResetInfo);
    }
  }, [initialResetInfo, refresh]);

  // Countdown timer
  useEffect(() => {
    if (!targetTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, targetTime - now);
      setMillisecondsUntilReset(remaining);

      if (remaining === 0 && onReset) {
        onReset();
      }
    };

    // Initial update
    updateCountdown();

    // Set up interval
    const intervalId = setInterval(updateCountdown, updateInterval);

    return () => clearInterval(intervalId);
  }, [targetTime, updateInterval, onReset]);

  // Format time string
  const formatTime = (ms: number): string => {
    if (ms <= 0) return "0分";

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  return {
    timeUntilReset: formatTime(millisecondsUntilReset),
    millisecondsUntilReset,
    isActive: targetTime !== null && millisecondsUntilReset > 0,
    refresh,
  };
}

/**
 * Format reset time for display
 * Can be used without the hook for simple static display
 */
export function formatResetTime(resetInfo: ResetInfo | null | undefined): string {
  if (!resetInfo) return "";
  return resetInfo.timeUntilDailyReset;
}
