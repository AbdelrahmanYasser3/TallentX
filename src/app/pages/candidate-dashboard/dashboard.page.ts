import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { CandidateService } from '../../core/services/candidate.service';       
import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { CandidateUIProfile, ApplicationModel, JobModel } from '../../core/models/candidate.models';
import { CandidateDashboardDto } from '../../core/models/dashboard.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.page.html'
})
export class DashboardPage implements OnInit {
  isLoading = true;
  isError = false;
  isUploadingCv = false;

  profile: CandidateUIProfile | null = null;
  dashboard: CandidateDashboardDto | null = null;
  applications: ApplicationModel[] = [];
  savedJobs: JobModel[] = [];
  suggestedJobs: JobModel[] = [];

  private candidateService = inject(CandidateService);
  private dashboardService = inject(DashboardService);
  private toastService = inject(ToastService);

  get aiMatchScore(): number {
    const completion = this.profile?.completionPercentage ?? 60;
    return Math.max(55, Math.min(98, completion + 8));
  }

  get firstName(): string {
    return this.profile?.firstName || 'there';
  }

  get topSuggestedJob(): JobModel | null {
    return this.suggestedJobs.length > 0 ? this.suggestedJobs[0] : null;
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.isError = false;

    forkJoin({
      profile: this.candidateService.getProfile().pipe(catchError(() => of(null))),
      dashboard: this.dashboardService.getCandidateDashboard().pipe(catchError(() => of(null))),
      savedJobs: this.candidateService.getSavedJobs().pipe(catchError(() => of([])))
    }).subscribe(({ profile, dashboard, savedJobs }) => {
      this.isLoading = false;

      if (!profile || !dashboard) {
        this.isError = true;
        this.toastService.error('Failed to load dashboard data.');
        return;
      }

      this.profile = profile;
      this.dashboard = dashboard;
      this.applications = this.normalizeCollection<ApplicationModel>(dashboard.recentApplications);
      this.savedJobs = this.normalizeCollection<JobModel>(savedJobs);
      this.suggestedJobs = this.savedJobs.slice(0, 3).map(job => ({
        ...job,
        isSaved: true
      }));
    });
  }

  private normalizeCollection<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (value && typeof value === 'object') {
      const items = (value as { items?: T[]; Items?: T[] }).items ?? (value as { items?: T[]; Items?: T[] }).Items;
      if (Array.isArray(items)) {
        return items;
      }
    }

    return [];
  }

  onSaveJob(job: JobModel): void {
    if (!job.jobPostId) return;

    // Optimistic Update
    job.isSaved = true;
    this.savedJobs.push(job);

    this.candidateService.saveJob(job.jobPostId).pipe(
      catchError(err => {
        // Revert on falure
        job.isSaved = false;
        this.savedJobs = this.savedJobs.filter(sj => sj.jobPostId !== job.jobPostId);
        this.toastService.error('Failed to save the job.');
        return of(null);
      })
      ).subscribe(res => {
      if (res) {
        this.toastService.success('Job saved successfully!');
      }
    });
  }

    onRetry(): void {
      this.loadDashboardData();
    }

    getApplicationStatusClass(status?: string): string {
      switch ((status || '').toLowerCase()) {
        case 'accepted':
          return 'bg-emerald-100 text-emerald-700';
        case 'rejected':
          return 'bg-red-100 text-red-700';
        case 'in review':
          return 'bg-blue-100 text-blue-700';
        case 'pending':
        default:
          return 'bg-amber-100 text-amber-700';
      }
    }

    getVelocityHeight(index: number): string {
      const values = [40, 60, 90, 75, 55, 85, 45];
      return `${values[index] || 50}%`;
    }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.onUploadCv(input.files[0]);
    }
  }

  onUploadCv(file: File): void {
    this.isUploadingCv = true;
    this.candidateService.uploadResume(file).pipe(
      catchError(err => {
        this.isUploadingCv = false;
        this.toastService.error('Failed to upload CV');
        return of(null);
      })
    ).subscribe(res => {
      this.isUploadingCv = false;
      if (res && this.profile) {
        this.profile.hasResume = true;
        // recalculate completion if needed, for now just show success
        this.toastService.success('CV uploaded successfully!');
      }
    });
  }
}

