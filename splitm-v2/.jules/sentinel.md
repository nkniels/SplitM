## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2026-10-30 - [Remove Hardcoded Firebase Secrets]
**Vulnerability:** Hardcoded Firebase API keys and project configuration in frontend code.
**Learning:** Using production values as OR fallbacks in Vite environment variable parsing exposes secrets if environment variables are missing, increasing risk of unauthorized access.
**Prevention:** Always use empty strings as fallbacks for environment variables containing secrets in frontend configuration to ensure secure failure if configuration is missing.
