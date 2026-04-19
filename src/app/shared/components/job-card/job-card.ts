import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobModel } from '../../../core/models/candidate.models';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card.html'
})
export class JobCardComponent {
  @Input() job: JobModel | null = null;
  @Input() showSaveButton = false;
  @Input() showApplyButton = true;
  @Input() isSaving = false;
  
  @Output() save = new EventEmitter<JobModel>();
  @Output() apply = new EventEmitter<JobModel>();

  onSave() {
    if (this.job && !this.job.isSaved && !this.isSaving) {
      this.save.emit(this.job);
    }
  }

  onApply() {
    if (this.job) {
      this.apply.emit(this.job);
    }
  }
}
