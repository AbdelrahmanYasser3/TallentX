import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobModel } from '../../core/models/candidate.models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.html'
})
export class LandingPage {
  private router = inject(Router);

  searchQuery = '';
  locationQuery = '';

  featuredJobs: JobModel[] = [
    {
      id: 'f-1',
      title: 'Senior Frontend Engineer',
      companyName: 'Neural Labs',
      location: 'Cairo, Egypt',
      employmentType: 'Full-time',
      salaryRange: '$2,500 - $3,500',
      isSaved: false
    },
    {
      id: 'f-2',
      title: 'AI Product Manager',
      companyName: 'TalentFlow',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '$3,000 - $4,200',
      isSaved: false
    },
    {
      id: 'f-3',
      title: 'Backend .NET Developer',
      companyName: 'Cloud Forge',
      location: 'Alexandria, Egypt',
      employmentType: 'Hybrid',
      salaryRange: '$2,000 - $3,000',
      isSaved: false
    }
  ];

  onSearch(): void {
    const q = this.searchQuery.trim();
    const location = this.locationQuery.trim();

    this.router.navigate(['/jobs'], {
      queryParams: {
        ...(q ? { q } : {}),
        ...(location ? { location } : {})
      }
    });
  }
}
