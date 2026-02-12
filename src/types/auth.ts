export type UserRole = 'owner' | 'runner' | 'admin' | 'shop';

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  full_name: string;
  password: string;
  role: UserRole;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}
