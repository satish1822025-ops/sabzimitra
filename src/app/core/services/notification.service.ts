import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  private _notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();

  private _unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this._unreadCount.asObservable();

  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this._toasts.asObservable();

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`).pipe(
      tap(n => {
        this._notifications.next(n);
        this._unreadCount.next(n.filter(x => !x.isRead).length);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const updated = this._notifications.value.map(n => n.id === id ? { ...n, isRead: true } : n);
        this._notifications.next(updated);
        this._unreadCount.next(updated.filter(x => !x.isRead).length);
      })
    );
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/read-all`, {}).pipe(
      tap(() => {
        const updated = this._notifications.value.map(n => ({ ...n, isRead: true }));
        this._notifications.next(updated);
        this._unreadCount.next(0);
      })
    );
  }

  // ── Toast System ──────────────────────────────────────────

  show(message: string, type: ToastType = 'info', duration = 3500): void {
    const toast: ToastMessage = { id: Date.now(), message, type };
    this._toasts.next([...this._toasts.value, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error', 5000); }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string):    void { this.show(message, 'info'); }

  dismiss(id: number): void {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface ToastMessage { id: number; message: string; type: ToastType; }
