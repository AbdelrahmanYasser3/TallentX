import { CandidateProfileDto } from '../models/candidate.models';
import { RecruiterApplicantDetailView } from '../models/recruiter-candidate.models';
import { PipelineStageId } from '../models/pipeline.models';
import { apiStatusToStageId } from '../utils/pipeline.mapper';
import { environment } from '../../../environments/environment';

type SeedDetailBase = Omit<
  RecruiterApplicantDetailView,
  'candidateId' | 'applicationId' | 'jobPostingId' | 'profile' | 'application'
>;

const DEFAULT_SEED: SeedDetailBase = {
    jobTitle: 'Software Engineer',
    fullName: 'Alex Morgan',
    headline: 'Full-stack developer · Angular & .NET',
    email: 'alex.morgan@email.com',
    phone: '+971 50 111 2233',
    location: 'Dubai, UAE',
    matchScore: 82,
    profileScore: 88,
    stageId: 'screening',
    applicationStatus: 'UnderReview',
    assessmentStatus: 'Not assigned',
    interviewStatus: 'Not scheduled',
    appliedAt: new Date().toISOString(),
    resumeId: 1001,
    skills: ['Angular', 'TypeScript', 'C#', 'SQL', 'Azure'],
    experience: [
      {
        company: 'TechNova Solutions',
        role: 'Senior Software Engineer',
        duration: '2021 — Present',
        description: 'Led migration of legacy modules to Angular 17 and improved API performance by 35%.',
      },
      {
        company: 'Gulf Digital Labs',
        role: 'Software Engineer',
        duration: '2018 — 2021',
        description: 'Built recruitment dashboards and integrated third-party assessment providers.',
      },
    ],
    education: [
      { university: 'American University of Sharjah', degree: 'BSc Computer Science', years: '2014 — 2018' },
    ],
    cvPreviewText: `PROFESSIONAL SUMMARY
Results-driven engineer with 6+ years building scalable web applications.

EXPERIENCE
TechNova Solutions — Senior Software Engineer (2021–Present)
• Delivered recruiter pipeline features used by 40+ hiring teams.
• Mentored junior developers on Angular best practices.

Gulf Digital Labs — Software Engineer (2018–2021)
• Implemented REST APIs and CI/CD pipelines on Azure.

EDUCATION
American University of Sharjah — BSc Computer Science`,
    cvDownloadUrl: '',
    recruiterNotes: '',
};

function profileFromSeed(candidateId: string, detail: SeedDetailBase): CandidateProfileDto {
  const [firstName, ...rest] = detail.fullName.split(' ');
  const lastName = rest.join(' ') || 'Candidate';
  return {
    id: candidateId,
    firstName,
    lastName,
    email: detail.email,
    phoneNumber: detail.phone,
    gender: 0,
    jobTitle: detail.headline,
    summary: detail.cvPreviewText.split('\n').slice(0, 3).join(' '),
    city: detail.location.split(',')[0]?.trim(),
    country: 'UAE',
    skills: detail.skills.map((name, i) => ({ id: i + 1, name, level: 3 })),
    education: detail.education.map((e, i) => ({
      id: i + 1,
      degree: e.degree,
      fieldOfStudy: e.degree,
      institution: e.university,
      graduationYear: Number(e.years.split('—').pop()?.trim()) || undefined,
    })),
    experience: detail.experience.map((e, i) => ({
      id: i + 1,
      jobTitle: e.role,
      company: e.company,
      description: e.description,
      startDate: '2018-01-01',
      endDate: e.duration.includes('Present') ? undefined : '2021-12-31',
    })),
    resumes: detail.resumeId
      ? [
          {
            id: detail.resumeId,
            originalFileName: `${detail.fullName.replace(/\s/g, '_')}_CV.pdf`,
            fileType: 'application/pdf',
            fileSizeBytes: 245000,
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
        ]
      : [],
  };
}

/** Enrich seed-candidate-* ids from pipeline with full profile data. */
export function buildSeedCandidateDetail(
  candidateId: string,
  applicationId: number,
  jobPostingId: number,
  jobTitle: string,
  overrides?: Partial<RecruiterApplicantDetailView>
): RecruiterApplicantDetailView {
  const base = { ...DEFAULT_SEED, ...overrides };
  const profile = profileFromSeed(candidateId, base);
  const resumeId = overrides?.resumeId ?? base.resumeId;
  return {
    candidateId,
    applicationId,
    jobPostingId,
    jobTitle: overrides?.jobTitle ?? jobTitle,
    profile,
    application: null,
    ...base,
    resumeId,
    cvDownloadUrl: resumeId
      ? `${environment.apiUrl}/Resume/${resumeId}/download`
      : '',
    fullName: overrides?.fullName ?? base.fullName,
    email: overrides?.email ?? base.email,
    phone: overrides?.phone ?? base.phone,
    skills: overrides?.skills ?? base.skills,
    experience: overrides?.experience ?? base.experience,
    education: overrides?.education ?? base.education,
    assessmentStatus: overrides?.assessmentStatus ?? base.assessmentStatus,
    interviewStatus: overrides?.interviewStatus ?? base.interviewStatus,
    matchScore: overrides?.matchScore ?? base.matchScore,
    stageId: overrides?.stageId ?? base.stageId,
    applicationStatus: overrides?.applicationStatus ?? base.applicationStatus,
    appliedAt: overrides?.appliedAt ?? base.appliedAt,
  };
}

export function getSeedDetailForPipelineCandidate(
  candidateId: string,
  application: {
    id: number;
    jobPostingId: number;
    jobTitle?: string;
    candidateName?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    skills?: string[];
    experienceLevel?: string;
    assessmentStatus?: string;
    interviewStatus?: string;
    status?: string;
    matchScore?: number;
    appliedAt?: string;
    resumeId?: number;
  }
): RecruiterApplicantDetailView {
  const name = application.candidateName ?? 'Candidate';
  const headline = application.experienceLevel
    ? `${application.experienceLevel} professional`
    : DEFAULT_SEED.headline;

  const stageId = apiStatusToStageId(application.status) as PipelineStageId;

  return buildSeedCandidateDetail(candidateId, application.id, application.jobPostingId, application.jobTitle ?? 'Role', {
    fullName: name,
    headline,
    email: application.candidateEmail ?? DEFAULT_SEED.email,
    phone: application.candidatePhone ?? DEFAULT_SEED.phone,
    skills: application.skills?.length ? application.skills : DEFAULT_SEED.skills,
    matchScore: Number(application.matchScore ?? 80),
    profileScore: Number(application.matchScore ?? 80) + 4,
    assessmentStatus: application.assessmentStatus ?? 'Not assigned',
    interviewStatus: application.interviewStatus ?? 'Not scheduled',
    applicationStatus: application.status ?? 'Pending',
    stageId,
    appliedAt: application.appliedAt ?? new Date().toISOString(),
    resumeId: application.resumeId ?? 1001,
    jobTitle: application.jobTitle ?? 'Open role',
  });
}
