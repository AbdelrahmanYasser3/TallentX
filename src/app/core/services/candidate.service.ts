import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { CandidateProfileDto, CandidateUIProfile } from '../models/candidate.models';
import { JobListDto, JobApplicationDto } from '../models/job.models';
import { PagedResult } from '../models/common.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private base = `${environment.apiUrl}/Candidates`;

  private profileSubject = new BehaviorSubject<CandidateUIProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProfileDto(): Observable<CandidateProfileDto | null> {
    return this.http.get<CandidateProfileDto>(`${this.base}/profile`).pipe(
      catchError(() => of(null))
    );
  }

  loadProfile(): Observable<CandidateUIProfile | null> {
    return this.http.get<CandidateProfileDto>(`${this.base}/profile`).pipe(
      map((res: CandidateProfileDto) => this.mapToUIProfile(res)),
      tap(profile => this.profileSubject.next(profile)),
      catchError(() => {
        this.profileSubject.next(null);
        return of(null);
      })
    );
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }

  getProfile(): Observable<CandidateUIProfile | null> {
    if (this.profileSubject.value) {
      return of(this.profileSubject.value);
    }
    return this.loadProfile();
  }

  // Transform API response into clean UI model
  private mapToUIProfile(apiProfile: CandidateProfileDto): CandidateUIProfile {
    const firstName = apiProfile.firstName || '';
    const lastName = apiProfile.lastName || '';
    const email = apiProfile.email || '';
    const phoneNumber = apiProfile.phoneNumber || null;
    const skills = apiProfile.skills?.map(s => s.name) || [];
    let profilePicture = apiProfile.profilePicturePath || null;
    
    // Normalize and add computed flags
    if (profilePicture && !profilePicture.startsWith('http')) {
      profilePicture = environment.baseUrl + '/' + profilePicture.replace(/^\//, '');
    }
    const hasResume = apiProfile.resumes && apiProfile.resumes.length > 0;
    const hasProfilePicture = !!profilePicture;

    const baseProfile: CandidateUIProfile = {
      fullName: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      phoneNumber,
      skills,
      profilePicture,
      hasResume,
      hasProfilePicture,
      completionPercentage: 0
    };

    baseProfile.completionPercentage = this.recalculateCompletion(baseProfile);
    return baseProfile;
  }

  private recalculateCompletion(profile: CandidateUIProfile): number {
    let completedFields = 0;
    if (profile.firstName.trim() !== '') completedFields++;
    if (profile.lastName.trim() !== '') completedFields++;
    if (profile.email.trim() !== '') completedFields++;
    if (profile.phoneNumber && profile.phoneNumber.trim() !== '') completedFields++;
    if (profile.skills.length > 0) completedFields++;
    if (profile.hasResume) completedFields++;
    if (profile.hasProfilePicture) completedFields++;

    return Math.round((completedFields / 7) * 100);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.base}/profile`, data);
  }

  updateSkills(skills: string[]): Observable<any> {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return of(null); // Validating non-empty array
    }

    return this.http.put(`${this.base}/skills`, { skills }).pipe(
      tap(() => {
        const current = this.profileSubject.value;
        if (current) {
          const updated = { ...current, skills };
          updated.completionPercentage = this.recalculateCompletion(updated);
          this.profileSubject.next(updated);
        }
      })
    );
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.base}/resume`, formData).pipe(
      tap(() => {
        const current = this.profileSubject.value;
        if (current) {
          const updated = { ...current, hasResume: true };
          updated.completionPercentage = this.recalculateCompletion(updated);
          this.profileSubject.next(updated);
        }
      })
    );
  }

  deleteResume(resumeId: string): Observable<any> {
    return this.http.delete(`${this.base}/resume/${resumeId}`).pipe(
      tap(() => {
        const current = this.profileSubject.value;
        if (current) {
          const updated = { ...current, hasResume: false };
          updated.completionPercentage = this.recalculateCompletion(updated);
          this.profileSubject.next(updated);
        }
      })
    );
  }

  generateCv(resumeId: string): Observable<any> {
    return this.http.post(`${this.base}/resume/${resumeId}/generate-cv`, {});
  }

  updateProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put(`${this.base}/profile-picture`, formData).pipe(
      tap((res: any) => {
        const current = this.profileSubject.value;
        if (current) {
          let newPic = res?.url || res?.profilePicture || URL.createObjectURL(file);
          if (newPic && !newPic.startsWith('http') && !newPic.startsWith('blob:')) {
            newPic = environment.baseUrl + '/' + newPic.replace(/^\//, '');
          }
          const updated = { ...current, hasProfilePicture: true, profilePicture: newPic };
          updated.completionPercentage = this.recalculateCompletion(updated);
          this.profileSubject.next(updated);
        }
      })
    );
  }

  getApplications(): Observable<JobApplicationDto[]> {
    return this.http.get<PagedResult<any> | any[]>(`${this.base}/applications`).pipe(
      map((payload) => {
        const items = Array.isArray(payload)
          ? payload
          : payload?.items ?? [];

        if (!Array.isArray(items)) {
          return [];
        }

        return items.map((item) => ({
          id: Number(item?.id ?? item?.applicationId ?? 0),
          jobPostingId: Number(item?.jobPostingId ?? item?.jobPostId ?? 0),
          candidateId: String(item?.candidateId ?? ''),
          candidateName: item?.candidateName,
          jobTitle: item?.jobTitle,
          status: String(item?.status ?? 'Pending'),
          appliedAt: item?.appliedAt ?? new Date().toISOString(),
          updatedAt: item?.updatedAt,
          resumeId: Number(item?.resumeId ?? 0),
          coverLetter: item?.coverLetter,
          matchScore: item?.matchScore !== undefined ? Number(item.matchScore) : undefined,
          recruiterRating: item?.recruiterRating !== undefined ? Number(item.recruiterRating) : undefined,
          rejectionReason: item?.rejectionReason
        } as JobApplicationDto));
      }),
      catchError(() => of([]))
    );
  }

  getSavedJobs(): Observable<JobListDto[]> {
    return this.http.get<PagedResult<JobListDto> | JobListDto[]>(`${this.base}/saved-jobs`).pipe(
      map((payload) => {
        const items = Array.isArray(payload)
          ? payload
          : payload?.items ?? [];
        return Array.isArray(items) ? items : [];
      }),
      catchError(() => of([]))
    );
  }

  saveJob(jobPostId: string | number): Observable<any> {
    return this.http.post(`${this.base}/saved-jobs/${jobPostId}`, {});
  }

  withdrawApplication(applicationId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/JobApplication/${applicationId}/withdraw`);
  }

  applyForJob(jobPostId: number, resumeId: number): Observable<JobApplicationDto> {
    return this.http.post<JobApplicationDto>(`${environment.apiUrl}/JobApplication/apply`, {
      jobPostId,
      resumeId
    });
  }
}
