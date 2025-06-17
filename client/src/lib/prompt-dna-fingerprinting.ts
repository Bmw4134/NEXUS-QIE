
import crypto from 'crypto-js';

export interface PromptFingerprint {
  id: string;
  prompt: string;
  context: any;
  fingerprint: string;
  timestamp: Date;
  metadata: {
    tokens: number;
    complexity: number;
    category: string;
  };
}

export class PromptDNAFingerprinting {
  private fingerprints: Map<string, PromptFingerprint> = new Map();

  fingerprint(prompt: string, context: any = {}): PromptFingerprint {
    const id = crypto.MD5(prompt + JSON.stringify(context)).toString();
    const fingerprint = crypto.SHA256(prompt).toString();
    
    const tokens = this.estimateTokens(prompt);
    const complexity = this.calculateComplexity(prompt);
    const category = this.categorizePrompt(prompt);

    const result: PromptFingerprint = {
      id,
      prompt,
      context,
      fingerprint,
      timestamp: new Date(),
      metadata: {
        tokens,
        complexity,
        category
      }
    };

    this.fingerprints.set(id, result);
    return result;
  }

  getFingerprint(id: string): PromptFingerprint | undefined {
    return this.fingerprints.get(id);
  }

  getAllFingerprints(): PromptFingerprint[] {
    return Array.from(this.fingerprints.values());
  }

  private estimateTokens(prompt: string): number {
    // Rough token estimation (GPT-style)
    return Math.ceil(prompt.length / 4);
  }

  private calculateComplexity(prompt: string): number {
    let complexity = 0;
    
    // Length factor
    complexity += prompt.length / 100;
    
    // Special characters
    complexity += (prompt.match(/[{}[\]()]/g) || []).length * 0.5;
    
    // Keywords indicating complexity
    const complexKeywords = ['analyze', 'compare', 'synthesize', 'evaluate', 'create'];
    complexKeywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword)) {
        complexity += 2;
      }
    });

    return Math.round(complexity * 10) / 10;
  }

  private categorizePrompt(prompt: string): string {
    const categories = [
      { name: 'analysis', keywords: ['analyze', 'examine', 'study', 'investigate'] },
      { name: 'generation', keywords: ['create', 'generate', 'build', 'make'] },
      { name: 'optimization', keywords: ['optimize', 'improve', 'enhance', 'refactor'] },
      { name: 'question', keywords: ['what', 'how', 'why', 'when', 'where'] },
      { name: 'instruction', keywords: ['do', 'execute', 'run', 'perform'] }
    ];

    const lowerPrompt = prompt.toLowerCase();
    
    for (const category of categories) {
      if (category.keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return category.name;
      }
    }

    return 'general';
  }
}
