/**
 * User role
 */
export type UserRole = "SuperAdmin" | "SubAdmin" | "Student";

/**
 * User status
 */
export type UserStatus = "Active" | "Inactive" | "Suspended";

/**
 * User data
 */
export interface UserData {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  firebaseUid?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserData;
}

/**
 * Register request
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Exchange token request
 */
export interface ExchangeTokenRequest {
  firebaseIdToken: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}
