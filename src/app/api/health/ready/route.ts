import { getServerEnv } from "@/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import { logger } from "@/infrastructure/logging/logger";
import { sanitizedHealthResponse } from "@/infrastructure/security/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    getServerEnv();

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("readiness timeout")), 2_000);
    });

    await Promise.race([
      prisma.systemMetadata.findUnique({ where: { key: "platform.phase" } }),
      timeout,
    ]);

    return Response.json(
      sanitizedHealthResponse({ status: "ok", checks: { env: "ok", database: "ok" } }),
    );
  } catch (error) {
    logger.error({ event: "health.ready.failed", error }, "Readiness check failed");

    return Response.json(
      sanitizedHealthResponse({
        status: "error",
        checks: { env: "error", database: "error" },
      }),
      { status: 503 },
    );
  }
}
