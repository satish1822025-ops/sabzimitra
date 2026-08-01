import { Component, Input } from '@angular/core';

export type SkeletonType =
  | 'vendor-card'
  | 'inventory-item'
  | 'stat-card'
  | 'text'
  | 'map'
  | 'profile'
  | 'row'
  | 'default';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    @switch (type) {
      @case ('vendor-card') {
        <div class="sm-card overflow-hidden">
          <div class="skeleton h-40 w-full rounded-none"></div>
          <div class="flex flex-col gap-3 p-4">
            <div class="skeleton h-4 w-2/3"></div>
            <div class="skeleton h-3 w-2/5"></div>
            <div class="flex gap-2 pt-1">
              <div class="skeleton h-6 w-20 rounded-full"></div>
              <div class="skeleton h-6 w-16 rounded-full"></div>
            </div>
          </div>
        </div>
      }
      @case ('inventory-item') {
        <div class="sm-card flex items-center gap-3.5 p-3.5">
          <div class="skeleton h-14 w-14 flex-none rounded-md"></div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="skeleton h-4 w-2/5"></div>
            <div class="skeleton h-3 w-1/4"></div>
          </div>
          <div class="skeleton h-7 w-20 rounded-full"></div>
        </div>
      }
      @case ('stat-card') {
        <div class="sm-card flex flex-col gap-3 p-5">
          <div class="skeleton h-8 w-8 rounded-full"></div>
          <div class="skeleton h-7 w-24"></div>
          <div class="skeleton h-3 w-16"></div>
        </div>
      }
      @case ('text') {
        <div class="flex flex-col gap-2.5">
          @for (line of lineArray; track $index) {
            <div class="skeleton h-3.5" [style.width]="widthFor($index)"></div>
          }
        </div>
      }
      @case ('row') {
        <div class="flex items-center gap-4 border-b border-line px-4 py-4">
          <div class="skeleton h-10 w-10 flex-none rounded-full"></div>
          <div class="skeleton h-3.5 flex-1"></div>
          <div class="skeleton h-3.5 w-20"></div>
          <div class="skeleton h-7 w-16 rounded-full"></div>
        </div>
      }
      @case ('map') {
        <div class="skeleton w-full rounded-lg" style="height: 26rem"></div>
      }
      @case ('profile') {
        <div class="sm-card p-6">
          <div class="mb-5 flex items-center gap-4">
            <div class="skeleton h-20 w-20 rounded-full"></div>
            <div class="flex flex-1 flex-col gap-2.5">
              <div class="skeleton h-5 w-1/2"></div>
              <div class="skeleton h-3.5 w-1/3"></div>
            </div>
          </div>
          <div class="flex flex-col gap-2.5">
            <div class="skeleton h-3 w-full"></div>
            <div class="skeleton h-3 w-4/5"></div>
          </div>
        </div>
      }
      @default {
        <div class="skeleton" [style.height]="height" [style.width]="width"></div>
      }
    }
  `,
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'default';
  @Input() height = '1rem';
  @Input() width = '100%';

  private _lines = 3;
  @Input()
  set lines(value: number) {
    this._lines = value;
    this.lineArray = Array.from({ length: value });
  }
  get lines(): number {
    return this._lines;
  }

  lineArray: unknown[] = Array.from({ length: 3 });

  /** Deterministic widths — avoids layout jitter on re-render. */
  private readonly widths = ['100%', '88%', '94%', '72%', '82%'];

  widthFor(index: number): string {
    return this.widths[index % this.widths.length];
  }
}
