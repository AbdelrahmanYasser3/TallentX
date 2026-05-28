import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private router = inject(Router);
  private signalRService = inject(SignalRService);
  public notificationService = inject(NotificationService);
  private toast = inject(ToastService);

  public mobileMenuOpen = false;
  public authenticated = false;
  public profileRoute = '/candidate/dashboard';
  public userInitial = 'U';

  /** Controls the notification dropdown visibility */
  public notificationDropdownOpen = signal(false);

  private navSub?: Subscription;
  private signalRSub?: Subscription;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.refreshUserUiState();

    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.refreshUserUiState();
        // Close dropdown on navigation
        this.notificationDropdownOpen.set(false);
      }
    });

    // Initialize SignalR + notifications if authenticated
    if (this.authenticated) {
      this.initializeNotifications();
    }
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  toggleNotificationDropdown(): void {
    const willOpen = !this.notificationDropdownOpen();
    this.notificationDropdownOpen.set(willOpen);

    // Load recent notifications when opening dropdown for the first time
    if (willOpen && !this.notificationService.hasLoaded()) {
      this.notificationService.loadRecent();
    }
  }

  closeNotificationDropdown(): void {
    this.notificationDropdownOpen.set(false);
  }

  markNotificationRead(id: number): void {
    this.notificationService.markRead(id).subscribe();
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllRead().subscribe();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'NewJobPosted': return 'work';
      case 'ApplicationReceived': return 'person_add';
      case 'InterviewScheduled': return 'calendar_today';
      case 'ApplicationStatusUpdate':
      case 'StatusUpdate': return 'sync_alt';
      default: return 'notifications';
    }
  }

  getNotificationIconColor(type: string): string {
    switch (type) {
      case 'NewJobPosted': return 'text-primary bg-primary/10';
      case 'ApplicationReceived': return 'text-success bg-success/10';
      case 'InterviewScheduled': return 'text-secondary bg-secondary/10';
      case 'ApplicationStatusUpdate':
      case 'StatusUpdate': return 'text-tertiary bg-tertiary/10';
      default: return 'text-on-surface-variant bg-surface-container';
    }
  }

  getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  logout() {
    this.signalRService.stopConnection();
    this.notificationService.clearPersistedState();
    this.authService.logout();
    this.authenticated = false;
    this.profileRoute = '/candidate/dashboard';
    this.userInitial = 'U';
    this.router.navigate(['/login']);
  }

  private refreshUserUiState(): void {
    const wasAuthenticated = this.authenticated;
    this.authenticated = this.authService.isAuthenticated();

    const role = (this.authService.getRole() || '').toLowerCase();
    if (role === 'recruiter' || role === 'admin') {
      this.profileRoute = '/recruiter/dashboard';
    } else {
      this.profileRoute = '/candidate/dashboard';
    }

    const email = localStorage.getItem('ies_email') || '';
    if (email.length > 0) {
      this.userInitial = email.charAt(0).toUpperCase();
    } else {
      this.userInitial = 'U';
    }

    // Start notifications if user just became authenticated
    if (this.authenticated && !wasAuthenticated) {
      this.initializeNotifications();
    }
  }

  private initializeNotifications(): void {
    // Start SignalR connection
    this.signalRService.startConnection();

    // Load unread count from API
    this.notificationService.loadUnreadCount();

    // Subscribe to real-time notifications
    this.signalRSub?.unsubscribe();
    this.signalRSub = this.signalRService.notification$.subscribe((notification) => {
      if (!notification) return;

      // Update notification service state
      this.notificationService.handleIncomingNotification(notification as any);

      // Show toast for new job notifications
      if (notification.type === 'NewJobPosted') {
        this.toast.show(
          notification.message || `New job posted: ${notification.title}`,
          'info'
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
    this.signalRSub?.unsubscribe();
  }
}
