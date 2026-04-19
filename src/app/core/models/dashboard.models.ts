import { InterviewDto } from './interview.models';
import { ApplicationModel } from "./candidate.models";

export interface CandidateDashboardDto {
    savedJobsCount: number;
    activeApplicationsCount: number;
    upcomingInterviewsCount: number;
    unreadNotificationsCount: number;
    recentApplications: ApplicationModel[];
    upcomingInterviews: InterviewDto[];
}

export interface CompanyDashboardDto {
    activeJobsCount: number;
    totalApplicantsCount: number;
    pendingInterviewsCount: number;
    unreadNotificationsCount: number;
    recentJobPosts: any[]; // Adjust as needed
    recentApplicants: any[];
}
