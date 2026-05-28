import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';
import { finalize, switchMap } from 'rxjs/operators';
import { JobApplicationService } from '../../core/services/job-application.service';
import { RecruiterService } from '../../core/services/recruiter';
import { AssessmentService } from '../../core/services/assessment.service';
import { JobService } from '../../core/services/job';
import { ToastService } from '../../core/services/toast.service';
import {
  PIPELINE_STAGES,
  PipelineApplicantView,
  PipelineStageId,
} from '../../core/models/pipeline.models';
import {
  apiStatusToStageId,
  getStageConfig,
  initials,
  stageIdToApiStatus,
  toPipelineApplicant,
} from '../../core/utils/pipeline.mapper';
import { AssessmentListItemDto } from '../../core/models/assessment.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-recruiter-applicants-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
  ],
  templateUrl: './recruiter-applicants.html',
})
export class RecruiterApplicantsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobApplications = inject(JobApplicationService);
  private recruiterService = inject(RecruiterService);
  private assessmentService = inject(AssessmentService);
  private jobService = inject(JobService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly stages = PIPELINE_STAGES;
  readonly jobId = signal<number>(0);
  readonly jobTitle = signal<string>('Position');
  readonly applicants = signal<PipelineApplicantView[]>([]);
  readonly isLoading = signal(true);
  readonly searchTerm = signal('');
  readonly assessments = signal<AssessmentListItemDto[]>([]);

  readonly scheduleOpen = signal(false);
  readonly assignOpen = signal(false);
  readonly activeApplicant = signal<PipelineApplicantView | null>(null);

  readonly scheduleForm = this.fb.group({
    scheduledTime: ['', Validators.required],
    durationMinutes: [45, [Validators.required, Validators.min(15)]],
    meetingLink: [''],
    notes: [''],
  });

  readonly assignForm = this.fb.group({
    assessmentId: [null as number | null, Validators.required],
  });

  readonly totalApplicants = computed(() => this.applicants().length);

  ngOnInit(): void {
    const rawJobId = this.route.snapshot.paramMap.get('jobId');
    const jobId = Number(rawJobId);

    if (!Number.isFinite(jobId) || jobId <= 0) {
      this.isLoading.set(false);
      this.toast.error('Invalid job id.');
      return;
    }

    this.jobId.set(jobId);
    this.loadPipeline(jobId);
    this.loadAssessments(jobId);
  }

  initials = initials;
  getStageConfig = getStageConfig;

  stageDropListIds(): string[] {
    return this.stages.map((s) => `stage-${s.id}`);
  }

  applicantsInStage(stageId: PipelineStageId): PipelineApplicantView[] {
    const query = this.searchTerm().trim().toLowerCase();
    return this.applicants().filter((applicant) => {
      if (applicant.stageId !== stageId) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        applicant.fullName.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.skills.join(' ').toLowerCase().includes(query)
      );
    });
  }

  stageCount(stageId: PipelineStageId): number {
    return this.applicantsInStage(stageId).length;
  }

  stageBadgeClass(theme: string): Record<string, boolean> {
    return {
      'bg-primary-container text-on-primary-container': theme === 'primary',
      'bg-secondary-container text-on-secondary-container': theme === 'secondary',
      'bg-tertiary-container text-on-tertiary-container': theme === 'tertiary',
      'bg-success-container text-on-success-container': theme === 'success',
      'bg-error-container text-on-error-container': theme === 'error',
      'bg-surface-container-highest text-on-surface-variant': theme === 'neutral',
    };
  }

  assessmentBadgeClass(status: string): string {
    const value = status.toLowerCase();
    if (value.includes('completed') || value.includes('passed')) {
      return 'bg-success-container/40 text-on-success-container';
    }
    if (value.includes('progress') || value.includes('assigned')) {
      return 'bg-tertiary-container/40 text-on-tertiary-container';
    }
    if (value.includes('failed')) {
      return 'bg-error-container/40 text-on-error-container';
    }
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  interviewBadgeClass(status: string): string {
    const value = status.toLowerCase();
    if (value.includes('scheduled') || value.includes('completed')) {
      return 'bg-primary-container/40 text-on-primary-container';
    }
    if (value.includes('cancel')) {
      return 'bg-error-container/40 text-on-error-container';
    }
    return 'bg-surface-container-highest text-on-surface-variant';
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onDrop(event: CdkDragDrop<PipelineApplicantView>, targetStageId: PipelineStageId): void {
    const applicant = event.item.data as PipelineApplicantView;
    if (!applicant || applicant.stageId === targetStageId) {
      return;
    }
    this.moveToStage(applicant, targetStageId);
  }

  moveToStage(applicant: PipelineApplicantView, stageId: PipelineStageId): void {
    const apiStatus = stageIdToApiStatus(stageId);
    const previousStage = applicant.stageId;

    this.applicants.update((list) =>
      list.map((item) =>
        item.applicationId === applicant.applicationId ? { ...item, stageId } : item
      )
    );

    this.jobApplications.updateStatus(applicant.applicationId, apiStatus).subscribe({
      next: (updated) => {
        const resolvedStage = apiStatusToStageId(updated.status ?? apiStatus);
        this.applicants.update((list) =>
          list.map((item) =>
            item.applicationId === applicant.applicationId
              ? { ...item, stageId: resolvedStage, source: { ...item.source, status: updated.status ?? apiStatus } }
              : item
          )
        );
        this.toast.success(`Moved to ${getStageConfig(stageId).label}.`);
      },
      error: () => {
        this.applicants.update((list) =>
          list.map((item) =>
            item.applicationId === applicant.applicationId
              ? { ...item, stageId: previousStage }
              : item
          )
        );
        this.toast.error('Could not update pipeline stage.');
      },
    });
  }

  shortlist(applicant: PipelineApplicantView): void {
    this.moveToStage(applicant, 'shortlisted');
  }

  reject(applicant: PipelineApplicantView): void {
    this.moveToStage(applicant, 'rejected');
  }

  openProfile(applicant: PipelineApplicantView): void {
    this.navigateToCandidate(applicant);
  }

  navigateToCandidate(applicant: PipelineApplicantView): void {
    this.router.navigate(
      ['/recruiter/jobs', this.jobId(), 'applications', applicant.candidateId],
      {
        queryParams: {
          applicationId: applicant.applicationId,
          jobTitle: applicant.appliedPosition,
        },
      }
    );
  }

  openSchedule(applicant: PipelineApplicantView): void {
    this.activeApplicant.set(applicant);
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
    const applicant = this.activeApplicant();
    if (!applicant || this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    const value = this.scheduleForm.getRawValue();
    this.recruiterService
      .scheduleInterview({
        jobApplicationId: applicant.applicationId,
        scheduledTime: new Date(value.scheduledTime!).toISOString(),
        durationMinutes: Number(value.durationMinutes),
        meetingLink: value.meetingLink || undefined,
        notes: value.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.patchApplicant(applicant.applicationId, { interviewStatus: 'Scheduled' });
          this.moveToStage(applicant, 'interview');
          this.toast.success('Interview scheduled.');
          this.closeSchedule();
        },
        error: () => this.toast.error('Failed to schedule interview.'),
      });
  }

  openAssign(applicant: PipelineApplicantView): void {
    this.activeApplicant.set(applicant);
    this.assignForm.reset({ assessmentId: null });
    this.assignOpen.set(true);
  }

  closeAssign(): void {
    this.assignOpen.set(false);
  }

  submitAssign(): void {
    const applicant = this.activeApplicant();
    const assessmentId = this.assignForm.value.assessmentId;
    if (!applicant || !assessmentId) {
      this.assignForm.markAllAsTouched();
      return;
    }

    this.assessmentService.assign(assessmentId, [applicant.candidateId]).subscribe({
      next: () => {
        this.patchApplicant(applicant.applicationId, { assessmentStatus: 'Assigned' });
        this.moveToStage(applicant, 'assessment');
        this.toast.success('Assessment assigned.');
        this.closeAssign();
      },
      error: () => this.toast.error('Failed to assign assessment.'),
    });
  }

  viewResume(applicant: PipelineApplicantView): void {
    if (!applicant.resumeId) {
      this.toast.show('No resume attached to this application.', 'info');
      return;
    }
    const url = `${environment.apiUrl}/Resume/${applicant.resumeId}/download`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private loadPipeline(jobId: number): void {
    this.isLoading.set(true);

    this.jobService
      .getJob(jobId)
      .pipe(
        switchMap((job) => {
          const title = job?.title ?? 'Position';
          this.jobTitle.set(title);
          return this.jobApplications.getByJob(jobId, title);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (rows) => {
          const jobTitle = this.jobTitle();
          this.applicants.set(
            rows.map((row) => toPipelineApplicant(row, row.jobTitle ?? jobTitle))
          );
        },
        error: () => {
          this.applicants.set([]);
          this.toast.error('Failed to load pipeline.');
        },
      });
  }

  private loadAssessments(jobId: number): void {
    this.assessmentService.getAll().subscribe({
      next: (items) => this.assessments.set(items ?? []),
      error: () => this.assessments.set([]),
    });
  }

  private patchApplicant(
    applicationId: number,
    patch: Partial<Pick<PipelineApplicantView, 'assessmentStatus' | 'interviewStatus' | 'stageId'>>
  ): void {
    this.applicants.update((list) =>
      list.map((item) =>
        item.applicationId === applicationId ? { ...item, ...patch } : item
      )
    );
  }
}
