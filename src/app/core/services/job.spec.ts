import { TestBed } from '@angular/core/testing';
import { JobService } from './job';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('JobService', () => {
  let service: JobService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(JobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

