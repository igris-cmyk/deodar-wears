import { redactValue } from "./redaction";

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogFields = Record<string, unknown> & {
  event: string;
  requestId?: string;
  correlationId?: string;
};

export type Logger = {
  debug(fields: LogFields, message?: string): void;
  info(fields: LogFields, message?: string): void;
  warn(fields: LogFields, message?: string): void;
  error(fields: LogFields, message?: string): void;
  child(fields: Record<string, unknown>): Logger;
};

function write(
  level: LogLevel,
  base: Record<string, unknown>,
  fields: LogFields,
  message?: string,
) {
  const payload = redactValue({
    timestamp: new Date().toISOString(),
    level,
    environment: process.env.APP_ENV ?? "unknown",
    service: "deodar-wears",
    message,
    ...base,
    ...fields,
  });

  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function createLogger(base: Record<string, unknown> = {}): Logger {
  return {
    debug: (fields, message) => write("debug", base, fields, message),
    info: (fields, message) => write("info", base, fields, message),
    warn: (fields, message) => write("warn", base, fields, message),
    error: (fields, message) => write("error", base, fields, message),
    child: (fields) => createLogger({ ...base, ...fields }),
  };
}

export const logger = createLogger();
