"use client";

export default function GlobalError({
  error,
}: Readonly<{ error: Error & { digest?: string } }>) {
  return (
    <html lang="en-IN">
      <body>
        <main id="main-content" style={{ padding: "4rem", fontFamily: "sans-serif" }}>
          <p>Deodar Wears</p>
          <h1>Unexpected platform failure.</h1>
          <p>Reference: {error.digest ?? "unavailable"}</p>
        </main>
      </body>
    </html>
  );
}
