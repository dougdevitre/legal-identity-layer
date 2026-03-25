/**
 * @module PermissionMatrix
 * @description Defines and manages the mapping between roles and permissions.
 * Provides utilities for querying, validating, and displaying the
 * permission matrix across the Justice OS ecosystem.
 *
 * @example
 * ```typescript
 * const matrix = new PermissionMatrix();
 * matrix.getPermissions('attorney'); // ['view-case-documents', 'file-documents', ...]
 * matrix.getRolesWithPermission('manage-hearings'); // ['judge', 'clerk']
 * ```
 */

import type { Role, Permission } from '../types';

/** A single entry in the permission matrix */
export interface PermissionEntry {
  /** The permission identifier */
  permission: Permission;
  /** Human-readable description */
  description: string;
  /** Which roles have this permission directly (not inherited) */
  directRoles: Role[];
  /** Whether this permission is considered sensitive */
  sensitive: boolean;
}

/** Default permission definitions */
const PERMISSION_DEFINITIONS: PermissionEntry[] = [
  {
    permission: 'view-case-documents',
    description: 'View documents associated with a case',
    directRoles: ['attorney', 'advocate', 'parent', 'litigant'],
    sensitive: false,
  },
  {
    permission: 'file-documents',
    description: 'File new documents with the court',
    directRoles: ['attorney', 'parent'],
    sensitive: false,
  },
  {
    permission: 'manage-hearings',
    description: 'Schedule, reschedule, or cancel hearings',
    directRoles: ['judge', 'clerk'],
    sensitive: true,
  },
  {
    permission: 'assign-roles',
    description: 'Assign or revoke roles for other users',
    directRoles: ['system-admin'],
    sensitive: true,
  },
  {
    permission: 'view-sealed',
    description: 'View sealed or confidential case materials',
    directRoles: ['judge'],
    sensitive: true,
  },
  {
    permission: 'manage-notifications',
    description: 'Configure notification rules and channels',
    directRoles: ['clerk'],
    sensitive: false,
  },
  {
    permission: 'edit-case-data',
    description: 'Modify case metadata and details',
    directRoles: ['clerk', 'attorney'],
    sensitive: true,
  },
  {
    permission: 'export-data',
    description: 'Export case data and reports',
    directRoles: ['system-admin'],
    sensitive: true,
  },
  {
    permission: 'admin-settings',
    description: 'Manage system-wide settings and configuration',
    directRoles: ['system-admin'],
    sensitive: true,
  },
];

export class PermissionMatrix {
  private definitions: Map<Permission, PermissionEntry> = new Map();

  constructor() {
    for (const def of PERMISSION_DEFINITIONS) {
      this.definitions.set(def.permission, def);
    }
  }

  /**
   * Get the description of a permission.
   */
  getDescription(permission: Permission): string | undefined {
    return this.definitions.get(permission)?.description;
  }

  /**
   * Get all roles that directly hold a permission.
   */
  getRolesWithPermission(permission: Permission): Role[] {
    return this.definitions.get(permission)?.directRoles ?? [];
  }

  /**
   * Check if a permission is classified as sensitive.
   */
  isSensitive(permission: Permission): boolean {
    return this.definitions.get(permission)?.sensitive ?? false;
  }

  /**
   * Get all permission entries.
   */
  getAllPermissions(): PermissionEntry[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get only sensitive permissions.
   */
  getSensitivePermissions(): PermissionEntry[] {
    return this.getAllPermissions().filter((p) => p.sensitive);
  }
}
