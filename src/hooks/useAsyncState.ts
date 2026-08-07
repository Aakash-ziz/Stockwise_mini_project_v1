import { useState, useCallback, useRef } from 'react';
import type { AsyncState } from '../types/ui';

/**
 * Reusable React custom hook for standardizing asynchronous state management.
 * Handles loading status transitions, error scopes, success resolutions, and retries.
 */
export const useAsyncState = <T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T;
  }
) => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    success: false,
    data: options?.initialData ?? null,
  });

  const lastArgs = useRef<any[]>([]);

  const execute = useCallback(
    async (...args: any[]) => {
      lastArgs.current = args;
      setState(prev => ({ ...prev, loading: true, error: null, success: false }));
      try {
        const result = await asyncFn(...args);
        setState({
          loading: false,
          error: null,
          success: true,
          data: result,
        });
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(err?.message || 'An error occurred');
        setState({
          loading: false,
          error: errorObj.message,
          success: false,
          data: null,
        });
        if (options?.onError) {
          options.onError(errorObj);
        }
        throw errorObj;
      }
    },
    [asyncFn, options]
  );

  const retry = useCallback(() => {
    return execute(...lastArgs.current);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      data: options?.initialData ?? null,
    });
  }, [options?.initialData]);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
};
export type UseAsyncStateReturnType<T> = ReturnType<typeof useAsyncState<T>>;
