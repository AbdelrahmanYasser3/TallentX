import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EducationDto } from '../models/candidate.models';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Education`;

  getAll(): Observable<EducationDto[]> {
    return this.http.get<EducationDto[]>(this.base);
  }

  create(data: Omit<EducationDto, 'id'>): Observable<EducationDto> {
    return this.http.post<EducationDto>(this.base, data);
  }

  update(id: number, data: Partial<EducationDto>): Observable<EducationDto> {
    return this.http.put<EducationDto>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
