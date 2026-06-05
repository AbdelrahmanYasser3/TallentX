import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { JobService } from '../../core/services/job';
import { CandidateService } from '../../core/services/candidate.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { JobModel } from '../../core/models/candidate.models';
import { jobListDtoToJobModel } from '../../core/utils/job.mapper';

/** Allowed MIME types for CV upload */
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css']
})
export class JobDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobService = inject(JobService);
  private candidateService = inject(CandidateService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isApplying = signal(false);
  readonly job = signal<JobModel | null>(null);

  // ─── Apply Modal State ───
  readonly showApplyModal = signal(false);
  readonly cvFile = signal<File | null>(null);
  readonly cvFileName = signal('');
  readonly cvFileError = signal('');
  readonly coverLetter = signal('');
  readonly hasAlreadyApplied = signal(false);
  readonly isCheckingApplication = signal(false);
  readonly isDragOver = signal(false);

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
        const model = result ? jobListDtoToJobModel(result) : null;
        this.job.set(model);

        if (this.authService.isAuthenticated() && this.authService.getRole()?.toLowerCase() === 'candidate') {
          this.checkIfApplied(Number(model?.id ?? model?.jobPostId ?? 0));
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  /** Called when user clicks the "Apply Now" button */
  openApplyModal(): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please login to apply for this job.', 'info');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.hasAlreadyApplied()) {
      return;
    }

    // Try to apply with existing resume first
    this.showApplyModal.set(true);
  }

  closeApplyModal(): void {
    this.showApplyModal.set(false);
    this.resetApplyForm();
  }

  // ─── File Handling ───

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  removeFile(): void {
    this.cvFile.set(null);
    this.cvFileName.set('');
    this.cvFileError.set('');
  }

  private validateAndSetFile(file: File): void {
    this.cvFileError.set('');

    // Check file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      this.cvFileError.set(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.cvFileError.set(`File too large. Maximum size: ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    this.cvFile.set(file);
    this.cvFileName.set(file.name);
  }

  getFileSizeFormatted(): string {
    const file = this.cvFile();
    if (!file) return '';
    const kb = file.size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  // ─── Submit Application ───

  submitApplication(): void {
    const currentJob = this.job();
    if (!currentJob || this.isApplying() || this.hasAlreadyApplied()) return;

    const file = this.cvFile();
    if (!file) {
      this.cvFileError.set('Please upload your CV before applying.');
      return;
    }

    const jobId = Number(currentJob.id ?? currentJob.jobPostId);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      this.toastService.error('Invalid job data. Please refresh and try again.');
      return;
    }

    this.isApplying.set(true);
    const coverLetterText = this.coverLetter().trim() || undefined;

    this.candidateService.applyWithCv(jobId, file, coverLetterText)
      .pipe(finalize(() => this.isApplying.set(false)))
      .subscribe({
        next: () => {
          this.job.set({ ...currentJob, hasApplied: true });
          this.hasAlreadyApplied.set(true);
          this.toastService.success('Application submitted successfully! 🎉');
          this.closeApplyModal();
        },
        error: (err) => {
          const msg = err?.error?.message || err?.error?.title || 'Failed to submit application. Please try again.';
          this.toastService.error(msg);
        }
      });
  }

  /** Apply with existing resume (no upload needed) */
  applyWithExistingResume(): void {
    const currentJob = this.job();
    if (!currentJob || this.isApplying() || this.hasAlreadyApplied()) return;

    const jobId = Number(currentJob.id ?? currentJob.jobPostId);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      this.toastService.error('Invalid job data.');
      return;
    }

    this.isApplying.set(true);

    this.candidateService.getProfileDto().subscribe({
      next: (profile) => {
        const defaultResume = profile?.resumes?.find(r => r.isDefault) ?? profile?.resumes?.[0];
        if (!defaultResume?.id) {
          this.isApplying.set(false);
          this.toastService.error('Please upload a resume before applying.');
          return;
        }

        const coverLetterText = this.coverLetter().trim() || undefined;
        this.candidateService.applyForJob(jobId, defaultResume.id, coverLetterText)
          .pipe(finalize(() => this.isApplying.set(false)))
          .subscribe({
            next: () => {
              this.job.set({ ...currentJob, hasApplied: true });
              this.hasAlreadyApplied.set(true);
              this.toastService.success('Application submitted successfully! 🎉');
              this.closeApplyModal();
            },
            error: (err) => {
              const msg = err?.error?.message || err?.error?.title || 'Failed to submit application.';
              this.toastService.error(msg);
            }
          });
      },
      error: () => {
        this.isApplying.set(false);
        this.toastService.error('Unable to load profile data.');
      }
    });
  }

  // ─── Helpers ───

  private checkIfApplied(jobPostId: number): void {
    if (!jobPostId || jobPostId <= 0) return;
    this.isCheckingApplication.set(true);

    this.candidateService.hasAppliedToJob(jobPostId)
      .pipe(finalize(() => this.isCheckingApplication.set(false)))
      .subscribe({
        next: (applied) => {
          this.hasAlreadyApplied.set(applied);
          if (applied) {
            const current = this.job();
            if (current) this.job.set({ ...current, hasApplied: true });
          }
        }
      });
  }

  private resetApplyForm(): void {
    this.cvFile.set(null);
    this.cvFileName.set('');
    this.cvFileError.set('');
    this.coverLetter.set('');
    this.isDragOver.set(false);
  }

  /** Parse skills from requirements text (comma/newline separated) */
  getSkillsList(): string[] {
    const job = this.job();
    if (!job?.requirements) return [];
    return job.requirements
      .split(/[\n,;•]+/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 60)
      .slice(0, 10);
  }

  /** Build salary display string */
  getSalaryDisplay(): string {
    const job = this.job();
    if (!job) return '';
    if (job.salaryRange) return job.salaryRange;
    if (job.salaryMin && job.salaryMax) return `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
    if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`;
    return 'Competitive';
  }

  /** Get employment type display */
  getEmploymentTypeDisplay(): string {
    const type = this.job()?.employmentType || this.job()?.jobType || '';
    switch (type) {
      case 'FullTime': return 'Full-time';
      case 'PartTime': return 'Part-time';
      case 'Contract': return 'Contract';
      case 'Internship': return 'Internship';
      default: return type || 'Full-time';
    }
  }

  /** Format the posted date */
  getPostedDate(): string {
    const job = this.job();
    const dateStr = job?.postedDate || job?.createdAt;
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }
}
