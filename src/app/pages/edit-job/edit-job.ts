import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService } from '../../core/services/job';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateJobPostingDto } from '../../core/models/job.models';

@Component({
  selector: 'app-edit-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-job.html'
})
export class EditJobPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isLoading = signal(true);
  isSaving = signal(false);
  jobId = signal<number | null>(null);

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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.toast.error('Invalid job id.');
      this.router.navigate(['/recruiter/jobs']);
      return;
    }

    this.jobId.set(id);
    this.jobService.getJob(id).subscribe({
      next: (job) => {
        if (!job) {
          this.toast.error('Job not found.');
          this.router.navigate(['/recruiter/jobs']);
          return;
        }

        this.form.patchValue({
          title: job.title ?? '',
          description: '',
          requirementsText: '',
          location: job.location ?? '',
          employmentType: job.jobType ?? 'FullTime',
          salaryMin: job.salaryMin ?? null,
          salaryMax: job.salaryMax ?? null,
          currency: job.currency ?? 'USD'
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load job.');
        this.router.navigate(['/recruiter/jobs']);
      }
    });
  }

  save(): void {
    if (this.form.invalid || !this.jobId()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const requirements = (value.requirementsText ?? '').trim();

    const salaryRange = this.buildSalaryRange(
      value.salaryMin,
      value.salaryMax,
      value.currency
    );

    const requiredSkills = (value.requiredSkills ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    // Format application deadline to match ASP.NET expectations (append seconds)
    let safeDeadline = value.applicationDeadline || undefined;
    if (safeDeadline && safeDeadline.includes('T') && !safeDeadline.includes(':00', safeDeadline.length - 3)) {
      safeDeadline = safeDeadline + ':00';
    }

    const payload: Partial<CreateJobPostingDto> = {
      title: value.title ?? '',
      description: value.description ?? '',
      requirements,
      location: value.location || undefined,
      employmentType: value.employmentType ?? 'FullTime',
      isActive: true,
      salaryRange: salaryRange || undefined,
      applicationDeadline: safeDeadline,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined
    };

    console.log('[EditJob] Payload:', payload);

    this.isSaving.set(true);
    this.jobService.updateJob(this.jobId()!, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Job updated successfully.');
        this.router.navigate(['/recruiter/jobs']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const serverMsg = err?.error?.title || err?.error?.message || 'Failed to update job.';
        this.toast.error(serverMsg);
        console.error('[EditJobPage] Update failed:', err);
      }
    });
  }

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

