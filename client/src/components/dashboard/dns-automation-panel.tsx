import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Server, 
  Shield, 
  Activity, 
  Plus, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

interface DNSRecord {
  id: string;
  domain: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  status: string;
  lastUpdated: Date;
  provider: string;
}

interface DNSProvider {
  id: string;
  name: string;
  isActive: boolean;
  supportedRecordTypes: string[];
}

interface DNSMetrics {
  totalRecords: number;
  activeProviders: number;
  activeRules: number;
  healthyChecks: number;
  totalHealthChecks: number;
  uptime: number;
}

export function DNSAutomationPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [recordForm, setRecordForm] = useState({
    domain: "",
    type: "A",
    name: "",
    value: "",
    ttl: 3600,
    provider: ""
  });

  const [providerForm, setProviderForm] = useState({
    providerId: "",
    apiKey: ""
  });

  // Queries
  const { data: metrics } = useQuery({
    queryKey: ["/api/dns/metrics"],
    refetchInterval: 30000
  });

  const { data: records = [] } = useQuery({
    queryKey: ["/api/dns/records"],
    refetchInterval: 30000
  });

  const { data: providers = [] } = useQuery({
    queryKey: ["/api/dns/providers"],
    refetchInterval: 60000
  });

  const { data: healthChecks = [] } = useQuery({
    queryKey: ["/api/dns/health-checks"],
    refetchInterval: 15000
  });

  // Mutations
  const createRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      const response = await apiRequest("POST", "/api/dns/records", recordData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dns/metrics"] });
      setShowAddRecord(false);
      setRecordForm({ domain: "", type: "A", name: "", value: "", ttl: 3600, provider: "" });
      toast({
        title: "DNS Record Created",
        description: "DNS record has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addProviderMutation = useMutation({
    mutationFn: async (providerData: any) => {
      const response = await apiRequest("POST", "/api/dns/providers", providerData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns/providers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dns/metrics"] });
      setShowAddProvider(false);
      setProviderForm({ providerId: "", apiKey: "" });
      toast({
        title: data.success ? "Provider Connected" : "Provider Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Provider",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return 'text-green-600 bg-green-100';
      case 'inactive': case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'pending': case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': case 'unhealthy': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': case 'warning': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          DNS Automation Suite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">DNS Records</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* DNS Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics?.totalRecords || 0}
                      </div>
                      <div className="text-sm text-gray-600">DNS Records</div>
                    </div>
                    <Server className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {metrics?.activeProviders || 0}
                      </div>
                      <div className="text-sm text-gray-600">Active Providers</div>
                    </div>
                    <Globe className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics?.uptime?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">System Uptime</div>
                    </div>
                    <Activity className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DNS System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Health</span>
                    <span className="font-medium">{metrics?.uptime?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.uptime || 0} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Health Checks: {metrics?.healthyChecks || 0}/{metrics?.totalHealthChecks || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Active Rules: {metrics?.activeRules || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">DNS Records</h3>
              <Button onClick={() => setShowAddRecord(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>

            <AnimatePresence>
              {showAddRecord && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Create DNS Record</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="domain">Domain</Label>
                          <Input
                            id="domain"
                            value={recordForm.domain}
                            onChange={(e) => setRecordForm({...recordForm, domain: e.target.value})}
                            placeholder="example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="recordType">Record Type</Label>
                          <Select value={recordForm.type} onValueChange={(value) => setRecordForm({...recordForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="AAAA">AAAA</SelectItem>
                              <SelectItem value="CNAME">CNAME</SelectItem>
                              <SelectItem value="MX">MX</SelectItem>
                              <SelectItem value="TXT">TXT</SelectItem>
                              <SelectItem value="NS">NS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={recordForm.name}
                            onChange={(e) => setRecordForm({...recordForm, name: e.target.value})}
                            placeholder="www"
                          />
                        </div>
                        <div>
                          <Label htmlFor="value">Value</Label>
                          <Input
                            id="value"
                            value={recordForm.value}
                            onChange={(e) => setRecordForm({...recordForm, value: e.target.value})}
                            placeholder="192.168.1.1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => createRecordMutation.mutate(recordForm)}
                          disabled={createRecordMutation.isPending}
                        >
                          Create Record
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-2">
              {records.map((record: DNSRecord) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{record.type}</Badge>
                      <div>
                        <div className="font-medium">{record.name}.{record.domain}</div>
                        <div className="text-sm text-gray-600">{record.value}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </Badge>
                      <div className="text-sm text-gray-500">{record.provider}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">DNS Providers</h3>
              <Button onClick={() => setShowAddProvider(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>

            <AnimatePresence>
              {showAddProvider && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add DNS Provider</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="providerId">Provider</Label>
                        <Select value={providerForm.providerId} onValueChange={(value) => setProviderForm({...providerForm, providerId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cloudflare">Cloudflare</SelectItem>
                            <SelectItem value="route53">AWS Route 53</SelectItem>
                            <SelectItem value="namecheap">Namecheap</SelectItem>
                            <SelectItem value="godaddy">GoDaddy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={providerForm.apiKey}
                          onChange={(e) => setProviderForm({...providerForm, apiKey: e.target.value})}
                          placeholder="Enter API key"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => addProviderMutation.mutate(providerForm)}
                          disabled={addProviderMutation.isPending}
                        >
                          Connect Provider
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddProvider(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4">
              {providers.map((provider: DNSProvider) => (
                <Card key={provider.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Globe className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-600">
                          Supports: {provider.supportedRecordTypes.join(", ")}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(provider.isActive ? 'active' : 'inactive')}>
                      {getStatusIcon(provider.isActive ? 'active' : 'inactive')}
                      {provider.isActive ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <h3 className="text-lg font-semibold">DNS Health Monitoring</h3>
            
            <div className="grid gap-4">
              {healthChecks.map((check: any) => (
                <Card key={check.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Activity className="w-8 h-8 text-green-500" />
                      <div>
                        <div className="font-medium">{check.recordName}</div>
                        <div className="text-sm text-gray-600">
                          Expected: {check.expectedValue}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{check.uptime?.toFixed(1) || 0}% uptime</div>
                        <div className="text-sm text-gray-500">{check.responseTime || 0}ms</div>
                      </div>
                      <Badge className={getStatusColor(check.status)}>
                        {getStatusIcon(check.status)}
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}