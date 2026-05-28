import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CompanyDetailDto,
  InviteCodeDto,
  GenerateInviteCodeRequest,
  GenerateInviteCodeResponse,
  PublicCompanyListItemDto,
} from '../models/company.models';
import { getSeedCompanyById, PUBLIC_COMPANY_SEED } from '../data/public-companies.seed';
import { PublicJobsService } from './public-jobs.service';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private publicJobsService = inject(PublicJobsService);
  private base = `${environment.apiUrl}/Company`;

  getPublicCompanies(): Observable<PublicCompanyListItemDto[]> {
    return this.http.get<PublicCompanyListItemDto[] | CompanyDetailDto[] | { items: CompanyDetailDto[] }>(this.base).pipe(
      map((response) => {
        const list = Array.isArray(response)
          ? response
          : Array.isArray((response as any)?.items)
            ? (response as any).items
            : [];

        if (!list.length) return PUBLIC_COMPANY_SEED;
        return list.map((company: any) => ({
          id: Number(company.id),
          name: company.name,
          logoPath: company.logoPath,
          industry: company.industry,
          location: company.location,
          description: company.description,
          openJobsCount: Number(company.openJobsCount ?? 0),
          size: company.size,
          employeesCount: company.employeesCount,
        }));
      }),
      catchError(() => of(PUBLIC_COMPANY_SEED))
    );
  }

  getPublicCompanyById(id: number): Observable<CompanyDetailDto | null> {
    return this.getCompany(id).pipe(
      catchError(() => of(getSeedCompanyById(id) ?? null))
    );
  }

  getPublicCompanyJobs(companyId: number): Observable<any[]> {
    return this.publicJobsService.getPublicJobs({ pageNumber: 1, pageSize: 200 }).pipe(
      map((page) =>
        (page.items || []).filter((j) => Number(j.company?.id) === companyId)
      ),
      catchError(() => of([]))
    );
  }

  getCompany(id: number): Observable<CompanyDetailDto> {
    return this.http.get<CompanyDetailDto>(`${this.base}/${id}`);
  }

  updateCompany(id: number, data: Partial<CompanyDetailDto>): Observable<CompanyDetailDto> {
    return this.http.put<CompanyDetailDto>(`${this.base}/${id}`, data);
  }

  transferAdmin(companyId: number, newAdminId: string): Observable<any> {
    return this.http.post(`${this.base}/${companyId}/transfer-admin`, { newAdminId });
  }

  getActiveInvitationsCount(companyId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/${companyId}/active-invitations-count`);
  }

  generateInviteCode(companyId: number, request: GenerateInviteCodeRequest): Observable<GenerateInviteCodeResponse> {
    return this.http.post<GenerateInviteCodeResponse>(`${this.base}/${companyId}/invite-codes`, request);
  }

  getInviteCodes(companyId: number): Observable<InviteCodeDto[]> {
    return this.http.get<InviteCodeDto[]>(`${this.base}/${companyId}/invite-codes`);
  }

  revokeInviteCode(companyId: number, codeId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${companyId}/invite-codes/${codeId}`);
  }
}
