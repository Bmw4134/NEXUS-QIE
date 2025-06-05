import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GitBranch, 
  Brain, 
  Network, 
  Search,
  BookOpen,
  Zap,
  Code,
  Link,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProjectBrain {
  repoId: number;
  repoName: string;
  architecture: string;
  technologies: string[];
  dependencies: Record<string, string>;
  codebase_summary: string;
  api_endpoints: string[];
  database_schema: string;
  business_logic: string;
  integration_points: string[];
  last_analyzed: string;
  brain_knowledge_id: string;
}

interface CrossProjectConnection {
  id: string;
  sourceRepo: string;
  targetRepo: string;
  connectionType: string;
  interface_definition: string;
  communication_protocol: string;
  data_flow: string;
  security_requirements: string;
  implementation_status: string;
  created_at: string;
}

interface BrainStats {
  totalRepositories: number;
  analyzedProjects: number;
  crossConnections: number;
  lastAnalysisTime: string;
  brainHealth: number;
}

export function GitHubBrainPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [username, setUsername] = useState('');
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('architecture');
  const [context, setContext] = useState('');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<BrainStats>({
    queryKey: ['/api/github-brain/stats'],
    enabled: isInitialized,
    refetchInterval: 30000
  });

  const { data: projects } = useQuery<ProjectBrain[]>({
    queryKey: ['/api/github-brain/projects'],
    enabled: isInitialized,
    refetchInterval: 60000
  });

  const { data: connections } = useQuery<CrossProjectConnection[]>({
    queryKey: ['/api/github-brain/connections'],
    enabled: isInitialized,
    refetchInterval: 60000
  });

  const initializeMutation = useMutation({
    mutationFn: async (data: { githubToken: string; username: string }) => {
      const response = await fetch('/api/github-brain/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to initialize GitHub Brain');
      return response.json();
    },
    onSuccess: () => {
      setIsInitialized(true);
      queryClient.invalidateQueries({ queryKey: ['/api/github-brain/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/github-brain/projects'] });
    }
  });

  const queryMutation = useMutation({
    mutationFn: async (data: { query: string; queryType: string; context: string }) => {
      const response = await fetch('/api/github-brain/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to query GitHub Brain');
      return response.json();
    }
  });

  const handleInitialize = () => {
    if (!githubToken || !username) return;
    initializeMutation.mutate({ githubToken, username });
  };

  const handleQuery = () => {
    if (!query) return;
    queryMutation.mutate({ query, queryType, context });
  };

  if (!isInitialized) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-blue-600" />
            GitHub Brain Integration
          </h1>
          <Badge variant="secondary">Not Connected</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Connect to GitHub Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Centralized Repository Brain System
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Connect your GitHub repositories to enable cross-project analysis, automated documentation, 
                intelligent code connections, and AI-powered insights across your entire codebase ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">GitHub Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-github-username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Personal Access Token</label>
                <Input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                />
              </div>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Need a token? Visit: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
              <br />
              Required permissions: repo, read:user
            </div>

            <Button 
              onClick={handleInitialize}
              disabled={!githubToken || !username || initializeMutation.isPending}
              className="w-full"
            >
              {initializeMutation.isPending ? 'Initializing Brain...' : 'Connect GitHub Brain'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="w-8 h-8 text-green-600" />
          GitHub Brain Integration
        </h1>
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      </div>

      {/* Brain Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRepositories || 0}</div>
            <p className="text-xs text-muted-foreground">Total discovered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Analyzed Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.analyzedProjects || 0}</div>
            <p className="text-xs text-muted-foreground">Brain patterns created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="w-4 h-4" />
              Cross-Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.crossConnections || 0}</div>
            <p className="text-xs text-muted-foreground">Project relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Brain Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((stats?.brainHealth || 0) * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">System efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Brain Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Query GitHub Brain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Query Type</label>
              <Select value={queryType} onValueChange={setQueryType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architecture">Architecture Analysis</SelectItem>
                  <SelectItem value="implementation">Implementation Details</SelectItem>
                  <SelectItem value="integration">Integration Opportunities</SelectItem>
                  <SelectItem value="debugging">Debugging Assistance</SelectItem>
                  <SelectItem value="optimization">Code Optimization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Context</label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Additional context for the query"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Brain Query</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the GitHub Brain about your projects, architectures, connections, or optimizations..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleQuery}
            disabled={!query || queryMutation.isPending}
            className="w-full"
          >
            {queryMutation.isPending ? 'Analyzing...' : 'Query Brain'}
          </Button>

          {queryMutation.data && (
            <div className="mt-4 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Brain Response</h4>
                <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                  {queryMutation.data.response}
                </p>
              </div>

              {queryMutation.data.suggested_actions?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Suggested Actions</h4>
                  <ul className="space-y-2">
                    {queryMutation.data.suggested_actions.map((action: any, index: number) => (
                      <li key={index} className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>{action.repo}:</strong> {action.action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Brains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Project Brains ({projects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects?.length ? (
              projects.map((project) => (
                <div key={project.repoId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{project.repoName}</h3>
                    <Badge variant="outline">{project.technologies.length} technologies</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.codebase_summary}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last analyzed: {new Date(project.last_analyzed).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No project brains created yet. The system is analyzing your repositories.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Project Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Cross-Project Connections ({connections?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections?.length ? (
              connections.map((connection) => (
                <div key={connection.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{connection.sourceRepo}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold">{connection.targetRepo}</span>
                    </div>
                    <Badge variant={connection.implementation_status === 'completed' ? 'default' : 'secondary'}>
                      {connection.implementation_status}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Type:</strong> {connection.connectionType}</div>
                    <div><strong>Protocol:</strong> {connection.communication_protocol}</div>
                    <div><strong>Interface:</strong> {connection.interface_definition}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No cross-connections detected yet. The brain is analyzing project relationships.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}