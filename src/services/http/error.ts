import ERROR_MESSAGES from '@constants/errors';
import axios, { AxiosError } from 'axios';

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    if (!ax.response) {
      if (ax.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
      return ERROR_MESSAGES.UNKNOWN_ERROR || 'Network error. Please check your connection.';
    }
    const data = ax.response.data;
    if (typeof data === 'string') return data;
    if (data?.error) return String(data.error); // { error: "Invalid OTP" }
    if (data?.message) return String(data.message); // { message: "..." }
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first.length) return String(first[0]);
    }
    return `Request failed (${ax.response.status})`;
  }
  return (err as any)?.message ?? 'Something went wrong';
}
