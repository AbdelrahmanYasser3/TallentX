export interface InterviewDto {
  id: number;
  jobApplicationId: number;
  candidateId: string;
  recruiterId: string;
  jobTitle: string;
  candidateName: string;
  recruiterName: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink?: string;
  notes?: string;
}

export interface ScheduleInterviewRequest {
  jobApplicationId: number;
  scheduledTime: string;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
}
