## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2026-10-23 - [Hardcoded Firebase Secrets in Config]
**Vulnerability:** CRITICAL - Hardcoded Firebase API keys and secrets in `splitm-v2/src/core/config/firebase.ts`. If committed to a public repository, these secrets can be exposed, leading to unauthorized database access, quota exhaustion, or data breaches.
**Learning:** Hardcoded secrets in client-side applications (like Vite/React) or any configuration files represent a significant risk. Even though Firebase API keys for web are meant to be public, they should not be hardcoded as they shouldn't bypass CI/CD environment configurations or be exposed in source control unnecessarily, and other config variables shouldn't leak either.
**Prevention:** Always use environment variables (`import.meta.env.VITE_...` in Vite) and implement safe fallbacks like empty strings (`|| ''`) to ensure failures occur securely if variables are missing instead of falling back to insecure hardcoded defaults.
