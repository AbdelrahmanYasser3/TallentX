import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApplicationTrendDto {
  date: string;
  count: number;
}

export interface CompanyAnalyticsDto {
  activeJobs: number;
  totalApplicants: number;
  hireRate: number;
  applicationTrends: ApplicationTrendDto[];
}

export interface CandidateAnalyticsDto {
  applicationsSent: number;
  savedJobs: number;
  upcommingInterviews: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Analytics`;

  getCompanyAnalytics(companyId: number): Observable<CompanyAnalyticsDto> {
    return this.http.get<CompanyAnalyticsDto>(`${this.base}/company/${companyId}`);
  }

  getCandidateAnalytics(): Observable<CandidateAnalyticsDto> {
    return this.http.get<CandidateAnalyticsDto>(`${this.base}/candidate`);
  }
}
