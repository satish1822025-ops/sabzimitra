import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="type">
      <!-- Vendor Card Skeleton -->
      <div *ngSwitchCase="'vendor-card'" class="sm-card p-4">
        <div class="skeleton h-40 w-full rounded-lg mb-3"></div>
        <div class="skeleton h-4 w-3/4 rounded mb-2"></div>
        <div class="skeleton h-3 w-1/2 rounded mb-3"></div>
        <div class="flex gap-2">
          <div class="skeleton h-6 w-16 rounded-full"></div>
          <div class="skeleton h-6 w-16 rounded-full"></div>
        </div>
      </div>

      <!-- Inventory Item Skeleton -->
      <div *ngSwitchCase="'inventory-item'" class="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E6E6E6]">
        <div class="skeleton w-14 h-14 rounded-lg flex-shrink-0"></div>
        <div class="flex-1">
          <div class="skeleton h-4 w-2/3 rounded mb-2"></div>
          <div class="skeleton h-3 w-1/3 rounded"></div>
        </div>
        <div class="skeleton h-6 w-20 rounded-full"></div>
      </div>

      <!-- Text Block Skeleton -->
      <div *ngSwitchCase="'text'" class="space-y-2">
        <div *ngFor="let i of [].constructor(lines)" class="skeleton rounded" [style.height]="'1rem'" [style.width]="getWidth()"></div>
      </div>

      <!-- Map Pin Skeleton -->
      <div *ngSwitchCase="'map'" class="skeleton rounded-2xl" style="height: 400px; width: 100%;"></div>

      <!-- Profile Skeleton -->
      <div *ngSwitchCase="'profile'" class="sm-card p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="skeleton w-20 h-20 rounded-full"></div>
          <div class="flex-1">
            <div class="skeleton h-5 w-2/3 rounded mb-2"></div>
            <div class="skeleton h-4 w-1/2 rounded"></div>
          </div>
        </div>
        <div class="skeleton h-3 w-full rounded mb-2"></div>
        <div class="skeleton h-3 w-3/4 rounded"></div>
      </div>

      <!-- Default -->
      <div *ngSwitchDefault class="skeleton rounded" [style.height]="height" [style.width]="width"></div>
    </ng-container>
  `
})
export class SkeletonLoaderComponent {
  @Input() type: 'vendor-card' | 'inventory-item' | 'text' | 'map' | 'profile' | 'default' = 'default';
  @Input() lines = 3;
  @Input() height = '1rem';
  @Input() width = '100%';

  private widths = ['100%', '85%', '90%', '70%', '80%'];

  getWidth(): string {
    return this.widths[Math.floor(Math.random() * this.widths.length)];
  }
}
