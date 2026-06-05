import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CandidateSkillDto } from '../models/candidate.models';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Skill`;

  getAll(): Observable<CandidateSkillDto[]> {
    return this.http.get<CandidateSkillDto[]>(this.base);
  }

  create(data: Omit<CandidateSkillDto, 'id'>): Observable<CandidateSkillDto> {
    return this.http.post<CandidateSkillDto>(this.base, data);
  }

  update(id: number, data: Partial<CandidateSkillDto>): Observable<CandidateSkillDto> {
    return this.http.put<CandidateSkillDto>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

/*
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/categories`);
  }
*/
}
