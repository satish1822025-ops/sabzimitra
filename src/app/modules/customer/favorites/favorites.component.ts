import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { Vendor } from '../../../core/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonLoaderComponent, RatingStarsComponent],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] py-8">
      <div class="page-container">
        <div class="flex items-center gap-3 mb-6">
          <h1>❤️ My Favorites</h1>
          <span class="text-sm text-[#7D7D7D]">{{ vendors().length }} saved</span>
        </div>

        <div *ngIf="loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <app-skeleton-loader type="vendor-card" *ngFor="let i of [1,2,3]"></app-skeleton-loader>
        </div>

        <div *ngIf="!loading() && vendors().length === 0" class="text-center py-20">
          <div class="text-7xl mb-4">🤍</div>
          <h2 class="text-[#252525] mb-2">No favorites yet</h2>
          <p class="text-[#7D7D7D] text-sm mb-6">Save your favorite vendors to quickly find them again</p>
          <a routerLink="/customer/map" class="btn-primary">🗺️ Explore Vendors</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let vendor of vendors(); trackBy: trackById" class="vendor-card">
            <div class="relative h-40 bg-[#BAC8B1] overflow-hidden">
              <img *ngIf="vendor.coverImage" [src]="vendor.coverImage" [alt]="vendor.shopName"
                   class="w-full h-full object-cover" loading="lazy">
              <div *ngIf="!vendor.coverImage" class="w-full h-full flex items-center justify-center text-5xl">🏪</div>
              <div class="absolute top-2 left-2">
                <span [class]="vendor.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'"
                      class="text-xs font-semibold px-2.5 py-1 rounded-full glass">
                  {{ vendor.isOpen ? '🟢 Open' : '🔴 Closed' }}
                </span>
              </div>
              <button (click)="removeFavorite(vendor); $event.stopPropagation()"
                      class="absolute top-2 right-2 glass w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-white/90">
                ❤️
              </button>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between mb-1">
                <h3 class="font-semibold text-[#252525]">{{ vendor.shopName }}</h3>
                <span *ngIf="vendor.isVerified" class="text-xs">✅</span>
              </div>
              <p class="text-xs text-[#7D7D7D] mb-3 truncate">📍 {{ vendor.address }}</p>
              <div class="flex items-center justify-between">
                <app-rating-stars [rating]="vendor.rating" [count]="vendor.reviewCount" [showCount]="true" [size]="13"></app-rating-stars>
                <a [routerLink]="['/customer/vendor', vendor.id]" class="text-sm text-[#7B9699] font-semibold hover:underline">
                  View →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  private vendorService = inject(VendorService);
  private notifService = inject(NotificationService);

  vendors = signal<Vendor[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.vendorService.getFavorites().subscribe({
      next: v => { this.vendors.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  removeFavorite(vendor: Vendor): void {
    this.vendorService.removeFromFavorites(vendor.id).subscribe({
      next: () => {
        this.vendors.update(vs => vs.filter(v => v.id !== vendor.id));
        this.notifService.info('Removed from favorites');
      }
    });
  }

  trackById(_: number, v: Vendor): number { return v.id; }
}
