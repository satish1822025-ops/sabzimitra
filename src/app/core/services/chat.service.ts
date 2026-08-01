import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { ChatMessage } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

// SockJS uses 'global' — polyfilled in main.ts before this import is used.
// We import the type here but create the instance lazily inside webSocketFactory.
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private http          = inject(HttpClient);
  private authService   = inject(AuthService);

  private stompClient!: Client;
  private subscriptions: StompSubscription[] = [];
  private _isConnected  = false;

  private _messages     = new BehaviorSubject<ChatMessage[]>([]);
  messages$             = this._messages.asObservable();

  private _connected    = new BehaviorSubject<boolean>(false);
  connected$            = this._connected.asObservable();

  private _stockUpdates = new Subject<any>();
  stockUpdates$         = this._stockUpdates.asObservable();

  connect(): void {
    if (this._isConnected || this.stompClient?.active) return;

    const token = this.authService.getAccessToken();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environment.wsUrl}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        this._isConnected = true;
        this._connected.next(true);
        this.subscribeToUserNotifications();
      },
      onDisconnect: () => {
        this._isConnected = false;
        this._connected.next(false);
      },
      onStompError: (frame) => {
        // Use bracket notation for index signature access
        console.warn('STOMP error:', frame.headers?.['message']);
      }
    });

    try {
      this.stompClient.activate();
    } catch (e) {
      console.warn('WebSocket unavailable — real-time features disabled.');
    }
  }

  disconnect(): void {
    this.subscriptions.forEach(s => { try { s.unsubscribe(); } catch {} });
    this.subscriptions = [];
    this.stompClient?.deactivate();
    this._isConnected = false;
    this._connected.next(false);
  }

  joinRoom(roomId: string): void {
    if (!this.stompClient?.connected) return;
    const sub = this.stompClient.subscribe(`/topic/chat/${roomId}`, (msg: IMessage) => {
      try {
        const message: ChatMessage = JSON.parse(msg.body);
        this._messages.next([...this._messages.value, message]);
      } catch {}
    });
    this.subscriptions.push(sub);
  }

  subscribeToVendorStock(vendorId: number): void {
    if (!this.stompClient?.connected) return;
    const sub = this.stompClient.subscribe(
      `/topic/vendor/${vendorId}/stock-updates`,
      (msg: IMessage) => { try { this._stockUpdates.next(JSON.parse(msg.body)); } catch {} }
    );
    this.subscriptions.push(sub);
  }

  private subscribeToUserNotifications(): void {
    const user = this.authService.currentUser();
    if (!user || !this.stompClient?.connected) return;
    this.stompClient.subscribe(`/topic/customer/${user.id}/notifications`, () => {
      // Notification service handles this
    });
  }

  sendMessage(roomId: string, message: ChatMessage): void {
    if (!this.stompClient?.connected) return;
    this.stompClient.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message)
    });
  }

  getChatHistory(otherUserId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${environment.apiUrl}/chat/history/${otherUserId}`);
  }

  clearMessages(): void { this._messages.next([]); }

  ngOnDestroy(): void { this.disconnect(); }
}
