import { useQuery } from "@tanstack/react-query";
import type { DatabaseStats, ActivityItem, LearningProgress } from "@shared/schema";

export function useQuantumDatabase() {
  const statsQuery = useQuery<DatabaseStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activityQuery = useQuery<ActivityItem[]>({
    queryKey: ["/api/dashboard/activity"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const learningQuery = useQuery<LearningProgress>({
    queryKey: ["/api/dashboard/learning-progress"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    // Stats data
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,

    // Activity data
    activity: activityQuery.data,
    activityLoading: activityQuery.isLoading,
    
    // Learning progress data
    learningProgress: learningQuery.data,
    learningLoading: learningQuery.isLoading,

    // Refetch functions
    refetchStats: statsQuery.refetch,
    refetchActivity: activityQuery.refetch,
    refetchLearning: learningQuery.refetch,

    // Combined loading state
    isAnyLoading: statsQuery.isLoading || activityQuery.isLoading || learningQuery.isLoading,
  };
}
