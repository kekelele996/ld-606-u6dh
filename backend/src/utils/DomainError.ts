import type { ErrorCode } from "../constants/errorCodes";

/**
 * Domain-level business exception. Services throw it; controllers re-wrap it
 * into an HTTP response instead of swallowing everything in one global place.
 */
export class DomainError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly vars: Record<string, string | number>;

  constructor(code: ErrorCode, message: string, vars: Record<string, string | number> = {}, status = 409) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
    this.vars = vars;
  }
}
