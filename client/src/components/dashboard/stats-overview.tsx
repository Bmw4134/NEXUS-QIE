import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Atom, Brain, CheckCircle, Network, TrendingUp } from "lucide-react";
import { useQuantumDatabase } from "@/hooks/use-quantum-database";

export function StatsOverview() {
  const { stats, isLoading } = useQuantumDatabase();

  const statCards = [
    {
      title: "Quantum Nodes",
      value: stats?.quantumNodes?.toLocaleString() || "0",
      change: "+12.5% from last hour",
      icon: Atom,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "ASI Enhancement",
      value: `${stats?.asiFactor?.toFixed(3) || "1.000"}x`,
      change: "Continuously learning",
      icon: Brain,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Query Success",
      value: `${stats?.successRate?.toFixed(1) || "0.0"}%`,
      change: "+2.1% improvement",
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Connections",
      value: stats?.connections?.toLocaleString() || "0",
      change: "Neural mesh expanding",
      icon: Network,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50 dark:bg-cyan-900/20"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="quantum-node">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="quantum-node bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
                <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
