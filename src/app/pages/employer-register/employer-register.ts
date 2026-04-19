import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-employer-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employer-register.html',
})
export class EmployerRegisterPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  companyForm: FormGroup;
  isLoading = false;
  selectedLogoFile: File | null = null;
  selectedLogoFileName = '';

  constructor() {
    this.companyForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ],
      phoneNumber: ['', Validators.required],
      gender: ['Male', Validators.required],
      dateOfBirth: ['', Validators.required],
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      website: [''],
      taxNumber: ['', Validators.required],
      description: ['']
    });
  }

  get f() { return this.companyForm.controls; }

  openLogoPicker(fileInput: HTMLInputElement): void {
    if (this.isLoading) {
      return;
    }
    fileInput.click();
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedLogoFile = null;
      this.selectedLogoFileName = '';
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select a valid image file (PNG, JPG, or SVG).');
      input.value = '';
      this.selectedLogoFile = null;
      this.selectedLogoFileName = '';
      return;
    }

    if (file.size > maxBytes) {
      this.toast.error('Logo file is too large. Maximum size is 5MB.');
      input.value = '';
      this.selectedLogoFile = null;
      this.selectedLogoFileName = '';
      return;
    }

    this.selectedLogoFile = file;
    this.selectedLogoFileName = file.name;
    this.toast.show('Logo selected. It will be completed in company settings after registration.', 'info');
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const raw = this.companyForm.value;
    const payload = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      password: raw.password,
      phoneNumber: raw.phoneNumber,
      gender: raw.gender,
      dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth).toISOString() : raw.dateOfBirth,
      companyName: raw.companyName,
      taxNumber: raw.taxNumber,
      industry: raw.industry,
      website: raw.website
    };

    this.authService.registerCompany(payload).subscribe({
      next: (res) => {
        if (res) {
          this.toast.success('Company registered successfully! Welcome to TallentX.');
          if (this.selectedLogoFileName) {
            this.toast.show('Company logo selected. Complete logo upload from Company Settings.', 'info');
          }
          this.router.navigate(['/recruiter/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const message = err?.error?.message || 'Company registration failed. Please review your data.';
        this.toast.error(message);
        console.error('Company register error:', err);
      }
    });
  }
}
