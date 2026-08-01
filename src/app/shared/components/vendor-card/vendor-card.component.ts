import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vendor } from '../../../core/models';
import { IconComponent } from '../icon/icon.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

/**
 * Shared vendor presentation card.
 *  - variant="grid"    → tall card with cover image (search / favorites grids)
 *  - variant="compact" → dense horizontal row (map side panel)
 */
@Component({
  selector: 'app-vendor-card',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingStarsComponent],
  template: `
    @if (variant === 'compact') {
      <article
        class="sm-card sm-card-hover group flex cursor-pointer gap-3.5 p-3"
        [class.is-selected]="selected"
        (click)="cardClick.emit(vendor)"
      >
        <div class="relative h-[4.5rem] w-[4.5rem] flex-none overflow-hidden rounded-md bg-surface-3">
          @if (vendor.coverImage || vendor.shopImage) {
            <img
              [src]="vendor.coverImage || vendor.shopImage"
              [alt]="vendor.shopName"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          } @else {
            <span class="flex h-full w-full items-center justify-center text-fg-3">
              <app-icon name="store" [size]="24" />
            </span>
          }
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h3 class="flex min-w-0 items-center gap-1.5 text-[0.875rem] font-bold text-fg">
              <span class="truncate">{{ vendor.shopName }}</span>
              @if (vendor.isVerified) {
                <span class="flex-none text-brand-bright" title="Verified vendor">
                  <app-icon name="shield-check" [size]="14" />
                </span>
              }
            </h3>
            @if (vendor.distance != null) {
              <span class="num flex-none text-[0.6875rem] font-bold text-brand-bright">
                {{ distanceLabel }}
              </span>
            }
          </div>

          <p class="mt-0.5 truncate text-[0.75rem] text-fg-3">{{ vendor.address }}</p>

          <div class="mt-2 flex items-center gap-2.5">
            <span class="badge" [class]="statusBadgeClass">
              <span class="dot" [class]="statusDotClass"></span>
              {{ statusLabel }}
            </span>
            <app-rating-stars [rating]="vendor.rating" [count]="vendor.reviewCount" [showCount]="true" [size]="11" />
          </div>
        </div>
      </article>
    } @else {
      <article class="sm-card sm-card-hover group overflow-hidden">
        <a [routerLink]="['/customer/vendor', vendor.id]" class="block">
          <div class="relative aspect-[16/10] overflow-hidden bg-surface-3">
            @if (vendor.coverImage || vendor.shopImage) {
              <img
                [src]="vendor.coverImage || vendor.shopImage"
                [alt]="vendor.shopName"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                loading="lazy"
              />
            } @else {
              <span class="flex h-full w-full items-center justify-center text-fg-3">
                <app-icon name="store" [size]="38" />
              </span>
            }

            <div
              class="pointer-events-none absolute inset-0"
              style="background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.05) 55%, transparent)"
            ></div>

            <div class="absolute left-3 top-3 flex gap-2">
              <span class="badge" [class]="statusBadgeClass">
                <span class="dot" [class]="statusDotClass"></span>
                {{ statusLabel }}
              </span>
            </div>

            @if (vendor.subscriptionTier !== 'FREE') {
              <span class="badge badge-pro absolute right-3 top-3">
                <app-icon name="sparkles" [size]="11" />
                {{ vendor.subscriptionTier }}
              </span>
            }

            @if (vendor.distance != null) {
              <span
                class="absolute bottom-3 right-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold text-white"
                style="background: rgba(0,0,0,0.55); backdrop-filter: blur(6px)"
              >
                <app-icon name="navigation" [size]="11" />
                {{ distanceLabel }}
              </span>
            }
          </div>
        </a>

        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <h3 class="flex min-w-0 items-center gap-1.5 text-[0.9375rem] font-bold text-fg">
              <a [routerLink]="['/customer/vendor', vendor.id]" class="truncate hover:text-brand-bright">
                {{ vendor.shopName }}
              </a>
              @if (vendor.isVerified) {
                <span class="flex-none text-brand-bright" title="Verified vendor">
                  <app-icon name="shield-check" [size]="14" />
                </span>
              }
            </h3>
            <button
              type="button"
              class="btn-icon h-8 w-8 flex-none"
              [style.color]="isFavorite ? 'var(--accent)' : ''"
              (click)="favoriteToggle.emit(vendor)"
              [attr.aria-label]="isFavorite ? 'Remove from saved' : 'Save vendor'"
            >
              <app-icon [name]="isFavorite ? 'heart-filled' : 'heart'" [size]="15" />
            </button>
          </div>

          <p class="mt-1 flex items-center gap-1.5 truncate text-[0.75rem] text-fg-3">
            <app-icon name="map-pin" [size]="12" />
            <span class="truncate">{{ vendor.address }}</span>
          </p>

          <div class="mt-3 flex items-center justify-between gap-2">
            <app-rating-stars [rating]="vendor.rating" [count]="vendor.reviewCount" [showCount]="true" [size]="13" />
            <span class="flex items-center gap-1 text-[0.6875rem] font-semibold text-fg-3">
              <app-icon name="clock" [size]="12" />
              {{ vendor.openingHours }} – {{ vendor.closingHours }}
            </span>
          </div>

          @if (vendor.paymentMethods?.length) {
            <div class="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
              @for (method of vendor.paymentMethods.slice(0, 3); track method) {
                <span class="rounded-full bg-surface-3 px-2 py-0.5 text-[0.6875rem] font-semibold text-fg-3">
                  {{ method }}
                </span>
              }
            </div>
          }
        </div>
      </article>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .is-selected {
        border-color: var(--brand) !important;
        box-shadow: var(--shadow-glow);
      }
    `,
  ],
})
export class VendorCardComponent {
  @Input({ required: true }) vendor!: Vendor;
  @Input() variant: 'grid' | 'compact' = 'grid';
  @Input() selected = false;
  @Input() isFavorite = false;

  @Output() cardClick = new EventEmitter<Vendor>();
  @Output() favoriteToggle = new EventEmitter<Vendor>();

  get statusLabel(): string {
    if (!this.vendor.isOpen) return 'Closed';
    return this.vendor.status === 'LOW_STOCK' ? 'Low stock' : 'Open now';
  }

  get statusBadgeClass(): string {
    if (!this.vendor.isOpen) return 'badge-neutral';
    return this.vendor.status === 'LOW_STOCK' ? 'badge-warn' : 'badge-success';
  }

  get statusDotClass(): string {
    if (!this.vendor.isOpen) return 'dot-closed';
    return this.vendor.status === 'LOW_STOCK' ? 'dot-low' : 'dot-open dot-live';
  }

  get distanceLabel(): string {
    const d = this.vendor.distance ?? 0;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  }
}
