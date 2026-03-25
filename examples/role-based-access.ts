/**
 * @example Role-Based Access Control
 * @description Demonstrates checking permissions for different roles
 * (judge, attorney, litigant) across various case operations.
 */

import { RoleEngine } from '../src/roles/role-engine';
import { AuthProvider } from '../src/auth/provider';

async function main(): Promise<void> {
  // Initialize the role engine with default hierarchy
  const roleEngine = new RoleEngine();

  // Define role hierarchy
  roleEngine.defineHierarchy({
    'system-admin': ['judge', 'clerk', 'attorney', 'advocate', 'litigant'],
    judge: ['clerk'],
    clerk: [],
    attorney: [],
    advocate: [],
    litigant: ['public-viewer'],
    'public-viewer': [],
  });

  // Assign permissions to roles
  roleEngine.assignPermission('judge', 'view-case-documents');
  roleEngine.assignPermission('judge', 'manage-hearings');
  roleEngine.assignPermission('judge', 'view-sealed');
  roleEngine.assignPermission('clerk', 'view-case-documents');
  roleEngine.assignPermission('clerk', 'file-documents');
  roleEngine.assignPermission('attorney', 'view-case-documents');
  roleEngine.assignPermission('attorney', 'file-documents');
  roleEngine.assignPermission('litigant', 'view-case-documents');
  roleEngine.assignPermission('public-viewer', 'view-case-documents');

  // Check permissions for different roles
  console.log('--- Permission Checks ---');

  const judgeCanViewSealed = roleEngine.checkPermission('judge', 'view-sealed');
  console.log(`Judge can view sealed docs: ${judgeCanViewSealed}`); // true

  const attorneyCanViewSealed = roleEngine.checkPermission('attorney', 'view-sealed');
  console.log(`Attorney can view sealed docs: ${attorneyCanViewSealed}`); // false

  const clerkCanFile = roleEngine.checkPermission('clerk', 'file-documents');
  console.log(`Clerk can file documents: ${clerkCanFile}`); // true

  const litigantCanManageHearings = roleEngine.checkPermission('litigant', 'manage-hearings');
  console.log(`Litigant can manage hearings: ${litigantCanManageHearings}`); // false

  // Get all permissions for a role (including inherited)
  const judgePerms = roleEngine.getEffectivePermissions('judge');
  console.log('\nJudge effective permissions:', judgePerms);

  // Get role hierarchy
  const hierarchy = roleEngine.getHierarchy();
  console.log('\nRole hierarchy:', hierarchy);

  // Authenticate and check role
  const auth = new AuthProvider({
    issuer: 'https://auth.justiceos.org',
    clientId: 'court-portal',
  });

  console.log('\n--- Authentication Flow ---');
  const authUrl = auth.getAuthorizationUrl('https://court.example.com/callback');
  console.log('Authorization URL:', authUrl);
}

main().catch(console.error);
