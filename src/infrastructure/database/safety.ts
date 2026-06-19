import { ApplicationError } from "@/infrastructure/errors/application-error";

export function assertNonProductionDatabase(input: {
  appEnv: string;
  databaseUrl: string;
}): void {
  if (input.appEnv === "production") {
    throw new ApplicationError({
      code: "CONFIGURATION_ERROR",
      message: "Destructive database operation refused in production.",
      status: 500,
    });
  }

  if (/prod|production/i.test(input.databaseUrl)) {
    throw new ApplicationError({
      code: "CONFIGURATION_ERROR",
      message:
        "Destructive database operation refused for production-looking database URL.",
      status: 500,
    });
  }
}
