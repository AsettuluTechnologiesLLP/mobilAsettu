import logger from '@utils/logger';
import { Method } from 'axios';

import { http } from './client';

export async function apiCall<T>(
  endpoint: string,
  method: Method,
  data?: Record<string, any>,
): Promise<T> {
  try {
    const res = await http.request<T>({ url: endpoint, method, data });
    return res.data as T;
  } catch (err: any) {
    // Interceptors already logged request/response/error details.
    // This is just a final catch-all.
    logger.error('[API] unhandled error', err?.message);
    throw err;
  }
}
