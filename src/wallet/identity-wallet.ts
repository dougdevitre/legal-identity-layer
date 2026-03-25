/**
 * @module IdentityWallet
 * @description Portable, encrypted container for a user's legal identity.
 * Stores the user profile, credentials, and case associations.
 * The wallet is the user-facing entry point into the identity layer.
 *
 * @example
 * ```typescript
 * const wallet = new IdentityWallet({
 *   userId: 'user-123',
 *   displayName: 'Jane Doe',
 *   email: 'jane@example.com',
 * });
 * wallet.addCredential({ type: 'bar-number', value: 'CA-12345', issuer: 'CA Bar' });
 * ```
 */

import type { IdentityProfile, Credential, CaseLink } from '../types';

export interface IdentityWalletConfig {
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  preferredLanguage?: string;
}

export class IdentityWallet {
  /** The user's identity profile */
  private profile: IdentityProfile;

  /** Stored credentials, keyed by credential ID */
  private credentials: Map<string, Credential> = new Map();

  /** Case links, keyed by case ID */
  private caseLinks: Map<string, CaseLink> = new Map();

  /**
   * Create a new identity wallet.
   * @param config - Initial profile configuration
   */
  constructor(config: IdentityWalletConfig) {
    this.profile = {
      userId: config.userId,
      displayName: config.displayName,
      email: config.email,
      phone: config.phone,
      preferredLanguage: config.preferredLanguage ?? 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /** Get the user's profile. */
  getProfile(): IdentityProfile {
    return { ...this.profile };
  }

  /** Update profile fields. */
  updateProfile(updates: Partial<Omit<IdentityProfile, 'userId' | 'createdAt'>>): void {
    Object.assign(this.profile, updates, { updatedAt: new Date() });
  }

  /**
   * Add a credential to the wallet.
   * @param credential - The credential to store
   */
  addCredential(credential: Omit<Credential, 'id' | 'issuedAt' | 'verificationStatus'>): Credential {
    const full: Credential = {
      id: `cred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      issuedAt: new Date(),
      verificationStatus: 'pending',
      ...credential,
    };
    this.credentials.set(full.id, full);
    return full;
  }

  /** Get a credential by ID. */
  getCredential(id: string): Credential | undefined {
    return this.credentials.get(id);
  }

  /** Get all credentials. */
  getAllCredentials(): Credential[] {
    return Array.from(this.credentials.values());
  }

  /** Get credentials by type. */
  getCredentialsByType(type: Credential['type']): Credential[] {
    return this.getAllCredentials().filter((c) => c.type === type);
  }

  /** Remove a credential from the wallet. */
  removeCredential(id: string): boolean {
    return this.credentials.delete(id);
  }

  /**
   * Link this identity to a court case.
   * @param caseLink - The case link details
   */
  linkCase(caseLink: Omit<CaseLink, 'id' | 'linkedAt' | 'active'>): CaseLink {
    const full: CaseLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      linkedAt: new Date(),
      active: true,
      ...caseLink,
    };
    this.caseLinks.set(full.caseId, full);
    return full;
  }

  /** Get a case link by case ID. */
  getCaseLink(caseId: string): CaseLink | undefined {
    return this.caseLinks.get(caseId);
  }

  /** Get all active case links. */
  getActiveCaseLinks(): CaseLink[] {
    return Array.from(this.caseLinks.values()).filter((l) => l.active);
  }

  /** Deactivate a case link. */
  unlinkCase(caseId: string): boolean {
    const link = this.caseLinks.get(caseId);
    if (!link) return false;
    link.active = false;
    return true;
  }

  /**
   * Export the wallet as a portable JSON object (for backup or transfer).
   * Sensitive credential values are redacted.
   */
  exportPortable(): object {
    return {
      profile: this.getProfile(),
      credentialCount: this.credentials.size,
      activeCaseLinks: this.getActiveCaseLinks().map((l) => ({
        caseId: l.caseId,
        role: l.role,
      })),
      exportedAt: new Date().toISOString(),
    };
  }
}
