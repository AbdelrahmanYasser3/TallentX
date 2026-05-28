import { JobApplicationDto } from '../models/job.models';

interface SeedProfile {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  skills: string[];
  experienceLevel: string;
  assessmentStatus: string;
  interviewStatus: string;
  status: string;
  matchScore: number;
}

const PROFILES: SeedProfile[] = [
  {
    candidateName: 'Sara Al-Mansoori',
    candidateEmail: 'sara.mansoori@email.com',
    candidatePhone: '+971 50 123 4567',
    skills: ['Angular', 'TypeScript', 'RxJS'],
    experienceLevel: 'Senior',
    assessmentStatus: 'Completed — 88%',
    interviewStatus: 'Scheduled',
    status: 'Interview',
    matchScore: 91,
  },
  {
    candidateName: 'Omar Hassan',
    candidateEmail: 'omar.hassan@email.com',
    candidatePhone: '+971 55 234 5678',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    experienceLevel: 'Mid-level',
    assessmentStatus: 'In progress',
    interviewStatus: 'Not scheduled',
    status: 'Assessment',
    matchScore: 84,
  },
  {
    candidateName: 'Layla Ibrahim',
    candidateEmail: 'layla.ibrahim@email.com',
    candidatePhone: '+971 52 345 6789',
    skills: ['Product Design', 'Figma', 'UX Research'],
    experienceLevel: 'Mid-level',
    assessmentStatus: 'Not assigned',
    interviewStatus: 'Not scheduled',
    status: 'UnderReview',
    matchScore: 79,
  },
  {
    candidateName: 'Khalid Rahman',
    candidateEmail: 'khalid.rahman@email.com',
    candidatePhone: '+971 56 456 7890',
    skills: ['Java', 'Spring Boot', 'AWS'],
    experienceLevel: 'Senior',
    assessmentStatus: 'Completed — 92%',
    interviewStatus: 'Completed',
    status: 'Shortlisted',
    matchScore: 93,
  },
  {
    candidateName: 'Nour Farouk',
    candidateEmail: 'nour.farouk@email.com',
    candidatePhone: '+971 54 567 8901',
    skills: ['Python', 'Data Analysis', 'SQL'],
    experienceLevel: 'Junior',
    assessmentStatus: 'Not assigned',
    interviewStatus: 'Not scheduled',
    status: 'Pending',
    matchScore: 72,
  },
  {
    candidateName: 'Youssef Nabil',
    candidateEmail: 'youssef.nabil@email.com',
    candidatePhone: '+971 50 678 9012',
    skills: ['DevOps', 'Docker', 'Kubernetes'],
    experienceLevel: 'Senior',
    assessmentStatus: 'Completed — 95%',
    interviewStatus: 'Offer pending',
    status: 'Accepted',
    matchScore: 96,
  },
  {
    candidateName: 'Hana Saleh',
    candidateEmail: 'hana.saleh@email.com',
    candidatePhone: '+971 55 789 0123',
    skills: ['QA Automation', 'Cypress', 'Selenium'],
    experienceLevel: 'Mid-level',
    assessmentStatus: 'Failed — 54%',
    interviewStatus: 'Cancelled',
    status: 'Rejected',
    matchScore: 58,
  },
  {
    candidateName: 'Amir Zaki',
    candidateEmail: 'amir.zaki@email.com',
    candidatePhone: '+971 52 890 1234',
    skills: ['.NET', 'C#', 'Azure'],
    experienceLevel: 'Mid-level',
    assessmentStatus: 'Assigned',
    interviewStatus: 'Not scheduled',
    status: 'Assessment',
    matchScore: 81,
  },
];

export function getPipelineApplicantsSeed(jobPostingId: number, jobTitle: string): JobApplicationDto[] {
  const baseDate = Date.now();
  return PROFILES.map((profile, index) => ({
    id: jobPostingId * 1000 + index + 1,
    jobPostingId,
    candidateId: `seed-candidate-${jobPostingId}-${index + 1}`,
    candidateName: profile.candidateName,
    jobTitle,
    status: profile.status,
    appliedAt: new Date(baseDate - (index + 1) * 86400000 * 2).toISOString(),
    resumeId: 1000 + index,
    matchScore: profile.matchScore,
    candidateEmail: profile.candidateEmail,
    candidatePhone: profile.candidatePhone,
    skills: profile.skills,
    experienceLevel: profile.experienceLevel,
    assessmentStatus: profile.assessmentStatus,
    interviewStatus: profile.interviewStatus,
  }));
}
