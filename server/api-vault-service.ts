
/**
 * NEXUS Internal API Vault Service
 * Secure credential management with encrypted storage and rotation
 */

import { db } from "./db";
import { evolutionApiKeyVault } from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export interface ApiCredential {
  id: string;
  service: string;
  apiKey: string;
  secretKey?: string;
  status: 'active' | 'inactive' | 'rate_limited' | 'expired';
  environment: 'paper' | 'live' | 'sandbox';
  lastUsed?: Date;
  usageCount: number;
  errorCount: number;
  metadata?: Record<string, any>;
}

export interface VaultConfig {
  encryptionKey: string;
  maxRetries: number;
  rotationInterval: number;
}

export class ApiVaultService {
  private encryptionKey: string;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    this.encryptionKey = process.env.VAULT_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  private decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async storeCredential(credential: Omit<ApiCredential, 'id'>): Promise<string> {
    try {
      const id = crypto.randomUUID();
      const encryptedApiKey = this.encrypt(credential.apiKey);
      const encryptedSecretKey = credential.secretKey ? this.encrypt(credential.secretKey) : null;

      await db.insert(evolutionApiKeyVault).values({
        service: credential.service,
        keyStatus: credential.status,
        lastUsed: credential.lastUsed || new Date(),
        usageCount: credential.usageCount,
        errorCount: credential.errorCount,
        metadata: {
          id,
          environment: credential.environment,
          encryptedApiKey,
          encryptedSecretKey,
          ...credential.metadata
        }
      });

      console.log(`🔐 Credential stored securely for ${credential.service}`);
      return id;
    } catch (error) {
      console.error('Failed to store credential:', error);
      throw new Error('Credential storage failed');
    }
  }

  async getCredential(service: string): Promise<ApiCredential | null> {
    try {
      const result = await db.select()
        .from(evolutionApiKeyVault)
        .where(eq(evolutionApiKeyVault.service, service))
        .limit(1);

      if (!result.length) return null;

      const vaultEntry = result[0];
      const metadata = vaultEntry.metadata as any;

      if (!metadata.encryptedApiKey) return null;

      const apiKey = this.decrypt(metadata.encryptedApiKey);
      const secretKey = metadata.encryptedSecretKey ? this.decrypt(metadata.encryptedSecretKey) : undefined;

      return {
        id: metadata.id,
        service: vaultEntry.service,
        apiKey,
        secretKey,
        status: vaultEntry.keyStatus as any,
        environment: metadata.environment || 'paper',
        lastUsed: vaultEntry.lastUsed || undefined,
        usageCount: vaultEntry.usageCount || 0,
        errorCount: vaultEntry.errorCount || 0,
        metadata: metadata
      };
    } catch (error) {
      console.error(`Failed to retrieve credential for ${service}:`, error);
      return null;
    }
  }

  async updateCredentialStatus(service: string, status: ApiCredential['status']): Promise<boolean> {
    try {
      await db.update(evolutionApiKeyVault)
        .set({ 
          keyStatus: status,
          updatedAt: new Date()
        })
        .where(eq(evolutionApiKeyVault.service, service));

      return true;
    } catch (error) {
      console.error(`Failed to update credential status for ${service}:`, error);
      return false;
    }
  }

  async incrementUsage(service: string): Promise<void> {
    try {
      const current = await this.getCredential(service);
      if (!current) return;

      await db.update(evolutionApiKeyVault)
        .set({ 
          usageCount: (current.usageCount || 0) + 1,
          lastUsed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(evolutionApiKeyVault.service, service));
    } catch (error) {
      console.error(`Failed to increment usage for ${service}:`, error);
    }
  }

  async incrementError(service: string): Promise<void> {
    try {
      const current = await this.getCredential(service);
      if (!current) return;

      await db.update(evolutionApiKeyVault)
        .set({ 
          errorCount: (current.errorCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(evolutionApiKeyVault.service, service));
    } catch (error) {
      console.error(`Failed to increment error count for ${service}:`, error);
    }
  }

  async listAllCredentials(): Promise<Omit<ApiCredential, 'apiKey' | 'secretKey'>[]> {
    try {
      const results = await db.select().from(evolutionApiKeyVault);
      
      return results.map(entry => {
        const metadata = entry.metadata as any;
        return {
          id: metadata.id || entry.service,
          service: entry.service,
          status: entry.keyStatus as any,
          environment: metadata.environment || 'paper',
          lastUsed: entry.lastUsed || undefined,
          usageCount: entry.usageCount || 0,
          errorCount: entry.errorCount || 0,
          metadata: metadata
        };
      });
    } catch (error) {
      console.error('Failed to list credentials:', error);
      return [];
    }
  }

  async deleteCredential(service: string): Promise<boolean> {
    try {
      await db.delete(evolutionApiKeyVault)
        .where(eq(evolutionApiKeyVault.service, service));
      
      console.log(`🗑️ Credential deleted for ${service}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete credential for ${service}:`, error);
      return false;
    }
  }

  async validateCredential(service: string): Promise<{ valid: boolean; message: string }> {
    const credential = await this.getCredential(service);
    
    if (!credential) {
      return { valid: false, message: 'Credential not found' };
    }

    if (credential.status === 'expired' || credential.status === 'inactive') {
      return { valid: false, message: `Credential is ${credential.status}` };
    }

    // Perform service-specific validation
    switch (service) {
      case 'alpaca':
        return this.validateAlpacaCredential(credential);
      case 'coinbase':
        return this.validateCoinbaseCredential(credential);
      case 'openai':
        return this.validateOpenAICredential(credential);
      default:
        return { valid: true, message: 'Credential appears valid' };
    }
  }

  private async validateAlpacaCredential(credential: ApiCredential): Promise<{ valid: boolean; message: string }> {
    try {
      // Basic validation - check if keys exist and have proper format
      if (!credential.apiKey || !credential.secretKey) {
        return { valid: false, message: 'Missing API key or secret key' };
      }

      if (credential.apiKey.length < 20 || credential.secretKey.length < 30) {
        return { valid: false, message: 'API keys appear to be invalid format' };
      }

      return { valid: true, message: 'Alpaca credentials appear valid' };
    } catch (error) {
      return { valid: false, message: 'Validation failed' };
    }
  }

  private async validateCoinbaseCredential(credential: ApiCredential): Promise<{ valid: boolean; message: string }> {
    try {
      if (!credential.apiKey || !credential.secretKey) {
        return { valid: false, message: 'Missing API key or secret key' };
      }

      return { valid: true, message: 'Coinbase credentials appear valid' };
    } catch (error) {
      return { valid: false, message: 'Validation failed' };
    }
  }

  private async validateOpenAICredential(credential: ApiCredential): Promise<{ valid: boolean; message: string }> {
    try {
      if (!credential.apiKey || !credential.apiKey.startsWith('sk-')) {
        return { valid: false, message: 'Invalid OpenAI API key format' };
      }

      return { valid: true, message: 'OpenAI credentials appear valid' };
    } catch (error) {
      return { valid: false, message: 'Validation failed' };
    }
  }
}

export const apiVaultService = new ApiVaultService();
