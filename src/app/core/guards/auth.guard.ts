import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = authService.getToken();
  if (!token) {
    return router.parseUrl('/login?reason=unauthenticated');
  }

  if (!authService.isTokenExpired(token)) {
    return true;
  }

  authService.clearSession();
  return router.parseUrl('/login?reason=expired');
};
