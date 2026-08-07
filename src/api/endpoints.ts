/**
 * Central registry of all future backend REST route paths.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  products: {
    list: '/products',
    detail: '/products/:id',
    create: '/products',
    update: '/products/:id',
    delete: '/products/:id',
    image: '/products/:id/image',
  },
  categories: {
    list: '/categories',
    create: '/categories',
    detail: '/categories/:id',
    update: '/categories/:id',
    delete: '/categories/:id',
  },
  suppliers: {
    list: '/suppliers',
    create: '/suppliers',
    detail: '/suppliers/:id',
    update: '/suppliers/:id',
    delete: '/suppliers/:id',
  },
  sales: {
    list: '/sales',
    create: '/sales',
    detail: '/sales/:id',
  },
  reports: {
    summary: '/reports/summary',
    performance: '/reports/performance',
    exportPdf: '/reports/export-pdf',
  },
  dashboard: {
    kpis: '/dashboard/kpis',
    velocity: '/dashboard/velocity',
    stockHealth: '/dashboard/stock-health',
  },
  notifications: {
    list: '/notifications',
    read: '/notifications/:id/read',
    readAll: '/notifications/read-all',
  },
  settings: {
    get: '/settings',
    update: '/settings',
  },
  users: {
    list: '/users',
    profile: '/users/profile',
  }
} as const;
