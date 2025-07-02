import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProtectedUserResponse, User } from '../models/user.model';
import {
  LoginUser,
  LoginUserSuccess,
  LoginUserFailure,
  RegisterUser,
  RegisterUserSuccess,
  RegisterUserFailure,
  LogoutUser,
  LogoutUserSuccess,
  CheckAuthStatus
} from './registration.actions';
import { AuthService } from '../../core/services/auth.service';

export interface AuthStateModel {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  user?: User;
  error?: string;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    isAuthenticated: false,
    isLoading: false,
    isLoginLoading: false,
    isRegisterLoading: false,
    user: undefined,
    error: undefined
  }
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static isLoading(state: AuthStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static isLoginLoading(state: AuthStateModel): boolean {
    return state.isLoginLoading;
  }

  @Selector()
  static isRegisterLoading(state: AuthStateModel): boolean {
    return state.isRegisterLoading;
  }

  @Selector()
  static getUser(state: AuthStateModel): User | undefined {
    return state.user;
  }

  @Selector()
  static getError(state: AuthStateModel): string | undefined {
    return state.error;
  }

  @Action(LoginUser)
  loginUser(ctx: StateContext<AuthStateModel>, action: LoginUser) {
    ctx.patchState({ isLoginLoading: true, error: undefined });

    return this.authService.login(action.payload).pipe(
      tap(response => {
        ctx.dispatch(new LoginUserSuccess(response));
      }),
      catchError(error => {
        ctx.dispatch(new LoginUserFailure({ error: error.error?.error || 'Login failed' }));
        return of(error);
      })
    );
  }

  @Action(LoginUserSuccess)
  loginUserSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      isAuthenticated: true,
      isLoginLoading: false,
      error: undefined,
    });

    return this.authService.getProtectedData().pipe(
      tap((userData: ProtectedUserResponse) => {
        ctx.patchState({
          user: {
            id: userData.userId,
            username: userData.username || 'User'
          }
        });
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  @Action(LoginUserFailure)
  loginUserFailure(ctx: StateContext<AuthStateModel>, action: LoginUserFailure) {
    ctx.patchState({
      isAuthenticated: false,
      isLoginLoading: false,
      error: action.payload.error
    });
  }

  @Action(RegisterUser)
  registerUser(ctx: StateContext<AuthStateModel>, action: RegisterUser) {
    ctx.patchState({ isRegisterLoading: true, error: undefined });

    return this.authService.register(action.payload).pipe(
      tap(() => {
        ctx.dispatch(new RegisterUserSuccess({ username: action.payload.username, password: action.payload.password }));
      }),
      catchError(error => {
        ctx.dispatch(new RegisterUserFailure({ error: error.error?.error || 'Registration failed' }));
        return of(error);
      })
    );
  }

  @Action(RegisterUserSuccess)
  registerUserSuccess(ctx: StateContext<AuthStateModel>, action: RegisterUserSuccess) {
    ctx.patchState({
      isRegisterLoading: false,
      error: undefined
    });
    return ctx.dispatch(new LoginUser({ username: action.payload.username, password: action.payload.password }));
  }

  @Action(RegisterUserFailure)
  registerUserFailure(ctx: StateContext<AuthStateModel>, action: RegisterUserFailure) {
    ctx.patchState({
      isRegisterLoading: false,
      error: action.payload.error
    });
  }

  @Action(LogoutUser)
  logoutUser(ctx: StateContext<AuthStateModel>) {
    return this.authService.logout().pipe(
      tap(() => {
        ctx.dispatch(new LogoutUserSuccess());
      }),
      catchError(() => {
        ctx.dispatch(new LogoutUserSuccess());
        return of(null);
      })
    );
  }

  @Action(LogoutUserSuccess)
  logoutUserSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.setState({
      isAuthenticated: false,
      isLoading: false,
      isLoginLoading: false,
      isRegisterLoading: false,
      user: undefined,
      error: undefined
    });
  }

  @Action(CheckAuthStatus)
  checkAuthStatus(ctx: StateContext<AuthStateModel>) {
    const isAuthenticated = this.authService.isAuthenticated();
    ctx.patchState({ isAuthenticated });
  }
}
