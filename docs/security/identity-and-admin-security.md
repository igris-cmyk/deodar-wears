# Identity and Admin Security

Customer sessions are database-backed and revocable. The initial customer policy is seven days absolute lifetime and roughly daily refresh.

Administrator access uses the same user identity with a separate `AdminMembership`. Administrator sessions require active membership, role-derived permissions, MFA, and fresh-session checks for sensitive operations.

Administrator MFA is mandatory. TOTP enrollment and recovery-code helpers are server-only. Recovery codes are generated as one-time values and stored as hashes in `admin_recovery_codes`.

Role changes, bootstrap, MFA enrollment/reset and other sensitive identity events must write append-only audit records. `audit_logs` has database triggers preventing update and delete.

Trusted origins are exact-match only. Wildcard production origins are not allowed.
