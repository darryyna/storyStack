import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectIsAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthLoading
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectForgotPassword = createSelector(
  selectAuthState,
  state => state.forgotPassword
);

export const selectResetPassword = createSelector(
  selectAuthState,
  state => state.resetPassword
);
