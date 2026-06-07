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
  QuestionPayload,
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
    'Multiple Choice',
    'True/False',
    'Text Answer',
    'Coding Challenge',
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

    console.log(
      'Assessment Payload',
      JSON.stringify(payload, null, 2)
    );
    req$
      .pipe(finalize(() => (isPublish ? this.isPublishing : this.isSaving).set(false)))
      .subscribe({
        next: (saved) => {
          this.assessmentId.set(saved.id);
          this.autoSaveAt.set(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          this.markSnapshotAsSaved();
          this.toast.success(status === 'Published' ? 'Assessment published.' : 'Draft saved.');
        },
        error: (err) => {
          const userMessage = err?.userMessage || `Failed to save assessment.`;
          const validationErrors = err?.error?.errors?.validation;
          if (validationErrors && Array.isArray(validationErrors)) {
            this.toast.error(validationErrors[0] || userMessage);
          } else {
            this.toast.error(userMessage);
          }
        },
      });
  }

  private toPayload(status: 'Draft' | 'Published'): AssessmentBuilderPayload {
    const v = this.builderForm.getRawValue();

    // Map backend AssessmentType: 0=Technical, 1=Personality, 2=Mixed
    // For now, default to Technical (0) - can be extended to let users choose
    const assessmentType = 0; // AssessmentType.Technical

    return {
      id: this.assessmentId() ?? undefined,
      jobPostId: Number(v.jobPostingId),  // Changed from 'jobPostingId' to 'jobPostId'
      title: v.title.trim(),
      description: v.description.trim(),
      type: assessmentType,               // Changed from 'status' to 'type' with numeric value
      timeLimitMinutes: Number(v.timeLimitMinutes),
      isAiGenerated: true,                // Mark as AI generated
      questions: v.questions.map((q: any, index: number): QuestionPayload => {
        // Convert options array to JSON string for MCQ
        let optionsStr: string | undefined;
        if (q.type === 'Multiple Choice' && q.options) {
          const optionsList = typeof q.options === 'string'
            ? String(q.options || '')
              .split('\n')
              .map((x: string) => x.trim())
              .filter(Boolean)
            : Array.isArray(q.options) ? q.options : [];
          optionsStr = JSON.stringify(optionsList);
        }

        return {
          id: Number(q.id),
          text: String(q.title || '').trim(),  // Changed from 'title' to 'text' (backend requirement)
          type: q.type as QuestionType,
          options: optionsStr,                 // JSON string for MCQ
          correctAnswer: q.correctAnswer,      // Include answer key if provided
          points: Number(q.points),
          orderIndex: index,                   // REQUIRED: position in assessment

          // Legacy properties for backward compatibility
          title: String(q.title || '').trim(),
          description: String(q.description || '').trim(),
          timeLimitMinutes: Number(q.timeLimitMinutes),
          required: Boolean(q.required),
          rubric: q.rubric ? String(q.rubric) : undefined,
          starterCode: q.type === 'Coding Challenge' ? q.starterCode : undefined,
        };
      }),

      // Legacy properties for backward compatibility
      jobPostingId: Number(v.jobPostingId),
      status,
      passingScore: Number(v.passingScore || 0),
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
        error: (err) => {
          const userMessage = err?.userMessage || 'Unable to load assessment. Starting a new draft.';
          if (this.questions.length === 0) this.addQuestion();
          this.toast.error(userMessage);
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
