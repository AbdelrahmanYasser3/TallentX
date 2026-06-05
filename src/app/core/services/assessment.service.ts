import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssessmentDetailDto } from '../models/assessment.models';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Assessments`;

  create(data: any): Observable<AssessmentDetailDto> {
    return this.http.post<AssessmentDetailDto>(this.base, data);
  }

  getByJob(jobId: number): Observable<AssessmentDetailDto[]> {
    return this.http.get<AssessmentDetailDto[]>(`${this.base}/job/${jobId}`);
  }

  generate(jobId: number): Observable<AssessmentDetailDto> {
    return this.http.post<AssessmentDetailDto>(`${this.base}/job/${jobId}/generate`, {});
  }

  start(assessmentId: number): Observable<any> {
    return this.http.post(`${this.base}/${assessmentId}/start`, {});
  }

  submit(assessmentId: number, answers: any): Observable<any> {
    return this.http.post(`${this.base}/${assessmentId}/submit`, answers);
  }
}
