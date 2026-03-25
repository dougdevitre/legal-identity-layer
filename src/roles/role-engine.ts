/**
 * @module RoleEngine
 * @description Manages role assignment, hierarchy checking, and permission
 * evaluation for users across the Justice OS ecosystem. Roles can be
 * scoped globally or to specific court cases.
 *
 * The role hierarchy ensures that higher-privilege roles inherit the
 * permissions of lower ones (e.g., a judge inherits attorney permissions).
 *
 * @example
 * ```typescript
 * const engine = new RoleEngine();
 * engine.assignRole('user-123', 'parent', { caseId: 'case-456' });
 * engine.hasPermission('user-123', 'view-case-documents', 'case-456'); // true
 * engine.hasPermission('user-123', 'manage-hearings', 'case-456');     // false
 * ```
 */

import type { Role, Permission, RoleAssignment } from '../types';

/** Role hierarchy: each role and the roles it inherits from */
const ROLE_HIERARCHY: Record<Role, Role[]> = {
  'system-admin': ['judge', 'clerk', 'attorney', 'advocate', 'parent', 'litigant', 'public-viewer'],
  'judge': ['attorney', 'advocate', 'parent', 'litigant', 'public-viewer'],
  'clerk': ['attorney', 'advocate', 'parent', 'litigant', 'public-viewer'],
  'attorney': ['advocate', 'parent', 'litigant', 'public-viewer'],
  'advocate': ['parent', 'litigant', 'public-viewer'],
  'parent': ['litigant', 'public-viewer'],
  'litigant': ['public-viewer'],
  'public-viewer': [],
};

/** Permissions granted to each role (direct, not inherited) */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'system-admin': ['admin-settings', 'assign-roles', 'export-data'],
  'judge': ['view-sealed', 'manage-hearings'],
  'clerk': ['manage-hearings', 'edit-case-data', 'manage-notifications'],
  'attorney': ['file-documents', 'view-case-documents', 'edit-case-data'],
  'advocate': ['view-case-documents'],
  'parent': ['view-case-documents', 'file-documents'],
  'litigant': ['view-case-documents'],
  'public-viewer': [],
};

export class RoleEngine {
  /** All role assignments, keyed by `userId:caseId` or `userId:global` */
  private assignments: Map<string, RoleAssignment[]> = new Map();

  /**
   * Assign a role to a user, optionally scoped to a case.
   * @param userId - The user to assign the role to
   * @param role - The role to assign
   * @param options - Optional case scope and metadata
   */
  assignRole(
    userId: string,
    role: Role,
    options: { caseId?: string; assignedBy?: string; expiresAt?: Date } = {}
  ): RoleAssignment {
    const assignment: RoleAssignment = {
      userId,
      role,
      caseId: options.caseId,
      assignedAt: new Date(),
      assignedBy: options.assignedBy,
      expiresAt: options.expiresAt,
    };

    const key = this.makeKey(userId, options.caseId);
    const existing = this.assignments.get(key) ?? [];
    existing.push(assignment);
    this.assignments.set(key, existing);

    return assignment;
  }

  /**
   * Revoke a role from a user.
   * @param userId - The user to revoke the role from
   * @param role - The role to revoke
   * @param caseId - Optional case scope
   */
  revokeRole(userId: string, role: Role, caseId?: string): boolean {
    const key = this.makeKey(userId, caseId);
    const assignments = this.assignments.get(key);
    if (!assignments) return false;

    const filtered = assignments.filter((a) => a.role !== role);
    if (filtered.length === assignments.length) return false;

    this.assignments.set(key, filtered);
    return true;
  }

  /**
   * Get all roles assigned to a user for a specific case (or globally).
   * @param userId - The user ID
   * @param caseId - Optional case scope
   * @returns Array of assigned roles
   */
  getRoles(userId: string, caseId?: string): Role[] {
    const key = this.makeKey(userId, caseId);
    const assignments = this.assignments.get(key) ?? [];
    return assignments
      .filter((a) => !a.expiresAt || a.expiresAt > new Date())
      .map((a) => a.role);
  }

  /**
   * Check if a user has a specific permission, considering role hierarchy.
   * Checks both case-scoped and global roles.
   * @param userId - The user ID
   * @param permission - The permission to check
   * @param caseId - Optional case scope
   * @returns True if the user has the permission
   */
  hasPermission(userId: string, permission: Permission, caseId?: string): boolean {
    // Collect roles from both case-scoped and global assignments
    const roles = new Set<Role>();

    if (caseId) {
      for (const role of this.getRoles(userId, caseId)) {
        roles.add(role);
      }
    }
    for (const role of this.getRoles(userId)) {
      roles.add(role);
    }

    // Check each role and its inherited roles
    for (const role of roles) {
      if (this.roleHasPermission(role, permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a role has a permission, including inherited permissions.
   * @param role - The role to check
   * @param permission - The permission to look for
   */
  roleHasPermission(role: Role, permission: Permission): boolean {
    // Direct permissions
    if (ROLE_PERMISSIONS[role]?.includes(permission)) {
      return true;
    }

    // Inherited permissions
    for (const inheritedRole of ROLE_HIERARCHY[role] ?? []) {
      if (ROLE_PERMISSIONS[inheritedRole]?.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all permissions available to a role (direct + inherited).
   * @param role - The role to query
   */
  getPermissionsForRole(role: Role): Permission[] {
    const permissions = new Set<Permission>();

    // Direct permissions
    for (const perm of ROLE_PERMISSIONS[role] ?? []) {
      permissions.add(perm);
    }

    // Inherited permissions
    for (const inheritedRole of ROLE_HIERARCHY[role] ?? []) {
      for (const perm of ROLE_PERMISSIONS[inheritedRole] ?? []) {
        permissions.add(perm);
      }
    }

    return Array.from(permissions);
  }

  /**
   * Check if one role outranks another in the hierarchy.
   * @param roleA - The potentially higher role
   * @param roleB - The potentially lower role
   */
  outranks(roleA: Role, roleB: Role): boolean {
    return ROLE_HIERARCHY[roleA]?.includes(roleB) ?? false;
  }

  /**
   * Get all role assignments (for audit/admin purposes).
   */
  getAllAssignments(): RoleAssignment[] {
    const all: RoleAssignment[] = [];
    for (const assignments of this.assignments.values()) {
      all.push(...assignments);
    }
    return all;
  }

  /** Generate a storage key from userId and optional caseId */
  private makeKey(userId: string, caseId?: string): string {
    return `${userId}:${caseId ?? 'global'}`;
  }
}
