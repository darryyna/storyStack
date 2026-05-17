import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // LOGIN
  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginUser),
      mergeMap(action =>
        this.authService.login(action.payload).pipe(
          map(authResponse =>
            AuthActions.loginUserSuccess({
              user: {
                username: action.payload.username,
                email: action.payload.email
              },
              accessToken: authResponse.accessToken
            })
          ),
          catchError(error =>
            of(
              AuthActions.loginUserFailure({
                error: error.error?.error || 'Login failed'
              })
            )
          )
        )
      )
    )
  );

  // REGISTER
  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerUser),
      mergeMap(action =>
        this.authService.register(action.payload).pipe(
          map(authResponse =>
            AuthActions.loginUserSuccess({
              user: {
                username: action.payload.username,
                email: action.payload.email
              },
              accessToken: authResponse.accessToken
            })
          ),
          catchError(error =>
            of(AuthActions.registerUserFailure({ error: error.error?.error || 'Registration failed' }))
          )
        )
      )
    )
  );

  // LOGOUT
  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutUser),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutUserSuccess()),
          catchError(() => of(AuthActions.logoutUserSuccess()))
        )
      )
    )
  );

  // CHECK AUTH
  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      mergeMap(() =>
        this.authService.refreshToken().pipe(
          map(res =>
            res.user
              ? AuthActions.loginUserSuccess({ user: res.user, accessToken: res.accessToken })
              : AuthActions.checkAuthStatusFailure()
          ),
          catchError(() => of(AuthActions.checkAuthStatusFailure()))
        )
      )
    )
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      mergeMap(({ email }) =>
        this.authService.forgotPassword(email).pipe(
          map(() => AuthActions.forgotPasswordSuccess()),
          catchError(error =>
            of(AuthActions.forgotPasswordFailure({
              error: error.error?.error || 'AUTH.FORGOT_PASSWORD_ERROR'
            }))
          )
        )
      )
    )
  );

  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      mergeMap(({ token, newPassword }) =>
        this.authService.resetPassword(token, newPassword).pipe(
          map(() => AuthActions.resetPasswordSuccess()),
          catchError(error =>
            of(AuthActions.resetPasswordFailure({
              error: error.error?.error || 'AUTH.RESET_ERROR'
            }))
          )
        )
      )
    )
  );

  resetPasswordRedirect$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.resetPasswordSuccess),
        tap(() => setTimeout(() => this.router.navigate(['/login']), 2000))
      ),
    { dispatch: false }
  );
}
