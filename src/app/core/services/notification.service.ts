import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto, UnreadCountDto } from '../models/notification.models';
import { PagedResult } from '../models/common.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Notifications`;

  getAll(pageNumber = 1, pageSize = 20, isRead?: boolean): Observable<PagedResult<NotificationDto>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (isRead !== undefined) {
      params = params.set('isRead', isRead);
    }
    return this.http.get<PagedResult<NotificationDto>>(this.base, { params });
  }

  getUnreadCount(): Observable<UnreadCountDto> {
    return this.http.get<UnreadCountDto>(`${this.base}/unread-count`);
  }

  markRead(id: number): Observable<any> {
    return this.http.patch(`${this.base}/${id}/mark-read`, {});
  }

  markAllRead(): Observable<any> {
    return this.http.patch(`${this.base}/read-all`, {});
  }
}
