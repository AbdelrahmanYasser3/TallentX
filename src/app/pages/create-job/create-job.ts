import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../core/services/job';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateJobPostingDto } from '../../core/models/job.models';

@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-job.html'
})
export class CreateJobPage {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  isSubmitting = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    requirementsText: ['', [Validators.required]],
    location: [''],
    employmentType: ['FullTime', [Validators.required]],
    salaryMin: [null as number | null],
    salaryMax: [null as number | null],
    currency: ['USD'],
    applicationDeadline: [''],
    requiredSkills: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const companyId = this.authService.getCompanyId();
    if (!companyId) {
      this.toast.error('Unable to determine company context.');
      return;
    }

    const value = this.form.getRawValue();

    // Convert multi-line requirements textarea into a single string
    const requirements = (value.requirementsText ?? '').trim();

    // Combine salaryMin + salaryMax into a salaryRange string
    const salaryRange = this.buildSalaryRange(
      value.salaryMin,
      value.salaryMax,
      value.currency
    );

    // Parse comma-separated skills into an array
    const requiredSkills = (value.requiredSkills ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    // Format application deadline to match ASP.NET expectations (append seconds)
    let safeDeadline = value.applicationDeadline || undefined;
    if (safeDeadline && safeDeadline.includes('T') && !safeDeadline.includes(':00', safeDeadline.length - 3)) {
      safeDeadline = safeDeadline + ':00';
    }

    const payload: CreateJobPostingDto = {
      title: value.title ?? '',
      description: value.description ?? '',
      requirements,
      location: value.location || undefined,
      employmentType: value.employmentType ?? 'FullTime',
      companyId,
      isActive: true,
      salaryRange: salaryRange || undefined,
      applicationDeadline: safeDeadline,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined
    };

    console.log('[CreateJob] Payload:', payload);

    this.isSubmitting.set(true);
    this.jobService.createJob(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Job created successfully.');
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverMsg = err?.error?.title || err?.error?.message || 'Failed to create job.';
        this.toast.error(serverMsg);
        console.error('[CreateJobPage] Submission failed:', err);
      }
    });
  }

  /** Combines salary fields into a human-readable range string */
  private buildSalaryRange(
    min: number | null,
    max: number | null,
    currency: string | null
  ): string {
    const cur = currency || 'USD';
    if (min && max) {
      return `${cur} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) {
      return `${cur} ${min.toLocaleString()}+`;
    }
    if (max) {
      return `Up to ${cur} ${max.toLocaleString()}`;
    }
    return '';
  }
}

