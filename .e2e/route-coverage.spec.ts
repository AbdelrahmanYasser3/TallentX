import { test, expect, Page } from '@playwright/test';

type Role = 'Candidate' | 'Recruiter' | 'Admin';

const buildMockJwt = (role: Role, companyId?: number) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      ...(companyId ? { companyId } : {}),
    }),
  ).toString('base64url');
  return `${header}.${payload}.signature`;
};

const seedCandidateSession = async (page: Page) => {
  const token = buildMockJwt('Candidate');
  await page.addInitScript((value) => {
    localStorage.setItem('ies_token', value.token);
    localStorage.setItem('ies_role', 'Candidate');
    localStorage.setItem('ies_email', 'candidate@example.com');
  }, { token });
};

const seedRecruiterSession = async (page: Page) => {
  const token = buildMockJwt('Recruiter', 1);
  await page.addInitScript((value) => {
    localStorage.setItem('ies_token', value.token);
    localStorage.setItem('ies_role', 'Recruiter');
    localStorage.setItem('ies_email', 'recruiter@example.com');
    localStorage.setItem('ies_company_id', '1');
    localStorage.setItem('ies_recruiter_role', 'Admin');
  }, { token });
};

const mockCandidateDashboardApis = async (page: Page) => {
  await page.route('**/api/Candidates/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'candidate-user-id',
        firstName: 'Candidate',
        lastName: 'User',
        email: 'candidate@example.com',
        phoneNumber: null,
        gender: 0,
        skills: [],
        education: [],
        experience: [],
        resumes: [],
      }),
    });
  });

  await page.route('**/api/Candidates/saved-jobs', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/Dashboards/candidate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        activeApplicationsCount: 5,
        savedJobsCount: 2,
        upcomingInterviewsCount: 1,
        unreadNotificationsCount: 0,
        recentApplications: [],
        upcomingInterviews: [],
      }),
    });
  });
};

const mockRecruiterDashboardApis = async (page: Page) => {
  await page.route('**/api/Dashboards/company/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        activeJobs: 10,
        totalApplicants: 50,
        interviewsScheduled: 4,
        unreadMessages: 2,
      }),
    });
  });

  await page.route('**/api/Analytics/company/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        activeJobs: 10,
        totalApplicants: 50,
        hireRate: 72,
        applicationTrends: [],
      }),
    });
  });

  await page.route('**/api/JobPosting/company/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/JobApplication/job/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/Interview/recruiter/interviews*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
};

test.describe('Route Coverage Smoke', () => {
  const publicRoutes = [
    '/landing',
    '/jobs',
    '/companies',
    '/about',
    '/terms',
    '/privacy',
    '/login',
    '/register',
  ];

  for (const route of publicRoutes) {
    test(`public route loads: ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`${route.replace('/', '\\/')}`));
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('unknown route redirects to 404', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page).toHaveURL(/\/404$/);
  });

  test('unauthenticated user is redirected from candidate dashboard', async ({ page }) => {
    await page.goto('/candidate/dashboard');
    await expect(page).toHaveURL(/\/login(\?.*)?$/);
  });

  test('candidate session can access candidate dashboard', async ({ page }) => {
    await seedCandidateSession(page);
    await mockCandidateDashboardApis(page);

    await page.goto('/candidate/dashboard');

    await expect(page).toHaveURL(/\/candidate\/dashboard$/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('recruiter session can access recruiter dashboard', async ({ page }) => {
    await seedRecruiterSession(page);
    await mockRecruiterDashboardApis(page);

    await page.goto('/recruiter/dashboard');

    await expect(page).toHaveURL(/\/recruiter\/dashboard$/);
    await expect(page.getByText('Recruitment Overview')).toBeVisible();
  });
});
