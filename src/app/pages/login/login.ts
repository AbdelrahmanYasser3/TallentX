import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.handleRedirectReason();
  }

  get f() { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(mode: 'standard' = 'standard') {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    
    // Only send what backend expects per AuthModels
    const data = { email, password };

    this.authService.login(data)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (response) => {
          if (response) {
            this.toast.success('Welcome back to TallentX!');
            const role = (this.authService.getRole() || '').toLowerCase();
            const targetRoute = (role.includes('recruiter') || role.includes('admin')) ? '/recruiter/dashboard' : '/candidate/dashboard';
            this.router.navigate([targetRoute]);
          }
        },
        error: (err) => {
          const msg = err?.error?.message || 'Invalid email or password. Please try again.';
          this.toast.error(msg);
          console.error('Login error:', err);
        }
      });
  }

  private handleRedirectReason(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'expired') {
      this.toast.error('Your session has expired. Please login again.');
      return;
    }

    if (reason === 'unauthenticated') {
      this.toast.error('Please login to continue.');
      return;
    }

    if (reason === 'invalid') {
      this.toast.error('Your session is invalid. Please login again.');
    }
  }
}

