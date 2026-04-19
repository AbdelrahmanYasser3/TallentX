import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { InterviewService } from '../../core/services/interview.service';
import { InterviewDto } from '../../core/models/interview.models';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

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

  readonly interviews = signal<InterviewDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);

  readonly upcoming = computed(() =>
    this.interviews()
      .filter((item) => item.status === 'Scheduled')
      .sort((a, b) =>
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      )
  );

  /** Minimum datetime value for the scheduling input (now, in local time format) */
  get minDateTime(): string {
    const now = new Date();
    // datetime-local requires "YYYY-MM-DDTHH:mm" format in local time
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  readonly interviewForm = this.fb.nonNullable.group({
    jobApplicationId: [0, [Validators.required, Validators.min(1)]],
    scheduledTime: ['', Validators.required],
    durationMinutes: [45, [Validators.required, Validators.min(15)]],
    meetingLink: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.isLoading.set(true);

    this.interviewService.getByRecruiter()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => this.interviews.set(items ?? []),
        error: () => {
          this.interviews.set([]);
          this.toast.error('Failed to load interviews.');
        }
      });
  }

  schedule(): void {
    if (this.interviewForm.invalid || this.isSubmitting()) {
      this.interviewForm.markAllAsTouched();
      return;
    }

    const value = this.interviewForm.getRawValue();

    // 1. Parse the datetime-local value ("2026-04-30T16:00") into a Date object.
    //    datetime-local gives a naive local-time string — no timezone indicator.
    const selectedDate = new Date(value.scheduledTime);

    // 2. Frontend validation — reject past dates before making a network call.
    if (isNaN(selectedDate.getTime())) {
      this.toast.error('Please enter a valid date and time.');
      return;
    }
    if (selectedDate.getTime() <= Date.now()) {
      this.toast.error('Interview must be scheduled for a future date.');
      return;
    }

    // 3. Send the local time AS-IS — do NOT convert to UTC with toISOString().
    //
    //    WHY: toISOString() shifts the time to UTC (e.g., 16:00 UTC+2 → 14:00Z),
    //    but the backend compares against DateTime.Now (server-local, not UtcNow).
    //    If the server is in a different timezone, the shifted time can appear
    //    to be in the past, causing "must be scheduled for a future date".
    //
    //    The datetime-local value ("2026-04-30T16:00") is already ISO 8601.
    //    We append ":00" for seconds so ASP.NET Core parses it cleanly.
    const scheduledTimeLocal = value.scheduledTime.includes(':00', value.scheduledTime.length - 3)
      ? value.scheduledTime
      : value.scheduledTime + ':00';

    console.log('[InterviewScheduling] User selected (local):', value.scheduledTime);
    console.log('[InterviewScheduling] Sent to backend:', scheduledTimeLocal);

    const roomId = this.generateRoomId();
    const meetingLink = `https://meet.jit.si/TallentX-${roomId}`;

    this.isSubmitting.set(true);

    this.interviewService.schedule({
      jobApplicationId: Number(value.jobApplicationId),
      scheduledTime: scheduledTimeLocal,
      durationMinutes: Number(value.durationMinutes),
      meetingLink: meetingLink,
      notes: value.notes || undefined
    })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (created) => {
          this.interviews.update((current) => [created, ...current]);

          this.interviewForm.reset({
            jobApplicationId: 0,
            scheduledTime: '',
            durationMinutes: 45,
            meetingLink: '',
            notes: ''
          });

          this.toast.success('Interview scheduled successfully.');
        },
        error: (err) => {
          const serverMsg = err?.error?.message || err?.error?.title || 'Failed to schedule interview.';
          this.toast.error(serverMsg);
          console.error('[InterviewScheduling] Schedule failed:', err?.status, err?.error);
        }
      });
  }

  cancelInterview(interviewId: number): void {
    this.interviewService.cancel(interviewId).subscribe({
      next: () => {
        this.interviews.update((current) =>
          current.map((item) =>
            item.id === interviewId
              ? { ...item, status: 'Cancelled' }
              : item
          )
        );
        this.toast.success('Interview cancelled.');
      },
      error: () => this.toast.error('Failed to cancel interview.')
    });
  }

  generateRoomId(): string {
    return 'room-' + Math.random().toString(36).substring(2, 10);
  }

  startInterview() {
    const roomId = this.generateRoomId();

    const interviews = JSON.parse(localStorage.getItem('interviews') || '[]');

    interviews.push({
      roomId,
      date: new Date(),
      status: 'started'
    });

    localStorage.setItem('interviews', JSON.stringify(interviews));

    this.router.navigate(['/interview', roomId]);
  }

  joinInterview(link: string) {
    if (!link) return;

    const roomId = link.split('/').pop();
    this.router.navigate(['/interview', roomId]);
  }
}