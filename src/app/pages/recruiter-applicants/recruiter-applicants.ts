import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RecruiterService } from '../../core/services/recruiter';
import { JobApplicationDto } from '../../core/models/job.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-recruiter-applicants-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recruiter-applicants.html',
})
export class RecruiterApplicantsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private recruiterService = inject(RecruiterService);
  private toast = inject(ToastService);

  readonly applicants = signal<JobApplicationDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<string>('All');

  readonly filteredApplicants = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.applicants().filter((item) => {
      const matchesText = !query ||
        (item.candidateName ?? '').toLowerCase().includes(query) ||
        (item.jobTitle ?? '').toLowerCase().includes(query) ||
        item.candidateId.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || item.status.toLowerCase() === status.toLowerCase();
      return matchesText && matchesStatus;
    });
  });

  ngOnInit(): void {
    const rawJobId = this.route.snapshot.paramMap.get('jobId');
    const jobId = Number(rawJobId);

    if (!Number.isFinite(jobId) || jobId <= 0) {
      this.isLoading.set(false);
      this.toast.error('Invalid job id.');
      return;
    }

    this.loadApplicants(jobId);
  }

  loadApplicants(jobId: number): void {
    this.isLoading.set(true);
    this.recruiterService.getJobApplicants(jobId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (applications) => this.applicants.set(applications ?? []),
        error: () => {
          this.applicants.set([]);
          this.toast.error('Failed to load applicants.');
        }
      });
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatus(value: string): void {
    this.selectedStatus.set(value);
  }

  updateStatus(application: JobApplicationDto, status: string): void {
    if (application.status.toLowerCase() === status.toLowerCase()) {
      return;
    }

    this.recruiterService.updateApplicationStatus(application.id, status).subscribe({
      next: (updated) => {
        this.applicants.update((current) =>
          current.map((item) => item.id === application.id ? updated : item)
        );
        this.toast.success(`Application moved to ${status}.`);
      },
      error: () => this.toast.error('Failed to update applicant status.')
    });
  }
}
