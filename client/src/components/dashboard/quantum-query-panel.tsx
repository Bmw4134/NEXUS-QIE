import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { QuantumQueryResponse } from "@shared/schema";

export function QuantumQueryPanel() {
  const [query, setQuery] = useState("");
  const [currentResult, setCurrentResult] = useState<QuantumQueryResponse | null>(null);
  const { toast } = useToast();

  const queryMutation = useMutation({
    mutationFn: async (queryData: { query: string; context?: string }) => {
      const response = await apiRequest("POST", "/api/quantum/query", queryData);
      return response.json() as Promise<QuantumQueryResponse>;
    },
    onSuccess: (data) => {
      setCurrentResult(data);
      setQuery("");
      toast({
        title: "Query Processed",
        description: `Confidence: ${(data.confidence * 100).toFixed(1)}%`,
      });
    },
    onError: (error) => {
      toast({
        title: "Query Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a query to process",
        variant: "destructive",
      });
      return;
    }

    queryMutation.mutate({ query: query.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
            Quantum Query Interface
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">ASI Active</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Query Input */}
        <div className="relative">
          <Textarea
            placeholder="Ask the quantum database anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px]"
            disabled={queryMutation.isPending}
          />
          <Button
            onClick={handleSubmit}
            disabled={queryMutation.isPending || !query.trim()}
            className="absolute bottom-3 right-3 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {queryMutation.isPending ? (
              <Activity className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {queryMutation.isPending ? "Processing..." : "Query"}
          </Button>
        </div>

        {/* Query Results */}
        {currentResult && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Latest Query Result
              </span>
              <Badge 
                variant="secondary" 
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              >
                {(currentResult.confidence * 100).toFixed(1)}% Confidence
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
              {currentResult.responseText}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Source: {currentResult.sourceNodes.length} nodes
              </Badge>
              <Badge variant="outline" className="text-xs">
                ASI Enhanced: {currentResult.quantumEnhancement.toFixed(3)}x
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentResult.computationalCost.toFixed(2)}s response
              </Badge>
            </div>

            {/* Reasoning Chain */}
            {currentResult.reasoningChain.length > 0 && (
              <details className="mt-3">
                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                  View Reasoning Chain ({currentResult.reasoningChain.length} steps)
                </summary>
                <div className="mt-2 space-y-1">
                  {currentResult.reasoningChain.map((step, index) => (
                    <div key={index} className="text-xs text-gray-500 dark:text-gray-400 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                      {step}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Ctrl+Enter</kbd> to submit quickly
        </div>
      </CardContent>
    </Card>
  );
}
