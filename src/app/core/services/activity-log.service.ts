import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActivityLogDto {
  id: number;
  userId: string;
  actionType: string;
  details?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ActivityLogs`;

  getMyActivity(limit: number = 20): Observable<ActivityLogDto[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<ActivityLogDto[]>(this.base, { params });
  }
}
