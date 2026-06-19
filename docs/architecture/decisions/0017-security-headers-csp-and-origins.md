# 0017 Security Headers, CSP and Origins

Status: Accepted
Date: 2026-06-17

Context: Identity endpoints need secure defaults without blocking later provider integrations.

Decision: Keep CSP in report-only mode, enforce exact trusted origins for mutations, and retain hardened baseline headers.

Alternatives: Wide CSP wildcards, disabled origin checks.

Consequences: Razorpay and Cloudinary origins must be added intentionally in later phases.

Security impact: Reduces XSS, clickjacking and cross-origin mutation risk.

Reversal conditions: CSP reports prove the policy is ready for enforced mode.

Exact package versions: Next.js 16.2.9, Better Auth 1.6.19.
