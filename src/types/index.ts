/**
 * @module @justice-os/identity/types
 * @description Core type definitions for the Legal Identity Layer.
 * Defines roles, permissions, credentials, identity profiles,
 * case links, and audit structures.
 */

/** System-defined roles in the justice ecosystem */
export type Role =
  | 'system-admin'
  | 'judge'
  | 'clerk'
  | 'attorney'
  | 'advocate'
  | 'parent'
  | 'litigant'
  | 'public-viewer';

/** Permission identifiers for access control */
export type Permission =
  | 'view-case-documents'
  | 'file-documents'
  | 'manage-hearings'
  | 'assign-roles'
  | 'view-sealed'
  | 'manage-notifications'
  | 'edit-case-data'
  | 'export-data'
  | 'admin-settings';

/** Credential types that can be stored in the identity wallet */
export type CredentialType =
  | 'bar-number'
  | 'court-id'
  | 'government-id'
  | 'court-appointment'
  | 'legal-aid-affiliation'
  | 'interpreter-certification';

/** Status of a credential verification */
export type VerificationStatus = 'pending' | 'verified' | 'expired' | 'revoked';

/** MFA method types */
export type MFAMethod = 'totp' | 'sms' | 'email' | 'webauthn';

/** Auth event types for audit logging */
export type AuthEventType =
  | 'login'
  | 'logout'
  | 'login-failed'
  | 'mfa-challenge'
  | 'mfa-verified'
  | 'token-issued'
  | 'token-refreshed'
  | 'token-revoked'
  | 'role-assigned'
  | 'role-revoked'
  | 'permission-checked'
  | 'sso-session-created'
  | 'sso-session-validated';

/**
 * A verifiable credential stored in the identity wallet.
 */
export interface Credential {
  /** Unique credential ID */
  id: string;
  /** Type of credential */
  type: CredentialType;
  /** The credential value (e.g., bar number) */
  value: string;
  /** Who issued this credential */
  issuer: string;
  /** When the credential was issued */
  issuedAt: Date;
  /** When the credential expires (if applicable) */
  expiresAt?: Date;
  /** Current verification status */
  verificationStatus: VerificationStatus;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * A user's identity profile in the Justice OS ecosystem.
 */
export interface IdentityProfile {
  /** Unique user identifier */
  userId: string;
  /** Display name */
  displayName: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Preferred language */
  preferredLanguage?: string;
  /** When the profile was created */
  createdAt: Date;
  /** When the profile was last updated */
  updatedAt: Date;
  /** Whether the profile email is verified */
  emailVerified?: boolean;
  /** Whether the profile phone is verified */
  phoneVerified?: boolean;
}

/**
 * A link between a user identity and a court case.
 */
export interface CaseLink {
  /** Unique link identifier */
  id: string;
  /** The user ID */
  userId: string;
  /** The case identifier */
  caseId: string;
  /** The role the user holds in this case */
  role: Role;
  /** When the link was established */
  linkedAt: Date;
  /** Whether this link is currently active */
  active: boolean;
  /** Court or jurisdiction identifier */
  courtId?: string;
}

/**
 * A role assignment scoped to a specific case or global.
 */
export interface RoleAssignment {
  /** The user ID */
  userId: string;
  /** The assigned role */
  role: Role;
  /** Case scope (undefined = global role) */
  caseId?: string;
  /** When the role was assigned */
  assignedAt: Date;
  /** Who assigned the role */
  assignedBy?: string;
  /** When the role expires (if applicable) */
  expiresAt?: Date;
}

/**
 * An entry in the audit log.
 */
export interface AuditEntry {
  /** Unique audit entry ID */
  id: string;
  /** Timestamp of the event */
  timestamp: Date;
  /** Type of auth event */
  eventType: AuthEventType;
  /** The user involved */
  userId: string;
  /** IP address of the request */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Which application triggered the event */
  applicationId?: string;
  /** Whether the action succeeded */
  success: boolean;
  /** Additional event details */
  details?: Record<string, unknown>;
}

/**
 * Configuration for the AuthProvider.
 */
export interface AuthProviderConfig {
  /** OIDC issuer URL */
  issuer: string;
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 client secret (for confidential clients) */
  clientSecret?: string;
  /** Redirect URI after authentication */
  redirectUri?: string;
  /** Scopes to request */
  scopes?: string[];
  /** Whether MFA is required */
  requireMFA?: boolean;
}

/**
 * Configuration for the SSO Manager.
 */
export interface SSOConfig {
  /** SSO session timeout in seconds */
  sessionTimeout: number;
  /** Allowed application origins */
  allowedOrigins: string[];
  /** Token signing key */
  signingKey: string;
}
