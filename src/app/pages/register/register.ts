import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

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

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  userType = 'Candidate';
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
      userType: ['Candidate', Validators.required],
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

    this.isRecruiterMode = this.router.url.includes('/register/recruiter');
    if (this.isRecruiterMode) {
      this.userType = 'Recruiter';
      this.registerForm.patchValue({ userType: 'Recruiter' });
      this.registerForm.get('inviteCode')?.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        Validators.pattern('^[A-Za-z0-9]+$')
      ]);
      this.registerForm.get('inviteCode')?.updateValueAndValidity();
    }
  }

  get f() { return this.registerForm.controls; }

  setUserType(type: string) {
    this.userType = type;
    this.registerForm.patchValue({ userType: type });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const data = {
      ...this.registerForm.value,
      firstName: String(this.registerForm.value.firstName ?? '').trim(),
      lastName: String(this.registerForm.value.lastName ?? '').trim(),
      email: String(this.registerForm.value.email ?? '').trim(),
      phoneNumber: String(this.registerForm.value.phoneNumber ?? '').trim(),
      gender: String(this.registerForm.value.gender),
      dateOfBirth: this.registerForm.value.dateOfBirth ? new Date(this.registerForm.value.dateOfBirth).toISOString() : undefined,
      inviteCode: String(this.registerForm.value.inviteCode ?? '').trim()
    };

    const request$ = this.isRecruiterMode
      ? this.authService.registerRecruiter({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: this.registerForm.value.password,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          inviteCode: data.inviteCode
        })
      : this.authService.registerCandidate({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: this.registerForm.value.password,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth
        });

    request$.subscribe({
      next: (res) => {
        if (res) {
          this.toast.success(this.isRecruiterMode ? 'Recruiter account created successfully!' : 'Registration successful! Welcome to TallentX.');
          this.router.navigate([this.isRecruiterMode ? '/recruiter/dashboard' : '/candidate/dashboard']);
        }
      },
      error: (err) => {
        setTimeout(() => {
          this.isLoading = false;
        });
        const message = err?.error?.message || 'Registration failed. Please check your data and try again.';
        setTimeout(() => {
          this.errorMessage = message;
        });
        this.toast.error(message);
        console.error('Register error:', err);
      }
    });
  }
}

