/**
 * @module CredentialStore
 * @description Secure storage and verification of legal credentials such as
 * bar numbers, court IDs, interpreter certifications, and government IDs.
 * Handles credential lifecycle: issuance, verification, expiration, and revocation.
 *
 * @example
 * ```typescript
 * const store = new CredentialStore();
 * const cred = store.issue({
 *   type: 'bar-number',
 *   value: 'CA-12345',
 *   issuer: 'State Bar of California',
 *   userId: 'user-123',
 * });
 * store.verify(cred.id); // Updates status to 'verified'
 * ```
 */

import type { Credential, CredentialType, VerificationStatus } from '../types';

export interface IssueCredentialInput {
  type: CredentialType;
  value: string;
  issuer: string;
  userId: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export class CredentialStore {
  /** All credentials indexed by ID */
  private credentials: Map<string, Credential & { userId: string }> = new Map();

  /** User-to-credential index */
  private userIndex: Map<string, Set<string>> = new Map();

  /**
   * Issue a new credential.
   * @param input - Credential details
   * @returns The issued credential
   */
  issue(input: IssueCredentialInput): Credential {
    const credential: Credential & { userId: string } = {
      id: `cred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: input.type,
      value: input.value,
      issuer: input.issuer,
      issuedAt: new Date(),
      expiresAt: input.expiresAt,
      verificationStatus: 'pending',
      metadata: input.metadata,
      userId: input.userId,
    };

    this.credentials.set(credential.id, credential);

    if (!this.userIndex.has(input.userId)) {
      this.userIndex.set(input.userId, new Set());
    }
    this.userIndex.get(input.userId)!.add(credential.id);

    return credential;
  }

  /**
   * Mark a credential as verified.
   * @param credentialId - The credential to verify
   */
  verify(credentialId: string): boolean {
    return this.updateStatus(credentialId, 'verified');
  }

  /**
   * Revoke a credential.
   * @param credentialId - The credential to revoke
   */
  revoke(credentialId: string): boolean {
    return this.updateStatus(credentialId, 'revoked');
  }

  /**
   * Get a credential by ID.
   */
  get(credentialId: string): Credential | undefined {
    return this.credentials.get(credentialId);
  }

  /**
   * Get all credentials for a user.
   */
  getByUser(userId: string): Credential[] {
    const ids = this.userIndex.get(userId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.credentials.get(id))
      .filter((c): c is Credential & { userId: string } => c !== undefined);
  }

  /**
   * Check if a user has a valid (verified, non-expired) credential of a given type.
   */
  hasValidCredential(userId: string, type: CredentialType): boolean {
    return this.getByUser(userId).some(
      (c) =>
        c.type === type &&
        c.verificationStatus === 'verified' &&
        (!c.expiresAt || c.expiresAt > new Date())
    );
  }

  /** Update the verification status of a credential. */
  private updateStatus(credentialId: string, status: VerificationStatus): boolean {
    const cred = this.credentials.get(credentialId);
    if (!cred) return false;
    cred.verificationStatus = status;
    return true;
  }
}
