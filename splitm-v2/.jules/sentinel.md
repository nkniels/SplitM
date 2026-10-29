## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-05-18 - [Fix Hardcoded Firebase Secrets]
**Vulnerability:** Hardcoded API keys and project secrets for Firebase were exposed in the source code (`splitm-v2/src/core/config/firebase.ts`) as fallbacks for environment variables.
**Learning:** Even as fallbacks, sensitive keys should never be committed to source code as they can be easily extracted by attackers.
**Prevention:** Use empty strings (`|| ''`) as fallbacks for environment variables that store secrets, ensuring the application fails securely (or handles missing config gracefully) rather than exposing credentials.
