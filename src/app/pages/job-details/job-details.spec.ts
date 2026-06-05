import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobDetails } from './job-details';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('JobDetails', () => {
  let component: JobDetails;
  let fixture: ComponentFixture<JobDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetails, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { 
            snapshot: { 
              paramMap: { get: () => '1' } 
            } 
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

