import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';

export interface KpiStat {
  label: string;
  value: string;
  trend: string;
  trendType: 'success' | 'warning' | 'neutral';
}

export interface FunnelStage {
  label: string;
  percentage: number;
  theme: 'primary' | 'secondary' | 'tertiary' | 'success';
}

export interface MetricsInsight {
  title: string;
  description: string;
}

export interface SourceMetric {
  source: string;
  percentage: number;
}

export interface RiskItem {
  icon: string;
  text: string;
  type: 'warning' | 'success';
}

@Component({
  selector: 'app-analytics-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-reports.html',
})
export class AnalyticsReportsPage implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  kpis = signal<KpiStat[]>([]);

  funnelStages = signal<FunnelStage[]>([
    { label: 'Applied', percentage: 100, theme: 'primary' },
    { label: 'Screened', percentage: 56, theme: 'secondary' },
    { label: 'Interviewed', percentage: 25, theme: 'tertiary' },
    { label: 'Hired', percentage: 6, theme: 'success' },
  ]);

  insights = signal<MetricsInsight[]>([
    { title: 'Recruiter Velocity', description: 'Average time from application to first interview dropped from 6.1 days to 4.7 days.' },
    { title: 'AI Recommendation Lift', description: 'Candidates surfaced by AI recommendations show 18% higher interview conversion.' },
  ]);

  topSources = signal<SourceMetric[]>([]);

  risks = signal<RiskItem[]>([]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    const companyId = this.authService.getCompanyId();
    if (!companyId) {
      this.kpis.set([
        { label: 'Applications', value: '0', trend: 'Company not resolved', trendType: 'neutral' },
        { label: 'Interviews', value: '0', trend: 'No data', trendType: 'neutral' },
        { label: 'Offers', value: '0', trend: 'No data', trendType: 'neutral' },
        { label: 'Acceptance', value: '0%', trend: 'No data', trendType: 'neutral' },
      ]);
      this.funnelStages.set([
        { label: 'Applied', percentage: 0, theme: 'primary' },
        { label: 'Screened', percentage: 0, theme: 'secondary' },
        { label: 'Interviewed', percentage: 0, theme: 'tertiary' },
        { label: 'Hired', percentage: 0, theme: 'success' },
      ]);
      this.topSources.set([]);
      this.risks.set([{ icon: 'fa-solid fa-triangle-exclamation', text: 'Unable to determine company context.', type: 'warning' }]);
      return;
    }

    this.isLoading.set(true);
    this.analyticsService.getCompanyAnalytics(companyId).subscribe({
      next: (dto) => {
        const totalApplicants = Math.max(0, Number(dto.totalApplicants ?? 0));
        const activeJobs = Math.max(0, Number(dto.activeJobs ?? 0));
        const hireRate = Math.max(0, Number(dto.hireRate ?? 0));
        const totalInterviews = Math.round(totalApplicants * 0.25);
        const totalOffers = Math.round(totalApplicants * (hireRate / 100));

        this.kpis.set([
          { label: 'Applications', value: String(totalApplicants), trend: `${activeJobs} active job posts`, trendType: 'success' },
          { label: 'Interviews', value: String(totalInterviews), trend: 'Estimated from funnel', trendType: 'neutral' },
          { label: 'Offers', value: String(totalOffers), trend: 'Derived from hire rate', trendType: 'neutral' },
          { label: 'Acceptance', value: `${hireRate.toFixed(1)}%`, trend: 'Current hire rate', trendType: hireRate >= 50 ? 'success' : 'warning' },
        ]);

        const screened = totalApplicants > 0 ? Math.min(100, Math.round((totalInterviews / totalApplicants) * 100) + 25) : 0;
        const interviewed = totalApplicants > 0 ? Math.min(100, Math.round((totalInterviews / totalApplicants) * 100)) : 0;
        const hired = Math.min(100, Math.round(hireRate));

        this.funnelStages.set([
          { label: 'Applied', percentage: totalApplicants > 0 ? 100 : 0, theme: 'primary' },
          { label: 'Screened', percentage: screened, theme: 'secondary' },
          { label: 'Interviewed', percentage: interviewed, theme: 'tertiary' },
          { label: 'Hired', percentage: hired, theme: 'success' },
        ]);

        const trends = dto.applicationTrends ?? [];
        const totalTrendCount = trends.reduce((sum, item) => sum + (item.count ?? 0), 0);
        const topTrendDays = [...trends]
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
          .slice(0, 4);

        this.topSources.set(topTrendDays.map(item => ({
          source: item.date,
          percentage: totalTrendCount > 0 ? Math.round(((item.count ?? 0) / totalTrendCount) * 100) : 0
        })));

        const warnings: RiskItem[] = [];
        if (hireRate < 30) {
          warnings.push({ icon: 'fa-solid fa-triangle-exclamation', text: 'Hire rate is below target threshold.', type: 'warning' });
        }
        if (activeJobs > 0 && totalApplicants / activeJobs < 3) {
          warnings.push({ icon: 'fa-solid fa-triangle-exclamation', text: 'Applicant volume per job is low.', type: 'warning' });
        }
        if (warnings.length === 0) {
          warnings.push({ icon: 'fa-solid fa-circle-check', text: 'Hiring indicators are stable this period.', type: 'success' });
        }
        this.risks.set(warnings);
        this.isLoading.set(false);
      },
      error: () => {
        this.kpis.set([
          { label: 'Applications', value: '0', trend: 'Failed to load', trendType: 'warning' },
          { label: 'Interviews', value: '0', trend: 'Failed to load', trendType: 'warning' },
          { label: 'Offers', value: '0', trend: 'Failed to load', trendType: 'warning' },
          { label: 'Acceptance', value: '0%', trend: 'Failed to load', trendType: 'warning' },
        ]);
        this.topSources.set([]);
        this.risks.set([{ icon: 'fa-solid fa-triangle-exclamation', text: 'Unable to load analytics from server.', type: 'warning' }]);
        this.isLoading.set(false);
      }
    });
  }
}

