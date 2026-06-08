import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AssessmentService } from '../../core/services/assessment.service';
import { RecruiterService, RecruiterJob } from '../../core/services/recruiter';
import { ToastService } from '../../core/services/toast.service';
import { AssessmentDetailDto, QuestionDto } from '../../core/models/assessment.models';

@Component({
  selector: 'app-recruiter-assessments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recruiter-assessments.html',
})
export class RecruiterAssessmentsPage implements OnInit {
  private assessmentService = inject(AssessmentService);
  private recruiterService = inject(RecruiterService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals
  readonly assessments = signal<AssessmentDetailDto[]>([]);
  readonly jobs = signal<RecruiterJob[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly activeTab = signal<'list' | 'create'>('list');

  // Form for creating manual assessment
  readonly createForm = this.fb.group({
    jobPostingId: [0, [Validators.required, Validators.min(1)]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    timeLimitMinutes: [30, [Validators.required, Validators.min(5)]],
    passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
    questions: this.fb.array([]),
  });

  get questionsFormArray(): FormArray {
    return this.createForm.get('questions') as FormArray;
  }

  ngOnInit() {
    this.loadData();
  }

  parseAssessment(a: any): AssessmentDetailDto {
    return {
      ...a,
      jobPostingId: a.jobPostingId ?? a.jobPostId,
      questions: (a.questions ?? []).map((q: any) => {
        let parsedOptions: string[] = [];
        if (typeof q.options === 'string') {
          try {
            parsedOptions = JSON.parse(q.options);
          } catch {
            parsedOptions = [];
          }
        } else if (Array.isArray(q.options)) {
          parsedOptions = q.options;
        }
        return {
          ...q,
          options: parsedOptions,
          correctOptionIndex: Number(q.correctOptionIndex ?? q.correctAnswer ?? 0)
        };
      })
    };
  }

  loadData() {
    this.isLoading.set(true);
    this.recruiterService.getJobPostings().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        if (jobs.length > 0) {
          const requests = jobs.map((job) =>
            this.assessmentService.getByJob(Number(job.id)).pipe(
              catchError(() => of([] as AssessmentDetailDto[]))
            )
          );
          forkJoin(requests)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
              next: (results) => {
                const mapped = results.flat().map(a => this.parseAssessment(a));
                this.assessments.set(mapped);
              },
              error: () => {
                this.assessments.set([]);
              },
            });
        } else {
          this.assessments.set([]);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.error('Failed to load job postings.');
        this.isLoading.set(false);
      },
    });
  }

  getJobTitle(jobId: number): string {
    const job = this.jobs().find(j => Number(j.id) === jobId);
    return job ? job.title : `Job #${jobId}`;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      option0: ['', Validators.required],
      option1: ['', Validators.required],
      option2: ['', Validators.required],
      option3: ['', Validators.required],
      correctOptionIndex: [0, Validators.required],
    });
    this.questionsFormArray.push(questionGroup);
  }

  removeQuestion(index: number) {
    this.questionsFormArray.removeAt(index);
  }

  createManualAssessment() {
    if (this.createForm.invalid || this.isSubmitting()) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.value;
    const questionsRaw = (val.questions || []) as any[];

    // Transform questions to match backend CreateQuestionDto
    const questions = questionsRaw.map((q, idx) => ({
      text: q.text,
      type: 0, // MCQ QuestionType
      options: JSON.stringify([q.option0, q.option1, q.option2, q.option3]),
      correctAnswer: String(q.correctOptionIndex),
      points: 10, // Default to pass backend validation range
      orderIndex: idx + 1,
    }));

    const payload = {
      jobPostId: Number(val.jobPostingId), // Map to jobPostId
      title: val.title,
      description: val.description || '',
      type: 0, // Technical AssessmentType
      timeLimitMinutes: Number(val.timeLimitMinutes),
      questions,
    };

    this.isSubmitting.set(true);
    this.assessmentService.create(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (created) => {
          this.toast.success('Assessment created successfully.');
          this.assessments.update(curr => [...curr, this.parseAssessment(created)]);
          this.resetForm();
          this.activeTab.set('list');
        },
        error: (err) => {
          this.toast.error(err?.error?.message || err?.error?.title || 'Failed to create assessment.');
        }
      });
  }

  generateAIAssessment(jobId: number) {
    if (!jobId) {
      this.toast.error('Please select a job first.');
      return;
    }
    
    this.isSubmitting.set(true);
    this.assessmentService.generate(jobId)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (created) => {
          this.toast.success('AI Assessment generated successfully.');
          this.assessments.update(curr => [...curr, this.parseAssessment(created)]);
          this.activeTab.set('list');
        },
        error: (err) => {
          this.toast.error(err?.error?.message || err?.error?.title || 'Failed to generate AI assessment.');
        }
      });
  }

  resetForm() {
    this.createForm.reset({
      jobPostingId: 0,
      title: '',
      description: '',
      timeLimitMinutes: 30,
      passingScore: 70,
    });
    this.questionsFormArray.clear();
  }
}
