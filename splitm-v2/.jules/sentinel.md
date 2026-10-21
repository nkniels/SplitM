## 2024-05-18 - [Fix Firestore Rules Missing Authz & Null Ref]
**Vulnerability:** IDOR in Firestore rules. Subcollections and root collections (`members`, `expenses`, `settlements`) were allowing any authenticated user to write or delete documents. Also, combining `read`/`write` rules while checking `request.resource.data` led to null reference errors during `read` or `delete` because `request.resource` is only available during writes.
**Learning:** Always check ownership (e.g., `isGroupOwner`) for write operations. Never evaluate `request.resource.data` on a rule that allows `read` or `delete`.
**Prevention:** Separate `read`/`delete` from `create`/`update` rules. Validate ownership via `groupId` for subcollections and root collections.

## 2024-10-21 - [Fix IDOR and Auth Bypass in Firestore Rules]
**Vulnerability:** IDOR and Authorization Bypass in `firestore.rules`. The `update` rules in root collections and `groups` only checked the existing or incoming state but not both, allowing users to modify document ownership parameters and hijack resources. Additionally, the `notifications` and `backups` rules used a combined `write` permission checking `resource == null`, allowing any authenticated user to create records for other users.
**Learning:** `allow update` must always validate ownership constraints for BOTH the current data (`resource.data`) and the incoming data (`request.resource.data`). The check `resource == null` in a combined `write` rule will bypass all constraints on `request.resource.data` during document creation.
**Prevention:** Separate `create`, `update`, and `delete` operations in Firestore rules. Enforce ownership validation consistently on `resource.data` and `request.resource.data` to prevent unauthorized modification or creation.
