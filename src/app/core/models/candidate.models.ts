export type JobLevel = 'Entry' | 'Junior' | 'MidLevel' | 'Senior' | 'Lead' | 'Manager' | 'Director' | 'Executive';

export interface CandidateProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender: number;
  dateOfBirth?: string;
  profilePicturePath?: string;
  jobTitle?: string;
  summary?: string;
  yearsOfExperience?: number;
  careerLevel?: JobLevel;
  linkedInUrl?: string;
  portfolioUrl?: string;
  address?: string;
  city?: string;
  country?: string;
  skills: CandidateSkillDto[];
  education: EducationDto[];
  experience: ExperienceDto[];
  resumes: ResumeSummaryDto[];
}

export interface CandidateSkillDto {
  id: number;
  name: string;
  category?: 'Technical' | 'Language' | 'Soft' | 'Tool' | 'Other';
  level: 1 | 2 | 3;  // 1=Beginner, 2=Intermediate, 3=Expert
}

export interface EducationDto {
  id: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear?: number;
}

export interface ExperienceDto {
  id: number;
  jobTitle: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;  // null = current position
}

export interface ResumeSummaryDto {
  id: number;
  originalFileName: string;
  fileType: string;
  fileSizeBytes: number;
  isDefault: boolean;
  aiGeneratedCvPath?: string;
  createdAt: string;
}

export interface UpdateSkillsDto {
  skills: { name: string; level: 1 | 2 | 3 }[];
}

// Keep a UI Profile interface just for frontend convenience if needed in components
export interface CandidateUIProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  skills: string[]; // Simplification for UI display
  profilePicture: string | null;
  hasResume: boolean;
  hasProfilePicture: boolean;
  completionPercentage: number;
}

// Backward-compatible UI models used across existing pages.
export interface JobModel {
  id?: string | number;
  jobPostId?: string | number;
  title?: string;
  company?: string | { id: number; name: string; logoPath?: string };
  companyName?: string;
  companyLogo?: string;
  companyDescription?: string;
  location?: string;
  employmentType?: string;
  jobType?: string;
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  createdAt?: string;
  description?: string;
  requirements?: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  postedDate?: string;
  applicantsCount?: number;
  status?: string;
  skillTags?: string[];
  careerLevel?: JobLevel | string;
  workLocation?: string;
  category?: string;
}

export interface ApplicationModel {
  id?: string | number;
  jobTitle?: string;
  companyName?: string;
  status?: string;
  appliedDate?: string;
  matchScore?: number;
  name?: string;
}
