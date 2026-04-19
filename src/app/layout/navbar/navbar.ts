import { Component, OnDestroy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  public authService = inject(AuthService);
  private router = inject(Router);
  public mobileMenuOpen = false;
  public authenticated = false;
  public profileRoute = '/candidate/dashboard';
  public userInitial = 'U';

  private navSub?: Subscription;

  constructor(public themeService: ThemeService) {
    this.refreshUserUiState();

    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.refreshUserUiState();
      }
    });
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
    this.authenticated = false;
    this.profileRoute = '/candidate/dashboard';
    this.userInitial = 'U';
    this.router.navigate(['/login']);
  }

  private refreshUserUiState(): void {
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
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
}
