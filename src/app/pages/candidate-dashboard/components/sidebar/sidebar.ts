import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent implements OnInit {
  @Input() hasResume = false;
  @Input() isUploading = false;
  @Output() uploadCv = new EventEmitter<File>();

  private authService = inject(AuthService);
  private router = inject(Router);
  isRecruiter = false;

  upcomingInterviews = [
    { company: 'Google', date: 'Oct 15, 2026', time: '10:00 AM', type: 'Technical' },
    { company: 'Meta', date: 'Oct 18, 2026', time: '2:30 PM', type: 'HR Screening' }
  ];

  recentActivities = [
    { action: 'Applied for Frontend Engineer at Netflix', time: '2 hours ago' },
    { action: 'Updated profile picture', time: '1 day ago' },
    { action: 'Saved a job from Spotify', time: '2 days ago' }
  ];

  ngOnInit() {
    const role = this.authService.getRole();
    this.isRecruiter = role === 'Recruiter';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (file) {
      this.uploadCv.emit(file);
    }
  }

  triggerFileInput() {
    document.getElementById('cv-upload')?.click();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

