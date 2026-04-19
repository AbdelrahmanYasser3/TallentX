import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';
import { CandidateService } from '../../core/services/candidate.service';
import { ToastService } from '../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { ApplicationModel, JobModel, CandidateUIProfile } from '../../core/models/candidate.models';
import { CandidateDashboardDto } from '../../core/models/dashboard.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let mockCandidateService: Mocked<CandidateService>;
  let mockDashboardService: Mocked<DashboardService>;
  let mockToastService: Mocked<ToastService>;

  const mockProfile: CandidateUIProfile = {
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'alex@example.com',
    hasResume: false,
    completionPercentage: 80
  } as any;

  const mockApplications: ApplicationModel[] = [
    { id: 'app-1', jobTitle: 'Senior Designer', companyName: 'Stripe', status: 'Interview', appliedDate: new Date('2023-10-24').toISOString() }
  ];

  const mockSavedJobs: JobModel[] = [
    { jobPostId: 'job-1', title: 'UX Engineer', company: 'Dropbox', location: 'London', jobType: 'Contract', isSaved: true, createdAt: '2 days ago' }
  ];

  const mockDashboard: CandidateDashboardDto = {
    savedJobsCount: 1,
    activeApplicationsCount: 1,
    upcomingInterviewsCount: 0,
    unreadNotificationsCount: 0,
    recentApplications: mockApplications as any,
    upcomingInterviews: []
  };

  beforeEach(async () => {
    mockCandidateService = {
      getProfile: vi.fn().mockReturnValue(of(mockProfile)),
      getApplications: vi.fn().mockReturnValue(of(mockApplications)),
      getSavedJobs: vi.fn().mockReturnValue(of(mockSavedJobs)),
      saveJob: vi.fn(),
      uploadResume: vi.fn()
    } as unknown as Mocked<CandidateService>;

    mockDashboardService = {
      getCandidateDashboard: vi.fn().mockReturnValue(of(mockDashboard))
    } as unknown as Mocked<DashboardService>;

    mockToastService = {
      success: vi.fn(),
      error: vi.fn()
    } as unknown as Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [DashboardPage, RouterTestingModule],
      providers: [
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', async () => {
    expect(mockCandidateService.getProfile).toHaveBeenCalled();
    expect(mockDashboardService.getCandidateDashboard).toHaveBeenCalled();
    expect(mockCandidateService.getSavedJobs).toHaveBeenCalled();

    // allow setTimeout to resolve
    await new Promise(r => setTimeout(r, 0));

    expect(component.profile).toEqual(mockProfile);
    expect(component.applications.length).toBe(1);
    expect(component.savedJobs.length).toBe(1);
    expect(component.isLoading).toBe(false);
    expect(component.isError).toBe(false);
  });

  it('should handle error when loading dashboard data', async () => {
    mockCandidateService.getProfile.mockReturnValueOnce(throwError(() => new Error('Error')));
    component.loadDashboardData();
    
    // allow setTimeout to resolve
    await new Promise(r => setTimeout(r, 0));

    expect(component.isError).toBe(true);
    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load dashboard data.');
  });

  it('should save a job and handle success', () => {
    const jobToSave: JobModel = { jobPostId: 'job-2', title: 'Developer', company: 'Company', location: 'Remote', jobType: 'Full-time', isSaved: false, createdAt: 'old' };
    mockCandidateService.saveJob.mockReturnValueOnce(of({} as any));

    component.onSaveJob(jobToSave);
    
    expect(jobToSave.isSaved).toBe(true);
    expect(mockCandidateService.saveJob).toHaveBeenCalledWith('job-2');
    expect(mockToastService.success).toHaveBeenCalledWith('Job saved successfully!');
  });
  
  it('should handle failure when saving a job', () => {
    const jobToSave: JobModel = { jobPostId: 'job-3', title: 'Developer', company: 'Company', location: 'Remote', jobType: 'Full-time', isSaved: false, createdAt: 'old' };
    mockCandidateService.saveJob.mockReturnValueOnce(throwError(() => new Error('Error')));

    component.onSaveJob(jobToSave);
    
    expect(jobToSave.isSaved).toBe(false);
    expect(mockToastService.error).toHaveBeenCalledWith('Failed to save the job.');
  });

  it('should upload file from event successfully', () => {
    const file = new File(['content'], 'resume.pdf');
    mockCandidateService.uploadResume.mockReturnValueOnce(of({} as any));

    component.profile = { ...mockProfile };
    const mockEvent = { target: { files: [file] } } as unknown as Event;
    component.onFileUpload(mockEvent);
    
    expect(component.isUploadingCv).toBe(false);
    expect(component.profile!.hasResume).toBe(true);
    expect(mockToastService.success).toHaveBeenCalledWith('CV uploaded successfully!');
  });

  it('should upload CV successfully', () => {
    const file = new File(['content'], 'resume.pdf');
    mockCandidateService.uploadResume.mockReturnValueOnce(of({} as any));

    component.profile = { ...mockProfile };
    component.onUploadCv(file);
    
    expect(component.isUploadingCv).toBe(false);
    expect(component.profile!.hasResume).toBe(true);
    expect(mockToastService.success).toHaveBeenCalledWith('CV uploaded successfully!');
  });
});

