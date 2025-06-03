import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Atom } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LearningProgress as LearningProgressType } from "@shared/schema";

export function LearningProgress() {
  const { data: progress, isLoading } = useQuery<LearningProgressType>({
    queryKey: ["/api/dashboard/learning-progress"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
            ASI Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressItems = [
    {
      label: "Knowledge Absorption",
      value: progress?.knowledgeAbsorption || 0,
      color: "from-blue-500 to-purple-500"
    },
    {
      label: "Pattern Recognition", 
      value: progress?.patternRecognition || 0,
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Quantum Coherence",
      value: progress?.quantumCoherence || 0,
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
          ASI Learning Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {progressItems.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {item.value.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${item.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(item.value, 100)}%` }}
              />
            </div>
          </div>
        ))}

        {/* Next Learning Cycle */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-800 dark:text-white">
                Next Learning Cycle
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {progress?.nextCycle || "Optimizing quantum connections"}
              </div>
            </div>
            <div className="w-8 h-8 quantum-gradient rounded-full animate-spin-slow flex items-center justify-center">
              <Atom className="text-white h-4 w-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
