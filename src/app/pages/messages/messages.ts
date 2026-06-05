import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { RecruiterService } from '../../core/services/recruiter';

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Message {
  id: string;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-messages-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
})
export class MessagesPage implements OnInit {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private recruiterService = inject(RecruiterService);

  // Stats
  unreadCount = signal(0);
  interviewsCount = signal(0);
  avgResponse = signal('--');
  aiDrafts = signal(0);
  isLoadingConversations = signal(false);
  isLoadingMessages = signal(false);

  // Search
  searchQuery = signal('');

  // Threads
  conversations = signal<Conversation[]>([]);

  activeConversationId = signal<string>('');

  get activeConversation() {
    return this.conversations().find(c => c.id === this.activeConversationId());
  }

  get filteredConversations(): Conversation[] {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.conversations();
    }

    return this.conversations().filter(conversation =>
      conversation.name.toLowerCase().includes(query) ||
      conversation.lastMessage.toLowerCase().includes(query)
    );
  }

  // Active chat messages
  activeMessages = signal<Message[]>([]);

  newMessage = signal('');

  ngOnInit(): void {
    this.loadConversations();
    this.loadUnreadCount();
    this.loadInterviewCount();
  }

  loadConversations(): void {
    this.isLoadingConversations.set(true);
    this.messageService.getConversations().subscribe({
      next: (items) => {
        const mapped = items.map(item => ({
          id: item.participantId,
          name: item.participantName,
          role: 'Conversation',
          lastMessage: item.lastMessage,
          timestamp: this.formatTimestamp(item.lastMessageAt),
          unread: item.unreadCount
        }));

        this.conversations.set(mapped);

        if (!this.activeConversationId() && mapped.length > 0) {
          this.selectConversation(mapped[0].id);
        }

        this.isLoadingConversations.set(false);
      },
      error: () => {
        this.conversations.set([]);
        this.isLoadingConversations.set(false);
      }
    });
  }

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (payload) => {
        const count = Number(payload.count ?? payload.Count ?? 0);
        this.unreadCount.set(count);
      },
      error: () => this.unreadCount.set(0)
    });
  }

  loadInterviewCount(): void {
    const role = (this.authService.getRole() || '').toLowerCase();
    if (role === 'candidate') {
      this.interviewsCount.set(0);
      return;
    }

    this.recruiterService.getRecruiterInterviews(1, 100).subscribe({
      next: (interviews) => this.interviewsCount.set(interviews.length),
      error: () => this.interviewsCount.set(0)
    });
  }

  selectConversation(id: string) {
    this.activeConversationId.set(id);
    this.isLoadingMessages.set(true);

    const currentUserId = this.authService.getUserId() ?? '';
    this.messageService.getConversation(id).subscribe({
      next: (messages) => {
        this.activeMessages.set(messages.map(message => ({
          id: String(message.id),
          sender: message.senderId === currentUserId ? 'me' : 'them',
          content: message.content,
          timestamp: this.formatTimestamp(message.sentAt)
        })));
        this.isLoadingMessages.set(false);
      },
      error: () => {
        this.activeMessages.set([]);
        this.isLoadingMessages.set(false);
      }
    });
  }

  sendMessage() {
    const content = this.newMessage().trim();
    const activeConversation = this.activeConversation;

    if (content && activeConversation) {
      this.messageService.sendMessage({
        receiverId: activeConversation.id,
        content
      }).subscribe({
        next: () => {
          this.newMessage.set('');
          this.selectConversation(activeConversation.id);
          this.loadConversations();
        }
      });
    }
  }

  private formatTimestamp(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  }
}

