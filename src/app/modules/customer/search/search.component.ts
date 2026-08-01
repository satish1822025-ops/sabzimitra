import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../core/services/search.service';
import { VendorService } from '../../../core/services/vendor.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VendorCardComponent } from '../../../shared/components/vendor-card/vendor-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Vendor } from '../../../core/models';

const QUICK_ITEMS = [
  { name: 'Tomato', nameHindi: 'टमाटर' },
  { name: 'Potato', nameHindi: 'आलू' },
  { name: 'Onion', nameHindi: 'प्याज' },
  { name: 'Spinach', nameHindi: 'पालक' },
  { name: 'Carrot', nameHindi: 'गाजर' },
  { name: 'Cauliflower', nameHindi: 'फूलगोभी' },
  { name: 'Cucumber', nameHindi: 'खीरा' },
  { name: 'Brinjal', nameHindi: 'बैगन' },
  { name: 'Peas', nameHindi: 'मटर' },
  { name: 'Lemon', nameHindi: 'नींबू' },
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    SkeletonLoaderComponent,
    VendorCardComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="min-h-screen bg-bg">
      <!-- Search hero -->
      <section class="relative overflow-hidden border-b border-line bg-bg-deep">
        <div class="map-grid pointer-events-none absolute inset-0 opacity-[0.5]"></div>
        <div
          class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[38rem] -translate-x-1/2 rounded-full opacity-50"
          style="background: radial-gradient(circle, var(--brand-soft), transparent 70%)"
        ></div>

        <div class="page-container relative py-10 sm:py-14">
          <div class="mx-auto max-w-2xl text-center">
            <span class="eyebrow">Produce finder</span>
            <h1 class="display-title mt-3 text-balance">
              What are you looking <span class="text-gradient-brand">for today?</span>
            </h1>
            <p class="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-fg-3">
              Search in English or Hindi. We match it against live inventory from every nearby cart.
            </p>

            <div class="input-group mt-7">
              <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-3">
                <app-icon name="search" [size]="18" />
              </span>
              <input
                [(ngModel)]="query"
                (ngModelChange)="onQueryChange($event)"
                type="text"
                autocomplete="off"
                placeholder="Tomato, palak, टमाटर…"
                aria-label="Search for produce"
                class="sm-input h-14 pl-12 pr-12 text-[0.9375rem]"
              />
              @if (query) {
                <button
                  type="button"
                  (click)="clearQuery()"
                  aria-label="Clear search"
                  class="btn-icon absolute right-2.5 top-1/2 h-9 w-9 -translate-y-1/2"
                >
                  <app-icon name="x" [size]="15" />
                </button>
              }
            </div>

            <!-- Autocomplete -->
            @if (suggestions().length) {
              <div class="sm-card scale-in mt-2 overflow-hidden p-1.5 text-left">
                @for (s of suggestions(); track s) {
                  <button
                    type="button"
                    (click)="selectSuggestion(s)"
                    class="flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-[0.875rem] text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg"
                  >
                    <app-icon name="search" [size]="14" class="text-fg-3" />
                    {{ s }}
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <div class="page-container page-section">
        <!-- Browse state -->
        @if (!query) {
          <div class="stagger">
            <div class="section-head">
              <div>
                <h2 class="section-title">Popular right now</h2>
                <p class="mt-1 text-[0.8125rem] text-fg-3">Tap any item to find vendors stocking it</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2.5">
              @for (item of quickItems; track item.name) {
                <button type="button" (click)="selectSuggestion(item.name)" class="chip">
                  <app-icon name="leaf" [size]="13" class="text-brand-bright" />
                  <span class="font-semibold text-fg">{{ item.name }}</span>
                  <span class="text-fg-3">{{ item.nameHindi }}</span>
                </button>
              }
            </div>

            @if (seasonal().length) {
              <div class="mt-12">
                <div class="section-head">
                  <div>
                    <h2 class="section-title">In season</h2>
                    <p class="mt-1 text-[0.8125rem] text-fg-3">Peak freshness, best prices this month</p>
                  </div>
                  <span class="badge badge-success">
                    <span class="dot dot-open dot-live"></span>
                    Harvest window
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  @for (item of seasonal().slice(0, 8); track item.name) {
                    <button
                      type="button"
                      (click)="selectSuggestion(item.name)"
                      class="sm-card sm-card-hover group overflow-hidden text-left"
                    >
                      <div class="relative aspect-[4/3] overflow-hidden bg-surface-3">
                        @if (item.image) {
                          <img
                            [src]="item.image"
                            [alt]="item.name"
                            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                            loading="lazy"
                          />
                        } @else {
                          <span class="flex h-full w-full items-center justify-center text-fg-3">
                            <app-icon name="leaf" [size]="30" />
                          </span>
                        }
                        <div
                          class="pointer-events-none absolute inset-0"
                          style="background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)"
                        ></div>
                        <span class="badge badge-brand absolute left-2.5 top-2.5">Seasonal</span>
                      </div>
                      <div class="p-3.5">
                        <p class="text-[0.875rem] font-bold text-fg">{{ item.name }}</p>
                        <p class="mt-0.5 text-[0.75rem] text-fg-3">{{ item.nameHindi }}</p>
                      </div>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Loading -->
        @if (query && loading()) {
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3]; track i) {
              <app-skeleton-loader type="vendor-card" />
            }
          </div>
        }

        <!-- Results -->
        @if (query && !loading() && results().length) {
          <div class="section-head">
            <div>
              <h2 class="section-title">
                Vendors stocking <span class="text-brand-bright">{{ query }}</span>
              </h2>
              <p class="mt-1 text-[0.8125rem] text-fg-3">Sorted by distance from your last known location</p>
            </div>
            <span class="badge badge-neutral num">{{ results().length }} results</span>
          </div>

          <div class="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (vendor of results(); track vendor.id) {
              <app-vendor-card [vendor]="vendor" variant="grid" />
            }
          </div>
        }

        <!-- No results -->
        @if (query && !loading() && !results().length) {
          <app-empty-state
            icon="search"
            [title]="'No vendors found for &quot;' + query + '&quot;'"
            description="Try a different spelling, search in Hindi, or widen your radius on the live map."
          />
        }
      </div>
    </div>
  `,
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
  private timer: any;

  ngOnInit(): void {
    this.searchService.suggestions$.subscribe((s) => this.suggestions.set(s));
    this.searchService.getSeasonalItems().subscribe({
      next: (s) => this.seasonal.set(s),
      error: () => {},
    });
  }

  onQueryChange(q: string): void {
    this.searchService.setQuery(q);
    clearTimeout(this.timer);
    if (q.length > 1) {
      this.loading.set(true);
      this.timer = setTimeout(() => this.doSearch(q), 500);
    } else {
      this.loading.set(false);
      this.results.set([]);
    }
  }

  selectSuggestion(s: string): void {
    this.query = s;
    this.suggestions.set([]);
    this.loading.set(true);
    this.doSearch(s);
  }

  clearQuery(): void {
    this.query = '';
    this.results.set([]);
    this.suggestions.set([]);
    this.loading.set(false);
  }

  private doSearch(q: string): void {
    const lat = 28.6139;
    const lng = 77.209;
    const radius = 5;
    this.vendorService.getNearbyVendors({ lat, lng, radius, product: q }).subscribe({
      next: (r) => {
        this.results.set(r.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
