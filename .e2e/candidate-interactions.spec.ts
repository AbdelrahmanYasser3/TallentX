import { test, expect, Page } from '@playwright/test';

const buildMockJwt = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      role: 'Candidate',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }),
  ).toString('base64url');
  return `${header}.${payload}.signature`;
};

const seedCandidateSession = async (page: Page) => {
  const token = buildMockJwt();
  await page.addInitScript((value) => {
    localStorage.setItem('ies_token', value.token);
    localStorage.setItem('ies_role', 'Candidate');
    localStorage.setItem('ies_email', 'candidate@example.com');
    localStorage.setItem('ies_user_id', 'candidate-user-id');
  }, { token });
};

test.describe('Candidate Interaction Flows', () => {
  test.beforeEach(async ({ page }) => {
    await seedCandidateSession(page);
  });

  test('saved jobs: remove updates UI and calls API', async ({ page }) => {
    let removeCalled = false;

    await page.route('**/api/Candidates/saved-jobs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            title: 'Senior .NET Developer',
            company: { id: 1, name: 'Acme Corp' },
            location: 'Cairo',
            jobType: 'FullTime',
            workLocation: 'Hybrid',
            careerLevel: 'MidLevel',
            skills: [],
            applicantsCount: 14,
            createdAt: new Date().toISOString(),
          },
          {
            id: 102,
            title: 'Angular Engineer',
            company: { id: 2, name: 'BlueSoft' },
            location: 'Alexandria',
            jobType: 'FullTime',
            workLocation: 'Remote',
            careerLevel: 'MidLevel',
            skills: [],
            applicantsCount: 9,
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.route('**/api/Candidates/saved-jobs/101', async (route) => {
      removeCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/dashboard/saved-jobs');

    await expect(page.getByRole('heading', { name: 'Saved Jobs' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Senior .NET Developer' })).toBeVisible();

    await page.locator('article').filter({ hasText: 'Senior .NET Developer' }).getByRole('button', { name: 'Remove' }).click();

    await expect(page.getByRole('heading', { name: 'Senior .NET Developer' })).not.toBeVisible();
    expect(removeCalled).toBeTruthy();
  });

  test('applications: filter + withdraw flow works', async ({ page }) => {
    let withdrawCalled = false;

    await page.route('**/api/Candidates/applications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 501,
            jobPostingId: 101,
            candidateId: 'candidate-user-id',
            jobTitle: 'Backend Engineer',
            status: 'Pending',
            appliedAt: new Date().toISOString(),
            resumeId: 1,
            matchScore: 88,
          },
          {
            id: 502,
            jobPostingId: 102,
            candidateId: 'candidate-user-id',
            jobTitle: 'QA Engineer',
            status: 'Rejected',
            appliedAt: new Date().toISOString(),
            resumeId: 1,
            matchScore: 67,
          },
        ]),
      });
    });

    await page.route('**/api/JobApplication/501/withdraw', async (route) => {
      withdrawCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/dashboard/applications');

    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
    await expect(page.getByText('Backend Engineer')).toBeVisible();

    await page.selectOption('select', 'Rejected');
    await expect(page.getByText('QA Engineer')).toBeVisible();
    await expect(page.getByText('Backend Engineer')).not.toBeVisible();

    await page.selectOption('select', 'All');
    await page.locator('article').filter({ hasText: 'Backend Engineer' }).getByRole('button', { name: 'Withdraw' }).click();

    await expect(page.locator('article').filter({ hasText: 'Backend Engineer' }).getByText('Withdrawn')).toBeVisible();
    expect(withdrawCalled).toBeTruthy();
  });

  test('candidate interviews page renders upcoming and completed sections', async ({ page }) => {
    await page.route('**/api/Interview/candidate/candidate-user-id', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 801,
            jobTitle: 'Fullstack Engineer',
            candidateName: 'Candidate User',
            recruiterName: 'Recruiter One',
            scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 45,
            status: 'Scheduled',
            meetingLink: 'https://meet.example.com/801',
          },
          {
            id: 802,
            jobTitle: 'Data Analyst',
            candidateName: 'Candidate User',
            recruiterName: 'Recruiter Two',
            scheduledTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            durationMinutes: 30,
            status: 'Completed',
            meetingLink: null,
          },
        ]),
      });
    });

    await page.goto('/candidate/interviews');

    await expect(page.getByRole('heading', { name: 'My Interviews' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Past & Cancelled' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fullstack Engineer' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data Analyst' })).toBeVisible();
  });

  test('messages page loads threads and sends a message', async ({ page }) => {
    await page.route('**/api/Messages/conversations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            participantId: 'recruiter-1',
            participantName: 'Nora Recruiter',
            lastMessage: 'Can we schedule a call?',
            lastMessageAt: new Date().toISOString(),
            unreadCount: 1,
          },
        ]),
      });
    });

    await page.route('**/api/Messages/conversation/recruiter-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            senderId: 'recruiter-1',
            senderName: 'Nora Recruiter',
            receiverId: 'candidate-user-id',
            content: 'Can we schedule a call?',
            sentAt: new Date().toISOString(),
            isRead: true,
          },
        ]),
      });
    });

    await page.route('**/api/Messages/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 1 }),
      });
    });

    await page.route('**/api/Interview/recruiter/interviews*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/Messages/send', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 2,
          senderId: 'candidate-user-id',
          senderName: 'Candidate User',
          receiverId: 'recruiter-1',
          content: 'Yes, tomorrow works for me.',
          sentAt: new Date().toISOString(),
          isRead: false,
        }),
      });
    });

    await page.goto('/messages');

    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Nora Recruiter' })).toBeVisible();

    const sendResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/Messages/send') && response.request().method() === 'POST'
    );

    await page.getByPlaceholder('Write a message...').fill('Yes, tomorrow works for me.');
    await page.getByPlaceholder('Write a message...').press('Enter');

    const sendResponse = await sendResponsePromise;
    expect(sendResponse.ok()).toBeTruthy();
  });
});
