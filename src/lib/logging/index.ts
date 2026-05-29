import { maskSensitiveData } from "@/lib/logging/mask";
import {
  resolveMinLogLevel,
  shouldLog,
  type LogContext,
  type LogLevel,
  type Logger,
} from "@/lib/logging/types";

function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const prefix = `[${level}]`;
  if (!context || Object.keys(context).length === 0) {
    return `${prefix} ${message}`;
  }
  const safe = maskSensitiveData(context);
  return `${prefix} ${message} ${JSON.stringify(safe)}`;
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level, resolveMinLogLevel())) return;

  const formatted = formatMessage(level, message, context);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

export const logger: Logger = {
  debug: (message, context) => emit("debug", message, context),
  info: (message, context) => emit("info", message, context),
  warn: (message, context) => emit("warn", message, context),
  error: (message, context) => emit("error", message, context),
};

/** Dev-only shorthand (maps to debug). */
export const devLogger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== "development") return;
    logger.debug(message, context);
  },
};

export { maskSensitiveData } from "@/lib/logging/mask";
export type { LogLevel, LogContext, Logger } from "@/lib/logging/types";
