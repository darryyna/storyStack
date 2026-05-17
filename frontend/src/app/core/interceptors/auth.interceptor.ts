import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

interface TokenResponse { accessToken: string; }


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<unknown> = new BehaviorSubject<unknown>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAccessToken();

    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: unknown) => {
          const tokenResponse = response as TokenResponse;
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.accessToken);
          return next.handle(this.addTokenToRequest(request, tokenResponse.accessToken));
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          return throwError(() => refreshError);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenToRequest(request, token as unknown as string)))
    );
  }
}
