import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  const isAuthEndpoint = /\/Auth\/(login|register|forgot-password|reset-password|change-password)$/i.test(req.url);
  const isPublicJobRead =
    /\/JobPosting(\/public)?(\?|$)/i.test(req.url) ||
    /\/JobPosting\/\d+$/i.test(req.url) ||
    /\/JobPosting\/search\//i.test(req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint && !isPublicJobRead) {
        console.error(`[ErrorInterceptor] Received HTTP 401 from backend for URL: ${req.url}`);
        // Token expired or invalid → clear session → redirect to login
        authService.clearSession();
        router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      } else if (error.status === 400) {
        // Model binding / validation failure — surface details for debugging
        const body = error.error;
        const validationErrors = body?.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const messages = Object.entries(validationErrors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join(' | ');
          toastService.error(`Validation failed — ${messages}`);
          console.error('[ErrorInterceptor] 400 Validation:', validationErrors);
        } else {
          const fallback = body?.title || body?.message || 'Invalid request. Please check your input.';
          toastService.error(fallback);
        }
        console.error('[ErrorInterceptor] 400 Bad Request:', body);
      } else if (error.status === 403) {
        toastService.error('You do not have permission for this action.');
      } else if (error.status === 500) {
        toastService.error('A server error occurred. Please try again later.');
      } else if (error.status === 0) {
        toastService.error('Unable to connect to server. Check your internet connection.');
      }
      return throwError(() => error);
    })
  );
};

