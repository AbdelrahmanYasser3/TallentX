import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto, UnreadCountDto } from '../models/notification.models';
import { PagedResult } from '../models/common.models';

const UNREAD_COUNT_KEY = 'ies_unread_notification_count';
const RECENT_NOTIFICATIONS_KEY = 'ies_recent_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Notifications`;

  /** Writable signal for unread count — synced with API + SignalR + localStorage */
  readonly unreadCount = signal<number>(this.loadPersistedCount());

  /** Recent notifications for the dropdown (up to 5) */
  readonly recentNotifications = signal<NotificationDto[]>(this.loadPersistedRecent());

  /** Whether the dropdown has been loaded at least once */
  readonly hasLoaded = signal(false);

  // ─── API Methods ───

  getAll(pageNumber = 1, pageSize = 20, isRead?: boolean): Observable<PagedResult<NotificationDto>> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    if (isRead !== undefined) {
      params = params.set('isRead', isRead);
    }
    return this.http.get<PagedResult<NotificationDto>>(this.base, { params });
  }

  getUnreadCount(): Observable<UnreadCountDto> {
    return this.http.get<UnreadCountDto>(`${this.base}/unread-count`).pipe(
      tap(result => {
        const count = result?.count ?? 0;
        this.unreadCount.set(count);
        this.persistCount(count);
      })
    );
  }

  markRead(id: number): Observable<any> {
    return this.http.patch(`${this.base}/${id}/mark-read`, {}).pipe(
      tap(() => {
        this.unreadCount.update(c => Math.max(0, c - 1));
        this.persistCount(this.unreadCount());
        // Update recent notifications
        this.recentNotifications.update(items =>
          items.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.persistRecent(this.recentNotifications());
      })
    );
  }

  markAllRead(): Observable<any> {
    return this.http.patch(`${this.base}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
        this.persistCount(0);
        this.recentNotifications.update(items =>
          items.map(n => ({ ...n, isRead: true }))
        );
        this.persistRecent(this.recentNotifications());
      })
    );
  }

  // ─── SignalR Integration Methods ───

  /** Called when a new notification arrives via SignalR */
  handleIncomingNotification(notification: Partial<NotificationDto>): void {
    const newItem: NotificationDto = {
      id: notification.id ?? Date.now(),
      title: notification.title ?? 'New Notification',
      message: notification.message ?? '',
      type: notification.type ?? 'General',
      isRead: false,
      createdAt: notification.createdAt ?? new Date().toISOString(),
      relatedEntityId: notification.relatedEntityId
    };

    // Prepend to recent list (keep max 5)
    this.recentNotifications.update(items => [newItem, ...items].slice(0, 5));
    this.persistRecent(this.recentNotifications());

    // Increment unread
    this.unreadCount.update(c => c + 1);
    this.persistCount(this.unreadCount());
  }

  /** Load recent notifications from API (for dropdown) */
  loadRecent(): void {
    this.getAll(1, 5).subscribe({
      next: (result) => {
        const items = result?.items ?? [];
        this.recentNotifications.set(items);
        this.persistRecent(items);
        this.hasLoaded.set(true);
      },
      error: () => this.hasLoaded.set(true)
    });
  }

  /** Load unread count from API */
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      error: () => {} // Silently fail, keep persisted count
    });
  }

  // ─── Persistence ───

  private persistCount(count: number): void {
    try { localStorage.setItem(UNREAD_COUNT_KEY, String(count)); } catch {}
  }

  private loadPersistedCount(): number {
    try {
      const stored = localStorage.getItem(UNREAD_COUNT_KEY);
      return stored ? Math.max(0, parseInt(stored, 10) || 0) : 0;
    } catch { return 0; }
  }

  private persistRecent(items: NotificationDto[]): void {
    try { localStorage.setItem(RECENT_NOTIFICATIONS_KEY, JSON.stringify(items)); } catch {}
  }

  private loadPersistedRecent(): NotificationDto[] {
    try {
      const stored = localStorage.getItem(RECENT_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  /** Clear all persisted notification state (called on logout) */
  clearPersistedState(): void {
    this.unreadCount.set(0);
    this.recentNotifications.set([]);
    this.hasLoaded.set(false);
    try {
      localStorage.removeItem(UNREAD_COUNT_KEY);
      localStorage.removeItem(RECENT_NOTIFICATIONS_KEY);
    } catch {}
  }
}
