import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NotificationService, ToastMessage, ToastType } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';

const TOAST_ICON: Record<ToastType, string> = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'alert-triangle',
  info: 'info',
};

const TOAST_COLOR: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warn)',
  info: 'var(--info)',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe, IconComponent],
  animations: [
    trigger('toastIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(24px) scale(0.96)' }),
        animate('280ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'none' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(24px) scale(0.96)' })),
      ]),
    ]),
  ],
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 top-4 z-[500] flex flex-col items-end gap-2.5 sm:inset-x-auto sm:right-5 sm:top-5"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      @for (toast of notifService.toasts$ | async; track toast.id) {
        <div class="toast pointer-events-auto w-full sm:w-auto" [@toastIn]>
          <span class="toast-accent-bar" [style.background]="color(toast.type)"></span>
          <span class="mt-0.5 flex-none" [style.color]="color(toast.type)">
            <app-icon [name]="icon(toast.type)" [size]="18" />
          </span>
          <p class="flex-1 text-[0.8125rem] font-medium leading-snug text-fg">{{ toast.message }}</p>
          <button
            type="button"
            class="-mr-1 -mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-surface-4 hover:text-fg"
            (click)="notifService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            <app-icon name="close" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  notifService = inject(NotificationService);

  icon(type: ToastType): string {
    return TOAST_ICON[type] ?? 'info';
  }

  color(type: ToastType): string {
    return TOAST_COLOR[type] ?? 'var(--info)';
  }
}
