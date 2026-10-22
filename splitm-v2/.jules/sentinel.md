## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-05-24 - [Remove Hardcoded Secrets in Firebase Config]
**Vulnerability:** Hardcoded API key, project ID, and other sensitive Firebase configurations in `splitm-v2/src/core/config/firebase.ts`. These were exposed in the source code.
**Learning:** Hardcoded credentials can easily leak and lead to unauthorized usage of services. Always fetch credentials from secure environment variables, and fallback gracefully (e.g. to empty strings) so it fails securely if not configured.
**Prevention:** Never hardcode secrets in source code files. Use `import.meta.env` (for Vite apps) to inject environment variables securely during build, and review configurations to ensure no hardcoded values exist.
