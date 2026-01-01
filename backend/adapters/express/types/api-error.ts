export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? 500;
    this.code = code;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError || (
    typeof err === 'object' && err !== null &&
    'message' in err && 'status' in err
  );
}
