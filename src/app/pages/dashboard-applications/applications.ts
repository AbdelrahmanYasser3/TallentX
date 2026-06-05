import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CandidateService } from '../../core/services/candidate.service';
import { JobApplicationDto } from '../../core/models/job.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-applications-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './applications.html',
})
export class ApplicationsPage implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastService);

  readonly applications = signal<JobApplicationDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly selectedStatus = signal<string>('All');

  readonly filteredApplications = computed(() => {
    const status = this.selectedStatus();
    return this.applications().filter((item) =>
      status === 'All' || item.status.toLowerCase() === status.toLowerCase()
    );
  });

  readonly activeCount = computed(() =>
    this.applications().filter((item) => !['Rejected', 'Withdrawn', 'Accepted'].includes(item.status)).length
  );

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.candidateService.getApplications()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => {
          const sorted = [...(items ?? [])].sort(
            (left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime()
          );
          this.applications.set(sorted);
        },
        error: () => {
          this.applications.set([]);
          this.toast.error('Failed to load applications.');
        }
      });
  }

  setStatusFilter(value: string): void {
    this.selectedStatus.set(value);
  }

  withdraw(application: JobApplicationDto): void {
    if (application.status.toLowerCase() === 'withdrawn') {
      return;
    }

    this.candidateService.withdrawApplication(application.id).subscribe({
      next: () => {
        this.applications.update((current) =>
          current.map((item) => item.id === application.id ? { ...item, status: 'Withdrawn' } : item)
        );
        this.toast.success('Application withdrawn.');
      },
      error: () => this.toast.error('Unable to withdraw application.')
    });
  }
}
