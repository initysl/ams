import { AxiosError } from "axios";

export type ApiErrorData = {
  message?: string;
  error?: string;
  code?: string;
  email?: string;
  nextAttemptTime?: string;
  retryAfter?: number;
  remainingAttempts?: number;
  attemptsUsed?: number;
  success?: boolean;
  valid?: boolean;
};

export const asApiError = (error: unknown): AxiosError<ApiErrorData> =>
  error as AxiosError<ApiErrorData>;

export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const apiError = asApiError(error);

  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    apiError.message ||
    fallback
  );
};
