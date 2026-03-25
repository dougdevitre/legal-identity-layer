# Legal Identity Layer Data Model

## Entity Relationship Diagram

```mermaid
erDiagram
    IDENTITY_PROFILE {
        string userId PK
        string displayName
        string email
        datetime createdAt
        datetime updatedAt
    }

    CREDENTIAL {
        string id PK
        string userId FK
        string type "bar-number | court-id | government-id | ..."
        string value
        string issuer
        datetime issuedAt
        datetime expiresAt
        string status "pending | verified | expired | revoked"
    }

    ROLE_ASSIGNMENT {
        string id PK
        string userId FK
        string role "system-admin | judge | clerk | attorney | ..."
        datetime assignedAt
        string assignedBy
    }

    ROLE_HIERARCHY {
        string parentRole FK
        string childRole FK
    }

    PERMISSION {
        string id PK
        string role FK
        string permission "view-case-documents | file-documents | ..."
    }

    CASE_LINK {
        string id PK
        string userId FK
        string caseId
        string role
        string courtId
        datetime linkedAt
        datetime unlinkedAt
    }

    AUTH_SESSION {
        string id PK
        string userId FK
        string accessToken
        string refreshToken
        datetime issuedAt
        datetime expiresAt
        string provider "oidc | sso | local"
    }

    MFA_CONFIG {
        string id PK
        string userId FK
        string method "totp | sms | email | webauthn"
        string secret
        boolean enabled
        datetime setupAt
    }

    SSO_SESSION {
        string id PK
        string userId FK
        string provider
        string externalId
        datetime createdAt
        datetime lastValidatedAt
    }

    AUDIT_EVENT {
        string id PK
        string userId FK
        string eventType "login | logout | role-assigned | ..."
        json details
        string ipAddress
        datetime timestamp
    }

    IDENTITY_PROFILE ||--o{ CREDENTIAL : holds
    IDENTITY_PROFILE ||--o{ ROLE_ASSIGNMENT : has
    IDENTITY_PROFILE ||--o{ CASE_LINK : participates
    IDENTITY_PROFILE ||--o{ AUTH_SESSION : authenticates
    IDENTITY_PROFILE ||--o{ MFA_CONFIG : configures
    IDENTITY_PROFILE ||--o{ SSO_SESSION : links
    IDENTITY_PROFILE ||--o{ AUDIT_EVENT : generates
    ROLE_HIERARCHY ||--o{ ROLE_HIERARCHY : inherits
    ROLE_ASSIGNMENT }o--|| PERMISSION : grants
```

## Key Relationships

- An **Identity Profile** is the root entity representing a user in the justice system
- **Credentials** (bar numbers, court IDs) are stored in the user's wallet and independently verifiable
- **Role Assignments** connect users to system roles which grant **Permissions** via a hierarchy
- **Case Links** associate a user with specific court cases in a particular role
- **Auth Sessions** track active authentication state including OAuth/OIDC tokens
- **MFA Config** stores multi-factor authentication setup per user
- **SSO Sessions** link external identity provider sessions to internal profiles
- **Audit Events** provide a complete trail of all authentication and authorization actions
