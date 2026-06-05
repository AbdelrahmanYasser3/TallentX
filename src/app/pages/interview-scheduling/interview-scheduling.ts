import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { InterviewService } from '../../core/services/interview.service';
import { InterviewDto } from '../../core/models/interview.models';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import {
  UpcomingInterviewItem,
  buildStaticUpcomingInterviews,
  InterviewType,
} from '../../core/data/upcoming-interviews.seed';

export type InterviewTimeBucket = 'today' | 'tomorrow' | 'thisWeek' | 'later';

export interface InterviewTimeSection {
  key: InterviewTimeBucket;
  label: string;
  items: UpcomingInterviewItem[];
}

@Component({
  selector: 'app-interview-scheduling-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './interview-scheduling.html',
})
export class InterviewSchedulingPage implements OnInit {
  private interviewService = inject(InterviewService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly interviews = signal<UpcomingInterviewItem[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly expandedId = signal<number | null>(null);

  readonly timeSections: { key: InterviewTimeBucket; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'later', label: 'Later' },
  ];

  readonly upcoming = computed(() => {
    const now = Date.now();
    return this.interviews()
      .filter((item) => item.status === 'Scheduled' && new Date(item.scheduledTime).getTime() > now - 60_000)
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  });

  readonly groupedSections = computed((): InterviewTimeSection[] => {
    const buckets: Record<InterviewTimeBucket, UpcomingInterviewItem[]> = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
    };

    for (const item of this.upcoming()) {
      buckets[this.getTimeBucket(item.scheduledTime)].push(item);
    }

    return this.timeSections
      .map((section) => ({ ...section, items: buckets[section.key] }))
      .filter((section) => section.items.length > 0);
  });

  readonly hasUpcoming = computed(() => this.upcoming().length > 0);

  get minDateTime(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  readonly interviewForm = this.fb.nonNullable.group({
    jobApplicationId: [0, [Validators.required, Validators.min(1)]],
    scheduledTime: ['', Validators.required],
    durationMinutes: [45, [Validators.required, Validators.min(15)]],
    meetingLink: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading.set(true);

    this.interviewService
      .getByRecruiter()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => {
          const apiItems = (items ?? []).map((item) => this.toDisplayItem(item));
          this.interviews.set(this.mergeWithStatic(apiItems));
        },
        error: () => {
          this.interviews.set(buildStaticUpcomingInterviews());
        },
      });
  }

  private mergeWithStatic(apiItems: UpcomingInterviewItem[]): UpcomingInterviewItem[] {
    const staticItems = buildStaticUpcomingInterviews();
    const apiIds = new Set(apiItems.map((i) => i.id));
    const merged = [...apiItems, ...staticItems.filter((s) => !apiIds.has(s.id))];
    return merged.sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }

  private toDisplayItem(item: InterviewDto): UpcomingInterviewItem {
    const roomName = item.meetingLink?.split('/').pop();
    return {
      ...item,
      companyName: 'Company',
      interviewType: 'Online',
      displayStatus: 'Scheduled',
      roomName,
      isStatic: false,
    };
  }

  getTimeBucket(scheduledTime: string): InterviewTimeBucket {
    const date = new Date(scheduledTime);
    const now = new Date();
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayMs = 86_400_000;

    const interviewDay = startOf(date).getTime();
    const today = startOf(now).getTime();
    const tomorrow = today + dayMs;

    if (interviewDay === today) return 'today';
    if (interviewDay === tomorrow) return 'tomorrow';

    const daysUntilSaturday = 6 - now.getDay();
    const endOfWeek = today + daysUntilSaturday * dayMs;
    if (interviewDay > tomorrow && interviewDay <= endOfWeek) return 'thisWeek';
    return 'later';
  }

  typeBadgeClass(type: InterviewType): string {
    const map: Record<InterviewType, string> = {
      Online: 'bg-primary-container/20 text-primary',
      'On-site': 'bg-secondary-container/20 text-secondary',
      Technical: 'bg-tertiary-container/20 text-tertiary',
      HR: 'bg-surface-container-high text-on-surface-variant',
    };
    return map[type] ?? 'bg-surface-container-high text-on-surface-variant';
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-tertiary/15 text-tertiary';
      case 'Pending':
        return 'bg-secondary/15 text-secondary';
      case 'Rescheduled':
        return 'bg-primary/15 text-primary';
      default:
        return 'bg-primary-container/30 text-on-primary-container';
    }
  }

  formatTime(scheduledTime: string): string {
    return new Date(scheduledTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  formatDate(scheduledTime: string): string {
    return new Date(scheduledTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  viewInterview(item: UpcomingInterviewItem): void {
    this.expandedId.update((current) => (current === item.id ? null : item.id));
  }

  rescheduleInterview(item: UpcomingInterviewItem): void {
    if (item.isStatic) {
      this.interviews.update((list) =>
        list.map((row) =>
          row.id === item.id ? { ...row, displayStatus: 'Rescheduled' as const } : row
        )
      );
    }
    this.toast.show(`Reschedule request noted for ${item.candidateName}.`, 'info');
  }

  schedule(): void {
    if (this.interviewForm.invalid || this.isSubmitting()) {
      this.interviewForm.markAllAsTouched();
      return;
    }

    const value = this.interviewForm.getRawValue();
    const selectedDate = new Date(value.scheduledTime);

    if (isNaN(selectedDate.getTime())) {
      this.toast.error('Please enter a valid date and time.');
      return;
    }
    if (selectedDate.getTime() <= Date.now()) {
      this.toast.error('Interview must be scheduled for a future date.');
      return;
    }

    const scheduledTimeLocal = value.scheduledTime.includes(':00', value.scheduledTime.length - 3)
      ? value.scheduledTime
      : value.scheduledTime + ':00';

    const roomId = this.generateRoomId();
    const meetingLink = `https://meet.jit.si/TallentX-${roomId}`;

    this.isSubmitting.set(true);

    this.interviewService
      .schedule({
        jobApplicationId: Number(value.jobApplicationId),
        scheduledTime: scheduledTimeLocal,
        durationMinutes: Number(value.durationMinutes),
        meetingLink,
        notes: value.notes || undefined,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (created) => {
          const display = this.toDisplayItem(created);
          display.roomName = meetingLink.split('/').pop();
          display.companyName = 'Your Company';
          display.interviewType = 'Online';
          display.displayStatus = 'Scheduled';
          this.interviews.update((current) => this.mergeWithStatic([display, ...current]));
          this.interviewForm.reset({
            jobApplicationId: 0,
            scheduledTime: '',
            durationMinutes: 45,
            meetingLink: '',
            notes: '',
          });
          this.toast.success('Interview scheduled successfully.');
        },
        error: (err) => {
          const serverMsg = err?.error?.message || err?.error?.title || 'Failed to schedule interview.';
          this.toast.error(serverMsg);
        },
      });
  }

  cancelInterview(interviewId: number): void {
    const target = this.interviews().find((i) => i.id === interviewId);
    if (target?.isStatic) {
      this.interviews.update((current) =>
        current.map((item) => (item.id === interviewId ? { ...item, status: 'Cancelled' } : item))
      );
      this.toast.success('Interview cancelled.');
      return;
    }

    this.interviewService.cancel(interviewId).subscribe({
      next: () => {
        this.interviews.update((current) =>
          current.map((item) => (item.id === interviewId ? { ...item, status: 'Cancelled' } : item))
        );
        this.toast.success('Interview cancelled.');
      },
      error: () => this.toast.error('Failed to cancel interview.'),
    });
  }

  generateRoomId(): string {
    return 'room-' + Math.random().toString(36).substring(2, 10);
  }

  startInterview(): void {
    const roomId = this.generateRoomId();
    this.router.navigate(['/interview', roomId]);
  }

  joinInterview(link: string | undefined): void {
    if (!link) {
      this.toast.show('No meeting link available for this interview.', 'info');
      return;
    }
    const roomId = link.split('/').pop();
    if (roomId) {
      this.router.navigate(['/interview', roomId]);
    }
  }
}
