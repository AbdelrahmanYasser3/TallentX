import { JobApplicationDto } from '../models/job.models';
import {
  PIPELINE_STAGES,
  PipelineApplicantView,
  PipelineStageConfig,
  PipelineStageId,
} from '../models/pipeline.models';

const STAGE_BY_API = new Map<string, PipelineStageId>(
  PIPELINE_STAGES.flatMap((stage) => {
    const keys = [stage.apiStatus, stage.id, stage.label];
    return keys.map((key) => [key.toLowerCase().replace(/\s/g, ''), stage.id] as const);
  })
);

STAGE_BY_API.set('pending', 'applied');
STAGE_BY_API.set('submitted', 'applied');
STAGE_BY_API.set('underreview', 'screening');
STAGE_BY_API.set('review', 'screening');
STAGE_BY_API.set('interviewing', 'interview');
STAGE_BY_API.set('offered', 'accepted');
STAGE_BY_API.set('hired', 'accepted');

export function apiStatusToStageId(status: string | undefined): PipelineStageId {
  const key = (status ?? 'pending').toLowerCase().replace(/\s/g, '');
  return STAGE_BY_API.get(key) ?? 'applied';
}

export function stageIdToApiStatus(stageId: PipelineStageId): string {
  return PIPELINE_STAGES.find((s) => s.id === stageId)?.apiStatus ?? 'Pending';
}

export function getStageConfig(stageId: PipelineStageId): PipelineStageConfig {
  return PIPELINE_STAGES.find((s) => s.id === stageId) ?? PIPELINE_STAGES[0];
}

export function toPipelineApplicant(
  dto: JobApplicationDto,
  jobTitle: string,
  enrichment?: Partial<PipelineApplicantView>
): PipelineApplicantView {
  const stageId = apiStatusToStageId(dto.status);
  return {
    applicationId: dto.id,
    jobPostingId: dto.jobPostingId,
    candidateId: dto.candidateId,
    fullName: dto.candidateName ?? enrichment?.fullName ?? 'Candidate',
    appliedPosition: dto.jobTitle ?? jobTitle,
    email: dto.candidateEmail ?? enrichment?.email ?? '',
    phone: dto.candidatePhone ?? enrichment?.phone ?? '',
    skills: dto.skills?.length ? dto.skills : (enrichment?.skills ?? []),
    experienceLevel: dto.experienceLevel ?? enrichment?.experienceLevel ?? 'Mid-level',
    appliedAt: dto.appliedAt,
    assessmentStatus: dto.assessmentStatus ?? enrichment?.assessmentStatus ?? 'Not assigned',
    interviewStatus: dto.interviewStatus ?? enrichment?.interviewStatus ?? 'Not scheduled',
    resumeId: dto.resumeId ?? enrichment?.resumeId ?? 0,
    matchScore: Number(dto.matchScore ?? enrichment?.matchScore ?? 0),
    stageId,
    avatarUrl: dto.avatarUrl ?? enrichment?.avatarUrl,
    source: dto,
  };
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
