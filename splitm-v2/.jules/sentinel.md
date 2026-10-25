## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-05-18 - [Remove Hardcoded Firebase Secrets]
**Vulnerability:** Hardcoded API keys and secrets in `splitm-v2/src/core/config/firebase.ts`. Hardcoding secrets in source code could result in credential exposure.
**Learning:** Always use environment variables for sensitive configuration details. The fallback values shouldn't be the actual secrets, but rather an empty string that can fail securely when missing or properly validated before usage.
**Prevention:** In Vite projects, ensure `import.meta.env` values fall back to an empty string (`''`) or throw an error during configuration initialization instead of supplying the hardcoded key.
