export const FEEDBACK_CONFIG = {
  defaultLoadingDelayMs: 200,
  retryButtonText: 'Retry Request',
  successAnimationDurationMs: 300,
  defaultErrorTitles: {
    generic: 'An Error Occurred',
    network: 'Connection Failed',
    validation: 'Validation Failed',
    unauthorized: 'Session Expired',
    forbidden: 'Access Denied',
    notFound: 'Resource Not Found',
    timeout: 'Request Timed Out',
    offline: 'You Are Offline',
  },
  emptyState: {
    products: {
      title: 'No Products Registered',
      description: 'Begin populating the inventory catalog by registering new product listings.',
    },
    sales: {
      title: 'No Transaction Logs Found',
      description: 'Initialize a transaction in the terminal view to record sales data.',
    },
    reports: {
      title: 'No Analytics Ready',
      description: 'Register items and process checkouts to populate sales reports graphs.',
    },
    search: {
      title: 'No Matching Results',
      description: 'Refine your query terms or reset filters to view all entries.',
    },
    notifications: {
      title: 'No Alerts Active',
      description: 'Your inventory counts are healthy. All alerts are cleared.',
    },
    generic: {
      title: 'No Data Available',
      description: 'There are no files or data records ready in this segment.',
    },
  },
} as const;
