import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../core/services/candidate.service';
import { CandidateProfileDto, ResumeSummaryDto } from '../../core/models/candidate.models';
import { ToastService } from '../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-resume-viewer-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-viewer.html',
})
export class ResumeViewerPage implements OnInit {
  private candidateService = inject(CandidateService);
  private toast = inject(ToastService);

  readonly profile = signal<CandidateProfileDto | null>(null);
  readonly resumes = signal<ResumeSummaryDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isGenerating = signal<boolean>(false);

  readonly defaultResume = computed(() =>
    this.resumes().find((resume) => resume.isDefault) ?? this.resumes()[0] ?? null
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.candidateService.getProfileDto()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.resumes.set(profile?.resumes ?? []);
        },
        error: () => {
          this.profile.set(null);
          this.resumes.set([]);
          this.toast.error('Failed to load resume data.');
        }
      });
  }

  generateAiCv(resume: ResumeSummaryDto): void {
    this.isGenerating.set(true);
    this.candidateService.generateCv(String(resume.id))
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: (response) => {
          const rawPath = response?.cvPath;
          if (!rawPath || typeof rawPath !== 'string') {
            this.toast.success('AI CV generated successfully.');
            return;
          }

          const normalized = rawPath.startsWith('http')
            ? rawPath
            : `${environment.baseUrl}/${rawPath.replace(/^\/+/, '')}`;

          window.open(normalized, '_blank', 'noopener');
          this.toast.success('AI CV generated successfully.');
        },
        error: () => this.toast.error('Failed to generate AI CV.')
      });
  }
}
