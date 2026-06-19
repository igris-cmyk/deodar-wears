import { ApplicationError } from "./application-error";

export type SafeErrorResponse = {
  error: {
    code: string;
    message: string;
    reference: string;
  };
  status: number;
};

export function mapErrorToSafeResponse(
  error: unknown,
  reference: string,
  production = process.env.APP_ENV === "production",
): SafeErrorResponse {
  if (error instanceof ApplicationError) {
    return {
      status: error.status,
      error: {
        code: error.code,
        message: error.expose && !production ? error.message : safeMessage(error.status),
        reference,
      },
    };
  }

  return {
    status: 500,
    error: {
      code: "INTERNAL_ERROR",
      message: safeMessage(500),
      reference,
    },
  };
}

function safeMessage(status: number): string {
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "The request conflicts with current state.";
  if (status === 429) return "Too many requests.";
  return "The request could not be completed.";
}
