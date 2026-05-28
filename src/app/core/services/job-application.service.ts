import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JobApplicationDto } from '../models/job.models';
import { getPipelineApplicantsSeed } from '../data/pipeline-applicants.seed';

@Injectable({ providedIn: 'root' })
export class JobApplicationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/JobApplication`;

  getByJob(
    jobId: number,
    jobTitle: string,
    pageNumber = 1,
    pageSize = 100
  ): Observable<JobApplicationDto[]> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<JobApplicationDto[]>(`${this.base}/job/${jobId}`, { params }).pipe(
      map((rows) => (Array.isArray(rows) ? rows : [])),
      map((rows) => (rows.length ? rows : getPipelineApplicantsSeed(jobId, jobTitle))),
      catchError(() => of(getPipelineApplicantsSeed(jobId, jobTitle)))
    );
  }

  getById(applicationId: number): Observable<JobApplicationDto | null> {
    return this.http.get<JobApplicationDto>(`${this.base}/${applicationId}`).pipe(
      catchError(() => of(null))
    );
  }

  updateStatus(applicationId: number, status: string): Observable<JobApplicationDto> {
    return this.http.put<JobApplicationDto>(`${this.base}/${applicationId}/status`, { status }).pipe(
      catchError(() =>
        of({
          id: applicationId,
          jobPostingId: 0,
          candidateId: '',
          status,
          appliedAt: new Date().toISOString(),
          resumeId: 0,
        } as JobApplicationDto)
      )
    );
  }
}
