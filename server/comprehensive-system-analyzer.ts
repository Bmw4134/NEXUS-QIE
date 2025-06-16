/**
 * NEXUS Comprehensive System Analyzer
 * Uses OpenAI and Perplexity APIs to analyze all visible and hidden system elements
 */

import OpenAI from "openai";
import axios from "axios";
import fs from "fs/promises";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SystemAnalysis {
  errors: SystemError[];
  recommendations: string[];
  hiddenIssues: string[];
  codeQuality: number;
  architectureScore: number;
  securityScore: number;
}

interface SystemError {
  type: 'react' | 'jsx' | 'typescript' | 'runtime' | 'build' | 'api';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  solution: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

export class ComprehensiveSystemAnalyzer {
  private analysisResults: SystemAnalysis = {
    errors: [],
    recommendations: [],
    hiddenIssues: [],
    codeQuality: 0,
    architectureScore: 0,
    securityScore: 0
  };

  async analyzeEntireSystem(): Promise<SystemAnalysis> {
    console.log('🔍 NEXUS: Starting comprehensive system analysis...');
    
    // Analyze frontend components
    await this.analyzeFrontendComponents();
    
    // Analyze backend services
    await this.analyzeBackendServices();
    
    // Analyze configuration files
    await this.analyzeConfigurationFiles();
    
    // Use Perplexity for market intelligence on best practices
    await this.getMarketIntelligence();
    
    // Use OpenAI for deep code analysis
    await this.performDeepCodeAnalysis();
    
    console.log('✅ NEXUS: Comprehensive analysis complete');
    return this.analysisResults;
  }

  private async analyzeFrontendComponents(): Promise<void> {
    console.log('🎯 Analyzing frontend components...');
    
    try {
      const clientDir = path.join(process.cwd(), 'client/src');
      const files = await this.getAllTsxFiles(clientDir);
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        await this.analyzeComponentFile(file, content);
      }
    } catch (error) {
      console.error('Error analyzing frontend:', error);
    }
  }

  private async analyzeComponentFile(filePath: string, content: string): Promise<void> {
    // Check for common React/JSX issues
    const issues = [];
    
    // Check for unclosed JSX tags
    const openTags = content.match(/<[^/][^>]*>/g) || [];
    const closeTags = content.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      issues.push({
        type: 'jsx' as const,
        severity: 'critical' as const,
        file: filePath,
        message: 'Potential unclosed JSX tags detected',
        solution: 'Review JSX structure for proper opening/closing tags'
      });
    }

    // Check for missing imports
    if (content.includes('useState') && !content.includes('import.*useState')) {
      issues.push({
        type: 'react' as const,
        severity: 'high' as const,
        file: filePath,
        message: 'useState used without import',
        solution: 'Add: import { useState } from "react"'
      });
    }

    // Check for key prop in lists
    if (content.includes('.map(') && !content.includes('key=')) {
      issues.push({
        type: 'react' as const,
        severity: 'medium' as const,
        file: filePath,
        message: 'Missing key prop in map function',
        solution: 'Add unique key prop to mapped elements'
      });
    }

    this.analysisResults.errors.push(...issues);
  }

  private async analyzeBackendServices(): Promise<void> {
    console.log('🔧 Analyzing backend services...');
    
    try {
      const serverDir = path.join(process.cwd(), 'server');
      const files = await this.getAllTsFiles(serverDir);
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        await this.analyzeServerFile(file, content);
      }
    } catch (error) {
      console.error('Error analyzing backend:', error);
    }
  }

  private async analyzeServerFile(filePath: string, content: string): Promise<void> {
    const issues = [];

    // Check for unhandled promises
    if (content.includes('async ') && !content.includes('try {') && !content.includes('.catch(')) {
      issues.push({
        type: 'runtime' as const,
        severity: 'high' as const,
        file: filePath,
        message: 'Async function without error handling',
        solution: 'Add try-catch blocks or .catch() handlers'
      });
    }

    // Check for console.log in production code
    if (content.includes('console.log') && !filePath.includes('test')) {
      issues.push({
        type: 'build' as const,
        severity: 'low' as const,
        file: filePath,
        message: 'Console.log statements found',
        solution: 'Replace with proper logging or remove'
      });
    }

    this.analysisResults.errors.push(...issues);
  }

  private async analyzeConfigurationFiles(): Promise<void> {
    console.log('⚙️ Analyzing configuration files...');
    
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts'
    ];

    for (const configFile of configFiles) {
      try {
        const content = await fs.readFile(configFile, 'utf-8');
        await this.analyzeConfigFile(configFile, content);
      } catch (error) {
        console.log(`Config file ${configFile} not found or error reading`);
      }
    }
  }

  private async analyzeConfigFile(fileName: string, content: string): Promise<void> {
    const issues = [];

    if (fileName === 'package.json') {
      const pkg = JSON.parse(content);
      
      // Check for security vulnerabilities in dependencies
      if (pkg.dependencies) {
        const outdatedDeps = await this.checkForOutdatedDependencies(pkg.dependencies);
        if (outdatedDeps.length > 0) {
          issues.push({
            type: 'build' as const,
            severity: 'medium' as const,
            file: fileName,
            message: `Potentially outdated dependencies: ${outdatedDeps.join(', ')}`,
            solution: 'Update dependencies to latest stable versions'
          });
        }
      }
    }

    this.analysisResults.errors.push(...issues);
  }

  private async getMarketIntelligence(): Promise<void> {
    console.log('🌐 Gathering market intelligence with Perplexity...');
    
    try {
      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a senior software architect analyzing React TypeScript trading applications. Provide actionable insights.'
            },
            {
              role: 'user',
              content: 'What are the current best practices for React TypeScript trading applications in 2024? Focus on error handling, performance, and security.'
            }
          ],
          max_tokens: 500,
          temperature: 0.2,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const perplexityData = response.data as PerplexityResponse;
      const insights = perplexityData.choices[0].message.content;
      
      this.analysisResults.recommendations.push(
        `Market Intelligence: ${insights}`
      );
      
    } catch (error) {
      console.error('Perplexity API error:', error);
      this.analysisResults.recommendations.push(
        'Market Intelligence: Unable to fetch current best practices'
      );
    }
  }

  private async performDeepCodeAnalysis(): Promise<void> {
    console.log('🧠 Performing deep code analysis with OpenAI...');
    
    try {
      // Get recent error logs
      const errorLogs = this.analysisResults.errors.map(err => 
        `${err.type}: ${err.message} in ${err.file}`
      ).join('\n');

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert React TypeScript developer analyzing a financial trading application. Identify hidden issues and provide specific solutions."
          },
          {
            role: "user",
            content: `Analyze these errors and issues in a React TypeScript trading application:

${errorLogs}

Browser console shows: "Error caught by boundary" with React component crashes.

Provide:
1. Root cause analysis
2. Hidden architectural issues
3. Specific code fixes
4. Performance optimizations
5. Security recommendations

Format as JSON with: rootCause, hiddenIssues, fixes, optimizations, security`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      if (analysis.hiddenIssues) {
        this.analysisResults.hiddenIssues.push(...analysis.hiddenIssues);
      }
      
      if (analysis.fixes) {
        this.analysisResults.recommendations.push(`OpenAI Fixes: ${JSON.stringify(analysis.fixes)}`);
      }

      if (analysis.optimizations) {
        this.analysisResults.recommendations.push(`Performance: ${JSON.stringify(analysis.optimizations)}`);
      }

      if (analysis.security) {
        this.analysisResults.recommendations.push(`Security: ${JSON.stringify(analysis.security)}`);
      }

      // Calculate scores
      this.analysisResults.codeQuality = Math.max(0, 100 - (this.analysisResults.errors.length * 10));
      this.analysisResults.architectureScore = this.analysisResults.errors.filter(e => e.severity === 'critical').length === 0 ? 85 : 60;
      this.analysisResults.securityScore = 80;

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      this.analysisResults.recommendations.push('Deep Analysis: Unable to complete AI-powered analysis');
    }
  }

  private async getAllTsxFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllTsxFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
    
    return files;
  }

  private async getAllTsFiles(dir: string): Promise<string[]> {
    return this.getAllTsxFiles(dir);
  }

  private async checkForOutdatedDependencies(dependencies: Record<string, string>): Promise<string[]> {
    // Simple check for potentially outdated patterns
    const outdated: string[] = [];
    
    for (const [name, version] of Object.entries(dependencies)) {
      if (version.includes('^') && !version.includes('2024') && !version.includes('2023')) {
        outdated.push(name);
      }
    }
    
    return outdated.slice(0, 5); // Limit to top 5
  }

  async generateFixScript(): Promise<string[]> {
    const fixes: string[] = [];
    
    for (const error of this.analysisResults.errors) {
      if (error.severity === 'critical' || error.severity === 'high') {
        fixes.push(`// Fix for ${error.file}: ${error.solution}`);
      }
    }
    
    return fixes;
  }
}

export const comprehensiveAnalyzer = new ComprehensiveSystemAnalyzer();