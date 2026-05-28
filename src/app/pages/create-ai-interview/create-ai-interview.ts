import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ToastService } from '../../core/services/toast.service';
import { AssessmentService } from '../../core/services/assessment.service';
import {
  AssessmentBuilderPayload,
  AssessmentDetailDto,
  QuestionType,
} from '../../core/models/assessment.models';

@Component({
  selector: 'app-create-ai-interview-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, RouterModule],
  templateUrl: './create-ai-interview.html',
})
export class CreateAiInterviewPage implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private assessmentService = inject(AssessmentService);
  private route = inject(ActivatedRoute);

  readonly assessmentId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly isPublishing = signal(false);
  readonly previewMode = signal(false);
  readonly autoSaveAt = signal<string>('');
  readonly isLoadingExisting = signal(false);
  private lastSavedSnapshot = '';

  readonly questionTypes: QuestionType[] = [
    'Coding Challenge',
    'Multiple Choice',
    'Conceptual',
    'Text Answer',
  ];

  readonly builderForm = this.fb.nonNullable.group({
    jobPostingId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: [''],
    timeLimitMinutes: [60, [Validators.required, Validators.min(15)]],
    passingScore: [70],
    questions: this.fb.array([]),
  });

  readonly totalPoints = computed(() =>
    this.questions.controls.reduce((sum, q) => sum + Number(q.get('points')?.value ?? 0), 0)
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));
    if (Number.isFinite(id) && id > 0) {
      this.assessmentId.set(id);
      this.loadExisting(id);
      return;
    }
    if (this.questions.length === 0) this.addQuestion();
    this.markSnapshotAsSaved();
  }

  get questions(): FormArray {
    return this.builderForm.get('questions') as FormArray;
  }

  questionAt(i: number) {
    return this.questions.at(i);
  }

  addQuestion(type: QuestionType = 'Multiple Choice'): void {
    this.questions.push(
      this.fb.nonNullable.group({
        id: [Date.now() + Math.floor(Math.random() * 1000)],
        type: [type],
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        options: [type === 'Multiple Choice' ? 'Option A\nOption B\nOption C' : ''],
        starterCode: [type === 'Coding Challenge' ? '// Write your solution here' : ''],
        points: [10, [Validators.required, Validators.min(1)]],
        timeLimitMinutes: [10, [Validators.required, Validators.min(1)]],
        required: [true],
        rubric: [''],
      })
    );
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  moveQuestion(index: number, dir: -1 | 1): void {
    const target = index + dir;
    if (target < 0 || target >= this.questions.length) return;
    const current = this.questions.at(index);
    this.questions.removeAt(index);
    this.questions.insert(target, current);
  }

  dropQuestion(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const moved = this.questions.at(event.previousIndex);
    this.questions.removeAt(event.previousIndex);
    this.questions.insert(event.currentIndex, moved);
  }

  generateRubric(index: number): void {
    const q = this.questionAt(index);
    const type = q.get('type')?.value as QuestionType;
    const title = q.get('title')?.value || 'the question';
    const rubric =
      type === 'Coding Challenge'
        ? `Evaluate ${title} on correctness (50%), code quality (30%), and edge-case handling (20%).`
        : `Evaluate ${title} on clarity, domain understanding, and practical reasoning.`;
    q.get('rubric')?.setValue(rubric);
    this.toast.aiInsight('Rubric generated.');
  }

  saveDraft(): void {
    this.persist('Draft');
  }

  publish(): void {
    this.persist('Published');
  }

  private persist(status: 'Draft' | 'Published'): void {
    if (this.builderForm.invalid) {
      this.builderForm.markAllAsTouched();
      this.toast.error('Please complete required fields before saving.');
      return;
    }

    const payload = this.toPayload(status);
    const id = this.assessmentId();
    const isPublish = status === 'Published';
    (isPublish ? this.isPublishing : this.isSaving).set(true);

    const req$ = id
      ? this.assessmentService.update(id, payload)
      : this.assessmentService.create(payload);

    req$
      .pipe(finalize(() => (isPublish ? this.isPublishing : this.isSaving).set(false)))
      .subscribe({
        next: (saved) => {
          this.assessmentId.set(saved.id);
          this.autoSaveAt.set(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          this.markSnapshotAsSaved();
          this.toast.success(status === 'Published' ? 'Assessment published.' : 'Draft saved.');
        },
        error: () => this.toast.error('Failed to save assessment.'),
      });
  }

  private toPayload(status: 'Draft' | 'Published'): AssessmentBuilderPayload {
    const v = this.builderForm.getRawValue();
    return {
      id: this.assessmentId() ?? undefined,
      jobPostingId: Number(v.jobPostingId),
      title: v.title.trim(),
      description: v.description.trim(),
      timeLimitMinutes: Number(v.timeLimitMinutes),
      passingScore: Number(v.passingScore || 0),
      status,
      questions: v.questions.map((q: any) => ({
        id: Number(q.id),
        type: q.type,
        title: String(q.title || '').trim(),
        description: String(q.description || '').trim(),
        points: Number(q.points),
        timeLimitMinutes: Number(q.timeLimitMinutes),
        required: Boolean(q.required),
        options: q.type === 'Multiple Choice'
          ? String(q.options || '')
              .split('\n')
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
        starterCode: q.type === 'Coding Challenge' ? q.starterCode : undefined,
        rubric: q.rubric ? String(q.rubric) : undefined,
      })),
    };
  }

  hasPendingChanges(): boolean {
    return this.serializeState() !== this.lastSavedSnapshot;
  }

  private loadExisting(id: number): void {
    this.isLoadingExisting.set(true);
    this.assessmentService
      .getById(id)
      .pipe(finalize(() => this.isLoadingExisting.set(false)))
      .subscribe({
        next: (assessment) => {
          this.patchFromAssessment(assessment);
          this.markSnapshotAsSaved();
        },
        error: () => {
          if (this.questions.length === 0) this.addQuestion();
          this.toast.error('Unable to load assessment. Starting a new draft.');
        },
      });
  }

  private patchFromAssessment(assessment: AssessmentDetailDto): void {
    this.builderForm.patchValue({
      jobPostingId: assessment.jobPostingId,
      title: assessment.title,
      description: assessment.description || '',
      timeLimitMinutes: assessment.timeLimitMinutes ?? 60,
      passingScore: assessment.passingScore ?? 70,
    });

    this.questions.clear();
    for (const q of assessment.questions || []) {
      this.questions.push(
        this.fb.nonNullable.group({
          id: [q.id],
          type: [q.type],
          title: [q.title, [Validators.required, Validators.minLength(3)]],
          description: [q.description || ''],
          options: [(q.options || []).join('\n')],
          starterCode: [q.starterCode || ''],
          points: [q.points || 10, [Validators.required, Validators.min(1)]],
          timeLimitMinutes: [q.timeLimitMinutes || 10, [Validators.required, Validators.min(1)]],
          required: [q.required ?? true],
          rubric: [q.rubric || ''],
        })
      );
    }
    if (this.questions.length === 0) this.addQuestion();
  }

  private serializeState(): string {
    return JSON.stringify(this.builderForm.getRawValue());
  }

  private markSnapshotAsSaved(): void {
    this.lastSavedSnapshot = this.serializeState();
  }
}
