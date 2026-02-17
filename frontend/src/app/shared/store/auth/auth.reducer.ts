import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { User } from '../../models/user.model';

export interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user?: User;
  error?: string;
}

export const initialState: AuthState = {
  isAuthenticated: false,
  isAuthLoading: false,
  user: undefined,
  error: undefined,
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

  // Register
  on(AuthActions.registerUser, state => ({ ...state, isAuthLoading: true, error: undefined })),
  on(AuthActions.registerUserSuccess, state => ({ ...state, isAuthLoading: false, error: undefined })),
  on(AuthActions.registerUserFailure, (state, { error }) => ({ ...state, isAuthLoading: false, error })),

  // Logout
  on(AuthActions.logoutUser, state => ({ ...state, isAuthLoading: true })),
  on(AuthActions.logoutUserSuccess, () => ({ ...initialState, isAuthLoading: false })),

  // Check auth (on app init)
  on(AuthActions.checkAuthStatus, state => ({ ...state, isAuthLoading: true })),
  on(AuthActions.checkAuthStatusFailure, state => ({ ...state, isAuthLoading: false }))
);
