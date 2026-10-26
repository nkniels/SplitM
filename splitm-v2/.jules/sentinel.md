## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-05-18 - [Fix Hardcoded Firebase API Key]
**Vulnerability:** CRITICAL - The Firebase configuration file (`src/core/config/firebase.ts`) contained a hardcoded API key and other Firebase configuration parameters as fallback values for environment variables.
**Learning:** Hardcoding sensitive configuration values (like API keys) exposes the application to unauthorized access and abuse if the source code is compromised or accidentally leaked.
**Prevention:** Always use environment variables for sensitive configuration parameters and provide secure defaults (like empty strings `''`) to ensure the application fails securely if the environment variables are not set.
