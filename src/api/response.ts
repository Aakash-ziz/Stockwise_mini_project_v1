import type { ApiResponseMetadata, ApiPagination } from './types';
import type { ApiError } from './errors';

/**
 * Standard HTTP success response data wrapper.
 * Design ensures all payload wrappers remain consistent.
 */
export interface ApiResponse<TData = any> {
  success: boolean;
  data: TData;
  pagination?: ApiPagination;
  metadata?: ApiResponseMetadata;
  message?: string;
  error?: ApiError;
}
