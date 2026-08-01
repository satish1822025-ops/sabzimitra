import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ],
  template: `
    <div class="fixed top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of notifService.toasts$ | async; trackBy: trackById"
           [@slideIn]
           [ngClass]="getToastClass(toast)"
           class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-[380px]">
        <span class="text-lg flex-shrink-0">{{ getIcon(toast) }}</span>
        <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        <button (click)="notifService.dismiss(toast.id)"
                class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  `
})
export class ToastComponent {
  notifService = inject(NotificationService);

  trackById(_: number, t: ToastMessage): number { return t.id; }

  getToastClass(toast: ToastMessage): string {
    const map: Record<string, string> = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info'
    };
    return map[toast.type] || 'toast-info';
  }

  getIcon(toast: ToastMessage): string {
    const map: Record<string, string> = {
      success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };
    return map[toast.type] || 'ℹ️';
  }
}
