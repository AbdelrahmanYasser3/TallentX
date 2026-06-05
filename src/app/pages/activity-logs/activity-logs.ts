import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogDto, ActivityLogService } from '../../core/services/activity-log.service';

@Component({
  selector: 'app-activity-logs-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.html',
})
export class ActivityLogsPage implements OnInit {
  private activityLogService = inject(ActivityLogService);

  logs = signal<ActivityLogDto[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.activityLogService.getMyActivity(30).subscribe({
      next: (items) => {
        this.logs.set(items ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.logs.set([]);
        this.errorMessage.set('تعذر تحميل سجل النشاط حالياً.');
        this.isLoading.set(false);
      }
    });
  }

  formatAction(actionType: string): string {
    return actionType.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDetails(details?: string): string {
    if (!details) {
      return 'No additional details';
    }

    try {
      const parsed = JSON.parse(details) as Record<string, unknown>;
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(' | ');
    } catch {
      return details;
    }
  }
}
