import { randomUUID } from "node:crypto";

import { bootstrapSuperAdmin } from "../src/modules/admin/bootstrap";

const email = process.argv[2];
const reason = process.argv.slice(3).join(" ") || "Initial controlled admin bootstrap";

if (!email) {
  console.error(
    'Usage: pnpm exec tsx scripts/bootstrap-admin.ts admin@example.com "reason"',
  );
  process.exit(1);
}

await bootstrapSuperAdmin({
  email,
  requestId: randomUUID(),
  reason,
})
  .then(() => {
    console.log("Admin bootstrap completed.");
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Admin bootstrap failed.");
    process.exitCode = 1;
  });
