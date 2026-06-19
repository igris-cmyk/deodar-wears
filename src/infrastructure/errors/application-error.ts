export const errorCodes = [
  "VALIDATION_FAILED",
  "INVALID_INPUT",
  "CONFIGURATION_ERROR",
  "AUTHENTICATION_REQUIRED",
  "SESSION_EXPIRED",
  "SESSION_NOT_FRESH",
  "MFA_REQUIRED",
  "PERMISSION_DENIED",
  "RESOURCE_NOT_OWNED",
  "USER_DISABLED",
  "ADMIN_MEMBERSHIP_INACTIVE",
  "EMAIL_NOT_VERIFIED",
  "INVALID_CREDENTIALS",
  "VERIFICATION_TOKEN_INVALID",
  "VERIFICATION_TOKEN_EXPIRED",
  "PASSWORD_RESET_TOKEN_INVALID",
  "PASSWORD_RESET_TOKEN_EXPIRED",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
  "DATABASE_UNAVAILABLE",
  "SERIALIZATION_RETRY_EXHAUSTED",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export class ApplicationError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;
  public readonly expose: boolean;
  public readonly retryable: boolean;
  public readonly details?: unknown;

  public constructor(input: {
    code: ErrorCode;
    message: string;
    status?: number;
    expose?: boolean;
    retryable?: boolean;
    details?: unknown;
    cause?: unknown;
  }) {
    super(input.message, { cause: input.cause });
    this.name = "ApplicationError";
    this.code = input.code;
    this.status = input.status ?? 500;
    this.expose = input.expose ?? false;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
  }
}

export function configurationError(message: string, cause?: unknown): ApplicationError {
  return new ApplicationError({
    code: "CONFIGURATION_ERROR",
    message,
    status: 500,
    expose: false,
    retryable: false,
    cause,
  });
}
