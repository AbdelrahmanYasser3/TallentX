import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { JobService } from '../../core/services/job';
import { JobModel } from '../../core/models/candidate.models';
import { JobCardComponent } from '../../shared/components/job-card/job-card';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, JobCardComponent],
  templateUrl: './job-search.html'
})
export class JobSearch implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);

  readonly jobs = signal<JobModel[]>([]);
  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);

  readonly searchForm = this.fb.nonNullable.group({
    keyword: [''],
    location: [''],
    jobType: [''],
    salaryMin: [''],
    salaryMax: ['']
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      const location = params.get('location') ?? '';

      if (q || location) {
        this.searchForm.patchValue({ keyword: q, location }, { emitEvent: false });
        this.search();
      }
    });
  }

  search(): void {
    const formValue = this.searchForm.getRawValue();

    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.jobService
      .searchJobs({
        keyword: formValue.keyword?.trim() || undefined,
        location: formValue.location?.trim() || undefined,
        jobType: formValue.jobType || undefined,
        salaryMin: formValue.salaryMin ? Number(formValue.salaryMin) : undefined,
        salaryMax: formValue.salaryMax ? Number(formValue.salaryMax) : undefined
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((results) => {
        this.jobs.set(results ?? []);
      });
  }

  clearFilters(): void {
    this.searchForm.reset({
      keyword: '',
      location: '',
      jobType: '',
      salaryMin: '',
      salaryMax: ''
    });

    this.jobs.set([]);
    this.hasSearched.set(false);
  }
}
