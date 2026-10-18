## 2023-11-20 - Firestore Rules Broken Access Control

**Vulnerability:** A broken access control vulnerability existed in the `/notifications` and `/backups` collections in `firestore.rules` where the `write` rule used `(resource == null || resource.data.userId == request.auth.uid)`.

**Learning:** `resource` is null during document creation, so `resource == null` evaluates to true, completely bypassing the `resource.data.userId` check. This allowed any authenticated user to create documents on behalf of other users by spoofing the `userId` field. Shared `write` rules that use `resource == null` to handle creation alongside updates/deletes are a critical security anti-pattern in Firestore.

**Prevention:** Always separate `write` operations into `create`, `update`, and `delete`. For `create` operations, always validate the incoming data using `request.resource.data`. For `update` operations, validate both the existing data (`resource.data`) and the incoming data (`request.resource.data`) to ensure ownership cannot be changed.
