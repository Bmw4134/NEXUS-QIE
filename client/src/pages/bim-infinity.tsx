import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  Building, 
  Layers, 
  Box, 
  Workflow,
  Settings,
  Database,
  Cloud,
  Network,
  BarChart3,
  Zap,
  Shield,
  Globe,
  Hammer,
  Factory,
  Truck,
  Calendar,
  Users,
  FileText,
  Target,
  TrendingUp
} from 'lucide-react';

interface BIMPackage {
  id: string;
  name: string;
  category: 'modeling' | 'collaboration' | 'analysis' | 'construction' | 'facility';
  status: 'active' | 'pending' | 'maintenance';
  version: string;
  license: string;
  usage: number;
  lastUpdated: string;
  features: string[];
}

interface ProjectMetrics {
  totalProjects: number;
  activeModels: number;
  collaborators: number;
  dataStorage: number;
  processingPower: number;
  cloudSync: number;
}

export function BIMInfinityPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const { data: packages } = useQuery<BIMPackage[]>({
    queryKey: ['/api/bim-infinity/packages'],
    queryFn: () => {
      // Enterprise BIM packages
      return Promise.resolve([
        {
          id: 'modeling-core',
          name: 'BIM Modeling Core',
          category: 'modeling',
          status: 'active',
          version: '2024.3.1',
          license: 'Enterprise',
          usage: 87,
          lastUpdated: '2024-12-05',
          features: ['3D Modeling', 'Parametric Design', 'Advanced Geometry', 'Material Libraries']
        },
        {
          id: 'collaboration-hub',
          name: 'Collaboration Hub Pro',
          category: 'collaboration',
          status: 'active',
          version: '12.8.2',
          license: 'Enterprise',
          usage: 92,
          lastUpdated: '2024-12-04',
          features: ['Real-time Collaboration', 'Version Control', 'Cloud Sync', 'Multi-user Access']
        },
        {
          id: 'structural-analysis',
          name: 'Structural Analysis Suite',
          category: 'analysis',
          status: 'active',
          version: '8.4.0',
          license: 'Professional',
          usage: 76,
          lastUpdated: '2024-12-03',
          features: ['Load Analysis', 'Seismic Modeling', 'Material Testing', 'Code Compliance']
        },
        {
          id: 'construction-manager',
          name: 'Construction Manager',
          category: 'construction',
          status: 'active',
          version: '5.2.1',
          license: 'Enterprise',
          usage: 83,
          lastUpdated: '2024-12-05',
          features: ['Schedule Management', 'Resource Planning', 'Progress Tracking', 'Cost Control']
        },
        {
          id: 'facility-operations',
          name: 'Facility Operations',
          category: 'facility',
          status: 'pending',
          version: '3.1.0',
          license: 'Enterprise',
          usage: 45,
          lastUpdated: '2024-12-01',
          features: ['Asset Management', 'Maintenance Scheduling', 'Energy Monitoring', 'Space Planning']
        },
        {
          id: 'mep-systems',
          name: 'MEP Systems Pro',
          category: 'modeling',
          status: 'active',
          version: '7.3.2',
          license: 'Professional',
          usage: 89,
          lastUpdated: '2024-12-04',
          features: ['Electrical Design', 'HVAC Modeling', 'Plumbing Systems', 'Fire Safety']
        }
      ]);
    }
  });

  const { data: metrics } = useQuery<ProjectMetrics>({
    queryKey: ['/api/bim-infinity/metrics'],
    queryFn: () => {
      return Promise.resolve({
        totalProjects: 247,
        activeModels: 1834,
        collaborators: 156,
        dataStorage: 2847, // GB
        processingPower: 94,
        cloudSync: 99
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'modeling': return <Box className="w-5 h-5" />;
      case 'collaboration': return <Users className="w-5 h-5" />;
      case 'analysis': return <BarChart3 className="w-5 h-5" />;
      case 'construction': return <Hammer className="w-5 h-5" />;
      case 'facility': return <Factory className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'maintenance': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building className="w-8 h-8 text-blue-600" />
          BIM Infinity Full Suite
        </h1>
        <Badge variant="default" className="bg-blue-600">
          Enterprise Edition
        </Badge>
      </div>

      {/* Enterprise Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Total active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Box className="w-4 h-4" />
              Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeModels || 0}</div>
            <p className="text-xs text-muted-foreground">Active models</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.collaborators || 0}</div>
            <p className="text-xs text-muted-foreground">Collaborators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.dataStorage || 0} GB</div>
            <p className="text-xs text-muted-foreground">Data used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.processingPower || 0}%</div>
            <Progress value={metrics?.processingPower || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cloudSync || 0}%</div>
            <Progress value={metrics?.cloudSync || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* BIM Package Management */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Enterprise Packages</TabsTrigger>
          <TabsTrigger value="modeling">3D Modeling</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages?.map((pkg) => (
              <Card key={pkg.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPackage(pkg.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getCategoryIcon(pkg.category)}
                      {pkg.name}
                    </CardTitle>
                    <Badge variant="outline" className={`${getStatusColor(pkg.status)} text-white`}>
                      {pkg.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Version:</span>
                    <span className="font-medium">{pkg.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>License:</span>
                    <span className="font-medium">{pkg.license}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Usage:</span>
                      <span className="font-medium">{pkg.usage}%</span>
                    </div>
                    <Progress value={pkg.usage} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {pkg.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modeling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                3D Modeling & Design Suite
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Parametric Design Tools</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Advanced geometric modeling</li>
                  <li>• Parametric constraints system</li>
                  <li>• Dynamic form generation</li>
                  <li>• Complex surface modeling</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Material & Rendering</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Photorealistic rendering engine</li>
                  <li>• Advanced material libraries</li>
                  <li>• Real-time visualization</li>
                  <li>• VR/AR integration ready</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Real-time Collaboration Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Multi-user Environment</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Simultaneous model editing</li>
                  <li>• Real-time conflict resolution</li>
                  <li>• Role-based permissions</li>
                  <li>• Activity tracking & history</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Cloud Integration</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Automatic cloud synchronization</li>
                  <li>• Cross-platform compatibility</li>
                  <li>• Mobile access & editing</li>
                  <li>• Enterprise security protocols</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Advanced Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Performance Analytics</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Model performance optimization</li>
                  <li>• Resource usage tracking</li>
                  <li>• Collaboration efficiency metrics</li>
                  <li>• Predictive maintenance alerts</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Business Intelligence</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Project cost analysis</li>
                  <li>• Timeline optimization</li>
                  <li>• Risk assessment modeling</li>
                  <li>• ROI dashboard reporting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Enterprise Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Settings
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              License Management
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflow Automation
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Performance Tuning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}