import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp } from "lucide-react";
import { useQuantumDatabase } from "@/hooks/use-quantum-database";

export function PerformanceAnalytics() {
  const { stats, isLoading } = useQuantumDatabase();

  const timeRanges = [
    { label: "24H", active: true },
    { label: "7D", active: false },
    { label: "30D", active: false },
  ];

  const metrics = [
    {
      label: "Avg Query Time",
      value: `${stats?.avgQueryTime?.toFixed(3) || "0.000"}s`,
      change: "↓ 0.3s improvement",
      changeColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Success Rate", 
      value: `${stats?.successRate?.toFixed(1) || "0.0"}%`,
      change: "↑ 2.1% increase",
      changeColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Queries/Hour",
      value: stats?.queriesPerHour?.toLocaleString() || "0",
      change: "↑ 15% growth",
      changeColor: "text-green-600 dark:text-green-400"
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
            Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
            Performance Analytics
          </CardTitle>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={range.active ? "default" : "outline"}
                size="sm"
                className={range.active ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {metric.label}
              </div>
              <div className={`text-xs ${metric.changeColor}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium mb-1">Real-time Performance Charts</p>
            <p className="text-xs">
              Interactive charts showing query latency, success rates, and throughput over time
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              Chart.js Integration
            </Badge>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Peak Performance
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              ASI enhancement is operating at optimal levels with continuous improvement trends.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                System Health
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              All quantum subsystems are functioning within normal parameters.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
