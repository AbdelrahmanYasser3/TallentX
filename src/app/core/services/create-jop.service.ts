import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewJobFormValue } from '../../pages/create-job/create-job';

@Injectable({ providedIn: 'root' })
export class CreateJobService {
  private http = inject(HttpClient);

  createJob(data: NewJobFormValue) {
    return this.http.post('http://ies.runasp.net/api/JobPosting', data);
  }
}