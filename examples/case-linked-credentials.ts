/**
 * @example Case-Linked Credentials
 * @description Demonstrates linking identity credentials to court cases,
 * verifying access rights, and managing case-identity associations.
 */

import { IdentityWallet } from '../src/wallet/identity-wallet';
import { CredentialStore } from '../src/wallet/credential-store';
import { CaseLinker } from '../src/cases/case-linker';
import { AuditLogger } from '../src/audit/logger';

async function main(): Promise<void> {
  const auditLogger = new AuditLogger();

  // Create an identity wallet for a user
  const wallet = new IdentityWallet({ auditLogger });
  const profile = await wallet.create({
    userId: 'user-456',
    displayName: 'Jane Smith',
    email: 'jane.smith@example.com',
  });
  console.log('Created identity profile:', profile.userId);

  // Issue credentials
  const credStore = new CredentialStore();
  const barCredential = await credStore.issue({
    type: 'bar-number',
    value: 'CA-123456',
    issuer: 'State Bar of California',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  console.log('Issued credential:', barCredential.id);

  // Add credential to wallet
  await wallet.addCredential(profile.userId, barCredential);
  console.log('Added credential to wallet');

  // Verify the credential
  const verification = await credStore.verify(barCredential.id);
  console.log('Credential verification status:', verification.status);

  // Link identity to a court case
  const caseLinker = new CaseLinker({ auditLogger });
  await caseLinker.linkCase({
    userId: profile.userId,
    caseId: 'CASE-2024-00123',
    role: 'attorney',
    courtId: 'CA-SUP-LA',
  });
  console.log('\nLinked user to case CASE-2024-00123 as attorney');

  // Verify access to the case
  const hasAccess = await caseLinker.verifyAccess(profile.userId, 'CASE-2024-00123');
  console.log('User has access to case:', hasAccess);

  // Get all cases for the user
  const cases = await caseLinker.getCases(profile.userId);
  console.log('User cases:', cases);

  // Query audit log
  const events = await auditLogger.query({
    userId: profile.userId,
    limit: 10,
  });
  console.log('\nAudit events:', events.length);

  // Revoke a credential
  await credStore.revoke(barCredential.id, 'License expired');
  console.log('\nRevoked credential:', barCredential.id);

  // Unlink from case when no longer involved
  await caseLinker.unlinkCase(profile.userId, 'CASE-2024-00123');
  console.log('Unlinked user from case');
}

main().catch(console.error);
