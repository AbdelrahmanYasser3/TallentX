import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyDetailDto, InviteCodeDto, GenerateInviteCodeRequest, GenerateInviteCodeResponse } from '../models/company.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Company`;

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
