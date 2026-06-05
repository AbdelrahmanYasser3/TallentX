export interface RecruiterDashboardStats {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
}

export interface RecruiterJobPosting {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'closed';
  applicantsCount: number;
  postedDate: string;
  location: string;
  jobType: string;
}

export interface ApplicantSummary {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  appliedDate: string;
  jobTitle: string;
  status: 'new' | 'reviewed' | 'interviewed' | 'offered' | 'rejected';
  matchScore?: number;
}
