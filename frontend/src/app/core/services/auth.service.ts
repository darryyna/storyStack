import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, ProtectedUserResponse } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/auth';

  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.setToken(response.accessToken);
      })
    );
  }

  register(userData: LoginRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/register`, userData);
  }

  getProtectedData(): Observable<ProtectedUserResponse> {
    return this.http.get<ProtectedUserResponse>(`${this.baseUrl}/protected`, {
      withCredentials: true
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearToken();
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setToken(response.accessToken);
      })
    );
  }
  private setToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.tokenSubject.next(token);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private clearToken(): void {
    localStorage.removeItem('accessToken');
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }
}

