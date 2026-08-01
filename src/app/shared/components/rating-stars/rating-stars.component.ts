import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-0.5">
      <button *ngFor="let star of stars; let i = index"
              (click)="interactive && rate(i + 1)"
              (mouseenter)="interactive && setHover(i + 1)"
              (mouseleave)="interactive && setHover(0)"
              [class.cursor-pointer]="interactive"
              [class.cursor-default]="!interactive"
              class="focus:outline-none transition-transform hover:scale-110"
              type="button">
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                [attr.fill]="getStarColor(i + 1)"
                stroke="#997E67"
                [attr.stroke-width]="getStarColor(i + 1) === '#CFCFCF' ? '0' : '0.5'"/>
        </svg>
      </button>
      <span *ngIf="showCount && count > 0" class="text-xs text-[#7D7D7D] ml-1">({{ count }})</span>
      <span *ngIf="showValue" class="text-sm font-semibold text-[#252525] ml-1">{{ rating.toFixed(1) }}</span>
    </div>
  `
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() count = 0;
  @Input() interactive = false;
  @Input() showCount = false;
  @Input() showValue = false;
  @Input() size = 16;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverRating = 0;

  getStarColor(index: number): string {
    const effective = this.hoverRating || this.rating;
    if (index <= Math.floor(effective)) return '#997E67'; // full star
    if (index <= effective) return '#CCBEB1'; // partial
    return '#CFCFCF'; // empty
  }

  rate(value: number): void {
    this.ratingChange.emit(value);
  }

  setHover(value: number): void { this.hoverRating = value; }
}
