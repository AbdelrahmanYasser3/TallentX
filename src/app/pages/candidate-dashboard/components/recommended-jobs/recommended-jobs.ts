import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobCardComponent } from '../../../../shared/components/job-card/job-card';
import { JobModel } from '../../../../core/models/candidate.models';

@Component({
  selector: 'app-recommended-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, JobCardComponent],
  templateUrl: './recommended-jobs.html',
  styleUrl: './recommended-jobs.css',
})
export class RecommendedJobs {
  @Input() jobs: JobModel[] = [];
  @Input() isLoading = false;
  @Input() isError = false;

  @Output() retryLoad = new EventEmitter<void>();

  onRetry(): void {
    this.retryLoad.emit();
  }
}
