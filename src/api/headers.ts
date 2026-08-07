/**
 * Standard HTTP request header key names.
 */
export const HEADER_KEYS = {
  contentType: 'Content-Type',
  accept: 'Accept',
  authorization: 'Authorization',
  acceptLanguage: 'Accept-Language',
  timezone: 'X-Timezone',
  deviceInfo: 'X-Device-Info',
  clientVersion: 'X-Client-Version',
  correlationId: 'X-Correlation-ID',
} as const;

export type HeaderKey = typeof HEADER_KEYS[keyof typeof HEADER_KEYS];
