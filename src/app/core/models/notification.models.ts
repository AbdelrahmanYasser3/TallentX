export type NotificationType =
  | 'NewJobPosted'
  | 'ApplicationReceived'
  | 'ApplicationStatusUpdate'
  | 'InterviewScheduled'
  | 'StatusUpdate'
  | 'General';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
}

export interface UnreadCountDto {
  count: number;
}
