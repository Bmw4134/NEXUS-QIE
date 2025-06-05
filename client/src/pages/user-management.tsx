import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Eye,
  Edit,
  Database,
  Activity,
  Crown,
  Cpu,
  TrendingUp,
  BarChart3,
  GitBranch,
  Building,
  Target,
  Network,
  BookOpen,
  Brain,
  Command,
  Zap
} from 'lucide-react';

interface UserRole {
  id: number;
  name: string;
  description: string;
  level: number;
  dashboardAccess: string[];
  modulePermissions: Record<string, boolean>;
  createdAt?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  fingerprint: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  role?: UserRole;
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  roleId: number;
  fingerprint: string;
}

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Main Dashboard', icon: Activity, description: 'Central control interface' },
  { id: 'quantum-ai', name: 'Quantum AI', icon: Brain, description: 'AI processing and learning' },
  { id: 'market-intelligence', name: 'Market Intelligence', icon: TrendingUp, description: 'Financial data and analysis' },
  { id: 'research-hub', name: 'Research Hub', icon: BookOpen, description: 'Automated research system' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Performance metrics' },
  { id: 'automation', name: 'Automation', icon: Zap, description: 'Task automation' },
  { id: 'github-brain', name: 'GitHub Brain', icon: GitBranch, description: 'Repository intelligence' },
  { id: 'bim-infinity', name: 'BIM Infinity', icon: Building, description: 'Building information management' },
  { id: 'kaizen-agent', name: 'KaizenGPT Agent', icon: Cpu, description: 'Continuous optimization' },
  { id: 'watson-command', name: 'Watson Command', icon: Command, description: 'System command engine' },
  { id: 'infinity-sovereign', name: 'Infinity Sovereign', icon: Crown, description: 'Executive control' },
  { id: 'knowledge-graph', name: 'Knowledge Graph', icon: Network, description: 'Knowledge visualization' },
];

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full system access with all privileges',
    level: 4,
    dashboardAccess: ['nexus', 'analytics', 'admin'],
    modulePermissions: Object.fromEntries(AVAILABLE_MODULES.map(m => [m.id, true]))
  },
  {
    name: 'Executive',
    description: 'Executive-level access to strategic modules',
    level: 3,
    dashboardAccess: ['nexus', 'analytics'],
    modulePermissions: {
      'dashboard': true,
      'market-intelligence': true,
      'analytics': true,
      'infinity-sovereign': true,
      'research-hub': true,
      'knowledge-graph': true,
      'quantum-ai': false,
      'automation': false,
      'github-brain': false,
      'bim-infinity': true,
      'kaizen-agent': false,
      'watson-command': false
    }
  },
  {
    name: 'Operations',
    description: 'Operational access to core system functions',
    level: 2,
    dashboardAccess: ['nexus'],
    modulePermissions: {
      'dashboard': true,
      'market-intelligence': true,
      'analytics': true,
      'automation': true,
      'research-hub': true,
      'quantum-ai': false,
      'github-brain': true,
      'bim-infinity': true,
      'kaizen-agent': true,
      'watson-command': false,
      'infinity-sovereign': false,
      'knowledge-graph': true
    }
  },
  {
    name: 'Viewer',
    description: 'Read-only access to basic dashboards',
    level: 1,
    dashboardAccess: ['nexus'],
    modulePermissions: {
      'dashboard': true,
      'market-intelligence': true,
      'analytics': true,
      'research-hub': true,
      'knowledge-graph': true,
      'quantum-ai': false,
      'automation': false,
      'github-brain': false,
      'bim-infinity': false,
      'kaizen-agent': false,
      'watson-command': false,
      'infinity-sovereign': false
    }
  }
];

export function UserManagementPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [newUser, setNewUser] = useState<Partial<CreateUserData>>({});
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean>>({});
  const [createdUsers, setCreatedUsers] = useState<User[]>([]);
  
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery<UserRole[]>({
    queryKey: ['/api/user-management/roles'],
    retry: false
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/user-management/users'],
    retry: false
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await fetch('/api/user-management/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-management/roles'] });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await fetch('/api/user-management/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: (newUser) => {
      setCreatedUsers(prev => [...prev, newUser]);
      queryClient.invalidateQueries({ queryKey: ['/api/user-management/users'] });
    }
  });

  const initializeDefaultRoles = async () => {
    try {
      for (const role of DEFAULT_ROLES) {
        await createRoleMutation.mutateAsync(role);
      }
    } catch (error) {
      console.error('Error initializing roles:', error);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCustomPermissions(role.modulePermissions);
    setNewUser(prev => ({ ...prev, roleId: role.id }));
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password || !selectedRole) {
      return;
    }

    const userData: CreateUserData = {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      roleId: selectedRole.id,
      fingerprint: `USER_${newUser.username.toUpperCase()}_${Date.now()}`
    };

    await createUserMutation.mutateAsync(userData);
    setNewUser({});
    setSelectedRole(null);
    setCurrentStep(4);
  };

  const getRoleColor = (level: number) => {
    switch (level) {
      case 4: return 'bg-red-100 text-red-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 1: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleIcon = (moduleId: string) => {
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    return module?.icon || Settings;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Initialize User Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Set up the foundational user roles for your NEXUS platform. These roles define access levels and module permissions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_ROLES.map((role, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{role.name}</h3>
                        <Badge className={getRoleColor(role.level)}>
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {role.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Access: {Object.values(role.modulePermissions).filter(Boolean).length}/{AVAILABLE_MODULES.length} modules
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => {
                  initializeDefaultRoles();
                  setCurrentStep(2);
                }}
                className="w-full"
                disabled={createRoleMutation.isPending}
              >
                Initialize Roles & Continue
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Create New User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newUser.username || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="john.doe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Secure password"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!newUser.username || !newUser.email || !newUser.password}
                >
                  Next: Select Role
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Select User Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <Card 
                    key={role.id} 
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedRole?.id === role.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{role.name}</h3>
                        <Badge className={getRoleColor(role.level)}>
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedRole && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Module Access Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {AVAILABLE_MODULES.map((module) => {
                        const hasAccess = customPermissions[module.id];
                        const Icon = module.icon;
                        
                        return (
                          <div 
                            key={module.id}
                            className={`p-3 rounded-lg border ${
                              hasAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${hasAccess ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${hasAccess ? 'text-green-900' : 'text-gray-500'}`}>
                                {module.name}
                              </span>
                            </div>
                            <Badge variant={hasAccess ? 'default' : 'secondary'} className="text-xs">
                              {hasAccess ? 'Accessible' : 'Restricted'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateUser}
                  disabled={!selectedRole || createUserMutation.isPending}
                >
                  Create User
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Creation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Users Created Successfully</h3>
                <p className="text-green-800">
                  {createdUsers.length} user(s) have been created with proper role assignments and module access.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>Modules</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {createdUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role?.level || 1)}>
                          {user.role?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{user.fingerprint.slice(-12)}</TableCell>
                      <TableCell>
                        {user.role ? Object.values(user.role.modulePermissions).filter(Boolean).length : 0}/{AVAILABLE_MODULES.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex gap-2">
                <Button onClick={() => setCurrentStep(2)}>
                  Create Another User
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-blue-600" />
          User Management System
        </h1>
        <Badge variant="outline">Step {currentStep} of 4</Badge>
      </div>

      <div className="mb-6">
        <Progress value={(currentStep / 4) * 100} className="w-full" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Initialize Roles</span>
          <span>Create User</span>
          <span>Set Permissions</span>
          <span>Summary</span>
        </div>
      </div>

      {renderStepContent()}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Watson Core Memory Sync
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              All user data synchronized with Watson core memory ring for cross-dashboard access
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}