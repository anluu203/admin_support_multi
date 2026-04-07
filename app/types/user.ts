export enum UserRole {
  SuperAdmin = "SuperAdmin",
  SubAdmin = "SubAdmin",
  Student = "Student",
}

export enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  firebaseUid?: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}

export interface Result<T> {
  isSuccess: boolean;
  data: T | null;
  error: string | null;
}

export type UserResponse = Result<PaginatedResponse<User>>;
