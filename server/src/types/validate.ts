export interface ValidateError<T = Record<string, string>> {
  status: false;
  error: T;
}
