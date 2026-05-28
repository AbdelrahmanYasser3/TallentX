import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CompanyService } from '../../core/services/company.service';
import { PublicCompanyListItemDto } from '../../core/models/company.models';

@Component({
  selector: 'app-companies-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './companies.html',
})
export class CompaniesPage implements OnInit {
  private companyService = inject(CompanyService);

  readonly isLoading = signal(false);
  readonly companies = signal<PublicCompanyListItemDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    if (!q) return this.companies();
    return this.companies().filter((c) =>
      [c.name, c.industry, c.location, c.description].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.companyService
      .getPublicCompanies()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((items) => this.companies.set(items ?? []));
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((x) => x[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
