import { JobLevel } from './candidate.models';

export interface JobListDto {
  id: number;
  title: string;
  company: { id: number; name: string; logoPath?: string };
  location?: string;
  jobType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship';
  workLocation: 'OnSite' | 'Remote' | 'Hybrid';
  careerLevel: JobLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skills: { id: number; name: string; requiredLevel: 1|2|3 }[];
  applicantsCount: number;
  createdAt: string;
  expiryDate?: string;
  /** Full job details — populated by GET /api/JobPosting/{id} */
  description?: string;
  requirements?: string;
}

export interface CreateJobPostingDto {
  title: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  location?: string;
  employmentType: string;
  companyId: number;
  isActive?: boolean;
  applicationDeadline?: string;
  requiredSkills?: string[];
}

export interface JobApplicationDto {
  id: number;
  jobPostingId: number;
  candidateId: string;
  candidateName?: string;
  jobTitle?: string;
  status: string;
  appliedAt: string;
  updatedAt?: string;
  resumeId: number;
  coverLetter?: string;
  matchScore?: number;
  recruiterRating?: number;
  rejectionReason?: string;
}

export interface ApplyWithCvDto {
  jobPostId: number;
  resumeId?: number;
  coverLetter?: string;
}
