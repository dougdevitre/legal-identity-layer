# Legal Identity Layer — Architecture

## Overview

The Legal Identity Layer provides a unified authentication and authorization system for the Justice OS ecosystem. It combines an identity wallet (portable user profile), an OAuth2/OIDC auth provider, a role-based access control engine, and case-linking capabilities — all backed by comprehensive audit logging.

---

## 1. Identity Wallet Model

The identity wallet is a portable, encrypted container for a user's legal identity, credentials, and case associations.

```mermaid
graph TD
    subgraph IdentityWallet
        UP[UserProfile<br/>name, email, phone]
        CS[CredentialStore<br/>bar number, court ID, etc.]
        CL[CaseLinks<br/>case-123, case-456]
        RP[RoleProfile<br/>parent, attorney, clerk]
    end

    subgraph Storage
        ENC[Encrypted at Rest]
        KEY[Key Derivation<br/>from user passphrase]
    end

    UP --> ENC
    CS --> ENC
    CL --> ENC
    RP --> ENC
    KEY --> ENC
```

---

## 2. Authentication Flow

The auth provider implements standard OAuth2/OIDC flows with optional MFA, supporting both interactive and machine-to-machine authentication.

```mermaid
sequenceDiagram
    participant User
    participant App as Client App
    participant Auth as AuthProvider
    participant MFA as MFAHandler
    participant Wallet as IdentityWallet
    participant Audit as AuditLogger

    User->>App: Click "Sign In"
    App->>Auth: Authorization request
    Auth->>User: Login form
    User->>Auth: Credentials
    Auth->>Auth: Validate credentials
    Auth->>MFA: Check MFA requirement
    MFA-->>Auth: MFA verified
    Auth->>Wallet: Load identity
    Wallet-->>Auth: UserProfile + roles
    Auth->>Audit: Log auth event
    Auth-->>App: Access token + ID token
    App-->>User: Authenticated session
```

---

## 3. Role Hierarchy

Roles form a hierarchy where higher-privilege roles inherit permissions from lower ones. Each role can be scoped to a specific case.

```mermaid
graph TD
    ADMIN[System Admin] --> JUDGE[Judge]
    ADMIN --> CLERK[Clerk]
    JUDGE --> ATTORNEY[Attorney]
    CLERK --> ATTORNEY
    ATTORNEY --> ADVOCATE[Community Advocate]
    ADVOCATE --> PARENT[Parent / Litigant]
    PARENT --> PUBLIC[Public Viewer]

    subgraph Permissions
        P1["view-case-documents"]
        P2["file-documents"]
        P3["manage-hearings"]
        P4["assign-roles"]
        P5["view-sealed"]
    end

    PARENT -.-> P1
    ATTORNEY -.-> P1
    ATTORNEY -.-> P2
    CLERK -.-> P3
    JUDGE -.-> P5
    ADMIN -.-> P4
```

---

## 4. Cross-Platform SSO Flow

SSO enables a single authentication event to grant access across all Justice OS applications, using federated token exchange.

```mermaid
sequenceDiagram
    participant User
    participant AppA as Court Portal
    participant SSO as SSOManager
    participant AppB as Legal Aid Platform
    participant AppC as Evidence Vault

    User->>AppA: Login
    AppA->>SSO: Create SSO session
    SSO-->>AppA: SSO token

    User->>AppB: Navigate to Legal Aid
    AppB->>SSO: Validate SSO token
    SSO->>SSO: Verify + check roles
    SSO-->>AppB: Scoped access token
    AppB-->>User: Authenticated

    User->>AppC: Navigate to Evidence Vault
    AppC->>SSO: Validate SSO token
    SSO-->>AppC: Scoped access token
    AppC-->>User: Authenticated
```

---

## Data Flow Summary

1. **User creates identity** -> `IdentityWallet` stores encrypted profile + credentials
2. **User logs in** -> `AuthProvider` handles OAuth2/OIDC flow with optional MFA
3. **Role engine** -> assigns case-scoped roles and evaluates permissions
4. **Case linker** -> binds identity to specific court cases
5. **SSO manager** -> enables seamless cross-platform authentication
6. **Audit logger** -> records every auth event for compliance
