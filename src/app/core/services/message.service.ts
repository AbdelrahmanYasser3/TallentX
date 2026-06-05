import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MessageDto {
  id: number;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  jobApplicationId?: number;
}

export interface ConversationSummaryDto {
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: string;
  content: string;
  jobApplicationId?: number;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/Messages`;

  sendMessage(request: SendMessageRequest): Observable<MessageDto> {
    return this.http.post<MessageDto>(`${this.base}/send`, request);
  }

  getConversation(userId: string): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`${this.base}/conversation/${userId}`);
  }

  getConversations(): Observable<ConversationSummaryDto[]> {
    return this.http.get<ConversationSummaryDto[]>(`${this.base}/conversations`);
  }

  getUnreadCount(): Observable<{ count?: number; Count?: number }> {
    return this.http.get<{ count?: number; Count?: number }>(`${this.base}/unread-count`);
  }

  markRead(id: number): Observable<any> {
    return this.http.patch(`${this.base}/${id}/mark-read`, {});
  }
}
