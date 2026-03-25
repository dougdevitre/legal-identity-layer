/**
 * @example SSO Integration
 * @description Demonstrates setting up cross-platform SSO with role-based
 * access checking across multiple Justice OS applications.
 *
 * Run: npx ts-node examples/sso-integration.ts
 */

import {
  IdentityWallet,
  RoleEngine,
  SSOManager,
  CaseLinker,
  AuditLogger,
} from '../src';

// ── 1. Set up the identity wallet ───────────────────────────────────

const wallet = new IdentityWallet({
  userId: 'user-jane-doe',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1-555-0123',
});

// Add a credential
wallet.addCredential({
  type: 'government-id',
  value: 'DL-9876543',
  issuer: 'State DMV',
});

console.log('=== Identity Wallet ===');
console.log(`Profile: ${wallet.getProfile().displayName}`);
console.log(`Credentials: ${wallet.getAllCredentials().length}`);

// ── 2. Link to a case ───────────────────────────────────────────────

const caseLinkManager = new CaseLinker();
const link = caseLinkManager.linkUserToCase(
  'user-jane-doe',
  'case-eviction-2024-001',
  'parent',
  'court-municipal-downtown'
);

wallet.linkCase({
  userId: 'user-jane-doe',
  caseId: 'case-eviction-2024-001',
  role: 'parent',
  courtId: 'court-municipal-downtown',
});

console.log(`\nLinked to case: ${link.caseId} as ${link.role}`);

// ── 3. Set up roles ────────────────────────────────────────────────

const roles = new RoleEngine();
roles.assignRole('user-jane-doe', 'parent', { caseId: 'case-eviction-2024-001' });

console.log('\n=== Role-Based Access ===');
console.log(
  `Can view documents: ${roles.hasPermission('user-jane-doe', 'view-case-documents', 'case-eviction-2024-001')}`
);
console.log(
  `Can file documents: ${roles.hasPermission('user-jane-doe', 'file-documents', 'case-eviction-2024-001')}`
);
console.log(
  `Can manage hearings: ${roles.hasPermission('user-jane-doe', 'manage-hearings', 'case-eviction-2024-001')}`
);
console.log(
  `Can view sealed: ${roles.hasPermission('user-jane-doe', 'view-sealed', 'case-eviction-2024-001')}`
);

// ── 4. SSO across platforms ────────────────────────────────────────

const sso = new SSOManager({
  sessionTimeout: 3600,
  allowedOrigins: [
    'https://court-portal.example.com',
    'https://legalaid.example.com',
    'https://evidence-vault.example.com',
  ],
  signingKey: 'demo-signing-key',
});

const session = sso.createSession('user-jane-doe', ['parent']);

console.log('\n=== SSO Session ===');
console.log(`Token: ${session.token}`);
console.log(`Expires: ${session.expiresAt.toISOString()}`);

// Validate from different apps
const courtAccess = sso.validateSession(session.token, 'https://court-portal.example.com');
const legalAidAccess = sso.validateSession(session.token, 'https://legalaid.example.com');
const unknownAccess = sso.validateSession(session.token, 'https://unknown-app.example.com');

console.log(`\nCourt Portal access: ${courtAccess ? 'GRANTED' : 'DENIED'}`);
console.log(`Legal Aid access: ${legalAidAccess ? 'GRANTED' : 'DENIED'}`);
console.log(`Unknown App access: ${unknownAccess ? 'GRANTED' : 'DENIED'}`);

// ── 5. Audit logging ───────────────────────────────────────────────

const audit = new AuditLogger();
audit.log({
  eventType: 'login',
  userId: 'user-jane-doe',
  success: true,
  applicationId: 'court-portal',
  ipAddress: '192.168.1.1',
});
audit.log({
  eventType: 'sso-session-created',
  userId: 'user-jane-doe',
  success: true,
  applicationId: 'court-portal',
});
audit.log({
  eventType: 'sso-session-validated',
  userId: 'user-jane-doe',
  success: true,
  applicationId: 'legalaid',
});

console.log('\n=== Audit Log ===');
const userEvents = audit.queryByUser('user-jane-doe');
for (const event of userEvents) {
  console.log(`  [${event.eventType}] success=${event.success} app=${event.applicationId ?? 'N/A'}`);
}
