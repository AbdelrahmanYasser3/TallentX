import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruiterService } from '../../core/services/recruiter';
import { ActivatedRoute } from '@angular/router';

export interface BoardColumn {
  id: string;
  name: string;
  count: number;
  theme: 'primary' | 'secondary' | 'tertiary' | 'success';
}

export interface ApplicantCard {
  id: string;
  name: string;
  role: string;
  columnId: string;
}

@Component({
  selector: 'app-applicant-tracking-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicant-tracking.html',
})
export class ApplicantTrackingPage implements OnInit {
  private route = inject(ActivatedRoute);
  private recruiterService = inject(RecruiterService);

  columns = signal<BoardColumn[]>([
    { id: 'new', name: 'Applied', count: 0, theme: 'primary' },
    { id: 'reviewed', name: 'Screening', count: 0, theme: 'secondary' },
    { id: 'interviewed', name: 'Interview', count: 0, theme: 'tertiary' },
    { id: 'offered', name: 'Offer', count: 0, theme: 'success' },
  ]);

  applicants = signal<ApplicantCard[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const requestedJobId = Number(params['jobId']);
      if (Number.isFinite(requestedJobId) && requestedJobId > 0) {
        this.loadApplicantsForJob(requestedJobId);
        return;
      }

      this.recruiterService.getJobPostings().subscribe({
        next: (jobs) => {
          if (jobs.length > 0) {
            this.loadApplicantsForJob(Number(jobs[0].id));
            return;
          }

          this.applicants.set([]);
          this.columns.update(cols => cols.map(col => ({ ...col, count: 0 })));
        },
        error: () => {
          this.applicants.set([]);
          this.columns.update(cols => cols.map(col => ({ ...col, count: 0 })));
        }
      });
    });
  }

  loadApplicantsForJob(jobId: number) {
    this.isLoading.set(true);
    
    // Load all applicants across all statuses for this job
    // Note: We use page size 50 to get a small board going.
    this.recruiterService.getJobApplicants(jobId, 1, 50).subscribe({
      next: (applications) => {
        const cards: ApplicantCard[] = applications.map(app => {
          let columnId = 'new';
          const normalizedStatus = (app.status || '').toLowerCase().replace(/\s/g, '');
          
          if (['reviewed', 'underreview', 'assessment'].includes(normalizedStatus)) columnId = 'reviewed';
          if (['interview', 'interviewed', 'interviewing'].includes(normalizedStatus)) columnId = 'interviewed';
          if (['offered', 'accepted', 'hired'].includes(normalizedStatus)) columnId = 'offered';

          return {
            id: String(app.id),
            name: app.candidateName || app.candidateId,
            role: 'Candidate', // The backend doesn't return role per applicant
            columnId: columnId
          };
        });

        this.applicants.set(cards);

        // Update column counts
        this.columns.update(cols => 
          cols.map(col => ({
            ...col,
            count: cards.filter(c => c.columnId === col.id).length
          }))
        );
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load applicants', err);
        this.isLoading.set(false);
      }
    });
  }

  getApplicantsForColumn(colId: string): ApplicantCard[] {
    return this.applicants().filter(a => a.columnId === colId);
  }
}


