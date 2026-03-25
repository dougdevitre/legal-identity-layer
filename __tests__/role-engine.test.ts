/**
 * @module RoleEngine Tests
 * @description Tests for the RoleEngine class covering role assignment,
 * permission checking, and hierarchy management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoleEngine } from '../src/roles/role-engine';

describe('RoleEngine', () => {
  let engine: RoleEngine;

  beforeEach(() => {
    engine = new RoleEngine();
    engine.defineHierarchy({
      'system-admin': ['judge', 'clerk', 'attorney'],
      judge: ['clerk'],
      clerk: [],
      attorney: [],
      litigant: ['public-viewer'],
      'public-viewer': [],
    });

    engine.assignPermission('judge', 'view-case-documents');
    engine.assignPermission('judge', 'manage-hearings');
    engine.assignPermission('judge', 'view-sealed');
    engine.assignPermission('clerk', 'view-case-documents');
    engine.assignPermission('clerk', 'file-documents');
    engine.assignPermission('attorney', 'view-case-documents');
    engine.assignPermission('attorney', 'file-documents');
    engine.assignPermission('litigant', 'view-case-documents');
  });

  describe('assignRole', () => {
    it('should assign a role to a user', () => {
      engine.assignRole('user-1', 'judge');
      const roles = engine.getUserRoles('user-1');
      expect(roles).toContain('judge');
    });

    it('should allow multiple roles for a single user', () => {
      engine.assignRole('user-1', 'judge');
      engine.assignRole('user-1', 'attorney');
      const roles = engine.getUserRoles('user-1');
      expect(roles).toContain('judge');
      expect(roles).toContain('attorney');
    });

    it('should not duplicate roles', () => {
      engine.assignRole('user-1', 'judge');
      engine.assignRole('user-1', 'judge');
      const roles = engine.getUserRoles('user-1');
      expect(roles.filter((r) => r === 'judge')).toHaveLength(1);
    });
  });

  describe('checkPermission', () => {
    it('should return true when role has the permission', () => {
      expect(engine.checkPermission('judge', 'view-sealed')).toBe(true);
    });

    it('should return false when role lacks the permission', () => {
      expect(engine.checkPermission('attorney', 'view-sealed')).toBe(false);
    });

    it('should inherit permissions from child roles in hierarchy', () => {
      // Judge inherits clerk permissions via hierarchy
      expect(engine.checkPermission('judge', 'view-case-documents')).toBe(true);
    });

    it('should return false for unknown roles', () => {
      expect(engine.checkPermission('unknown-role' as any, 'view-sealed')).toBe(false);
    });
  });

  describe('getHierarchy', () => {
    it('should return the full role hierarchy', () => {
      const hierarchy = engine.getHierarchy();
      expect(hierarchy).toBeDefined();
      expect(hierarchy['system-admin']).toContain('judge');
    });

    it('should show leaf roles with empty children', () => {
      const hierarchy = engine.getHierarchy();
      expect(hierarchy['clerk']).toEqual([]);
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return direct and inherited permissions', () => {
      const perms = engine.getEffectivePermissions('judge');
      expect(perms).toContain('view-sealed');
      expect(perms).toContain('view-case-documents');
    });

    it('should return empty set for roles with no permissions', () => {
      const perms = engine.getEffectivePermissions('public-viewer');
      expect(perms).toEqual([]);
    });
  });
});
