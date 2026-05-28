import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../core/services/job';
import { JobModel } from '../../core/models/candidate.models';
import { jobListDtoToJobModel } from '../../core/utils/job.mapper';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class LandingPage implements OnInit {
  private router = inject(Router);
  private jobService = inject(JobService);

  searchQuery = '';
  locationQuery = '';

  readonly featuredJobs = signal<JobModel[]>([]);
  readonly isLoadingJobs = signal(true);
  readonly totalPublicJobs = signal(0);

  ngOnInit(): void {
    this.loadFeaturedJobs();
  }

  private loadFeaturedJobs(): void {
    this.isLoadingJobs.set(true);
    this.jobService
      .getPublicJobs({ pageNumber: 1, pageSize: 6 })
      .pipe(finalize(() => this.isLoadingJobs.set(false)))
      .subscribe((page) => {
        this.totalPublicJobs.set(page.totalCount);
        this.featuredJobs.set(page.items.map(jobListDtoToJobModel));
      });
  }

  companyInitials(job: JobModel): string {
    const name = job.companyName || (typeof job.company === 'string' ? job.company : '') || 'TX';
    return name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  jobMetaLine(job: JobModel): string {
    const company = job.companyName || (typeof job.company === 'string' ? job.company : 'Company');
    const loc = job.location || 'Remote';
    const salary = job.salaryRange || '';
    return [company, loc, salary].filter(Boolean).join(' • ');
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    const location = this.locationQuery.trim();

    this.router.navigate(['/jobs'], {
      queryParams: {
        ...(q ? { q } : {}),
        ...(location ? { location } : {}),
      },
    });
  }
}
