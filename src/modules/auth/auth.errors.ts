import { ApplicationError } from "@/infrastructure/errors/application-error";

export function authError(
  code: ApplicationError["code"],
  message = "Sign in is required.",
) {
  return new ApplicationError({
    code,
    message,
    status: code === "PERMISSION_DENIED" ? 403 : 401,
    expose: false,
  });
}
