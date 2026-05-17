

// Login
import { LoginRequest, User } from '../../models/user.model';
import { createAction, props } from '@ngrx/store';

export const loginUser = createAction('[Auth] Login User', props<{ payload: LoginRequest }>());
export const loginUserSuccess = createAction('[Auth] Login User Success', props<{ user: User; accessToken: string }>());
export const loginUserFailure = createAction('[Auth] Login User Failure', props<{ error: string }>());
export const clearAuthError = createAction('[Auth] Clear Error');

// Register
export const registerUser = createAction('[Auth] Register User', props<{ payload: LoginRequest }>());
export const registerUserSuccess = createAction(
  '[Auth] Register User Success',
  props<{ user: User }>()
);
export const registerUserFailure = createAction('[Auth] Register User Failure', props<{ error: string }>());

// Logout
export const logoutUser = createAction('[Auth] Logout User');
export const logoutUserSuccess = createAction('[Auth] Logout User Success');

// Check auth (on app init: refresh from httpOnly cookie)
export const checkAuthStatus = createAction('[Auth] Check Auth Status');
export const checkAuthStatusFailure = createAction('[Auth] Check Auth Status Failure');

// Forgot Password
export const forgotPassword = createAction(
  '[Auth] Forgot Password',
  props<{ email: string }>()
);
export const forgotPasswordSuccess = createAction('[Auth] Forgot Password Success');
export const forgotPasswordFailure = createAction(
  '[Auth] Forgot Password Failure',
  props<{ error: string }>()
);

// Reset Password
export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ token: string; newPassword: string }>()
);
export const resetPasswordSuccess = createAction('[Auth] Reset Password Success');
export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: string }>()
);
