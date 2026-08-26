export type ProviderErrorCode =
  | "CONFIGURATION"
  | "INVALID_REQUEST"
  | "NETWORK"
  | "RATE_LIMITED"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "NOT_FOUND";

export class ProviderError extends Error {
  readonly providerId: string;
  readonly code: ProviderErrorCode;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(options: {
    providerId: string;
    code: ProviderErrorCode;
    message: string;
    retryable: boolean;
    status?: number;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ProviderError";
    this.providerId = options.providerId;
    this.code = options.code;
    this.retryable = options.retryable;
    this.status = options.status;
  }
}
