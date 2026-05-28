import { JobApplicationDto } from './job.models';

export type PipelineStageId =
  | 'applied'
  | 'screening'
  | 'assessment'
  | 'interview'
  | 'shortlisted'
  | 'accepted'
  | 'rejected';

export interface PipelineStageConfig {
  id: PipelineStageId;
  label: string;
  apiStatus: string;
  theme: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'neutral';
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: 'applied', label: 'Applied', apiStatus: 'Pending', theme: 'primary' },
  { id: 'screening', label: 'Screening', apiStatus: 'UnderReview', theme: 'secondary' },
  { id: 'assessment', label: 'Assessment', apiStatus: 'Assessment', theme: 'tertiary' },
  { id: 'interview', label: 'Interview', apiStatus: 'Interview', theme: 'tertiary' },
  { id: 'shortlisted', label: 'Shortlisted', apiStatus: 'Shortlisted', theme: 'success' },
  { id: 'accepted', label: 'Accepted', apiStatus: 'Accepted', theme: 'success' },
  { id: 'rejected', label: 'Rejected', apiStatus: 'Rejected', theme: 'error' },
];

export interface PipelineApplicantView {
  applicationId: number;
  jobPostingId: number;
  candidateId: string;
  fullName: string;
  appliedPosition: string;
  email: string;
  phone: string;
  skills: string[];
  experienceLevel: string;
  appliedAt: string;
  assessmentStatus: string;
  interviewStatus: string;
  resumeId: number;
  matchScore: number;
  stageId: PipelineStageId;
  avatarUrl?: string;
  source: JobApplicationDto;
}
