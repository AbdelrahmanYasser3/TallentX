import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CandidateProfileDto } from '../models/candidate.models';
import { JobApplicationDto } from '../models/job.models';
import { RecruiterApplicantDetailView } from '../models/recruiter-candidate.models';
import {
  buildSeedCandidateDetail,
  getSeedDetailForPipelineCandidate,
} from '../data/recruiter-candidate.seed';
import {
  apiStatusToStageId,
  stageIdToApiStatus,
} from '../utils/pipeline.mapper';
import { PipelineStageId } from '../models/pipeline.models';
import { JobApplicationService } from './job-application.service';

@Injectable({ providedIn: 'root' })
export class RecruiterCandidateService {
  private http = inject(HttpClient);
  private jobApplications = inject(JobApplicationService);
  private candidatesBase = `${environment.apiUrl}/Candidates`;
  private candidateAltBase = `${environment.apiUrl}/Candidate`;
  private jobAppBase = `${environment.apiUrl}/JobApplication`;
  private cvBase = `${environment.apiUrl}/CV`;

  getCandidateProfile(candidateId: string): Observable<CandidateProfileDto | null> {
    return this.http.get<CandidateProfileDto>(`${this.candidatesBase}/${candidateId}`).pipe(
      catchError(() =>
        this.http.get<CandidateProfileDto>(`${this.candidateAltBase}/${candidateId}`).pipe(
          catchError(() => of(null))
        )
      )
    );
  }

  getApplication(applicationId: number): Observable<JobApplicationDto | null> {
    return this.http.get<JobApplicationDto>(`${this.jobAppBase}/${applicationId}`).pipe(
      catchError(() => of(null))
    );
  }

  getCvPreview(candidateId: string, resumeId?: number): Observable<string> {
    const url = resumeId
      ? `${environment.apiUrl}/Resume/${resumeId}/preview`
      : `${this.cvBase}/${candidateId}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      catchError(() => of(''))
    );
  }

  loadApplicantDetail(params: {
    candidateId: string;
    applicationId?: number | null;
    jobId?: number | null;
    jobTitle?: string;
  }): Observable<RecruiterApplicantDetailView> {
    const { candidateId, applicationId, jobId, jobTitle } = params;

    const application$ = applicationId
      ? this.getApplication(applicationId)
      : jobId
        ? this.jobApplications.getByJob(jobId, jobTitle ?? 'Role').pipe(
            map((rows) => rows.find((r) => r.candidateId === candidateId) ?? null)
          )
        : of(null);

    const profile$ = this.getCandidateProfile(candidateId);

    return forkJoin({ application: application$, profile: profile$ }).pipe(
      map(({ application, profile }) =>
        this.mergeDetail(candidateId, application, profile, jobId, jobTitle)
      ),
      catchError(() =>
        of(
          buildSeedCandidateDetail(
            candidateId,
            applicationId ?? 1,
            jobId ?? 0,
            jobTitle ?? 'Open role'
          )
        )
      )
    );
  }

  private mergeDetail(
    candidateId: string,
    application: JobApplicationDto | null,
    profile: CandidateProfileDto | null,
    jobId?: number | null,
    jobTitle?: string
  ): RecruiterApplicantDetailView {
    if (!application && !profile) {
      return buildSeedCandidateDetail(candidateId, 1, jobId ?? 0, jobTitle ?? 'Open role');
    }

    if (application && !profile) {
      return getSeedDetailForPipelineCandidate(candidateId, application);
    }

    const fullName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : application?.candidateName ?? 'Candidate';

    const location = [profile?.city, profile?.country].filter(Boolean).join(', ') || '—';
    const skills =
      profile?.skills?.map((s) => s.name) ??
      application?.skills ??
      [];

    const experience =
      profile?.experience?.map((e) => ({
        company: e.company,
        role: e.jobTitle,
        duration: this.formatDuration(e.startDate, e.endDate),
        description: e.description ?? '',
      })) ?? [];

    const education =
      profile?.education?.map((e) => ({
        university: e.institution,
        degree: `${e.degree}${e.fieldOfStudy ? ` · ${e.fieldOfStudy}` : ''}`,
        years: e.graduationYear ? String(e.graduationYear) : '—',
      })) ?? [];

    const resumeId =
      application?.resumeId ??
      profile?.resumes?.find((r) => r.isDefault)?.id ??
      profile?.resumes?.[0]?.id ??
      0;

    const stageId = apiStatusToStageId(application?.status);
    const matchScore = Number(application?.matchScore ?? 0) || 78;

    let avatarUrl = profile?.profilePicturePath;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = `${environment.baseUrl}/${avatarUrl.replace(/^\//, '')}`;
    }

    const cvPreviewText =
      profile?.summary ??
      `${fullName}\n${profile?.jobTitle ?? application?.jobTitle ?? ''}\n\nProfessional background available in attached CV.`;

    const seedFallback = application
      ? getSeedDetailForPipelineCandidate(candidateId, application)
      : buildSeedCandidateDetail(candidateId, 1, jobId ?? 0, jobTitle ?? 'Open role');

    return {
      ...seedFallback,
      candidateId,
      applicationId: application?.id ?? seedFallback.applicationId,
      jobPostingId: application?.jobPostingId ?? jobId ?? seedFallback.jobPostingId,
      jobTitle: application?.jobTitle ?? jobTitle ?? seedFallback.jobTitle,
      fullName,
      headline: profile?.jobTitle ?? seedFallback.headline,
      email: profile?.email ?? application?.candidateEmail ?? seedFallback.email,
      phone: profile?.phoneNumber ?? application?.candidatePhone ?? seedFallback.phone,
      location: location !== '—' ? location : seedFallback.location,
      avatarUrl,
      matchScore,
      profileScore: Math.min(100, matchScore + 6),
      stageId,
      applicationStatus: application?.status ?? seedFallback.applicationStatus,
      assessmentStatus: application?.assessmentStatus ?? seedFallback.assessmentStatus,
      interviewStatus: application?.interviewStatus ?? seedFallback.interviewStatus,
      appliedAt: application?.appliedAt ?? seedFallback.appliedAt,
      resumeId,
      skills: skills.length ? skills : seedFallback.skills,
      experience: experience.length ? experience : seedFallback.experience,
      education: education.length ? education : seedFallback.education,
      cvPreviewText,
      cvDownloadUrl: resumeId
        ? `${environment.apiUrl}/Resume/${resumeId}/download`
        : seedFallback.cvDownloadUrl,
      recruiterNotes: '',
      profile,
      application,
    };
  }

  updateStage(applicationId: number, stageId: PipelineStageId) {
    return this.jobApplications.updateStatus(applicationId, stageIdToApiStatus(stageId));
  }

  private formatDuration(start: string, end?: string): string {
    const startYear = start ? new Date(start).getFullYear() : '';
    const endLabel = end ? new Date(end).getFullYear() : 'Present';
    return `${startYear} — ${endLabel}`;
  }
}
