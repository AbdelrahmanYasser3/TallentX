import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { RecruiterCandidateService } from '../../core/services/recruiter-candidate.service';
import { RecruiterService } from '../../core/services/recruiter';
import { AssessmentService } from '../../core/services/assessment.service';
import { ToastService } from '../../core/services/toast.service';
import { RecruiterApplicantDetailView } from '../../core/models/recruiter-candidate.models';
import {
  PIPELINE_STAGES,
  PipelineStageId,
} from '../../core/models/pipeline.models';
import { getStageConfig, initials } from '../../core/utils/pipeline.mapper';
import { AssessmentListItemDto } from '../../core/models/assessment.models';

@Component({
  selector: 'app-recruiter-candidate-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './recruiter-candidate-detail.html',
})
export class RecruiterCandidateDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private detailService = inject(RecruiterCandidateService);
  private recruiterService = inject(RecruiterService);
  private assessmentService = inject(AssessmentService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly detail = signal<RecruiterApplicantDetailView | null>(null);
  readonly isLoading = signal(true);
  readonly stages = PIPELINE_STAGES;
  readonly assessments = signal<AssessmentListItemDto[]>([]);
  readonly scheduleOpen = signal(false);
  readonly assignOpen = signal(false);
  readonly cvExpanded = signal(true);

  readonly recruiterNotes = signal('');

  readonly scheduleForm = this.fb.group({
    scheduledTime: ['', Validators.required],
    durationMinutes: [45, [Validators.required, Validators.min(15)]],
    meetingLink: [''],
    notes: [''],
  });

  readonly assignForm = this.fb.group({
    assessmentId: [null as number | null, Validators.required],
  });

  private jobId: number | null = null;
  private candidateId = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.candidateId = params.get('candidateId') ?? '';
      const jobParam = params.get('jobId');
      this.jobId = jobParam ? Number(jobParam) : null;

      const applicationId = Number(this.route.snapshot.queryParamMap.get('applicationId'));
      this.loadDetail(
        this.candidateId,
        Number.isFinite(applicationId) && applicationId > 0 ? applicationId : null
      );
    });

    this.assessmentService.getAll().subscribe({
      next: (items) => this.assessments.set(items ?? []),
      error: () => this.assessments.set([]),
    });
  }

  initials = initials;
  getStageConfig = getStageConfig;

  backLink(): string[] {
    if (this.jobId) {
      return ['/recruiter/jobs', String(this.jobId), 'pipeline'];
    }
    return ['/recruiter/jobs'];
  }

  stageBadgeClass(stageId: PipelineStageId): Record<string, boolean> {
    const theme = getStageConfig(stageId).theme;
    return {
      'bg-primary-container text-on-primary-container': theme === 'primary',
      'bg-secondary-container text-on-secondary-container': theme === 'secondary',
      'bg-tertiary-container text-on-tertiary-container': theme === 'tertiary',
      'bg-success-container text-on-success-container': theme === 'success',
      'bg-error-container text-on-error-container': theme === 'error',
    };
  }

  onStageChange(raw: string): void {
    const stageId = raw as PipelineStageId;
    const d = this.detail();
    if (!d) return;

    this.detailService.updateStage(d.applicationId, stageId).subscribe({
      next: () => {
        this.detail.update((current) =>
          current
            ? {
                ...current,
                stageId,
                applicationStatus: getStageConfig(stageId).apiStatus,
              }
            : current
        );
        this.toast.success(`Stage updated to ${getStageConfig(stageId).label}.`);
      },
      error: () => this.toast.error('Failed to update stage.'),
    });
  }

  shortlist(): void {
    this.onStageChange('shortlisted');
  }

  reject(): void {
    this.onStageChange('rejected');
  }

  openSchedule(): void {
    this.scheduleForm.reset({
      scheduledTime: '',
      durationMinutes: 45,
      meetingLink: '',
      notes: '',
    });
    this.scheduleOpen.set(true);
  }

  closeSchedule(): void {
    this.scheduleOpen.set(false);
  }

  submitSchedule(): void {
    const d = this.detail();
    if (!d || this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const value = this.scheduleForm.getRawValue();
    this.recruiterService
      .scheduleInterview({
        jobApplicationId: d.applicationId,
        scheduledTime: new Date(value.scheduledTime!).toISOString(),
        durationMinutes: Number(value.durationMinutes),
        meetingLink: value.meetingLink || undefined,
        notes: value.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.detail.update((current) =>
            current ? { ...current, interviewStatus: 'Scheduled', stageId: 'interview' } : current
          );
          this.toast.success('Interview scheduled.');
          this.closeSchedule();
        },
        error: () => this.toast.error('Failed to schedule interview.'),
      });
  }

  openAssign(): void {
    this.assignForm.reset({ assessmentId: null });
    this.assignOpen.set(true);
  }

  closeAssign(): void {
    this.assignOpen.set(false);
  }

  submitAssign(): void {
    const d = this.detail();
    const assessmentId = this.assignForm.value.assessmentId;
    if (!d || !assessmentId) {
      this.assignForm.markAllAsTouched();
      return;
    }

    this.assessmentService.assign(assessmentId, [d.candidateId]).subscribe({
      next: () => {
        this.detail.update((current) =>
          current
            ? { ...current, assessmentStatus: 'Assigned', stageId: 'assessment' }
            : current
        );
        this.toast.success('Assessment assigned.');
        this.closeAssign();
      },
      error: () => this.toast.error('Failed to assign assessment.'),
    });
  }

  viewCv(): void {
    const d = this.detail();
    if (!d?.cvDownloadUrl) {
      this.toast.show('No resume available.', 'info');
      return;
    }
    window.open(d.cvDownloadUrl, '_blank', 'noopener,noreferrer');
  }

  downloadResume(): void {
    this.viewCv();
  }

  sendEmail(): void {
    const d = this.detail();
    if (!d?.email) {
      this.toast.show('No email on file.', 'info');
      return;
    }
    window.location.href = `mailto:${d.email}?subject=Regarding your application — ${d.jobTitle}`;
  }

  saveNotes(): void {
    const d = this.detail();
    if (!d) return;
    this.detail.update((current) =>
      current ? { ...current, recruiterNotes: this.recruiterNotes() } : current
    );
    this.toast.success('Notes saved locally.');
  }

  private loadDetail(candidateId: string, applicationId: number | null): void {
    if (!candidateId) {
      this.isLoading.set(false);
      this.toast.error('Invalid candidate.');
      return;
    }

    this.isLoading.set(true);
    const jobTitle = this.route.snapshot.queryParamMap.get('jobTitle') ?? undefined;

    this.detailService
      .loadApplicantDetail({
        candidateId,
        applicationId,
        jobId: this.jobId,
        jobTitle: jobTitle ?? undefined,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (view) => {
          this.detail.set(view);
          this.recruiterNotes.set(view.recruiterNotes ?? '');
          if (!view.cvPreviewText && view.resumeId) {
            this.detailService.getCvPreview(candidateId, view.resumeId).subscribe({
              next: (text) => {
                if (text?.trim()) {
                  this.detail.update((c) => (c ? { ...c, cvPreviewText: text } : c));
                }
              },
            });
          }
        },
        error: () => {
          this.detail.set(null);
          this.toast.error('Failed to load candidate profile.');
        },
      });
  }
}
