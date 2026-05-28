import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssessmentBuilderPayload,
  AssessmentDetailDto,
  AssessmentListItemDto,
  AssignedAssessmentDto,
  SubmitAssessmentPayload,
} from '../models/assessment.models';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Assessments`;

  getAll(): Observable<AssessmentListItemDto[]> {
    return this.http.get<AssessmentListItemDto[]>(this.base);
  }

  getById(assessmentId: number): Observable<AssessmentDetailDto> {
    return this.http.get<AssessmentDetailDto>(`${this.base}/${assessmentId}`);
  }

  create(data: AssessmentBuilderPayload): Observable<AssessmentDetailDto> {
    return this.http.post<AssessmentDetailDto>(this.base, data);
  }

  update(assessmentId: number, data: AssessmentBuilderPayload): Observable<AssessmentDetailDto> {
    return this.http.put<AssessmentDetailDto>(`${this.base}/${assessmentId}`, data);
  }

  delete(assessmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${assessmentId}`);
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

  submit(assessmentId: number, answers: SubmitAssessmentPayload): Observable<any> {
    return this.http.post(`${this.base}/${assessmentId}/submit`, answers);
  }

  getAssignedForCandidate(): Observable<AssignedAssessmentDto[]> {
    return this.http.get<AssignedAssessmentDto[]>(`${this.base}/assigned`);
  }

  publish(assessmentId: number): Observable<AssessmentDetailDto> {
    return this.http.post<AssessmentDetailDto>(`${this.base}/${assessmentId}/publish`, {});
  }

  assign(assessmentId: number, candidateIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.base}/${assessmentId}/assign`, { candidateIds });
  }
}
