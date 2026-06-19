import { serve } from "inngest/next";

import { inngest } from "@/infrastructure/jobs/inngest";
import { platformHealthCheckFunction } from "@/infrastructure/jobs/platform-health";

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [platformHealthCheckFunction],
});
