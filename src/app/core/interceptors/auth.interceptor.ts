import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isAuthEndpoint = /\/Auth\/(login|register|forgot-password|reset-password|change-password|logout)$/i.test(req.url);

  if (isAuthEndpoint) {
    return next(req);
  }

  if (token) {
    if (authService.isTokenExpired(token)) {
      console.warn('[AuthInterceptor] Token is evaluated as EXPIRED. Wiping session and redirecting.');
      
      try {
         const payload = JSON.parse(atob(token.split('.')[1]));
         const exp = new Date(payload.exp * 1000).toLocaleString();
         const now = new Date().toLocaleString();
         console.warn(`[AuthInterceptor] Token EXP: ${exp} | Current Time: ${now}`);
      } catch (e) {}

      authService.clearSession();
      router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      return throwError(() => new Error('Session expired (Frontend check)'));
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
