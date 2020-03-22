import { ValidationError } from "yup";

export const formatYupError = (
  err: ValidationError,
): Array<{ path: string; message: string }> =>
  err.inner.map(({ path, message }) => ({ path, message }));
