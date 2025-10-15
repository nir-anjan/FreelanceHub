import { useState, useEffect, useCallback, useRef } from "react";
import adminService, { AdminStats } from "@/services/adminService";

export interface UseAdminStatsOptions {
  refreshInterval?: number; // in milliseconds, default 5 minutes
  enableAutoRefresh?: boolean; // default true
  enabled?: boolean; // default true, allows disabling the hook entirely
}

export interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminStats = (
  options: UseAdminStatsOptions = {}
): UseAdminStatsReturn => {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    enableAutoRefresh = true,
    enabled = true,
  } = options;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      const response = await adminService.getOverview();

      if (response.success) {
        setStats(response.data.stats);
      } else {
        setError("Failed to fetch admin statistics");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch admin statistics"
      );
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchStats(true);
    }
  }, [fetchStats, enabled]);

  // Auto refresh setup
  useEffect(() => {
    if (enabled && enableAutoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStats(false);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [fetchStats, enabled, enableAutoRefresh, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refetch = useCallback(() => fetchStats(false), [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
};
