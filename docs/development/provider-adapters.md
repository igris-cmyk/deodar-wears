# Provider Adapters

Phase 0 defines boundaries for Razorpay, Resend, Cloudinary, Upstash, and Inngest. Razorpay, Resend, and Cloudinary are boundary-only and intentionally do not return fake production success.

Provider SDK types must remain in `src/infrastructure/*`. Domain and UI code should depend on internal contracts only.
