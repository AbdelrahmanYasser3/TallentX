import { InterviewDto } from '../models/interview.models';

export type InterviewType = 'Online' | 'On-site' | 'Technical' | 'HR';
export type InterviewDisplayStatus = 'Scheduled' | 'Confirmed' | 'Pending' | 'Rescheduled';

export interface UpcomingInterviewItem extends InterviewDto {
  companyName: string;
  interviewType: InterviewType;
  displayStatus: InterviewDisplayStatus;
  roomName?: string;
  isStatic?: boolean;
}

function localIso(daysFromNow: number, hour: number, minute: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function room(id: string): { meetingLink: string; roomName: string } {
  const roomName = `TallentX-${id}`;
  return {
    roomName,
    meetingLink: `https://meet.jit.si/${roomName}`,
  };
}

/** Static upcoming interviews — dates are relative to load time. */
export function buildStaticUpcomingInterviews(): UpcomingInterviewItem[] {
  const entries: Omit<UpcomingInterviewItem, 'id' | 'scheduledTime' | 'meetingLink' | 'roomName'>[] = [
    {
      jobApplicationId: 501,
      candidateId: 'c-101',
      recruiterId: 'r-01',
      jobTitle: 'Senior Frontend Engineer',
      candidateName: 'Omar Hassan',
      recruiterName: 'Sara Mahmoud',
      companyName: 'Instabug',
      durationMinutes: 60,
      status: 'Scheduled',
      displayStatus: 'Confirmed',
      interviewType: 'Technical',
      notes: 'Focus on React performance and system design basics.',
      ...room('fe-omar-01'),
    },
    {
      jobApplicationId: 502,
      candidateId: 'c-102',
      recruiterId: 'r-01',
      jobTitle: 'Product Designer',
      candidateName: 'Layla Mostafa',
      recruiterName: 'Sara Mahmoud',
      companyName: 'Figma MENA',
      durationMinutes: 45,
      status: 'Scheduled',
      displayStatus: 'Scheduled',
      interviewType: 'HR',
      notes: 'Culture fit and portfolio walkthrough.',
      ...room('ux-layla-02'),
    },
    {
      jobApplicationId: 503,
      candidateId: 'c-103',
      recruiterId: 'r-02',
      jobTitle: 'Backend .NET Developer',
      candidateName: 'Karim Adel',
      recruiterName: 'Ahmed Nabil',
      companyName: 'Careem',
      durationMinutes: 75,
      status: 'Scheduled',
      displayStatus: 'Confirmed',
      interviewType: 'Technical',
      ...room('be-karim-03'),
    },
    {
      jobApplicationId: 504,
      candidateId: 'c-104',
      recruiterId: 'r-02',
      jobTitle: 'DevOps Engineer',
      candidateName: 'Nour El-Din',
      recruiterName: 'Ahmed Nabil',
      companyName: 'Swvl',
      durationMinutes: 50,
      status: 'Scheduled',
      displayStatus: 'Pending',
      interviewType: 'Online',
      ...room('devops-nour-04'),
    },
    {
      jobApplicationId: 505,
      candidateId: 'c-105',
      recruiterId: 'r-01',
      jobTitle: 'Data Analyst',
      candidateName: 'Yasmine Farouk',
      recruiterName: 'Sara Mahmoud',
      companyName: 'Breadfast Tech',
      durationMinutes: 40,
      status: 'Scheduled',
      displayStatus: 'Scheduled',
      interviewType: 'HR',
      ...room('data-yasmine-05'),
    },
    {
      jobApplicationId: 506,
      candidateId: 'c-106',
      recruiterId: 'r-03',
      jobTitle: 'Mobile Engineer (Flutter)',
      candidateName: 'Hassan Ali',
      recruiterName: 'Mona Khaled',
      companyName: 'Valu FinTech',
      durationMinutes: 60,
      status: 'Scheduled',
      displayStatus: 'Confirmed',
      interviewType: 'Technical',
      ...room('mob-hassan-06'),
    },
    {
      jobApplicationId: 507,
      candidateId: 'c-107',
      recruiterId: 'r-03',
      jobTitle: 'QA Automation Engineer',
      candidateName: 'Mariam Saeed',
      recruiterName: 'Mona Khaled',
      companyName: 'Raya Digital',
      durationMinutes: 45,
      status: 'Scheduled',
      displayStatus: 'Rescheduled',
      interviewType: 'On-site',
      notes: 'On-site: Smart Village, Building B12, Floor 3.',
    },
    {
      jobApplicationId: 508,
      candidateId: 'c-108',
      recruiterId: 'r-02',
      jobTitle: 'Full Stack Engineer',
      candidateName: 'Ahmed Salah',
      recruiterName: 'Ahmed Nabil',
      companyName: 'Odoo MENA',
      durationMinutes: 90,
      status: 'Scheduled',
      displayStatus: 'Confirmed',
      interviewType: 'Technical',
      ...room('fs-ahmed-08'),
    },
    {
      jobApplicationId: 509,
      candidateId: 'c-109',
      recruiterId: 'r-01',
      jobTitle: 'Engineering Manager',
      candidateName: 'Dina Kamal',
      recruiterName: 'Sara Mahmoud',
      companyName: 'Microsoft MEA',
      durationMinutes: 55,
      status: 'Scheduled',
      displayStatus: 'Scheduled',
      interviewType: 'HR',
      ...room('em-dina-09'),
    },
    {
      jobApplicationId: 510,
      candidateId: 'c-110',
      recruiterId: 'r-03',
      jobTitle: 'AI/ML Engineer',
      candidateName: 'Tarek Ibrahim',
      recruiterName: 'Mona Khaled',
      companyName: 'Google Cloud',
      durationMinutes: 60,
      status: 'Scheduled',
      displayStatus: 'Pending',
      interviewType: 'Online',
      ...room('ml-tarek-10'),
    },
    {
      jobApplicationId: 511,
      candidateId: 'c-111',
      recruiterId: 'r-02',
      jobTitle: 'Security Engineer',
      candidateName: 'Salma Hesham',
      recruiterName: 'Ahmed Nabil',
      companyName: 'Cloudflare',
      durationMinutes: 50,
      status: 'Scheduled',
      displayStatus: 'Confirmed',
      interviewType: 'Technical',
      ...room('sec-salma-11'),
    },
    {
      jobApplicationId: 512,
      candidateId: 'c-112',
      recruiterId: 'r-01',
      jobTitle: 'Technical Product Manager',
      candidateName: 'Youssef Nader',
      recruiterName: 'Sara Mahmoud',
      companyName: 'Stripe',
      durationMinutes: 45,
      status: 'Scheduled',
      displayStatus: 'Scheduled',
      interviewType: 'On-site',
      notes: 'Panel interview with PM + Engineering lead.',
    },
  ];

  const scheduleOffsets: { day: number; hour: number; minute: number }[] = [
    { day: 0, hour: 11, minute: 0 },
    { day: 0, hour: 15, minute: 30 },
    { day: 1, hour: 10, minute: 0 },
    { day: 1, hour: 14, minute: 0 },
    { day: 2, hour: 9, minute: 30 },
    { day: 3, hour: 13, minute: 0 },
    { day: 4, hour: 11, minute: 30 },
    { day: 5, hour: 16, minute: 0 },
    { day: 8, hour: 10, minute: 30 },
    { day: 10, hour: 12, minute: 0 },
    { day: 12, hour: 9, minute: 0 },
    { day: 14, hour: 15, minute: 0 },
  ];

  return entries.map((entry, index) => {
    const slot = scheduleOffsets[index] ?? { day: index, hour: 10, minute: 0 };
    return {
      ...(entry as UpcomingInterviewItem),
      id: 90001 + index,
      scheduledTime: localIso(slot.day, slot.hour, slot.minute),
      isStatic: true,
    };
  });
}
