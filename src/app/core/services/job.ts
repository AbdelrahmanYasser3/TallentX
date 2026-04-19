import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JobListDto, CreateJobPostingDto } from '../models/job.models';

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
  private apiUrl = `${environment.apiUrl}/JobPosting`;

  searchJobs(filters: SearchFilters): Observable<JobListDto[]> {
    let params = new HttpParams();
    
    const term = filters.searchTerm || filters.keyword || '';
    const page = filters.pageNumber || 1;
    const size = filters.pageSize || 20;

    params = params.set('pageNumber', page.toString());
    params = params.set('pageSize', size.toString());

    const url = term ? `${this.apiUrl}/search/${encodeURIComponent(term)}` : `${this.apiUrl}`;
    
    return this.http.get<JobListDto[]>(url, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getJob(id: number | string): Observable<JobListDto | null> {
    return this.http.get<JobListDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
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
