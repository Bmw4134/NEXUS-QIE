
import { Request, Response } from 'express';
import crypto from 'crypto';

interface StoredAPIKey {
  id: string;
  service: string;
  keyName: string;
  keyValue: string;
  status: 'active' | 'inactive' | 'expired' | 'rate_limited';
  usageCount: number;
  lastUsed: string;
  environment: 'development' | 'production' | 'testing';
  description: string;
  createdAt: string;
  updatedAt: string;
}

class APIVaultService {
  private keys: Map<string, StoredAPIKey> = new Map();
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.VAULT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.loadKeysFromEnvironment();
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return encryptedText; // Return as-is if not encrypted
    }
  }

  private loadKeysFromEnvironment(): void {
    // Load existing environment variables as API keys
    const envKeys = [
      { name: 'OPENAI_API_KEY', service: 'OpenAI' },
      { name: 'ALPACA_API_KEY', service: 'Alpaca' },
      { name: 'ALPACA_SECRET_KEY', service: 'Alpaca' },
      { name: 'COINBASE_API_KEY', service: 'Coinbase' },
      { name: 'COINBASE_API_SECRET', service: 'Coinbase' },
      { name: 'PERPLEXITY_API_KEY', service: 'Perplexity' },
      { name: 'ANTHROPIC_API_KEY', service: 'Anthropic' },
      { name: 'XAI_API_KEY', service: 'xAI' }
    ];

    envKeys.forEach(({ name, service }) => {
      const value = process.env[name];
      if (value) {
        const id = crypto.randomUUID();
        this.keys.set(id, {
          id,
          service,
          keyName: name,
          keyValue: value,
          status: 'active',
          usageCount: 0,
          lastUsed: 'Never',
          environment: 'development',
          description: `Loaded from environment variable`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
  }

  getAllKeys(): StoredAPIKey[] {
    return Array.from(this.keys.values()).map(key => ({
      ...key,
      keyValue: this.maskKey(key.keyValue)
    }));
  }

  getKey(id: string): StoredAPIKey | null {
    return this.keys.get(id) || null;
  }

  addKey(keyData: Omit<StoredAPIKey, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed' | 'status'>): StoredAPIKey {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newKey: StoredAPIKey = {
      id,
      ...keyData,
      keyValue: this.encrypt(keyData.keyValue),
      status: 'active',
      usageCount: 0,
      lastUsed: 'Never',
      createdAt: now,
      updatedAt: now
    };

    this.keys.set(id, newKey);
    
    // Also set as environment variable for immediate use
    process.env[keyData.keyName] = keyData.keyValue;
    
    return {
      ...newKey,
      keyValue: this.maskKey(keyData.keyValue)
    };
  }

  updateKey(id: string, updates: Partial<StoredAPIKey>): StoredAPIKey | null {
    const existingKey = this.keys.get(id);
    if (!existingKey) return null;

    const updatedKey = {
      ...existingKey,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.keyValue) {
      updatedKey.keyValue = this.encrypt(updates.keyValue);
      // Update environment variable
      process.env[existingKey.keyName] = updates.keyValue;
    }

    this.keys.set(id, updatedKey);
    
    return {
      ...updatedKey,
      keyValue: this.maskKey(this.decrypt(updatedKey.keyValue))
    };
  }

  deleteKey(id: string): boolean {
    const key = this.keys.get(id);
    if (!key) return false;

    // Remove from environment
    delete process.env[key.keyName];
    
    return this.keys.delete(id);
  }

  incrementUsage(keyName: string): void {
    const key = Array.from(this.keys.values()).find(k => k.keyName === keyName);
    if (key) {
      key.usageCount++;
      key.lastUsed = new Date().toLocaleString();
      this.keys.set(key.id, key);
    }
  }

  validateKey(service: string, keyValue: string): Promise<boolean> {
    // Add service-specific validation logic here
    return Promise.resolve(true);
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  }

  getKeysByService(service: string): StoredAPIKey[] {
    return Array.from(this.keys.values())
      .filter(key => key.service === service)
      .map(key => ({
        ...key,
        keyValue: this.maskKey(key.keyValue)
      }));
  }

  getKeyStatistics() {
    const keys = Array.from(this.keys.values());
    return {
      total: keys.length,
      active: keys.filter(k => k.status === 'active').length,
      inactive: keys.filter(k => k.status === 'inactive').length,
      byService: keys.reduce((acc, key) => {
        acc[key.service] = (acc[key.service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalUsage: keys.reduce((sum, key) => sum + key.usageCount, 0)
    };
  }
}

export const apiVaultService = new APIVaultService();

// Express route handlers
export const getAPIKeys = (req: Request, res: Response) => {
  try {
    const keys = apiVaultService.getAllKeys();
    const stats = apiVaultService.getKeyStatistics();
    
    res.json({
      success: true,
      keys,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys'
    });
  }
};

export const addAPIKey = (req: Request, res: Response) => {
  try {
    const { service, keyName, keyValue, environment, description } = req.body;
    
    if (!service || !keyName || !keyValue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: service, keyName, keyValue'
      });
    }

    const newKey = apiVaultService.addKey({
      service,
      keyName,
      keyValue,
      environment: environment || 'development',
      description: description || ''
    });

    res.json({
      success: true,
      key: newKey,
      message: 'API key added successfully'
    });
  } catch (error) {
    console.error('Error adding API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add API key'
    });
  }
};

export const updateAPIKey = (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const updates = req.body;
    
    const updatedKey = apiVaultService.updateKey(keyId, updates);
    
    if (!updatedKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    res.json({
      success: true,
      key: updatedKey,
      message: 'API key updated successfully'
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update API key'
    });
  }
};

export const deleteAPIKey = (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    
    const deleted = apiVaultService.deleteKey(keyId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key'
    });
  }
};

export const getKeysByService = (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const keys = apiVaultService.getKeysByService(service);
    
    res.json({
      success: true,
      keys,
      service
    });
  } catch (error) {
    console.error('Error fetching keys by service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch keys by service'
    });
  }
};
