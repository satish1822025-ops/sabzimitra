import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

/**
 * Precise star rating. Supports fractional fill (e.g. 4.3 stars) by
 * clipping an overlaid accent-coloured star row.
 */
@Component({
  selector: 'app-rating-stars',
  standalone: true,
  template: `
    <div class="flex items-center gap-2">
      <div
        class="relative inline-flex"
        [class.cursor-pointer]="interactive"
        (mouseleave)="hover.set(0)"
        [attr.role]="interactive ? 'radiogroup' : 'img'"
        [attr.aria-label]="interactive ? 'Choose a rating' : rating.toFixed(1) + ' out of 5 stars'"
      >
        <!-- Empty track -->
        <div class="flex" [style.gap.px]="gap">
          @for (s of stars; track s) {
            <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" aria-hidden="true">
              <path [attr.d]="STAR" fill="none" stroke="var(--line-strong)" stroke-width="1.4" />
            </svg>
          }
        </div>

        <!-- Filled overlay -->
        <div
          class="pointer-events-none absolute inset-0 flex overflow-hidden"
          [style.width.%]="fillPercent()"
          [style.gap.px]="gap"
        >
          @for (s of stars; track s) {
            <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" class="flex-none" aria-hidden="true">
              <path [attr.d]="STAR" fill="var(--accent)" />
            </svg>
          }
        </div>

        <!-- Interactive hit areas -->
        @if (interactive) {
          <div class="absolute inset-0 flex" [style.gap.px]="gap">
            @for (s of stars; track s) {
              <button
                type="button"
                class="flex-none"
                [style.width.px]="size"
                [style.height.px]="size"
                (click)="rate(s)"
                (mouseenter)="hover.set(s)"
                [attr.aria-label]="s + ' star' + (s > 1 ? 's' : '')"
              ></button>
            }
          </div>
        }
      </div>

      @if (showValue) {
        <span class="num text-sm font-bold text-fg">{{ (hover() || rating).toFixed(1) }}</span>
      }
      @if (showCount && count > 0) {
        <span class="text-xs text-fg-3">({{ count }})</span>
      }
    </div>
  `,
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() count = 0;
  @Input() interactive = false;
  @Input() showCount = false;
  @Input() showValue = false;
  @Input() size = 16;
  @Input() gap = 3;
  @Output() ratingChange = new EventEmitter<number>();

  readonly STAR = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z';
  readonly stars = [1, 2, 3, 4, 5];
  readonly hover = signal(0);

  fillPercent(): number {
    const value = this.hover() || this.rating;
    return Math.max(0, Math.min(100, (value / 5) * 100));
  }

  rate(value: number): void {
    this.rating = value;
    this.ratingChange.emit(value);
  }
}
