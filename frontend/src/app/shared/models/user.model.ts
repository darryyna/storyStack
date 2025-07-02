export interface User {
  id?: string;
  username: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface ProtectedUserResponse {
  userId: string;
  username: string;
}
