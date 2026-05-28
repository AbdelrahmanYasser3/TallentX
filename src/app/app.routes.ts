import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { candidateGuard, recruiterGuard, adminRecruiterGuard } from './core/guards/role.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.LandingPage),
  },

  // Auth & Registration Unprotected (or redirected if already logged in ideally)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },

  // Registration Flows Explicit Routes (if components exist, else keep redirecting to generic Register page)
  { path: 'register/candidate', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'register/company', loadComponent: () => import('./pages/employer-register/employer-register').then(m => m.EmployerRegisterPage) },
  { path: 'register/recruiter', loadComponent: () => import('./pages/register/register').then(m => m.Register) },

  // Candidate Routes
  {
    path: 'candidate/dashboard',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/candidate-dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'candidate/profile',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
  },
  {
    path: 'candidate/interviews',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/candidate-interviews/candidate-interviews').then(m => m.CandidateInterviewsPage),
  },
  {
    path: 'candidate/assessments',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/take-assessment/take-assessment').then(m => m.TakeAssessmentPage),
  },
  {
    path: 'candidate/assessments/:id',
    canActivate: [candidateGuard],
    loadComponent: () => import('./pages/take-assessment/take-assessment').then(m => m.TakeAssessmentPage),
  },
  {
    path: 'dashboard/saved-jobs',
    canActivate: [authGuard], // or candidateGuard
    loadComponent: () => import('./pages/dashboard-saved-jobs/saved-jobs').then(m => m.SavedJobsPage),
  },
  {
    path: 'dashboard/applications',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard-applications/applications').then(m => m.ApplicationsPage),
  },
  { path: 'candidate/saved-jobs', redirectTo: 'dashboard/saved-jobs', pathMatch: 'full' },
  { path: 'candidate/applications', redirectTo: 'dashboard/applications', pathMatch: 'full' },

  // Recruiter Routes
  {
    path: 'recruiter/dashboard',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/recruiter-dashboard/recruiter-dashboard').then(m => m.RecruiterDashboard),
  },
  {
    path: 'recruiter/jobs',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/recruiter-jobs/recruiter-jobs').then(m => m.RecruiterJobs),
  },
  {
    path: 'recruiter/jobs/new',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/create-job/create-job').then(m => m.CreateJobPage),
  },
  {
    path: 'recruiter/jobs/edit/:id',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/edit-job/edit-job').then(m => m.EditJobPage),
  },
  {
    path: 'recruiter/jobs/:jobId/applications',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/recruiter-applicants/recruiter-applicants').then(m => m.RecruiterApplicantsPage),
  },
  {
    path: 'recruiter/jobs/:jobId/pipeline',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/recruiter-applicants/recruiter-applicants').then(m => m.RecruiterApplicantsPage),
  },
  {
    path: 'recruiter/jobs/:jobId/applications/:candidateId',
    canActivate: [recruiterGuard],
    loadComponent: () =>
      import('./pages/recruiter-candidate-detail/recruiter-candidate-detail').then(
        (m) => m.RecruiterCandidateDetailPage
      ),
  },
  {
    path: 'recruiter/candidates/:candidateId',
    canActivate: [recruiterGuard],
    loadComponent: () =>
      import('./pages/recruiter-candidate-detail/recruiter-candidate-detail').then(
        (m) => m.RecruiterCandidateDetailPage
      ),
  },
  {
    path: 'recruiter/interviews',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/interview-scheduling/interview-scheduling').then(m => m.InterviewSchedulingPage),
  },
  {
    path: 'recruiter/assessments',
    canActivate: [recruiterGuard],
    loadComponent: () => import('./pages/assessment-builder-list/assessment-builder-list').then(m => m.AssessmentBuilderListPage),
  },
  {
    path: 'recruiter/assessments/new',
    canActivate: [recruiterGuard],
    canDeactivate: [pendingChangesGuard],
    loadComponent: () => import('./pages/create-ai-interview/create-ai-interview').then(m => m.CreateAiInterviewPage),
  },
  {
    path: 'recruiter/assessments/builder',
    canActivate: [recruiterGuard],
    canDeactivate: [pendingChangesGuard],
    loadComponent: () => import('./pages/create-ai-interview/create-ai-interview').then(m => m.CreateAiInterviewPage),
  },

  // Admin/Company Routes
  {
    path: 'company/settings',
    canActivate: [adminRecruiterGuard],
    loadComponent: () => import('./pages/company-settings/company-settings').then(m => m.CompanySettingsPage),
  },

  // Shared / General Public Pages
  {
    path: 'jobs',
    loadComponent: () => import('./pages/job-search/job-search').then(m => m.JobSearch),
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/job-details/job-details').then(m => m.JobDetails),
  },
  {
    path: 'companies',
    loadComponent: () => import('./pages/companies/companies').then(m => m.CompaniesPage),
  },
  {
    path: 'companies/:id',
    loadComponent: () => import('./pages/public-company-profile/public-company-profile').then(m => m.PublicCompanyProfilePage),
  },
  {
    path: 'public-company-profile',
    loadComponent: () => import('./pages/public-company-profile/public-company-profile').then(m => m.PublicCompanyProfilePage),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPage),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsPage),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then(m => m.PrivacyPage),
  },

  // Shared Auth Protected
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsPage),
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/messages/messages').then(m => m.MessagesPage),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notifications/notifications').then(m => m.NotificationsPage),
  },
  {
    path: 'resume-viewer',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resume-viewer/resume-viewer').then(m => m.ResumeViewerPage),
  },
  {
    path: 'analytics-reports',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/analytics-reports/analytics-reports').then(m => m.AnalyticsReportsPage),
  },
  {
    path: 'activity-logs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/activity-logs/activity-logs').then(m => m.ActivityLogsPage),
  },

  {
    path: 'interview/:id',
    loadComponent: () =>
      import('./pages/interview-room/interview-room')
        .then(m => m.InterviewRoom)

  },

  // Redirects from deprecated paths
  { path: 'dashboard', redirectTo: 'candidate/dashboard', pathMatch: 'full' },
  { path: 'candidate-dashboard', redirectTo: 'candidate/dashboard', pathMatch: 'full' },
  { path: 'profile', redirectTo: 'candidate/profile', pathMatch: 'full' },
  { path: 'profile-builder', redirectTo: 'candidate/profile', pathMatch: 'full' },
  { path: 'candidate-profile-view', redirectTo: 'candidate/profile', pathMatch: 'full' },
  { path: 'recruiter-dashboard', redirectTo: 'recruiter/dashboard', pathMatch: 'full' },
  { path: 'job-management', redirectTo: 'recruiter/jobs', pathMatch: 'full' },
  { path: 'job-search', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'job-details/:id', redirectTo: 'jobs/:id', pathMatch: 'full' },

  // Catch-all
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundPage),
  },
  { path: '**', redirectTo: '404' }
];
