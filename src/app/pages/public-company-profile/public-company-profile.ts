import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CompanyService } from '../../core/services/company.service';
import { CompanyDetailDto } from '../../core/models/company.models';
import { PublicJobDto } from '../../core/utils/job.mapper';

@Component({
  selector: 'app-public-company-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-company-profile.html',
})
export class PublicCompanyProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  readonly isLoading = signal(false);
  readonly company = signal<CompanyDetailDto | null>(null);
  readonly companyJobs = signal<PublicJobDto[]>([]);

  readonly hasCompany = computed(() => this.company() !== null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) return;
    this.load(id);
  }

  private load(companyId: number): void {
    this.isLoading.set(true);
    this.companyService
      .getPublicCompanyById(companyId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((c) => this.company.set(c));

    this.companyService
      .getPublicCompanyJobs(companyId)
      .subscribe((jobs) => this.companyJobs.set(jobs ?? []));
  }

  initials(name?: string): string {
    const value = name || 'Company';
    return value
      .split(' ')
      .map((x) => x[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
