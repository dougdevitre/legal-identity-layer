/**
 * @module @justice-os/identity
 * @description Universal Legal Identity Layer — login once, access everything
 * in the Justice OS ecosystem. Provides identity wallet, auth, roles, SSO,
 * and audit logging.
 */

export { IdentityWallet } from './wallet/identity-wallet';
export { CredentialStore } from './wallet/credential-store';
export { AuthProvider } from './auth/provider';
export { SSOManager } from './auth/sso';
export { MFAHandler } from './auth/mfa';
export { RoleEngine } from './roles/role-engine';
export { PermissionMatrix } from './roles/permissions';
export { CaseLinker } from './cases/case-linker';
export { AuditLogger } from './audit/logger';

export type {
  Role,
  Permission,
  CredentialType,
  VerificationStatus,
  MFAMethod,
  AuthEventType,
  Credential,
  IdentityProfile,
  CaseLink,
  RoleAssignment,
  AuditEntry,
  AuthProviderConfig,
  SSOConfig,
} from './types';
