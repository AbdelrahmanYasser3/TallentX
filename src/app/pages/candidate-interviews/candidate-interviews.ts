import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { InterviewService } from '../../core/services/interview.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { InterviewDto } from '../../core/models/interview.models';

@Component({
  selector: 'app-candidate-interviews-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-interviews.html',
})
export class CandidateInterviewsPage implements OnInit {
  private interviewService = inject(InterviewService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  readonly interviews = signal<InterviewDto[]>([]);
  readonly isLoading = signal<boolean>(true);

  readonly upcoming = computed(() =>
    this.interviews()
      .filter((item) => item.status === 'Scheduled')
      .sort((left, right) => new Date(left.scheduledTime).getTime() - new Date(right.scheduledTime).getTime())
  );

  readonly completed = computed(() =>
    this.interviews()
      .filter((item) => item.status !== 'Scheduled')
      .sort((left, right) => new Date(right.scheduledTime).getTime() - new Date(left.scheduledTime).getTime())
  );

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading.set(false);
      this.toast.error('Session not found. Please login again.');
      return;
    }

    this.isLoading.set(true);
    this.interviewService.getByCandidate(userId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => this.interviews.set(items ?? []),
        error: () => {
          this.interviews.set([]);
          this.toast.error('Failed to load interviews.');
        }
      });
  }
}
