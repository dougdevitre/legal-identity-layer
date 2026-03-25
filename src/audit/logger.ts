/**
 * @module AuditLogger
 * @description Records all authentication and authorization events for
 * compliance, security review, and forensic analysis. Every login,
 * role change, token operation, and permission check is logged.
 *
 * @example
 * ```typescript
 * const logger = new AuditLogger();
 * logger.log({
 *   eventType: 'login',
 *   userId: 'user-123',
 *   success: true,
 *   details: { method: 'password', applicationId: 'court-portal' },
 * });
 * const events = logger.queryByUser('user-123', { eventType: 'login' });
 * ```
 */

import type { AuditEntry, AuthEventType } from '../types';

export interface AuditLogInput {
  eventType: AuthEventType;
  userId: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  applicationId?: string;
  details?: Record<string, unknown>;
}

export interface AuditQueryOptions {
  eventType?: AuthEventType;
  startDate?: Date;
  endDate?: Date;
  successOnly?: boolean;
  limit?: number;
}

export class AuditLogger {
  /** In-memory audit log (replace with persistent storage in production) */
  private entries: AuditEntry[] = [];

  /**
   * Log an authentication or authorization event.
   * @param input - The event details
   * @returns The created audit entry
   */
  log(input: AuditLogInput): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
      ...input,
    };
    this.entries.push(entry);
    return entry;
  }

  /**
   * Query audit entries for a specific user.
   * @param userId - The user to query
   * @param options - Optional filters
   */
  queryByUser(userId: string, options: AuditQueryOptions = {}): AuditEntry[] {
    return this.query({ ...options, userId });
  }

  /**
   * Query audit entries with flexible filters.
   */
  query(
    options: AuditQueryOptions & { userId?: string } = {}
  ): AuditEntry[] {
    let results = [...this.entries];

    if (options.userId) {
      results = results.filter((e) => e.userId === options.userId);
    }
    if (options.eventType) {
      results = results.filter((e) => e.eventType === options.eventType);
    }
    if (options.startDate) {
      results = results.filter((e) => e.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter((e) => e.timestamp <= options.endDate!);
    }
    if (options.successOnly) {
      results = results.filter((e) => e.success);
    }

    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Get the total count of entries.
   */
  getCount(): number {
    return this.entries.length;
  }

  /**
   * Get recent failed login attempts for security monitoring.
   * @param userId - The user to check
   * @param windowMinutes - Time window in minutes
   */
  getRecentFailedLogins(userId: string, windowMinutes: number = 30): AuditEntry[] {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    return this.entries.filter(
      (e) =>
        e.userId === userId &&
        e.eventType === 'login-failed' &&
        e.timestamp >= cutoff
    );
  }
}
