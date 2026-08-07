import { FEEDBACK_CONFIG } from '../constants/feedback';

export interface BackendErrorPayload {
  status: number;
  code: string;
  message: string;
  validationErrors?: Record<string, string[]>;
}

/**
 * Maps system and remote API errors (400, 401, 403, 404, 422, 500) to unified title/messages configurations.
 */
export const formatBackendError = (err: any): { title: string; message: string; type: string } => {
  const titles = FEEDBACK_CONFIG.defaultErrorTitles;
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      title: titles.offline,
      message: 'Please check your internet settings and try again.',
      type: 'offline'
    };
  }

  const status = err?.status ?? err?.error?.status;
  const message = err?.message ?? err?.error?.message ?? 'An unexpected system error occurred.';
  const code = err?.code ?? err?.error?.code;

  if (status === 401) {
    return {
      title: titles.unauthorized,
      message: 'Your session has expired. Please sign in again.',
      type: 'unauthorized'
    };
  }
  
  if (status === 403) {
    return {
      title: titles.forbidden,
      message: 'You do not have administrative clearance to access this action.',
      type: 'forbidden'
    };
  }

  if (status === 404) {
    return {
      title: titles.notFound,
      message: 'The requested catalog item or path does not exist.',
      type: 'notFound'
    };
  }

  if (status === 422 || code === 'VALIDATION_FAILED') {
    return {
      title: titles.validation,
      message: 'The input details provided are invalid. Please check fields warnings.',
      type: 'validation'
    };
  }

  if (err?.name === 'TimeoutError' || code === 'TIMEOUT') {
    return {
      title: titles.timeout,
      message: 'The connection server took too long to respond. Please try again.',
      type: 'timeout'
    };
  }

  if (status >= 500) {
    return {
      title: titles.generic,
      message: 'Internal server error occurred. Our team is resolving it.',
      type: 'server'
    };
  }

  return {
    title: titles.generic,
    message,
    type: 'generic'
  };
};
