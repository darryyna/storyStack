import { User } from '../../models/user.model';

export interface ForgotPasswordState {
  isLoading: boolean;
  submitted: boolean;
  error: string | null;
}

export interface ResetPasswordState {
  isLoading: boolean;
  success: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user?: User;
  error?: string;
  forgotPassword: ForgotPasswordState;
  resetPassword: ResetPasswordState;
}
