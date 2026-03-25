/**
 * @module SSOManager
 * @description Cross-platform Single Sign-On manager for the Justice OS ecosystem.
 * Enables a single authentication event to grant access across all connected
 * applications (court portals, legal aid platforms, evidence storage, etc.).
 *
 * @example
 * ```typescript
 * const sso = new SSOManager({
 *   sessionTimeout: 3600,
 *   allowedOrigins: ['https://court.example.com', 'https://legalaid.example.com'],
 *   signingKey: process.env.SSO_SIGNING_KEY!,
 * });
 * const session = sso.createSession('user-123', ['parent']);
 * const isValid = sso.validateSession(session.token, 'https://legalaid.example.com');
 * ```
 */

import type { SSOConfig, Role } from '../types';

/** An active SSO session */
export interface SSOSession {
  /** Session token */
  token: string;
  /** The authenticated user ID */
  userId: string;
  /** Roles available in this session */
  roles: Role[];
  /** When the session was created */
  createdAt: Date;
  /** When the session expires */
  expiresAt: Date;
}

export class SSOManager {
  private config: SSOConfig;
  private sessions: Map<string, SSOSession> = new Map();

  constructor(config: SSOConfig) {
    this.config = config;
  }

  /**
   * Create a new SSO session after successful authentication.
   * @param userId - The authenticated user ID
   * @param roles - Roles to include in the session
   * @returns The created SSO session
   */
  createSession(userId: string, roles: Role[]): SSOSession {
    const token = this.generateToken();
    const session: SSOSession = {
      token,
      userId,
      roles,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout * 1000),
    };
    this.sessions.set(token, session);
    return session;
  }

  /**
   * Validate an SSO session token and check origin allowlisting.
   * @param token - The SSO session token
   * @param origin - The requesting application's origin
   * @returns The session if valid, null otherwise
   */
  validateSession(token: string, origin: string): SSOSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    if (!this.config.allowedOrigins.includes(origin)) {
      return null;
    }
    return session;
  }

  /**
   * Revoke an SSO session.
   * @param token - The session token to revoke
   */
  revokeSession(token: string): boolean {
    return this.sessions.delete(token);
  }

  /**
   * Revoke all sessions for a user.
   * @param userId - The user whose sessions to revoke
   */
  revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }

  /** Generate a secure session token. */
  private generateToken(): string {
    // TODO: Use crypto.randomBytes in production
    return `sso-${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;
  }
}
