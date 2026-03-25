/**
 * @module IdentityWallet Tests
 * @description Tests for the IdentityWallet class covering wallet creation,
 * credential management, and revocation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityWallet } from '../src/wallet/identity-wallet';
import { AuditLogger } from '../src/audit/logger';

describe('IdentityWallet', () => {
  let wallet: IdentityWallet;

  beforeEach(() => {
    const auditLogger = new AuditLogger();
    wallet = new IdentityWallet({ auditLogger });
  });

  describe('create', () => {
    it('should create a new identity profile', async () => {
      const profile = await wallet.create({
        userId: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
      });
      expect(profile).toBeDefined();
      expect(profile.userId).toBe('user-1');
      expect(profile.displayName).toBe('John Doe');
    });

    it('should reject duplicate user IDs', async () => {
      await wallet.create({
        userId: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
      });
      await expect(
        wallet.create({
          userId: 'user-1',
          displayName: 'Jane Doe',
          email: 'jane@example.com',
        })
      ).rejects.toThrow();
    });

    it('should set creation timestamp', async () => {
      const profile = await wallet.create({
        userId: 'user-2',
        displayName: 'Test User',
        email: 'test@example.com',
      });
      expect(profile.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('addCredential', () => {
    it('should add a credential to a user wallet', async () => {
      await wallet.create({
        userId: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
      });

      await wallet.addCredential('user-1', {
        id: 'cred-1',
        type: 'bar-number',
        value: 'CA-123456',
        issuer: 'State Bar of California',
        issuedAt: new Date(),
        status: 'verified',
      });

      const profile = await wallet.get('user-1');
      expect(profile?.credentials).toHaveLength(1);
    });

    it('should throw if user does not exist', async () => {
      await expect(
        wallet.addCredential('nonexistent', {
          id: 'cred-1',
          type: 'bar-number',
          value: 'CA-123456',
          issuer: 'State Bar',
          issuedAt: new Date(),
          status: 'verified',
        })
      ).rejects.toThrow();
    });
  });

  describe('revokeCredential', () => {
    it('should revoke an existing credential', async () => {
      await wallet.create({
        userId: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
      });

      await wallet.addCredential('user-1', {
        id: 'cred-1',
        type: 'court-id',
        value: 'COURT-789',
        issuer: 'Superior Court',
        issuedAt: new Date(),
        status: 'verified',
      });

      await wallet.revokeCredential('user-1', 'cred-1', 'Expired');
      const profile = await wallet.get('user-1');
      const cred = profile?.credentials.find((c) => c.id === 'cred-1');
      expect(cred?.status).toBe('revoked');
    });

    it('should throw if credential does not exist', async () => {
      await wallet.create({
        userId: 'user-1',
        displayName: 'John Doe',
        email: 'john@example.com',
      });
      await expect(
        wallet.revokeCredential('user-1', 'nonexistent', 'Reason')
      ).rejects.toThrow();
    });
  });
});
