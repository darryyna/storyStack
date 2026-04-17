import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, ForgotPasswordState, ResetPasswordState } from './auth.state';

const initialForgotPasswordState: ForgotPasswordState = {
  isLoading: false,
  submitted: false,
  error: null,
};

const initialResetPasswordState: ResetPasswordState = {
  isLoading: false,
  success: false,
  error: null,
};

export const initialState: AuthState = {
  isAuthenticated: false,
  isAuthLoading: false,
  user: undefined,
  error: undefined,
  forgotPassword: initialForgotPasswordState,
  resetPassword: initialResetPasswordState,
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.loginUser, state => ({ ...state, isAuthLoading: true, error: undefined })),
  on(AuthActions.loginUserSuccess, (state, { user }) => ({
    ...state,
    isAuthenticated: true,
    isAuthLoading: false,
    user,
    error: undefined
  })),
  on(AuthActions.loginUserFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    isAuthLoading: false,
    error
  })),
  on(AuthActions.clearAuthError, state => ({ ...state, error: undefined })),

  // Register
  on(AuthActions.registerUser, state => ({ ...state, isAuthLoading: true, error: undefined })),
  on(AuthActions.registerUserSuccess, state => ({ ...state, isAuthLoading: false, error: undefined })),
  on(AuthActions.registerUserFailure, (state, { error }) => ({ ...state, isAuthLoading: false, error })),

  // Logout
  on(AuthActions.logoutUser, state => ({ ...state, isAuthLoading: true })),
  on(AuthActions.logoutUserSuccess, () => ({ ...initialState, isAuthLoading: false })),

  // Check auth
  on(AuthActions.checkAuthStatus, state => ({ ...state, isAuthLoading: true })),
  on(AuthActions.checkAuthStatusFailure, state => ({ ...state, isAuthLoading: false })),

  // Forgot Password
  on(AuthActions.forgotPassword, state => ({
    ...state,
    forgotPassword: { ...initialForgotPasswordState, isLoading: true }
  })),
  on(AuthActions.forgotPasswordSuccess, state => ({
    ...state,
    forgotPassword: { ...initialForgotPasswordState, submitted: true }
  })),
  on(AuthActions.forgotPasswordFailure, (state, { error }) => ({
    ...state,
    forgotPassword: { ...initialForgotPasswordState, error }
  })),

  // Reset Password
  on(AuthActions.resetPassword, state => ({
    ...state,
    resetPassword: { ...initialResetPasswordState, isLoading: true }
  })),
  on(AuthActions.resetPasswordSuccess, state => ({
    ...state,
    resetPassword: { ...initialResetPasswordState, success: true }
  })),
  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    resetPassword: { ...initialResetPasswordState, error }
  })),
);
