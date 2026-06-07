import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AssessmentBuilderPayload,
  AssessmentDetailDto,
  AssessmentListItemDto,
  AssignedAssessmentDto,
  SubmitAssessmentPayload,
  AssessmentValidation,
  AssessmentSerializer,
  ApiErrorResponse,
  StartAssessmentPayload,
  AssignAssessmentPayload,
  AssessmentSubmissionResult,
} from '../models/assessment.models';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Assessments`;
  private isDevelopment = !environment.production;

  /**
   * Development logging utility
   */
  private log(method: string, url: string, data?: any, response?: any): void {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    console.group(
      `%c[Assessment API] ${method} ${url}`,
      'color: #0066cc; font-weight: bold'
    );
    console.log('%cTimestamp:', 'color: #999', timestamp);

    if (data) {
      console.log('%cRequest Payload:', 'color: #00aa00', data);
    }
    if (response) {
      console.log('%cResponse:', 'color: #aa0000', response);
    }
    console.groupEnd();
  }

  /**
   * Error logging utility
   */
  private logError(method: string, url: string, error: any): void {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    console.error(
      `%c[Assessment API Error] ${method} ${url}`,
      'color: #ff0000; font-weight: bold'
    );
    console.error('%cTimestamp:', 'color: #999', timestamp);
    console.error('%cError Details:', 'color: #ff0000', error);
  }

  /**
   * Handle HTTP errors with specific status code handling
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    let userMessage = 'An error occurred while communicating with the server';

    if (error.status === 0) {
      errorMessage = 'Network error - unable to reach the server';
      userMessage = 'Network error. Please check your internet connection.';
    } else if (error.status === 400) {
      errorMessage = `Validation error: ${error.error?.message || 'Invalid request'}`;
      userMessage = error.error?.message || 'The request contains invalid data.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized - authentication required';
      userMessage = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden - access denied';
      userMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
      userMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error - please try again later';
      userMessage = 'A server error occurred. Please try again later.';
    } else if (error.status >= 500) {
      errorMessage = `Server error (${error.status}): ${error.statusText}`;
      userMessage = 'A server error occurred. Please try again later.';
    } else {
      errorMessage = `HTTP Error ${error.status}: ${error.statusText}`;
    }

    this.logError('HTTP Error', `${error.status}`, {
      message: errorMessage,
      status: error.status,
      url: error.url,
      error: error.error,
    });

    const apiError: ApiErrorResponse = {
      status: error.status,
      message: errorMessage,
      errors: error.error?.errors,
      timestamp: new Date().toISOString(),
      path: error.url,
    };

    return throwError(() => ({
      error: apiError,
      userMessage,
      originalError: error,
    }));
  }

  /**
   * GET /Assessments - Get all assessments
   */
  getAll(): Observable<AssessmentListItemDto[]> {
    const url = this.base;
    this.log('GET', url);

    return this.http.get<AssessmentListItemDto[]>(url).pipe(
      tap((response) => this.log('GET', url, undefined, response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * GET /Assessments/{id} - Get assessment by ID
   */
  getById(assessmentId: number): Observable<AssessmentDetailDto> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('GET', `${this.base}/${assessmentId}`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    const url = `${this.base}/${assessmentId}`;
    this.log('GET', url);

    return this.http.get<AssessmentDetailDto>(url).pipe(
      tap((response) => {
        const deserialized = AssessmentSerializer.deserializeAssessment(response);
        this.log('GET', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments - Create a new assessment
   */
  create(data: AssessmentBuilderPayload): Observable<AssessmentDetailDto> {
    // Validate payload
    const validationErrors = AssessmentValidation.validateAssessmentPayload(data);
    if (validationErrors.length > 0) {
      this.logError('POST', this.base, validationErrors);
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Validation failed',
          errors: { validation: validationErrors },
        },
        userMessage: `Validation error: ${validationErrors[0]}`,
      }));
    }

    const url = this.base;
    const payload = AssessmentSerializer.serializeAssessmentPayload(data);
    this.log('POST', url, payload);

    return this.http.post<AssessmentDetailDto>(url, payload).pipe(
      tap((response) => {
        const deserialized = AssessmentSerializer.deserializeAssessment(response);
        this.log('POST', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * PUT /Assessments/{id} - Update an assessment
   */
  update(
    assessmentId: number,
    data: AssessmentBuilderPayload
  ): Observable<AssessmentDetailDto> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('PUT', `${this.base}/${assessmentId}`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    // Validate payload
    const validationErrors = AssessmentValidation.validateAssessmentPayload(data);
    if (validationErrors.length > 0) {
      this.logError('PUT', `${this.base}/${assessmentId}`, validationErrors);
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Validation failed',
          errors: { validation: validationErrors },
        },
        userMessage: `Validation error: ${validationErrors[0]}`,
      }));
    }

    const url = `${this.base}/${assessmentId}`;
    const payload = AssessmentSerializer.serializeAssessmentPayload(data);
    this.log('PUT', url, payload);

    return this.http.put<AssessmentDetailDto>(url, payload).pipe(
      tap((response) => {
        const deserialized = AssessmentSerializer.deserializeAssessment(response);
        this.log('PUT', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * DELETE /Assessments/{id} - Delete an assessment
   */
  delete(assessmentId: number): Observable<void> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('DELETE', `${this.base}/${assessmentId}`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    const url = `${this.base}/${assessmentId}`;
    this.log('DELETE', url);

    return this.http.delete<void>(url).pipe(
      tap(() => this.log('DELETE', url, undefined, 'Success')),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * GET /Assessments/job/{jobPostId} - Get assessments for a job
   */
  getByJob(jobId: number): Observable<AssessmentDetailDto[]> {
    if (!Number.isInteger(jobId) || jobId < 1) {
      this.logError('GET', `${this.base}/job/${jobId}`, 'Invalid job ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid job ID',
        },
        userMessage: 'Invalid job ID provided.',
      }));
    }

    const url = `${this.base}/job/${jobId}`;
    this.log('GET', url);

    return this.http.get<AssessmentDetailDto[]>(url).pipe(
      tap((response) => {
        const deserialized = (response || []).map((a) =>
          AssessmentSerializer.deserializeAssessment(a)
        );
        this.log('GET', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments/job/{jobPostId}/generate - Generate assessment for job
   */
  generate(jobId: number): Observable<AssessmentDetailDto> {
    if (!Number.isInteger(jobId) || jobId < 1) {
      this.logError('POST', `${this.base}/job/${jobId}/generate`, 'Invalid job ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid job ID',
        },
        userMessage: 'Invalid job ID provided.',
      }));
    }

    const url = `${this.base}/job/${jobId}/generate`;
    this.log('POST', url, {});

    return this.http.post<AssessmentDetailDto>(url, {}).pipe(
      tap((response) => {
        const deserialized = AssessmentSerializer.deserializeAssessment(response);
        this.log('POST', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments/{id}/start - Start an assessment
   */
  start(assessmentId: number): Observable<any> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('POST', `${this.base}/${assessmentId}/start`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    const url = `${this.base}/${assessmentId}/start`;
    const payload: StartAssessmentPayload = { request: 'StartAssessment' };
    this.log('POST', url, payload);

    return this.http.post(url, payload).pipe(
      tap((response) => this.log('POST', url, undefined, response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments/{id}/submit - Submit assessment answers
   */
  submit(assessmentId: number, answers: SubmitAssessmentPayload): Observable<AssessmentSubmissionResult> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('POST', `${this.base}/${assessmentId}/submit`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    // Validate payload
    const validationErrors = AssessmentValidation.validateSubmitPayload(answers);
    if (validationErrors.length > 0) {
      this.logError('POST', `${this.base}/${assessmentId}/submit`, validationErrors);
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Validation failed',
          errors: { validation: validationErrors },
        },
        userMessage: `Validation error: ${validationErrors[0]}`,
      }));
    }

    const url = `${this.base}/${assessmentId}/submit`;
    const payload = AssessmentSerializer.serializeSubmitPayload(answers);
    this.log('POST', url, payload);

    return this.http.post<AssessmentSubmissionResult>(url, payload).pipe(
      tap((response) => this.log('POST', url, undefined, response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * GET /Assessments/my-assessments - Get assessments assigned to current user
   */
  getAssignedForCandidate(): Observable<AssignedAssessmentDto[]> {
    const url = `${this.base}/my-assessments`;
    this.log('GET', url);

    return this.http.get<AssignedAssessmentDto[]>(url).pipe(
      tap((response) => this.log('GET', url, undefined, response)),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments/{id}/publish - Publish an assessment
   */
  publish(assessmentId: number): Observable<AssessmentDetailDto> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('POST', `${this.base}/${assessmentId}/publish`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    const url = `${this.base}/${assessmentId}/publish`;
    this.log('POST', url, {});

    return this.http.post<AssessmentDetailDto>(url, {}).pipe(
      tap((response) => {
        const deserialized = AssessmentSerializer.deserializeAssessment(response);
        this.log('POST', url, undefined, deserialized);
        return deserialized;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * POST /Assessments/{id}/assign - Assign assessment to candidates
   */
  assign(assessmentId: number, candidateIds: string[]): Observable<void> {
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      this.logError('POST', `${this.base}/${assessmentId}/assign`, 'Invalid assessment ID');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'Invalid assessment ID',
        },
        userMessage: 'Invalid assessment ID provided.',
      }));
    }

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      this.logError('POST', `${this.base}/${assessmentId}/assign`, 'Invalid candidate IDs');
      return throwError(() => ({
        error: {
          status: 400,
          message: 'At least one candidate must be selected',
        },
        userMessage: 'Please select at least one candidate.',
      }));
    }

    const url = `${this.base}/${assessmentId}/assign`;
    const payload: AssignAssessmentPayload = { candidateIds };
    this.log('POST', url, payload);

    return this.http.post<void>(url, payload).pipe(
      tap(() => this.log('POST', url, undefined, 'Success')),
      catchError((error) => this.handleError(error))
    );
  }
}
