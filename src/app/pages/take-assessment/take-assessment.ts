import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../core/services/toast.service';
import { AssessmentService } from '../../core/services/assessment.service';
import { AssignedAssessmentDto, AssessmentDetailDto } from '../../core/models/assessment.models';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-take-assessment-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './take-assessment.html',
})
export class TakeAssessmentPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private assessmentService = inject(AssessmentService);

  readonly assessmentId = signal<number | null>(null);
  readonly assigned = signal<AssignedAssessmentDto[]>([]);
  readonly assessment = signal<AssessmentDetailDto | null>(null);
  readonly currentIndex = signal(0);
  readonly startedAt = signal<string>('');
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly remainingSeconds = signal(0);

  private timerRef?: ReturnType<typeof setInterval>;

  readonly hasActiveAssessment = computed(() => this.assessment() !== null);
  readonly currentQuestion = computed(() => this.assessment()?.questions[this.currentIndex()] ?? null);
  readonly progressPercent = computed(() => {
    const total = this.assessment()?.questions.length ?? 0;
    if (!total) return 0;
    return Math.round((this.answeredCount() / total) * 100);
  });

  readonly answersForm = this.fb.nonNullable.group({
    answers: this.fb.record<string>({}),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isFinite(id) && id > 0) {
      this.loadAssessment(id);
    } else {
      this.loadAssigned();
    }
  }

  ngOnDestroy(): void {
    if (this.timerRef) clearInterval(this.timerRef);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasActiveAssessment() && this.answeredCount() > 0) {
      event.preventDefault();
      event.returnValue = true;
    }
  }

  loadAssigned(): void {
    this.isLoading.set(true);
    this.assessmentService
      .getAssignedForCandidate()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (items) => this.assigned.set(items ?? []),
        error: () => this.assigned.set([]),
      });
  }

  loadAssessment(id: number): void {
    this.assessmentId.set(id);
    this.isLoading.set(true);
    this.assessmentService
      .getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.assessment.set(data);
          this.startedAt.set(new Date().toISOString());
          this.restoreAutosave();
          this.startTimer((data.timeLimitMinutes ?? 60) * 60);
        },
        error: () => {
          this.toast.error('Could not load assessment.');
          this.router.navigate(['/candidate/assessments']);
        },
      });
  }

  startAssigned(item: AssignedAssessmentDto): void {
    this.router.navigate(['/candidate/assessments', item.assessmentId]);
  }

  answerFor(questionId: number): string {
    return this.answersForm.controls.answers.get(String(questionId))?.value ?? '';
  }

  setAnswer(questionId: number, value: string): void {
    this.answersForm.controls.answers.setControl(String(questionId), this.fb.control(value));
    this.persistAutosave();
  }

  answeredCount(): number {
    return Object.values(this.answersForm.controls.answers.value).filter((v) => String(v ?? '').trim() !== '').length;
  }

  goQuestion(index: number): void {
    const total = this.assessment()?.questions.length ?? 0;
    if (index < 0 || index >= total) return;
    this.currentIndex.set(index);
  }

  nextQuestion(): void {
    this.goQuestion(this.currentIndex() + 1);
  }

  prevQuestion(): void {
    this.goQuestion(this.currentIndex() - 1);
  }

  exitAssessment(): void {
    if (confirm('Your answers are autosaved. Exit assessment now?')) {
      this.router.navigate(['/candidate/assessments']);
    }
  }

  submit(): void {
    const id = this.assessmentId();
    if (!id) return;
    this.isSubmitting.set(true);
    const answers = Object.entries(this.answersForm.controls.answers.value).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer: String(answer ?? ''),
    }));
    this.assessmentService
      .submit(id, { answers, startedAt: this.startedAt(), submittedAt: new Date().toISOString() })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.clearAutosave();
          this.toast.success('Assessment submitted successfully.');
          this.router.navigate(['/candidate/assessments']);
        },
        error: () => this.toast.error('Failed to submit assessment.'),
      });
  }

  private startTimer(totalSeconds: number): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.remainingSeconds.set(totalSeconds);
    this.timerRef = setInterval(() => {
      const next = this.remainingSeconds() - 1;
      this.remainingSeconds.set(next);
      if (next <= 0) {
        clearInterval(this.timerRef);
        this.submit();
      }
    }, 1000);
  }

  timerLabel(): string {
    const s = this.remainingSeconds();
    const hh = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private autosaveKey(): string {
    return `assessment_answers_${this.assessmentId() ?? 'none'}`;
  }

  private persistAutosave(): void {
    localStorage.setItem(this.autosaveKey(), JSON.stringify(this.answersForm.controls.answers.value));
  }

  private restoreAutosave(): void {
    const raw = localStorage.getItem(this.autosaveKey());
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      Object.entries(parsed).forEach(([k, v]) => {
        this.answersForm.controls.answers.setControl(k, this.fb.control(v));
      });
      if (Object.keys(parsed).length > 0) this.toast.show('Recovered autosaved answers.', 'info');
    } catch {
      // ignore invalid cache
    }
  }

  private clearAutosave(): void {
    localStorage.removeItem(this.autosaveKey());
  }
}
