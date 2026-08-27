export type AiErrorCode =
  | "DISABLED"
  | "CONFIGURATION"
  | "NETWORK"
  | "TIMEOUT"
  | "INVALID_RESPONSE";

export class AiProviderError extends Error {
  readonly code: AiErrorCode;
  readonly retryable: boolean;

  constructor(options: {
    code: AiErrorCode;
    message: string;
    retryable: boolean;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "AiProviderError";
    this.code = options.code;
    this.retryable = options.retryable;
  }
}
