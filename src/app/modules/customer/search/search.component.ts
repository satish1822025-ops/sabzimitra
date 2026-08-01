import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../../core/services/search.service';
import { VendorService } from '../../../core/services/vendor.service';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { Vendor } from '../../../core/models';

const QUICK_ITEMS = [
  { name: 'Tomato', nameHindi: 'टमाटर', emoji: '🍅' },
  { name: 'Potato', nameHindi: 'आलू', emoji: '🥔' },
  { name: 'Onion', nameHindi: 'प्याज', emoji: '🧅' },
  { name: 'Spinach', nameHindi: 'पालक', emoji: '🥬' },
  { name: 'Carrot', nameHindi: 'गाजर', emoji: '🥕' },
  { name: 'Cauliflower', nameHindi: 'फूलगोभी', emoji: '🥦' },
  { name: 'Cucumber', nameHindi: 'खीरा', emoji: '🥒' },
  { name: 'Brinjal', nameHindi: 'बैगन', emoji: '🍆' },
  { name: 'Peas', nameHindi: 'मटर', emoji: '🫛' },
  { name: 'Lemon', nameHindi: 'नींबू', emoji: '🍋' }
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RatingStarsComponent, SkeletonLoaderComponent],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] py-8">
      <div class="page-container">
        <h1 class="mb-6">🔍 Search Vendors</h1>

        <!-- Search Bar -->
        <div class="relative mb-6">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input [(ngModel)]="query" (ngModelChange)="onQueryChange($event)"
                 type="text" placeholder="Search for vegetables, fruits... (English or Hindi)"
                 class="sm-input pl-12 h-14 text-base shadow-sm">
          <button *ngIf="query" (click)="clearQuery()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7D7D] hover:text-[#252525] text-xl">×</button>
        </div>

        <!-- Autocomplete Suggestions -->
        <div *ngIf="suggestions().length" class="sm-card p-2 mb-4">
          <button *ngFor="let s of suggestions()" (click)="selectSuggestion(s)"
                  class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#252525] hover:bg-[#F2F0EF] rounded-lg transition-colors text-left">
            🔍 {{ s }}
          </button>
        </div>

        <!-- Quick Filter Chips -->
        <div *ngIf="!query" class="mb-6">
          <h3 class="text-sm font-semibold text-[#545454] mb-3 uppercase tracking-wider">Popular searches</h3>
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let item of quickItems" (click)="selectSuggestion(item.name)"
                    class="flex items-center gap-1.5 bg-white border border-[#CFCFCF] rounded-full px-4 py-2 text-sm hover:border-[#7B9699] hover:bg-[#F2F0EF] transition-colors">
              <span>{{ item.emoji }}</span>
              <span class="text-[#252525] font-medium">{{ item.name }}</span>
              <span class="text-[#7D7D7D] text-xs">{{ item.nameHindi }}</span>
            </button>
          </div>
        </div>

        <!-- Seasonal -->
        <div *ngIf="!query && seasonal().length" class="mb-8">
          <h3 class="section-title">🌾 In Season Now</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div *ngFor="let item of seasonal().slice(0, 4)"
                 (click)="selectSuggestion(item.name)"
                 class="sm-card p-4 text-center cursor-pointer hover:border-[#7B9699] border-2 border-transparent">
              <img [src]="item.image" [alt]="item.name" class="w-12 h-12 rounded-full mx-auto mb-2 object-cover bg-[#BAC8B1]">
              <p class="font-medium text-sm text-[#252525]">{{ item.name }}</p>
              <p class="text-xs text-[#7D7D7D]">{{ item.nameHindi }}</p>
              <span class="badge-in-stock mt-2 inline-block">In Season</span>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div *ngIf="query && (loading() || results().length > 0)">
          <div class="flex items-center justify-between mb-4">
            <h3 class="section-title mb-0">Vendors with "{{ query }}"</h3>
            <span *ngIf="results().length > 0" class="text-sm text-[#7D7D7D]">{{ results().length }} found</span>
          </div>

          <div *ngIf="loading()" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <app-skeleton-loader type="vendor-card" *ngFor="let i of [1,2]"></app-skeleton-loader>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let vendor of results(); trackBy: trackById" class="vendor-card">
              <div class="h-36 bg-[#BAC8B1] overflow-hidden relative">
                <img *ngIf="vendor.coverImage" [src]="vendor.coverImage" [alt]="vendor.shopName"
                     class="w-full h-full object-cover" loading="lazy">
                <div *ngIf="!vendor.coverImage" class="w-full h-full flex items-center justify-center text-5xl">🏪</div>
                <div class="absolute top-2 left-2">
                  <span [class]="vendor.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'"
                        class="text-xs font-semibold px-2 py-1 rounded-full glass">
                    {{ vendor.isOpen ? 'Open' : 'Closed' }}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-[#252525] mb-1">{{ vendor.shopName }}</h3>
                <p class="text-xs text-[#7D7D7D] mb-2 truncate">📍 {{ vendor.address }}</p>
                <div class="flex items-center justify-between">
                  <app-rating-stars [rating]="vendor.rating" [count]="vendor.reviewCount" [showCount]="true" [size]="12"></app-rating-stars>
                  <a [routerLink]="['/customer/vendor', vendor.id]"
                     class="text-sm font-semibold text-[#7B9699] hover:underline">View →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No results -->
        <div *ngIf="query && !loading() && results().length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-[#252525] mb-2">No vendors found for "{{ query }}"</h3>
          <p class="text-[#7D7D7D] text-sm">Try a different search term or expand your radius on the map</p>
        </div>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  private searchService = inject(SearchService);
  private vendorService = inject(VendorService);

  query = '';
  results = signal<Vendor[]>([]);
  suggestions = signal<string[]>([]);
  loading = signal(false);
  seasonal = signal<any[]>([]);

  quickItems = QUICK_ITEMS;

  ngOnInit(): void {
    this.searchService.suggestions$.subscribe(s => this.suggestions.set(s));
    this.searchService.getSeasonalItems().subscribe({ next: s => this.seasonal.set(s), error: () => {} });
  }

  onQueryChange(q: string): void {
    this.searchService.setQuery(q);
    clearTimeout((this as any)._timer);
    if (q.length > 1) {
      this.loading.set(true);
      (this as any)._timer = setTimeout(() => this.doSearch(q), 500);
    } else {
      this.results.set([]);
    }
  }

  selectSuggestion(s: string): void {
    this.query = s;
    this.suggestions.set([]);
    this.doSearch(s);
  }

  clearQuery(): void {
    this.query = '';
    this.results.set([]);
    this.suggestions.set([]);
  }

  private doSearch(q: string): void {
    // Use user's last known location or default
    const lat = 28.6139, lng = 77.2090, radius = 5;
    this.vendorService.getNearbyVendors({ lat, lng, radius, product: q }).subscribe({
      next: r => { this.results.set(r.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  trackById(_: number, v: Vendor): number { return v.id; }
}
