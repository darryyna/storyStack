import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest } from 'src/app/shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  accessToken$ = this.accessTokenSubject.asObservable();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials, {
        withCredentials: true
      })
      .pipe(
        tap(res => this.accessTokenSubject.next(res.accessToken))
      );
  }

  register(data: LoginRequest) {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/register`,
      data,
      { withCredentials: true }
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, {}, {
        withCredentials: true
      })
      .pipe(
        tap(res => this.accessTokenSubject.next(res.accessToken))
      );
  }

  logout() {
    return this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.accessTokenSubject.next(null)));
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.accessTokenSubject.value;
  }
}

