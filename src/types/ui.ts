import React from 'react';

export interface AsyncState<T> {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: T | null;
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
export type LoadingVariant = 'page' | 'card' | 'table' | 'spinner' | 'button' | 'dashboard';
export type EmptyVariant = 'products' | 'sales' | 'reports' | 'search' | 'notifications' | 'generic';
export type ErrorVariant = 'generic' | 'network' | 'validation' | 'unauthorized' | 'forbidden' | 'notFound' | 'timeout' | 'offline';

export interface LoadingStateProps {
  variant?: LoadingVariant;
  label?: string;
}

export interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export interface SuccessStateProps {
  message: string;
  title?: string;
}

export interface RetryStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  retryText?: string;
}
