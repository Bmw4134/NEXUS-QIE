/**
 * NEXUS Registry Service
 * Manages cross-project communication and endpoint registration
 */

export interface ProjectEndpoint {
  projectId: string;
  projectName: string;
  baseUrl: string;
  endpoints: {
    dashboard: string;
    api: string;
    websocket?: string;
  };
  status: 'online' | 'offline' | 'error';
  lastPing: Date;
  capabilities: string[];
}

export interface CrossProjectMessage {
  id: string;
  sourceProject: string;
  targetProject: string;
  messageType: 'query' | 'command' | 'data' | 'status';
  payload: any;
  timestamp: Date;
  requiresResponse: boolean;
}

export class NexusRegistryService {
  private registeredProjects: Map<string, ProjectEndpoint> = new Map();
  private messageQueue: CrossProjectMessage[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry() {
    // Register core NEXUS project endpoints
    this.registerProject({
      projectId: 'nexus-unified-final',
      projectName: 'NEXUS Unified Final',
      baseUrl: process.env.NEXUS_BASE_URL || 'https://nexus-unified-final.replit.app',
      endpoints: {
        dashboard: '/dashboard',
        api: '/api',
        websocket: '/ws'
      },
      status: 'online',
      lastPing: new Date(),
      capabilities: ['live-trading', 'ptni-analytics', 'quantum-ai', 'robinhood-integration']
    });

    // Register TRAXORA project
    this.registerProject({
      projectId: 'traxora-quantum',
      projectName: 'TRAXORA Quantum',
      baseUrl: process.env.TRAXORA_BASE_URL || 'https://traxora-quantum.replit.app',
      endpoints: {
        dashboard: '/traxora-dashboard',
        api: '/api/traxora'
      },
      status: 'online',
      lastPing: new Date(),
      capabilities: ['quantum-database', 'asi-optimization', 'market-intelligence']
    });

    // Register additional projects as needed
    this.registerAdditionalProjects();
    this.isInitialized = true;
    
    console.log('🌐 NEXUS Registry Service initialized');
    console.log(`📊 ${this.registeredProjects.size} projects registered`);
  }

  private registerAdditionalProjects() {
    // Add more project registrations based on environment variables
    const additionalProjects = [
      'nexus-admin-panel',
      'quantum-superintelligent-ai',
      'market-intelligence-hub',
      'watson-command-engine'
    ];

    additionalProjects.forEach(projectId => {
      const envVar = `${projectId.toUpperCase().replace(/-/g, '_')}_URL`;
      const baseUrl = process.env[envVar];
      
      if (baseUrl) {
        this.registerProject({
          projectId,
          projectName: this.formatProjectName(projectId),
          baseUrl,
          endpoints: {
            dashboard: '/dashboard',
            api: '/api'
          },
          status: 'online',
          lastPing: new Date(),
          capabilities: this.getProjectCapabilities(projectId)
        });
      }
    });
  }

  registerProject(project: ProjectEndpoint): boolean {
    try {
      this.registeredProjects.set(project.projectId, project);
      console.log(`✅ Registered project: ${project.projectName} (${project.projectId})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register project ${project.projectId}:`, error);
      return false;
    }
  }

  async pingProject(projectId: string): Promise<boolean> {
    const project = this.registeredProjects.get(projectId);
    if (!project) return false;

    try {
      const response = await fetch(`${project.baseUrl}/api/health`, {
        method: 'GET',
        timeout: 5000
      });

      const isOnline = response.ok;
      project.status = isOnline ? 'online' : 'error';
      project.lastPing = new Date();
      
      return isOnline;
    } catch (error) {
      project.status = 'offline';
      project.lastPing = new Date();
      return false;
    }
  }

  async sendCrossProjectMessage(message: CrossProjectMessage): Promise<any> {
    const targetProject = this.registeredProjects.get(message.targetProject);
    if (!targetProject) {
      throw new Error(`Target project ${message.targetProject} not registered`);
    }

    try {
      const response = await fetch(`${targetProject.baseUrl}/api/cross-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-Project': message.sourceProject
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Cross-project communication failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Cross-project message failed:`, error);
      // Queue message for retry
      this.messageQueue.push(message);
      throw error;
    }
  }

  getRegisteredProjects(): ProjectEndpoint[] {
    return Array.from(this.registeredProjects.values());
  }

  getProjectStatus(projectId: string): ProjectEndpoint | undefined {
    return this.registeredProjects.get(projectId);
  }

  async healthCheck(): Promise<{
    totalProjects: number;
    onlineProjects: number;
    offlineProjects: number;
    projects: ProjectEndpoint[];
  }> {
    // Ping all projects
    const pingPromises = Array.from(this.registeredProjects.keys()).map(id => 
      this.pingProject(id)
    );
    
    await Promise.allSettled(pingPromises);

    const projects = this.getRegisteredProjects();
    const onlineProjects = projects.filter(p => p.status === 'online').length;
    const offlineProjects = projects.length - onlineProjects;

    return {
      totalProjects: projects.length,
      onlineProjects,
      offlineProjects,
      projects
    };
  }

  private formatProjectName(projectId: string): string {
    return projectId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getProjectCapabilities(projectId: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      'nexus-admin-panel': ['admin-controls', 'user-management', 'system-monitoring'],
      'quantum-superintelligent-ai': ['quantum-ai', 'asi-optimization', 'advanced-analytics'],
      'market-intelligence-hub': ['market-data', 'intelligence-gathering', 'analysis'],
      'watson-command-engine': ['command-processing', 'automation', 'ai-assistance']
    };

    return capabilityMap[projectId] || ['general-purpose'];
  }

  // Generate proper anchor schema for cross-project linking
  generateAnchorSchema(): any {
    const schema = {
      registry: {
        version: '1.0.0',
        projects: {},
        routes: {},
        capabilities: []
      }
    };

    this.registeredProjects.forEach((project, id) => {
      schema.registry.projects[id] = {
        name: project.projectName,
        baseUrl: project.baseUrl,
        endpoints: project.endpoints,
        status: project.status,
        capabilities: project.capabilities
      };

      // Add route mappings
      Object.entries(project.endpoints).forEach(([type, path]) => {
        const routeKey = `${id}.${type}`;
        schema.registry.routes[routeKey] = `${project.baseUrl}${path}`;
      });

      // Collect unique capabilities
      project.capabilities.forEach(cap => {
        if (!schema.registry.capabilities.includes(cap)) {
          schema.registry.capabilities.push(cap);
        }
      });
    });

    return schema;
  }
}

export const nexusRegistry = new NexusRegistryService();