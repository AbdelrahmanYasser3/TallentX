import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { RegistrationUserType, RegisterRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})

export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  /** Derived from URL: /register/recruiter vs /register, /register/candidate */
  registrationUserType: RegistrationUserType = 'Candidate';
  isRecruiterMode = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['Male', Validators.required],
      companyId: [''],
      inviteCode: [''],
      terms: [false, Validators.requiredTrue],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'),
        ]
      ]
    });

    this.syncModeFromUrl();

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.syncModeFromUrl());
  }

  get f() { return this.registerForm.controls; }

  private syncModeFromUrl(): void {
    const path = this.router.url.split('?')[0].toLowerCase();
    const recruiter = path.includes('/register/recruiter');
    this.isRecruiterMode = recruiter;
    this.registrationUserType = recruiter ? 'Recruiter' : 'Candidate';

    const invite = this.registerForm.get('inviteCode');
    if (recruiter) {
      invite?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$')
      ]);
    } else {
      invite?.clearValidators();
      invite?.setValue('', { emitEvent: false });
    }
    invite?.updateValueAndValidity({ emitEvent: false });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private toIsoDate(dateValue: string): string {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) {
      throw new Error('Invalid date');
    }
    return d.toISOString();
  }

  private buildRegisterRequest(): RegisterRequest {
    const v = this.registerForm.getRawValue();
    const dateOfBirth = this.toIsoDate(v.dateOfBirth as string);

    const body: RegisterRequest = {
      firstName: String(v.firstName ?? '').trim(),
      lastName: String(v.lastName ?? '').trim(),
      email: String(v.email ?? '').trim(),
      password: v.password as string,
      phoneNumber: String(v.phoneNumber ?? '').trim(),
      gender: String(v.gender),
      dateOfBirth,
      userType: this.registrationUserType,
    };

    if (this.registrationUserType === 'Recruiter') {
      const raw = String(v.companyId ?? '').trim();
      if (raw !== '') {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) {
          body.companyId = n;
        }
      }
      const code = String(v.inviteCode ?? '').trim();
      if (code !== '') {
        body.inviteCode = code;
      }
    }

    return body;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    let payload: RegisterRequest;
    try {
      payload = this.buildRegisterRequest();
    } catch {
      this.registerForm.get('dateOfBirth')?.setErrors({ invalidDate: true });
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(payload).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (res) => {
        if (res) {
          this.toast.success(this.isRecruiterMode ? 'Recruiter account created successfully!' : 'Registration successful! Welcome to TallentX.');
          this.router.navigate([this.isRecruiterMode ? '/recruiter/dashboard' : '/candidate/dashboard']);
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Registration failed. Please check your data and try again.';
        this.errorMessage = message;
        this.toast.error(message);
        console.error('Register error:', err);
      }
    });
  }
}
