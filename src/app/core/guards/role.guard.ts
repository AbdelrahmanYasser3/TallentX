import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

function hasValidSession(): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (!token) {
    router.navigate(['/login'], { queryParams: { reason: 'unauthenticated' } });
    return false;
  }

  if (auth.isTokenExpired(token)) {
    auth.clearSession();
    router.navigate(['/login'], { queryParams: { reason: 'expired' } });
    return false;
  }

  return true;
}

export const candidateGuard: CanActivateFn = () => {
  if (!hasValidSession()) {
    return false;
  }

  const role = localStorage.getItem('ies_role');
  if (role === 'Candidate') return true;
  inject(Router).navigate(['/']);
  return false;
};

export const recruiterGuard: CanActivateFn = () => {
  if (!hasValidSession()) {
    return false;
  }

  const role = localStorage.getItem('ies_role');
  if (role === 'Recruiter' || role === 'Admin') return true;
  inject(Router).navigate(['/']);
  return false;
};

export const adminRecruiterGuard: CanActivateFn = () => {
  if (!hasValidSession()) {
    return false;
  }

  const role = localStorage.getItem('ies_role');
  const recruiterRole = localStorage.getItem('ies_recruiter_role');
  if (role === 'Admin' || (role === 'Recruiter' && recruiterRole === 'Admin')) return true;
  inject(Router).navigate(['/']);
  return false;
};
