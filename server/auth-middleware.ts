/**
 * NEXUS Centralized Authentication Middleware
 * JWT-based authentication with role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  level: number;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  sessionId: string;
  lastActivity: Date;
  permissions: string[];
}

export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  maxSessions: number;
  sessionTimeout: number;
}

export class AuthMiddleware {
  private config: AuthConfig;
  private activeSessions: Map<string, AuthenticatedUser> = new Map();
  private refreshTokens: Map<string, string> = new Map();
  private blacklistedTokens: Set<string> = new Set();

  constructor() {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || 'nexus-quantum-secret-key-2024',
      tokenExpiry: '1h',
      refreshTokenExpiry: '7d',
      maxSessions: 5,
      sessionTimeout: 30 * 60 * 1000 // 30 minutes
    };
    this.initializeRoles();
  }

  private initializeRoles() {
    // Watson-level access (highest)
    const watsonRole: UserRole = {
      id: 'watson',
      name: 'Watson Administrator',
      permissions: [
        'system:admin',
        'trading:execute',
        'trading:real-money',
        'config:modify',
        'users:manage',
        'security:override',
        'quantum:access',
        'deployment:control'
      ],
      level: 100
    };

    // BM-level access
    const bmRole: UserRole = {
      id: 'bm',
      name: 'Business Manager',
      permissions: [
        'trading:view',
        'trading:execute',
        'analytics:view',
        'reports:generate',
        'canvas:manage',
        'family:admin'
      ],
      level: 80
    };

    // Standard user access
    const userRole: UserRole = {
      id: 'user',
      name: 'Standard User',
      permissions: [
        'trading:view',
        'analytics:view',
        'canvas:view',
        'family:participate'
      ],
      level: 40
    };
  }

  generateToken(user: AuthenticatedUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      roles: user.roles.map(r => r.id),
      permissions: user.permissions,
      sessionId: user.sessionId
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.tokenExpiry,
      issuer: 'nexus-quantum-platform',
      audience: 'nexus-users'
    });
  }

  generateRefreshToken(userId: string): string {
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.config.jwtSecret,
      { expiresIn: this.config.refreshTokenExpiry }
    );
    
    this.refreshTokens.set(refreshToken, userId);
    return refreshToken;
  }

  verifyToken(token: string): AuthenticatedUser | null {
    try {
      if (this.blacklistedTokens.has(token)) {
        return null;
      }

      const decoded = jwt.verify(token, this.config.jwtSecret) as any;
      const user = this.activeSessions.get(decoded.sessionId);
      
      if (!user) {
        return null;
      }

      // Check session timeout
      if (Date.now() - user.lastActivity.getTime() > this.config.sessionTimeout) {
        this.activeSessions.delete(decoded.sessionId);
        return null;
      }

      // Update last activity
      user.lastActivity = new Date();
      
      return user;
    } catch (error) {
      return null;
    }
  }

  authenticate() {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Valid authentication token required' 
        });
      }

      const token = authHeader.substring(7);
      const user = this.verifyToken(token);

      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid or expired token' 
        });
      }

      (req as any).user = user;
      next();
    };
  }

  requirePermission(permission: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user as AuthenticatedUser;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
      }

      if (!user.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Permission '${permission}' required` 
        });
      }

      next();
    };
  }

  requireRole(roleId: string, minLevel?: number) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user as AuthenticatedUser;
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Authentication required' 
        });
      }

      const hasRole = user.roles.some(role => role.id === roleId);
      const hasMinLevel = minLevel ? user.roles.some(role => role.level >= minLevel) : true;

      if (!hasRole && !hasMinLevel) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Role '${roleId}' required` 
        });
      }

      next();
    };
  }

  createSession(userData: {
    id: string;
    username: string;
    email: string;
    roleIds: string[];
  }): { token: string; refreshToken: string; user: AuthenticatedUser } {
    
    const sessionId = this.generateSessionId();
    const roles = this.getRolesByIds(userData.roleIds);
    const permissions = this.aggregatePermissions(roles);

    const user: AuthenticatedUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      roles,
      sessionId,
      lastActivity: new Date(),
      permissions
    };

    // Limit concurrent sessions
    this.limitUserSessions(userData.id);
    
    this.activeSessions.set(sessionId, user);
    
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(userData.id);

    return { token, refreshToken, user };
  }

  refreshSession(refreshToken: string): { token: string; refreshToken: string } | null {
    try {
      const decoded = jwt.verify(refreshToken, this.config.jwtSecret) as any;
      
      if (decoded.type !== 'refresh' || !this.refreshTokens.has(refreshToken)) {
        return null;
      }

      const userId = this.refreshTokens.get(refreshToken)!;
      
      // Find user's active session
      const userSession = Array.from(this.activeSessions.values())
        .find(session => session.id === userId);

      if (!userSession) {
        this.refreshTokens.delete(refreshToken);
        return null;
      }

      // Generate new tokens
      const newToken = this.generateToken(userSession);
      const newRefreshToken = this.generateRefreshToken(userId);
      
      // Remove old refresh token
      this.refreshTokens.delete(refreshToken);
      
      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      return null;
    }
  }

  revokeSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  revokeAllUserSessions(userId: string): number {
    let revokedCount = 0;
    
    for (const [sessionId, user] of this.activeSessions.entries()) {
      if (user.id === userId) {
        this.activeSessions.delete(sessionId);
        revokedCount++;
      }
    }
    
    return revokedCount;
  }

  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
    
    // Clean up old blacklisted tokens periodically
    if (this.blacklistedTokens.size > 10000) {
      this.cleanupBlacklist();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRolesByIds(roleIds: string[]): UserRole[] {
    // In production, this would fetch from database
    const allRoles: UserRole[] = [
      {
        id: 'watson',
        name: 'Watson Administrator',
        permissions: ['system:admin', 'trading:execute', 'trading:real-money', 'config:modify', 'users:manage'],
        level: 100
      },
      {
        id: 'bm',
        name: 'Business Manager',
        permissions: ['trading:view', 'trading:execute', 'analytics:view', 'reports:generate'],
        level: 80
      },
      {
        id: 'user',
        name: 'Standard User',
        permissions: ['trading:view', 'analytics:view'],
        level: 40
      }
    ];

    return allRoles.filter(role => roleIds.includes(role.id));
  }

  private aggregatePermissions(roles: UserRole[]): string[] {
    const permissions = new Set<string>();
    roles.forEach(role => {
      role.permissions.forEach(permission => permissions.add(permission));
    });
    return Array.from(permissions);
  }

  private limitUserSessions(userId: string): void {
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([_, user]) => user.id === userId)
      .sort(([_, a], [__, b]) => b.lastActivity.getTime() - a.lastActivity.getTime());

    // Remove oldest sessions if limit exceeded
    if (userSessions.length >= this.config.maxSessions) {
      const sessionsToRemove = userSessions.slice(this.config.maxSessions - 1);
      sessionsToRemove.forEach(([sessionId]) => {
        this.activeSessions.delete(sessionId);
      });
    }
  }

  private cleanupBlacklist(): void {
    // Keep only recent tokens (simple cleanup)
    const tokensArray = Array.from(this.blacklistedTokens);
    this.blacklistedTokens.clear();
    
    // Keep last 5000 tokens
    tokensArray.slice(-5000).forEach(token => {
      this.blacklistedTokens.add(token);
    });
  }

  getSessionMetrics() {
    return {
      activeSessions: this.activeSessions.size,
      blacklistedTokens: this.blacklistedTokens.size,
      refreshTokens: this.refreshTokens.size,
      sessionTimeout: this.config.sessionTimeout,
      maxSessions: this.config.maxSessions
    };
  }

  getActiveSessions(): AuthenticatedUser[] {
    return Array.from(this.activeSessions.values());
  }
}

export const authMiddleware = new AuthMiddleware();