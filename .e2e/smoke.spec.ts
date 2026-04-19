import { test, expect } from '@playwright/test';

test.describe('Authentication and Dashboards Smoke Tests', () => {

  const buildMockJwt = (role: 'Recruiter' | 'Candidate') => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + 60 * 60 })).toString('base64url');
    return `${header}.${payload}.signature`;
  };

  test.beforeEach(async ({ page }) => {
    // Mock the login API to avoid cross-origin issues and actual backend dependency
    await page.route(/.*\/api\/Auth\/login$/i, async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');

      if (postData.email === 'recruiter@example.com' && postData.password === 'Testing123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: buildMockJwt('Recruiter'),
            role: 'Recruiter',
            userId: 'recruiter-user-id',
            email: postData.email,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            companyId: 1,
            recruiterRole: 'Admin'
          }),
        });
      } else if (postData.email === 'candidate@example.com' && postData.password === 'Testing123') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: buildMockJwt('Candidate'),
            role: 'Candidate',
            userId: 'candidate-user-id',
            email: postData.email,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          }),
        });
      } else {
        await route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) });
      }
    });

    // Mock recruiter dashboard dependencies so the smoke test only validates auth + routing.
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

    // Mock the Recruiter Dashboard Data
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

    // Mock the Candidate Dashboard Data
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
          resumes: []
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
  });

  test('Recruiter logs in and views the Recruiter Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[formControlName="email"]').fill('recruiter@example.com');
    await page.locator('input[formControlName="password"]').fill('Testing123');
    await page.locator('button[type="submit"]').click();

    // Verify navigation to Recruiter dashboard
    await expect(page).toHaveURL(/.*\/recruiter\/dashboard/);

    // Verify recruiter dashboard content
    await expect(page.getByText('Recruitment Overview')).toBeVisible();
    await expect(page.getByText('Active Job Posts')).toBeVisible();
  });

  test('Candidate logs in and views the Candidate Dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[formControlName="email"]').fill('candidate@example.com');
    await page.locator('input[formControlName="password"]').fill('Testing123');
    await page.locator('button[type="submit"]').click();

    // Verify navigation to Candidate dashboard
    await expect(page).toHaveURL(/.*\/candidate\/dashboard/);

    // Verify candidate dashboard shell content
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });
});
