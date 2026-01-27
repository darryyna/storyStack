

// Login
import { LoginRequest, User } from '../../models/user.model';
import { createAction, props } from '@ngrx/store';

export const loginUser = createAction('[Auth] Login User', props<{ payload: LoginRequest }>());
export const loginUserSuccess = createAction('[Auth] Login User Success', props<{ user: User; accessToken: string }>());
export const loginUserFailure = createAction('[Auth] Login User Failure', props<{ error: string }>());

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
