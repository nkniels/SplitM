## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-05-18 - [Remove Hardcoded Firebase API Keys]
**Vulnerability:** Hardcoded API keys and configuration secrets in `splitm-v2/src/core/config/firebase.ts`. These fallback values could leak production or sensitive development credentials when environmental variables are omitted.
**Learning:** Hardcoded fallbacks in configuration files are an anti-pattern for sensitive secrets, as they bypass environmental configurations and leak into the frontend bundle.
**Prevention:** Always use empty string fallbacks (`|| ''`) for sensitive environment variables in configuration definitions, allowing the application to securely fail fast rather than exposing static credentials.
