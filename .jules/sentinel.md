## 2025-02-14 - Fix IDOR Risk in Firestore Rules and Prevent Information Leakage in UI
**Vulnerability:**
1. Missing Authorization Check in Firestore Rules: The `members`, `expenses`, and `settlements` collections were readable and writable by any authenticated user because they only checked `isAuthenticated()`.
2. Information Leakage: `splitm-v2/src/main.tsx` rendered the full error object directly in the UI DOM when an unhandled application mount error occurred.

**Learning:**
1. While `isAuthenticated()` ensures users are logged in, it doesn't verify if they have the rights to access or modify specific resources, leading to potential Insecure Direct Object Reference (IDOR) vulnerabilities where users could access or modify other groups' financial data. Root collections and subcollections must have strict access controls validating the ownership relationship.
2. Outputting raw errors directly to the client can leak internal implementation details, such as paths and file structures, and exposes a potential XSS vulnerability since error objects can sometimes contain unsanitized input.

**Prevention:**
1. Always apply fine-grained authorization using the data model's structure, like `isGroupOwner(groupId)` or matching the `resource.data.groupId` against the requestor's authenticated context. Never assume an authenticated user is an authorized user for a specific document.
2. Always replace unhandled or client-facing errors with generic secure error messages instead of raw error objects.
