import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CandidateService } from '../../core/services/candidate.service';
import { JobListDto } from '../../core/models/job.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-saved-jobs-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './saved-jobs.html',
})
export class SavedJobsPage implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastService);

  readonly jobs = signal<JobListDto[]>([]);
  readonly isLoading = signal<boolean>(true);

  readonly topMatches = computed(() =>
    [...this.jobs()].sort((left, right) => (right.applicantsCount ?? 0) - (left.applicantsCount ?? 0)).slice(0, 3)
  );

  ngOnInit(): void {
    this.loadSavedJobs();
  }

  loadSavedJobs(): void {
    this.isLoading.set(true);
    this.candidateService.getSavedJobs()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => this.jobs.set(items ?? []),
        error: () => {
          this.jobs.set([]);
          this.toast.error('Failed to load saved jobs.');
        }
      });
  }

  unsave(jobId: number): void {
    this.candidateService.saveJob(jobId).subscribe({
      next: () => {
        this.jobs.update((current) => current.filter((job) => job.id !== jobId));
        this.toast.success('Job removed from saved list.');
      },
      error: () => this.toast.error('Failed to update saved job.')
    });
  }
}
