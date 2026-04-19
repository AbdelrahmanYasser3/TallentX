import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationDto } from '../../core/models/notification.models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
})
export class NotificationsPage implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private signalRService = inject(SignalRService);
  private toast = inject(ToastService);
  private signalRSub?: Subscription;

  readonly notifications = signal<NotificationDto[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly filter = signal<'all' | 'unread'>('all');

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  readonly filteredNotifications = computed(() => {
    if (this.filter() === 'unread') {
      return this.notifications().filter((item) => !item.isRead);
    }
    return this.notifications();
  });

  ngOnInit(): void {
    this.loadNotifications();
    this.signalRService.startConnection();

    this.signalRSub = this.signalRService.notifications$.subscribe((incoming) => {
      if (!incoming) {
        return;
      }

      // Keep consistent with backend source of truth while still reacting in near real-time.
      this.loadNotifications();
    });
  }

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
    this.signalRService.stopConnection();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationService.getAll(1, 50)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (result) => {
          const items = result?.items ?? [];
          this.notifications.set(
            [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
          );
        },
        error: () => {
          this.toast.error('Failed to load notifications.');
          this.notifications.set([]);
        }
      });
  }

  setFilter(value: 'all' | 'unread'): void {
    this.filter.set(value);
  }

  markAsRead(notification: NotificationDto): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markRead(notification.id).subscribe({
      next: () => {
        this.notifications.update((current) =>
          current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item)
        );
      },
      error: () => this.toast.error('Failed to mark notification as read.')
    });
  }

  markAllRead(): void {
    if (this.unreadCount() === 0) {
      return;
    }

    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update((current) => current.map((item) => ({ ...item, isRead: true })));
        this.toast.success('All notifications marked as read.');
      },
      error: () => this.toast.error('Failed to mark all notifications as read.')
    });
  }

  formatTypeLabel(type: string): string {
    if (!type) {
      return 'General';
    }

    return type.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
