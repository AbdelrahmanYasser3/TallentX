import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { InterviewDto, ScheduleInterviewRequest } from '../models/interview.models';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Interview`;

  schedule(data: ScheduleInterviewRequest): Observable<InterviewDto> {
    console.log('[InterviewService] Scheduling with payload:', JSON.stringify(data, null, 2));
    return this.http.post<InterviewDto>(`${this.base}/schedule`, data).pipe(
      catchError((error) => {
        console.error('[InterviewService] schedule failed:', error.status, error.error);
        if (error.status === 400 && error.error) {
          console.error('[InterviewService] Validation details:', JSON.stringify(error.error.errors ?? error.error, null, 2));
        }
        return throwError(() => error);
      })
    );
  }

  getByCandidate(candidateId: string): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.base}/candidate/${candidateId}`);
  }

  getByRecruiter(): Observable<InterviewDto[]> {
    return this.http.get<InterviewDto[]>(`${this.base}/recruiter/interviews`);
  }

  update(id: number, data: Partial<ScheduleInterviewRequest>): Observable<InterviewDto> {
    // If scheduledTime is being updated, ensure it's already in UTC ISO format
    if (data.scheduledTime) {
      console.log('[InterviewService] Updating scheduledTime:', data.scheduledTime);
    }
    return this.http.put<InterviewDto>(`${this.base}/${id}`, data).pipe(
      catchError((error) => {
        console.error('[InterviewService] update failed:', error.status, error.error);
        return throwError(() => error);
      })
    );
  }

  cancel(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}/cancel`);
  }
}

