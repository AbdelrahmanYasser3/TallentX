import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Dashboards`;

  getCandidateDashboard(): Observable<any> {
    return this.http.get<any>(`${this.base}/candidate`);
  }

  getCompanyDashboard(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/company/${companyId}`);
  }
}
