import { CandidateProfileDto } from './candidate.models';
import { JobApplicationDto } from './job.models';
import { PipelineStageId } from './pipeline.models';

export interface RecruiterApplicantDetailView {
  candidateId: string;
  applicationId: number;
  jobPostingId: number;
  jobTitle: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  matchScore: number;
  profileScore: number;
  stageId: PipelineStageId;
  applicationStatus: string;
  assessmentStatus: string;
  interviewStatus: string;
  appliedAt: string;
  resumeId: number;
  skills: string[];
  experience: RecruiterExperienceItem[];
  education: RecruiterEducationItem[];
  cvPreviewText: string;
  cvDownloadUrl: string;
  recruiterNotes: string;
  profile: CandidateProfileDto | null;
  application: JobApplicationDto | null;
}

export interface RecruiterExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface RecruiterEducationItem {
  university: string;
  degree: string;
  years: string;
}
