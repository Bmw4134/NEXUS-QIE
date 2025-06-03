import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Network } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    confidence: number;
    asiLevel: number;
    quantumState: string;
    group: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
  stats: {
    totalNodes: number;
    totalEdges: number;
    clusters: number;
  };
}

export function KnowledgeGraph() {
  const { data: graphData, isLoading } = useQuery<GraphData>({
    queryKey: ["/api/quantum/knowledge-graph"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
              Knowledge Graph
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <ExternalLink className="h-4 w-4 mr-1" />
              View Full Graph
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="neural-pattern bg-gray-50 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <Network className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading graph data...</p>
            </div>
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
            Knowledge Graph
          </CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            View Full Graph
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="neural-pattern bg-gray-50 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
          {/* Simulated Graph Visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-8 opacity-60">
              {/* Knowledge nodes representation */}
              {graphData?.nodes.slice(0, 6).map((node, index) => {
                const sizeClasses = ["w-12 h-12", "w-8 h-8", "w-10 h-10", "w-6 h-6", "w-14 h-14", "w-8 h-8"];
                const colorClasses = [
                  "bg-blue-400 dark:bg-blue-500",
                  "bg-purple-400 dark:bg-purple-500", 
                  "bg-green-400 dark:bg-green-500",
                  "bg-cyan-400 dark:bg-cyan-500",
                  "bg-blue-600 dark:bg-blue-700",
                  "bg-pink-400 dark:bg-pink-500"
                ];
                
                return (
                  <div
                    key={node.id}
                    className={`${sizeClasses[index]} ${colorClasses[index]} rounded-full animate-pulse-slow flex items-center justify-center`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                    title={node.label}
                  >
                    <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                  </div>
                );
              }) || [...Array(6)].map((_, index) => {
                const sizeClasses = ["w-12 h-12", "w-8 h-8", "w-10 h-10", "w-6 h-6", "w-14 h-14", "w-8 h-8"];
                const colorClasses = [
                  "bg-blue-400", "bg-purple-400", "bg-green-400",
                  "bg-cyan-400", "bg-blue-600", "bg-pink-400"
                ];
                
                return (
                  <div
                    key={index}
                    className={`${sizeClasses[index]} ${colorClasses[index]} rounded-full animate-pulse-slow`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Connection lines overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-30">
              {/* Sample connection lines */}
              <line x1="30%" y1="40%" x2="50%" y2="60%" stroke="currentColor" strokeWidth="1" />
              <line x1="50%" y1="30%" x2="70%" y2="50%" stroke="currentColor" strokeWidth="1" />
              <line x1="40%" y1="70%" x2="60%" y2="40%" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          
          {/* Graph info overlay */}
          <div className="relative z-10 text-center bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm">
            <Network className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">Interactive Graph</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {graphData?.nodes.length || 0} nodes connected
            </p>
          </div>
        </div>

        {/* Graph Statistics */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Nodes: <strong className="text-gray-800 dark:text-white">
              {graphData?.stats.totalNodes?.toLocaleString() || "0"}
            </strong>
          </span>
          <span>
            Connections: <strong className="text-gray-800 dark:text-white">
              {graphData?.stats.totalEdges?.toLocaleString() || "0"}
            </strong>
          </span>
          <span>
            Clusters: <strong className="text-gray-800 dark:text-white">
              {graphData?.stats.clusters || "0"}
            </strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
