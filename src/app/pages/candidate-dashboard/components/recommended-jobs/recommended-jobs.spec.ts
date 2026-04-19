import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RecommendedJobs } from './recommended-jobs';

describe('RecommendedJobs', () => {
  let component: RecommendedJobs;
  let fixture: ComponentFixture<RecommendedJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecommendedJobs],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendedJobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
