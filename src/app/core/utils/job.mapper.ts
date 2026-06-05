import { JobModel, JobLevel } from '../models/candidate.models';
import { JobListDto } from '../models/job.models';
import { JobCategory } from '../data/job-categories';

export interface PublicJobDto extends JobListDto {
  category?: JobCategory;
}

export function formatEmploymentType(jobType?: string): string {
  switch (jobType) {
    case 'FullTime':
      return 'Full-time';
    case 'PartTime':
      return 'Part-time';
    case 'Contract':
      return 'Contract';
    case 'Internship':
      return 'Internship';
    default:
      return jobType || 'Full-time';
  }
}

export function formatWorkLocation(workLocation?: string, location?: string): string {
  if (workLocation === 'Remote') return 'Remote';
  if (workLocation === 'Hybrid') return 'Hybrid';
  if (location?.toLowerCase().includes('remote')) return 'Remote';
  return location || 'On-site';
}

export function formatSalaryRange(dto: Pick<JobListDto, 'salaryMin' | 'salaryMax' | 'currency'>): string | undefined {
  const { salaryMin, salaryMax, currency = 'USD' } = dto;
  const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  if (salaryMin && salaryMax) {
    return `${sym}${salaryMin.toLocaleString()} – ${sym}${salaryMax.toLocaleString()}`;
  }
  if (salaryMin) return `${sym}${salaryMin.toLocaleString()}+`;
  if (salaryMax) return `Up to ${sym}${salaryMax.toLocaleString()}`;
  return undefined;
}

export function jobListDtoToJobModel(dto: PublicJobDto): JobModel {
  const companyName = typeof dto.company === 'object' ? dto.company?.name : undefined;

  return {
    id: dto.id,
    jobPostId: dto.id,
    title: dto.title,
    company: companyName ?? 'Company',
    companyName,
    companyLogo: dto.company?.logoPath,
    location: dto.location,
    employmentType: formatEmploymentType(dto.jobType),
    jobType: formatEmploymentType(dto.jobType),
    salaryMin: dto.salaryMin,
    salaryMax: dto.salaryMax,
    salaryRange: formatSalaryRange(dto),
    createdAt: dto.createdAt,
    postedDate: dto.createdAt,
    description: dto.description,
    requirements: dto.requirements,
    applicantsCount: dto.applicantsCount,
    skillTags: dto.skills?.map((s) => s.name) ?? [],
    careerLevel: dto.careerLevel,
    workLocation: dto.workLocation,
    category: dto.category,
    isSaved: false,
    hasApplied: false,
  };
}

export function normalizeApiJob(raw: unknown): PublicJobDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  const companyRaw = item['company'];
  let company: PublicJobDto['company'];
  if (companyRaw && typeof companyRaw === 'object') {
    const c = companyRaw as Record<string, unknown>;
    company = {
      id: Number(c['id'] ?? 0),
      name: String(c['name'] ?? c['companyName'] ?? 'Company'),
      logoPath: c['logoPath'] as string | undefined,
    };
  } else if (typeof item['companyName'] === 'string') {
    company = { id: Number(item['companyId'] ?? 0), name: item['companyName'] };
  }

  const id = Number(item['id'] ?? item['jobPostId']);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    title: String(item['title'] ?? 'Open Role'),
    company: company ?? { id: 0, name: 'Company' },
    location: item['location'] as string | undefined,
    jobType: item['jobType'] as PublicJobDto['jobType'],
    workLocation: item['workLocation'] as PublicJobDto['workLocation'],
    careerLevel: item['careerLevel'] as JobLevel,
    salaryMin: item['salaryMin'] as number | undefined,
    salaryMax: item['salaryMax'] as number | undefined,
    currency: item['currency'] as string | undefined,
    skills: (item['skills'] as PublicJobDto['skills']) ?? [],
    applicantsCount: Number(item['applicantsCount'] ?? 0),
    createdAt: String(item['createdAt'] ?? item['postedDate'] ?? new Date().toISOString()),
    expiryDate: item['expiryDate'] as string | undefined,
    description: item['description'] as string | undefined,
    requirements: item['requirements'] as string | undefined,
    category: item['category'] as JobCategory | undefined,
  };
}

export function extractJobsFromApiResponse(body: unknown): PublicJobDto[] {
  if (Array.isArray(body)) {
    return body.map(normalizeApiJob).filter((j): j is PublicJobDto => j !== null);
  }
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    const list = obj['items'] ?? obj['data'] ?? obj['results'] ?? obj['jobPostings'];
    if (Array.isArray(list)) {
      return list.map(normalizeApiJob).filter((j): j is PublicJobDto => j !== null);
    }
  }
  return [];
}
