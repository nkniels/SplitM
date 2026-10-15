## 2026-10-15 - [Fix Null Reference Vulnerability in Firestore Rules]
**Vulnerability:** Read and delete access to `expenses` collection evaluated `request.resource.data`, which does not exist for those actions. This resulted in an evaluation error that silently denied all read and delete access.
**Learning:** `request.resource` in Firestore only exists on incoming write operations (create, update).
**Prevention:** Separate rule evaluation for `read`/`delete` vs `create`/`update` so payload evaluation is only executed when an incoming payload actually exists.
