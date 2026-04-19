import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { JobService } from '../../core/services/job';
import { CandidateService } from '../../core/services/candidate.service';
import { ToastService } from '../../core/services/toast.service';
import { JobModel } from '../../core/models/candidate.models';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-details.html'
})
export class JobDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private candidateService = inject(CandidateService);
  private toastService = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isApplying = signal(false);
  readonly job = signal<JobModel | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isLoading.set(false);
      return;
    }

    this.jobService
      .getJob(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((result) => {
        this.job.set(result);
      });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  applyForJob(): void {
    const currentJob = this.job();
    if (!currentJob || currentJob.hasApplied || this.isApplying()) {
      return;
    }

    const jobId = Number(currentJob.id ?? currentJob.jobPostId);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      this.toastService.error('Invalid job data. Please refresh and try again.');
      return;
    }

    this.isApplying.set(true);
    this.candidateService.getProfileDto().subscribe({
      next: (profile) => {
        const defaultResume = profile?.resumes?.find((resume) => resume.isDefault) ?? profile?.resumes?.[0];
        if (!defaultResume?.id) {
          this.isApplying.set(false);
          this.toastService.error('Please upload a resume before applying.');
          return;
        }

        this.candidateService.applyForJob(jobId, defaultResume.id).subscribe({
          next: () => {
            this.job.set({
              ...currentJob,
              hasApplied: true
            });
            this.isApplying.set(false);
            this.toastService.success('Application submitted successfully.');
          },
          error: () => {
            this.isApplying.set(false);
            this.toastService.error('Failed to submit application.');
          }
        });
      },
      error: () => {
        this.isApplying.set(false);
        this.toastService.error('Unable to load profile data.');
      }
    });
  }
}
