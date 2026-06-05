import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JobListDto, CreateJobPostingDto } from '../models/job.models';
import { PublicJobsService, PublicJobsFilters, PublicJobsPage } from './public-jobs.service';

export interface SearchFilters {
  searchTerm?: string;
  keyword?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private publicJobs = inject(PublicJobsService);
  private apiUrl = `${environment.apiUrl}/JobPosting`;

  /** Public catalog for landing + job search (anonymous-safe, seed fallback). */
  getPublicJobs(filters: PublicJobsFilters = {}): Observable<PublicJobsPage> {
    return this.publicJobs.getPublicJobs(filters);
  }

  searchJobs(filters: SearchFilters): Observable<JobListDto[]> {
    return this.getPublicJobs(filters).pipe(map((page) => page.items));
  }

  getJob(id: number | string): Observable<JobListDto | null> {
    return this.publicJobs.getPublicJob(id);
  }

  getJobsBySkill(skillId: number, pageNumber = 1, pageSize = 20): Observable<JobListDto[]> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<JobListDto[]>(`${this.apiUrl}/skill/${skillId}`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getJobsByType(type: string, pageNumber = 1, pageSize = 20): Observable<JobListDto[]> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<JobListDto[]>(`${this.apiUrl}/type/${type}`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getCompanyJobs(companyId: number, pageNumber = 1, pageSize = 20): Observable<JobListDto[]> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http.get<JobListDto[]>(`${this.apiUrl}/company/${companyId}`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  createJob(data: CreateJobPostingDto): Observable<JobListDto> {
    return this.http.post<JobListDto>(this.apiUrl, data).pipe(
      catchError((error) => {
        console.error('[JobService] createJob failed:', error.status, error.statusText);
        if (error.status === 400 && error.error) {
          console.error('[JobService] Validation errors:', JSON.stringify(error.error.errors ?? error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  updateJob(id: number, data: Partial<CreateJobPostingDto>): Observable<JobListDto> {
    return this.http.put<JobListDto>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error) => {
        console.error('[JobService] updateJob failed:', error.status, error.statusText);
        if (error.status === 400 && error.error) {
          console.error('[JobService] Validation errors:', JSON.stringify(error.error.errors ?? error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
