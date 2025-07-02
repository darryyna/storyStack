import { LoginRequest } from "../models/user.model";

export class LoginUser {
  static readonly type = '[Auth] Login User';
  constructor(public payload: LoginRequest) {}
}

export class LoginUserSuccess {
  static readonly type = '[Auth] Login User Success';
  constructor(public payload: { accessToken: string }) {}
}

export class LoginUserFailure {
  static readonly type = '[Auth] Login User Failure';
  constructor(public payload: { error: string }) {}
}

export class RegisterUser {
  static readonly type = '[Auth] Register User';
  constructor(public payload: LoginRequest) {}
}

export class RegisterUserSuccess {
  static readonly type = '[Auth] Register User Success';
  constructor(public payload: LoginRequest) {}
}

export class RegisterUserFailure {
  static readonly type = '[Auth] Register User Failure';
  constructor(public payload: { error: string }) {}
}

export class LogoutUser {
  static readonly type = '[Auth] Logout User';
}

export class LogoutUserSuccess {
  static readonly type = '[Auth] Logout User Success';
}

export class CheckAuthStatus {
  static readonly type = '[Auth] Check Auth Status';
}

