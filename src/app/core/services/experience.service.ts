import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExperienceDto } from '../models/candidate.models';

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Experience`;

  getAll(): Observable<ExperienceDto[]> {
    return this.http.get<ExperienceDto[]>(this.base);
  }

  create(data: Omit<ExperienceDto, 'id'>): Observable<ExperienceDto> {
    return this.http.post<ExperienceDto>(this.base, data);
  }

  update(id: number, data: Partial<ExperienceDto>): Observable<ExperienceDto> {
    return this.http.put<ExperienceDto>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
