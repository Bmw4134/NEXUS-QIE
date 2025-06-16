
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Network, TrendingUp, Database, Users, Settings,
  CheckCircle, AlertCircle, Hammer, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScaffoldingStatus {
  totalModules: number;
  scaffolded: number;
  missing: string[];
  categories: {
    [key: string]: {
      total: number;
      scaffolded: number;
      modules: Array<{ name: string; status: string }>;
    };
  };
}

const categoryIcons: { [key: string]: any } = {
  quantum: Brain,
  nexus: Network,
  trading: TrendingUp,
  intelligence: Database,
  family: Users,
  system: Settings
};

const categoryNames: { [key: string]: string } = {
  quantum: 'Quantum Intelligence',
  nexus: 'NEXUS Operations',
  trading: 'Trading & Markets',
  intelligence: 'Intelligence Hub',
  family: 'Family Platform',
  system: 'System Control'
};

export default function ModuleScaffoldingDashboard() {
  const [status, setStatus] = useState<ScaffoldingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scaffolding, setScaffolding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scaffolding/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching scaffolding status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scaffolding status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const executeScaffolding = async () => {
    setScaffolding(true);
    try {
      const response = await fetch('/api/scaffolding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to execute scaffolding');
      
      toast({
        title: "Success",
        description: "All modules scaffolded successfully!",
      });
      
      await fetchStatus(); // Refresh status
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scaffold modules",
        variant: "destructive",
      });
    } finally {
      setScaffolding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!status) return null;

  const completionPercentage = (status.scaffolded / status.totalModules) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Module Scaffolding</h1>
            <p className="text-gray-600 dark:text-gray-400">NEXUS Module Development Dashboard</p>
          </div>
        </div>
        <Button 
          onClick={executeScaffolding} 
          disabled={scaffolding || completionPercentage === 100}
          className="bg-gradient-to-r from-blue-500 to-purple-600"
        >
          {scaffolding ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Scaffolding...
            </>
          ) : (
            <>
              <Hammer className="w-4 h-4 mr-2" />
              Scaffold All Modules
            </>
          )}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Progress</span>
            <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
              {status.scaffolded}/{status.totalModules} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={completionPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{status.scaffolded} modules scaffolded</span>
              <span>{status.missing.length} modules missing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Category Overview</TabsTrigger>
          <TabsTrigger value="missing">Missing Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(status.categories).map(([categoryKey, category]) => {
              const Icon = categoryIcons[categoryKey] || Settings;
              const categoryProgress = (category.scaffolded / category.total) * 100;
              
              return (
                <Card key={categoryKey}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{categoryNames[categoryKey] || categoryKey}</span>
                    </CardTitle>
                    <Badge variant={categoryProgress === 100 ? 'default' : 'secondary'}>
                      {category.scaffolded}/{category.total}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <Progress value={categoryProgress} className="w-full mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {categoryProgress.toFixed(0)}% complete
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="missing" className="space-y-6">
          {status.missing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {status.missing.map((moduleName) => (
                <Card key={moduleName}>
                  <CardContent className="flex items-center space-x-3 p-4">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">{moduleName}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All Modules Scaffolded!</h3>
                  <p className="text-muted-foreground">Every sidebar module has been properly scaffolded.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
