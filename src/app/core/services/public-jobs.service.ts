import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JobCategory } from '../data/job-categories';
import { PUBLIC_JOB_SEED, findSeedJobById } from '../data/public-jobs.seed';
import { PublicJobDto, extractJobsFromApiResponse, normalizeApiJob } from '../utils/job.mapper';
import { SearchFilters } from './job';

export interface PublicJobsFilters extends SearchFilters {
  category?: JobCategory | '';
  careerLevel?: string;
  workLocation?: string;
}

export interface PublicJobsPage {
  items: PublicJobDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  source: 'api' | 'seed';
}

function normalizeJobTypeFilter(value?: string): string | undefined {
  if (!value) return undefined;
  const map: Record<string, string> = {
    'full-time': 'FullTime',
    'part-time': 'PartTime',
    contract: 'Contract',
    internship: 'Internship',
    FullTime: 'FullTime',
    PartTime: 'PartTime',
    Contract: 'Contract',
    Internship: 'Internship',
  };
  return map[value] ?? value;
}

function matchesFilters(job: PublicJobDto, filters: PublicJobsFilters): boolean {
  const term = (filters.searchTerm || filters.keyword || '').trim().toLowerCase();
  const location = (filters.location || '').trim().toLowerCase();
  const jobType = normalizeJobTypeFilter(filters.jobType);

  if (term) {
    const haystack = [
      job.title,
      job.company?.name,
      job.location,
      job.description,
      job.requirements,
      ...(job.skills?.map((s) => s.name) ?? []),
      job.category,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  if (location) {
    const loc = (job.location ?? '').toLowerCase();
    const work = (job.workLocation ?? '').toLowerCase();
    const wantsRemote = location === 'remote' || location.includes('remote');
    if (wantsRemote) {
      if (work === 'remote' || loc.includes('remote')) {
        // matched
      } else {
        return false;
      }
    } else if (!loc.includes(location) && !work.includes(location)) {
      return false;
    }
  }

  if (jobType && job.jobType !== jobType) return false;

  if (filters.category && job.category !== filters.category) return false;

  if (filters.careerLevel && job.careerLevel !== filters.careerLevel) return false;

  if (filters.workLocation && job.workLocation !== filters.workLocation) return false;

  if (filters.salaryMin != null && job.salaryMax != null && job.salaryMax < filters.salaryMin) return false;
  if (filters.salaryMax != null && job.salaryMin != null && job.salaryMin > filters.salaryMax) return false;

  return true;
}

function paginate<T>(items: T[], pageNumber: number, pageSize: number): { slice: T[]; totalCount: number } {
  const totalCount = items.length;
  const start = (pageNumber - 1) * pageSize;
  return { slice: items.slice(start, start + pageSize), totalCount };
}

@Injectable({ providedIn: 'root' })
export class PublicJobsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/JobPosting`;

  getPublicJobs(filters: PublicJobsFilters = {}): Observable<PublicJobsPage> {
    const pageNumber = filters.pageNumber ?? 1;
    const pageSize = filters.pageSize ?? 12;

    return this.fetchFromApi(filters).pipe(
      map((apiJobs) => {
        if (apiJobs.length > 0) {
          const filtered = apiJobs.filter((j) => matchesFilters(j, filters));
          const sorted = [...filtered].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const { slice, totalCount } = paginate(sorted, pageNumber, pageSize);
          return {
            items: slice,
            totalCount,
            pageNumber,
            pageSize,
            source: 'api' as const,
          };
        }
        return this.pageFromSeed(filters, pageNumber, pageSize);
      }),
      catchError(() => of(this.pageFromSeed(filters, pageNumber, pageSize)))
    );
  }

  getPublicJob(id: number | string): Observable<PublicJobDto | null> {
    const numericId = Number(id);
    return this.http.get<unknown>(`${this.apiUrl}/${numericId}`).pipe(
      map((body) => {
        const direct = normalizeApiJob(body);
        if (direct) return direct;
        const fromList = extractJobsFromApiResponse(body)[0];
        if (fromList) return fromList;
        return findSeedJobById(numericId) ?? null;
      }),
      catchError(() => of(findSeedJobById(numericId) ?? null))
    );
  }

  private fetchFromApi(filters: PublicJobsFilters): Observable<PublicJobDto[]> {
    const params = this.buildParams(filters);
    const term = (filters.searchTerm || filters.keyword || '').trim();

    const publicUrl = `${this.apiUrl}/public`;
    const listUrl = term ? `${this.apiUrl}/search/${encodeURIComponent(term)}` : `${this.apiUrl}`;

    return this.http.get<unknown>(publicUrl, { params }).pipe(
      map((body) => extractJobsFromApiResponse(body)),
      catchError(() =>
        this.http.get<unknown>(listUrl, { params }).pipe(
          map((body) => extractJobsFromApiResponse(body)),
          catchError(() => of([] as PublicJobDto[]))
        )
      )
    );
  }

  private buildParams(filters: PublicJobsFilters): HttpParams {
    let params = new HttpParams();
    const page = filters.pageNumber ?? 1;
    const size = filters.pageSize ?? 12;
    params = params.set('pageNumber', page.toString());
    params = params.set('pageSize', size.toString());

    if (filters.location) params = params.set('location', filters.location);
    if (filters.jobType) params = params.set('jobType', normalizeJobTypeFilter(filters.jobType) ?? filters.jobType);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.careerLevel) params = params.set('careerLevel', filters.careerLevel);
    if (filters.workLocation) params = params.set('workLocation', filters.workLocation);
    if (filters.salaryMin != null) params = params.set('salaryMin', filters.salaryMin.toString());
    if (filters.salaryMax != null) params = params.set('salaryMax', filters.salaryMax.toString());

    return params;
  }

  private pageFromSeed(filters: PublicJobsFilters, pageNumber: number, pageSize: number): PublicJobsPage {
    const filtered = PUBLIC_JOB_SEED.filter((j) => matchesFilters(j, filters)).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const { slice, totalCount } = paginate(filtered, pageNumber, pageSize);
    return {
      items: slice,
      totalCount,
      pageNumber,
      pageSize,
      source: 'seed',
    };
  }
}
