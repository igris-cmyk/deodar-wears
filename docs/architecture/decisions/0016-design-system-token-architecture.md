# 0016 Design-System Token Architecture

Status: Accepted
Date: 2026-06-17

Context: Deodar Wears needs an Alpine Editorial Utility visual foundation before catalogue pages exist.

Decision: Centralize color, typography, shape, spacing, focus and motion tokens in `src/styles/globals.css`, and build lightweight primitives over those tokens.

Alternatives: Default shadcn styling, one-off Tailwind values, external component kit.

Consequences: Future pages inherit a coherent visual language without fake commerce content.

Security impact: No direct security impact, but accessible focus and form states reduce operational mistakes.

Reversal conditions: A finalized brand system replaces the text-based token foundation.

Exact package versions: Tailwind CSS 4.3.1, Next.js 16.2.9.
