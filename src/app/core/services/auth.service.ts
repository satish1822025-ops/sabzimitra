import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthTokens, LoginRequest, RegisterRequest, OtpVerifyRequest, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly ACCESS_TOKEN_KEY  = 'sm_access_token';
  private readonly REFRESH_TOKEN_KEY = 'sm_refresh_token';
  private readonly USER_KEY          = 'sm_user';

  // Signal-based state — compatible with zoneless Angular 22
  private _currentUser = signal<User | null>(this.loadUser());

  // computed() signals — read these in templates with currentUser()
  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isVendor     = computed(() => this._currentUser()?.role === 'VENDOR');
  readonly isCustomer   = computed(() => this._currentUser()?.role === 'CUSTOMER');

  // ── Auth API Calls ─────────────────────────────────────────

  register(data: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap(tokens => this.saveTokens(tokens)),
      tap(() => this.fetchCurrentUser().subscribe())
    );
  }

  sendOtp(phone: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/send-otp`, { phone });
  }

  verifyOtp(data: OtpVerifyRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${environment.apiUrl}/auth/verify-otp`, data).pipe(
      tap(tokens => this.saveTokens(tokens)),
      tap(() => this.fetchCurrentUser().subscribe())
    );
  }

  refreshTokens(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthTokens>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(tokens => this.saveTokens(tokens)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken })
               .subscribe({ error: () => {} });
    }
    this.clearTokens();
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        this._currentUser.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  // ── Token helpers ──────────────────────────────────────────

  getAccessToken(): string | null  { return localStorage.getItem(this.ACCESS_TOKEN_KEY); }
  getRefreshToken(): string | null { return localStorage.getItem(this.REFRESH_TOKEN_KEY); }

  private saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch { return true; }
  }
}
