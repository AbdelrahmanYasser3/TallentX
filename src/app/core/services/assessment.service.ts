import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssessmentDetailDto, AssessmentListItemDto } from '../models/assessment.models';

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

  getAll(): Observable<AssessmentListItemDto[]> {
    return this.http.get<AssessmentListItemDto[]>(this.base);
  }

  publish(id: number): Observable<any> {
    return this.http.post(`${this.base}/${id}/publish`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  assign(assessmentId: number, candidateIds: string[] | number[]): Observable<any> {
    return this.http.post(`${this.base}/${assessmentId}/assign`, { candidateIds });
  }
}
