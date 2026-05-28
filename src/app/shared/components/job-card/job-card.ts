import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { JobModel } from '../../../core/models/candidate.models';
import { formatWorkLocation } from '../../../core/utils/job.mapper';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-card.html',
})
export class JobCardComponent {
  private router = inject(Router);

  @Input() job: JobModel | null = null;
  @Input() showSaveButton = false;
  @Input() showApplyButton = true;
  @Input() isSaving = false;

  @Output() save = new EventEmitter<JobModel>();
  @Output() apply = new EventEmitter<JobModel>();

  companyLabel(): string {
    if (!this.job) return 'Company';
    if (this.job.companyName) return this.job.companyName;
    if (typeof this.job.company === 'string') return this.job.company;
    if (this.job.company && typeof this.job.company === 'object') return this.job.company.name;
    return 'Company';
  }

  workplaceLabel(): string {
    if (!this.job) return 'On-site';
    return formatWorkLocation(this.job.workLocation, this.job.location);
  }

  isRemote(): boolean {
    const label = this.workplaceLabel().toLowerCase();
    return label.includes('remote');
  }

  postedLabel(): string {
    const raw = this.job?.postedDate || this.job?.createdAt;
    if (!raw) return 'Recently';
    try {
      return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }

  onSave(): void {
    if (this.job && !this.job.isSaved && !this.isSaving) {
      this.save.emit(this.job);
    }
  }

  onApply(): void {
    if (this.job) {
      this.apply.emit(this.job);
    }
  }

  viewDetails(): void {
    const id = this.job?.id ?? this.job?.jobPostId;
    if (id != null) {
      this.router.navigate(['/jobs', id]);
    }
  }
}
