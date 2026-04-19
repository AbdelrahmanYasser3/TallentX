import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobSearch } from './job-search';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { convertToParamMap } from '@angular/router';

describe('JobSearch', () => {
  let component: JobSearch;
  let fixture: ComponentFixture<JobSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSearch, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            queryParamMap: of(convertToParamMap({}))
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JobSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

