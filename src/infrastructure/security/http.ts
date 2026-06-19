export function methodNotAllowed(allowed: readonly string[]): Response {
  return Response.json(
    { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
    { status: 405, headers: { Allow: allowed.join(", ") } },
  );
}

export function sanitizedHealthResponse(input: {
  status: "ok" | "degraded" | "error";
  checks?: Record<string, "ok" | "error" | "skipped">;
}) {
  return {
    status: input.status,
    checks: input.checks,
  };
}
