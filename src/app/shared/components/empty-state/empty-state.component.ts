import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-16 text-center fade-in">
      <span
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-fg-3"
        style="box-shadow: inset 0 1px 0 var(--sheen)"
      >
        <app-icon [name]="icon" [size]="26" />
      </span>
      <h3 class="font-display text-[1.375rem] font-normal text-fg">{{ title }}</h3>
      @if (description) {
        <p class="mt-2 max-w-sm text-sm text-fg-3">{{ description }}</p>
      }
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = 'search';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
}
