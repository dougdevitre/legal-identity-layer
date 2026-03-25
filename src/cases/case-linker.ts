/**
 * @module CaseLinker
 * @description Links user identities to specific court cases with role-scoped
 * access. Enables the "case-linked credentials" pattern where a user's
 * permissions vary depending on which case they are accessing.
 *
 * @example
 * ```typescript
 * const linker = new CaseLinker();
 * linker.linkUserToCase('user-123', 'case-456', 'parent', 'court-789');
 * linker.getParticipants('case-456'); // [{ userId: 'user-123', role: 'parent' }]
 * ```
 */

import type { CaseLink, Role } from '../types';

export class CaseLinker {
  /** All case links, indexed by a composite key */
  private links: Map<string, CaseLink> = new Map();

  /** Case-to-users index */
  private caseIndex: Map<string, Set<string>> = new Map();

  /** User-to-cases index */
  private userIndex: Map<string, Set<string>> = new Map();

  /**
   * Link a user to a court case with a specific role.
   * @param userId - The user ID
   * @param caseId - The court case identifier
   * @param role - The user's role in this case
   * @param courtId - Optional court/jurisdiction identifier
   * @returns The created case link
   */
  linkUserToCase(userId: string, caseId: string, role: Role, courtId?: string): CaseLink {
    const link: CaseLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      caseId,
      role,
      linkedAt: new Date(),
      active: true,
      courtId,
    };

    const key = `${userId}:${caseId}`;
    this.links.set(key, link);

    if (!this.caseIndex.has(caseId)) this.caseIndex.set(caseId, new Set());
    this.caseIndex.get(caseId)!.add(key);

    if (!this.userIndex.has(userId)) this.userIndex.set(userId, new Set());
    this.userIndex.get(userId)!.add(key);

    return link;
  }

  /**
   * Get all participants (linked users) for a case.
   * @param caseId - The case to look up
   */
  getParticipants(caseId: string): CaseLink[] {
    const keys = this.caseIndex.get(caseId);
    if (!keys) return [];
    return Array.from(keys)
      .map((k) => this.links.get(k))
      .filter((l): l is CaseLink => l !== undefined && l.active);
  }

  /**
   * Get all cases linked to a user.
   * @param userId - The user to look up
   */
  getCasesForUser(userId: string): CaseLink[] {
    const keys = this.userIndex.get(userId);
    if (!keys) return [];
    return Array.from(keys)
      .map((k) => this.links.get(k))
      .filter((l): l is CaseLink => l !== undefined && l.active);
  }

  /**
   * Get the user's role in a specific case.
   */
  getUserRoleInCase(userId: string, caseId: string): Role | undefined {
    const link = this.links.get(`${userId}:${caseId}`);
    return link?.active ? link.role : undefined;
  }

  /**
   * Deactivate a user's link to a case.
   */
  unlinkUserFromCase(userId: string, caseId: string): boolean {
    const link = this.links.get(`${userId}:${caseId}`);
    if (!link) return false;
    link.active = false;
    return true;
  }
}
