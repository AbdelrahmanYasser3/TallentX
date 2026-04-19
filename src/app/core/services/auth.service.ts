import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterCandidateRequest, RegisterCompanyRequest, RegisterRecruiterRequest, AuthResponse } from '../models/auth.models';
import { CandidateService } from './candidate.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private readonly TOKEN_KEY = 'ies_token';
  private readonly ROLE_KEY = 'ies_role';
  private readonly USER_ID_KEY = 'ies_user_id';
  private readonly EMAIL_KEY = 'ies_email';
  private readonly EXPIRES_AT_KEY = 'ies_expires_at';
  private readonly COMPANY_ID_KEY = 'ies_company_id';
  private readonly RECRUITER_ROLE_KEY = 'ies_recruiter_role';
  private injector = inject(Injector);

  constructor(private http: HttpClient) {
    const oldToken = localStorage.getItem('token');
    if (oldToken && !localStorage.getItem(this.TOKEN_KEY)) {
      localStorage.setItem(this.TOKEN_KEY, oldToken);
      localStorage.removeItem('token');
    }
    const oldRole = localStorage.getItem('role');
    if (oldRole && !localStorage.getItem(this.ROLE_KEY)) {
      localStorage.setItem(this.ROLE_KEY, oldRole);
      localStorage.removeItem('role');
    }
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    const url = `${this.base}/Auth/login`;
    console.log(`[AuthService] Attempting login via: ${url}`);
    return this.http.post<AuthResponse>(url, data).pipe(
      tap(response => {
        console.log(`[AuthService] Login successful`);
        this.persistSession(response);
      }),
      catchError(error => {
        if (error.status === 0) {
           console.error('[AuthService] Network Error (Status 0): Potential CORS issue or server is unreachable.', error);
        } else {
           console.error(`[AuthService] Backend Error (Status ${error.status})`, error);
        }
        return throwError(() => error);
      })
    );
  }

  registerCandidate(data: RegisterCandidateRequest): Observable<AuthResponse> {
    const url = `${this.base}/Auth/register`;
    return this.http.post<AuthResponse>(url, data).pipe(
      tap(response => this.persistSession(response))
    );
  }

  registerCompany(data: RegisterCompanyRequest): Observable<AuthResponse> {
    const url = `${this.base}/Auth/register/company`;
    return this.http.post<AuthResponse>(url, data).pipe(
      tap(response => this.persistSession(response))
    );
  }

  registerRecruiter(data: RegisterRecruiterRequest): Observable<AuthResponse> {
    const url = `${this.base}/Auth/register/recruiter`;
    return this.http.post<AuthResponse>(url, data).pipe(
      tap(response => this.persistSession(response))
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.base}/Auth/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.base}/Auth/reset-password`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.base}/Auth/change-password`, data);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  getCompanyId(): number | null {
    const id = localStorage.getItem(this.COMPANY_ID_KEY);
    if (id) {
      const parsed = parseInt(id, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    const companyIdFromToken = this.extractCompanyIdFromToken(token);
    if (companyIdFromToken !== null) {
      localStorage.setItem(this.COMPANY_ID_KEY, companyIdFromToken.toString());
    }

    return companyIdFromToken;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload || typeof payload.exp !== 'number') {
        return false;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return nowInSeconds >= payload.exp;
    } catch {
      return true;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.COMPANY_ID_KEY);
    localStorage.removeItem(this.RECRUITER_ROLE_KEY);
    this.tryClearCandidateProfile();
  }

  logout(reason?: 'manual' | 'expired' | 'invalid'): void {
    if (reason === 'expired' || reason === 'invalid') {
      this.clearSession();
      return;
    }

    this.http.post(`${this.base}/Auth/logout`, {}).pipe(
      tap(() => this.clearSession())
    ).subscribe({
      error: () => this.clearSession()
    });
  }

  private persistSession(response: any): void {
    const token = this.extractToken(response);
    if (token) localStorage.setItem(this.TOKEN_KEY, token);

    const role = this.extractRole(response);
    if (role) localStorage.setItem(this.ROLE_KEY, role);

    // Recruiter/Admin sessions should not keep stale candidate profile state in memory.
    if (role && role.toLowerCase() !== 'candidate') {
      this.tryClearCandidateProfile();
    }

    if (response.userId) localStorage.setItem(this.USER_ID_KEY, response.userId);
    if (response.email) localStorage.setItem(this.EMAIL_KEY, response.email);
    if (response.expiresAt) localStorage.setItem(this.EXPIRES_AT_KEY, response.expiresAt);
    const companyId = response.companyId ?? (token ? this.extractCompanyIdFromToken(token) : null);
    if (companyId !== null && companyId !== undefined) {
      localStorage.setItem(this.COMPANY_ID_KEY, companyId.toString());
    }
    if (response.recruiterRole) localStorage.setItem(this.RECRUITER_ROLE_KEY, response.recruiterRole);
  }

  private extractToken(response: AuthResponse): string | null {
    if (typeof response.token === 'string' && response.token.trim() !== '') {
      return response.token;
    }
    return null;
  }

  private extractRole(response: AuthResponse): string | null {
    if (typeof response.role === 'string' && response.role.trim() !== '') {
      return response.role;
    }
    return null;
  }

  private extractCompanyIdFromToken(token: string): number | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return null;
    }

    const rawCompanyId = payload['companyId'];
    const parsedCompanyId = typeof rawCompanyId === 'string' ? Number(rawCompanyId) : rawCompanyId;

    return Number.isFinite(parsedCompanyId) && Number(parsedCompanyId) > 0 ? Number(parsedCompanyId) : null;
  }

  private decodeJwtPayload(token: string): (Record<string, unknown> & { exp?: number }) | null {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = atob(padded);

    return JSON.parse(jsonPayload) as Record<string, unknown> & { exp?: number };
  }

  private tryClearCandidateProfile(): void {
    try {
      const candidateService = this.injector.get(CandidateService);
      candidateService?.clearProfile?.();
    } catch {
      // Candidate service is optional in non-candidate flows.
    }
  }
}
