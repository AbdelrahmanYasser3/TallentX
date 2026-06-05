import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SignalRNotification {
  id?: number;
  title: string;
  message: string;
  type: string;
  createdAt?: string;
  relatedEntityId?: number;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  /** Emits every incoming notification from the hub */
  public notification$ = new Subject<SignalRNotification>();

  /** Connection state for UI feedback */
  public readonly isConnected = signal(false);

  startConnection(): void {
    // Prevent duplicate connections
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected ||
        this.hubConnection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    const token = localStorage.getItem('ies_token');
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRUrl + '/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for generic notifications (backward compatible)
    this.hubConnection.on('ReceiveNotification', (notification: SignalRNotification) => {
      this.notification$.next(notification);
    });

    // Listen for specific job posted event
    this.hubConnection.on('NewJobPosted', (notification: SignalRNotification) => {
      this.notification$.next({
        ...notification,
        type: notification.type || 'NewJobPosted'
      });
    });

    // Connection lifecycle
    this.hubConnection.onreconnecting(() => {
      this.isConnected.set(false);
      console.warn('[SignalR] Reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      console.log('[SignalR] Reconnected');
    });

    this.hubConnection.onclose(() => {
      this.isConnected.set(false);
    });

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        console.log('[SignalR] Connection started');
      })
      .catch((err: unknown) => {
        this.isConnected.set(false);
        console.error('[SignalR] Connection failed:', String(err));
      });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
      this.isConnected.set(false);
    }
  }
}
