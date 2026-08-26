export type ResearchCollectionErrorCode =
  | "PROJECT_NOT_FOUND"
  | "PROJECT_BUSY"
  | "PROVIDER_NOT_FOUND"
  | "COLLECTION_FAILED";

export class ResearchCollectionError extends Error {
  readonly code: ResearchCollectionErrorCode;

  constructor(code: ResearchCollectionErrorCode, message: string) {
    super(message);
    this.name = "ResearchCollectionError";
    this.code = code;
  }
}
