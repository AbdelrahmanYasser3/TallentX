import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RecruiterService, RecruiterJob } from '../../core/services/recruiter';
import { ToastService } from '../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-recruiter-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recruiter-jobs.html',
})
export class RecruiterJobs implements OnInit {
  private recruiterService = inject(RecruiterService);
  private toast = inject(ToastService);
  private router = inject(Router);

  jobs = signal<RecruiterJob[]>([]);
  isLoading = signal<boolean>(true);

  constructor() {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading.set(true);
    this.recruiterService.getJobPostings()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (jobs) => this.jobs.set(jobs),
        error: () => this.toast.error('Failed to load jobs')
      });
  }

  navigateToCreateJob(): void {
    this.router.navigate(['/recruiter/jobs/new']);
  }

  navigateToEditJob(id: string): void {
    this.router.navigate(['/recruiter/jobs/edit', id]);
  }

  changeStatus(id: string, currentStatus: string): void {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    this.recruiterService.updateJobStatus(id, newStatus as any).subscribe(success => {
      if (success) {
         this.toast.success(`Job marked as ${newStatus}`);
         this.loadJobs();
      }
    });
  }

  closeJob(id: string): void {
    if (confirm('Are you sure you want to close this job permanently?')) {
       this.recruiterService.updateJobStatus(id, 'closed').subscribe(success => {
         if (success) {
           this.toast.success('Job closed');
           this.loadJobs();
         }
       });
    }
  }
}


