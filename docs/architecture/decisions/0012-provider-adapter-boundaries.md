# 0012 Provider Adapter Boundaries

Status: Accepted
Date: 2026-06-17

Context: Razorpay, Resend, Cloudinary, and Upstash integrations will arrive in later phases.

Decision: Define typed provider interfaces now and fail safely when production adapters are unconfigured.

Alternatives considered: Installing all SDKs immediately, fake success adapters.

Consequences: Later phases can add SDK-specific implementations without leaking provider payloads into domain code.

Security impact: Prevents accidental production success with test mocks.

Operational impact: Missing provider configuration is explicit and observable.

Reversal conditions: A provider is replaced before implementation.

Relevant versions: Upstash Redis 1.38.0, Upstash Ratelimit 2.0.8.
