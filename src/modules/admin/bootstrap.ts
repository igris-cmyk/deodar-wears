import "server-only";

import { prisma } from "@/infrastructure/database/prisma";
import { ApplicationError } from "@/infrastructure/errors/application-error";
import { withCommerceTransaction } from "@/infrastructure/transactions/commerce-transaction";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { normalizeEmail } from "@/modules/auth/auth.schemas";

export async function bootstrapSuperAdmin(input: {
  email: string;
  requestId: string;
  reason: string;
}) {
  const email = normalizeEmail(input.email);

  return withCommerceTransaction(async (transaction) => {
    const user = await transaction.user.findUnique({ where: { email } });

    if (!user?.emailVerified) {
      throw new ApplicationError({
        code: "EMAIL_NOT_VERIFIED",
        message: "Bootstrap requires an existing verified user.",
        status: 400,
      });
    }

    const membership = await transaction.adminMembership.upsert({
      where: { userId: user.id },
      update: {
        active: true,
        disabledAt: null,
        requiresMfa: true,
      },
      create: {
        userId: user.id,
        active: true,
        requiresMfa: true,
      },
    });

    const role = await transaction.adminRole.findUniqueOrThrow({
      where: { code: "SUPER_ADMIN" },
    });

    await transaction.adminMembershipRole.upsert({
      where: {
        adminMembershipId_roleId: {
          adminMembershipId: membership.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        adminMembershipId: membership.id,
        roleId: role.id,
      },
    });

    await writeAuditLog(
      {
        actorType: "SYSTEM",
        action: "ADMIN_BOOTSTRAPPED",
        entityType: "AdminMembership",
        entityId: membership.id,
        requestId: input.requestId,
        reason: input.reason,
        afterData: { userId: user.id, role: "SUPER_ADMIN", requiresMfa: true },
      },
      transaction,
    );

    return membership;
  });
}

export async function getAdminSummary() {
  return prisma.adminMembership.count();
}
