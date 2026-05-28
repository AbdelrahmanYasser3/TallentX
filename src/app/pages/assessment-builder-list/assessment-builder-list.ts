import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AssessmentService } from '../../core/services/assessment.service';
import { AssessmentListItemDto } from '../../core/models/assessment.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-assessment-builder-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './assessment-builder-list.html',
})
export class AssessmentBuilderListPage implements OnInit {
  private assessmentService = inject(AssessmentService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly isLoading = signal(false);
  readonly activeTab = signal<'Draft' | 'Published'>('Draft');
  readonly assessments = signal<AssessmentListItemDto[]>([]);

  readonly drafts = computed(() => this.assessments().filter((a) => a.status === 'Draft'));
  readonly published = computed(() => this.assessments().filter((a) => a.status === 'Published'));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.assessmentService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => this.assessments.set(items ?? []),
        error: () => {
          this.assessments.set([]);
          this.toast.error('Failed to load assessments.');
        },
      });
  }

  setTab(tab: 'Draft' | 'Published'): void {
    this.activeTab.set(tab);
  }

  createNew(): void {
    this.router.navigate(['/recruiter/assessments/new']);
  }

  edit(item: AssessmentListItemDto): void {
    this.router.navigate(['/recruiter/assessments/builder'], { queryParams: { id: item.id } });
  }

  publish(item: AssessmentListItemDto): void {
    this.assessmentService.publish(item.id).subscribe({
      next: () => {
        this.toast.success('Assessment published.');
        this.load();
      },
      error: () => this.toast.error('Failed to publish assessment.'),
    });
  }

  remove(item: AssessmentListItemDto): void {
    if (!confirm(`Delete "${item.title}"?`)) return;
    this.assessmentService.delete(item.id).subscribe({
      next: () => {
        this.toast.success('Assessment deleted.');
        this.load();
      },
      error: () => this.toast.error('Failed to delete assessment.'),
    });
  }
}
