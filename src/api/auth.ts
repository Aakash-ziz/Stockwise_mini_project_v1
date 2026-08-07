/**
 * Interfaces modeling Token payloads and auth sessions.
 */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  roles: string[];
  exp: number;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: number; // epoch timestamp
}

export interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
}

/**
 * Interface contract for client token storage adapters.
 */
export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  clearRefreshToken(): void;
}
