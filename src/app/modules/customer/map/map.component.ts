import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { ChatService } from '../../../core/services/chat.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { VendorCardComponent } from '../../../shared/components/vendor-card/vendor-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Vendor, NearbyVendorsRequest } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

declare const google: any;

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1b1b1b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e0e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7d7d7d' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#232a24' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6c8480' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#14201f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a5f5e' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#404040' }] },
];

const LIGHT_MAP_STYLE = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbe6e5' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f2f0ef' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#545454' }] },
];

const RADIUS_OPTIONS = [
  { value: 0.5, label: '500 m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
];

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest', icon: 'navigation' },
  { value: 'rating', label: 'Top rated', icon: 'star' },
  { value: 'price', label: 'Best price', icon: 'rupee' },
  { value: 'freshness', label: 'Freshest', icon: 'sprout' },
];

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SkeletonLoaderComponent,
    RatingStarsComponent,
    VendorCardComponent,
    EmptyStateComponent,
    IconComponent,
  ],
  template: `
    <div class="flex h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100dvh-4.5rem)]">
      <!-- ─────────── LEFT: results panel ─────────── -->
      <aside
        class="flex h-full w-full flex-none flex-col overflow-hidden border-r border-line bg-surface md:w-[27rem]"
        [class.hidden]="mobileView() === 'map'"
      >
        <!-- Search + filters -->
        <div class="flex-none border-b border-line px-4 pb-3.5 pt-4">
          <div class="input-group">
            <span class="input-icon"><app-icon name="search" [size]="17" /></span>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              type="search"
              placeholder="Tomatoes, spinach, mangoes…"
              aria-label="Search produce"
              class="sm-input has-icon"
            />
          </div>

          <div class="scroll-x no-scrollbar mt-3">
            <div class="relative flex-none">
              <select
                [(ngModel)]="filters.radius"
                (ngModelChange)="refreshVendors()"
                aria-label="Search radius"
                class="chip appearance-none pr-8"
              >
                @for (opt of radiusOptions; track opt.value) {
                  <option [value]="opt.value">Within {{ opt.label }}</option>
                }
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-3">
                <app-icon name="chevron-down" [size]="13" />
              </span>
            </div>

            <div class="relative flex-none">
              <select
                [(ngModel)]="filters.sort"
                (ngModelChange)="refreshVendors()"
                aria-label="Sort results"
                class="chip appearance-none pr-8"
              >
                @for (opt of sortOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-3">
                <app-icon name="chevron-down" [size]="13" />
              </span>
            </div>

            <button
              type="button"
              class="chip flex-none"
              [class.is-active]="filters.inStockOnly"
              (click)="filters.inStockOnly = !filters.inStockOnly; refreshVendors()"
            >
              <app-icon name="check-circle" [size]="14" /> In stock
            </button>

            <button
              type="button"
              class="chip flex-none"
              [class.is-active]="filters.organicOnly"
              (click)="filters.organicOnly = !filters.organicOnly; refreshVendors()"
            >
              <app-icon name="sprout" [size]="14" /> Organic
            </button>
          </div>
        </div>

        <!-- Result meta -->
        <div class="flex flex-none items-center justify-between border-b border-line px-4 py-2.5">
          <p class="text-xs text-fg-3">
            <span class="num font-bold text-fg">{{ vendors().length }}</span>
            {{ vendors().length === 1 ? 'vendor' : 'vendors' }}
            @if (userLocation()) {
              <span>near you</span>
            }
          </p>
          <button
            type="button"
            class="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-fg-3 transition-colors hover:text-fg"
            (click)="getUserLocation()"
          >
            <app-icon name="crosshair" [size]="13" /> Recenter
          </button>
        </div>

        <!-- List -->
        <div class="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          @if (loading()) {
            @for (i of [1, 2, 3, 4]; track i) {
              <app-skeleton-loader type="inventory-item" />
            }
          } @else if (!userLocation()) {
            <app-empty-state
              icon="map-pin"
              title="Enable location"
              description="Share your location and we'll surface the freshest stalls within walking distance."
            >
              <button type="button" class="btn btn-primary" (click)="getUserLocation()">
                <app-icon name="navigation" [size]="16" /> Share location
              </button>
            </app-empty-state>
          } @else if (!vendors().length) {
            <app-empty-state
              icon="leaf"
              title="No vendors in range"
              description="Try widening the radius or clearing a filter to see more shops."
            >
              <button type="button" class="btn btn-outline" (click)="resetFilters()">
                <app-icon name="refresh" [size]="16" /> Reset filters
              </button>
            </app-empty-state>
          } @else {
            @for (vendor of vendors(); track vendor.id) {
              <app-vendor-card
                variant="compact"
                [vendor]="vendor"
                [selected]="selectedVendor()?.id === vendor.id"
                (cardClick)="selectVendor(vendor)"
              />
            }
          }
        </div>
      </aside>

      <!-- ─────────── RIGHT: map ─────────── -->
      <div class="relative flex-1" [class.hidden]="mobileView() === 'list'">
        <div #mapContainer class="h-full w-full"></div>

        @if (mapLoading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-bg">
            <div class="flex flex-col items-center gap-3">
              <span class="spinner text-brand" style="width: 2rem; height: 2rem; border-width: 2.5px"></span>
              <p class="text-xs uppercase tracking-widest text-fg-3">Loading map</p>
            </div>
          </div>
        }

        <!-- Elegant fallback when no Maps key is configured -->
        @if (!mapLoading() && !mapReady()) {
          <div class="map-canvas absolute inset-0">
            <div class="map-grid"></div>

            <!-- Decorative vendor pins from the live result set -->
            @for (pin of pins(); track pin.id) {
              <button
                type="button"
                class="map-pin"
                [class.is-active]="selectedVendor()?.id === pin.id"
                [style.left.%]="pin.x"
                [style.top.%]="pin.y"
                (click)="selectVendor(pin.vendor)"
                [attr.aria-label]="pin.vendor.shopName"
              >
                <span class="flex flex-col items-center gap-1">
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-full border shadow-md"
                    [style.background]="selectedVendor()?.id === pin.id ? 'var(--brand)' : 'var(--surface)'"
                    [style.border-color]="'var(--line-2)'"
                    [style.color]="selectedVendor()?.id === pin.id ? 'var(--brand-fg)' : 'var(--brand-bright)'"
                  >
                    <app-icon name="store" [size]="17" />
                  </span>
                  <span
                    class="max-w-[7rem] truncate rounded-full border border-line-2 bg-surface px-2 py-0.5 text-[0.625rem] font-bold text-fg"
                  >
                    {{ pin.vendor.shopName }}
                  </span>
                </span>
              </button>
            }

            <!-- You-are-here radar -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span class="radar block h-24 w-24"></span>
              <span class="radar block h-24 w-24" style="animation-delay: 1.1s"></span>
              <span
                class="absolute left-1/2 top-1/2 flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand"
                style="box-shadow: 0 0 0 4px var(--brand-soft)"
              ></span>
            </div>

            <div class="absolute inset-x-0 bottom-6 flex justify-center px-6">
              <p
                class="flex items-center gap-2 rounded-full border border-line-2 bg-surface/80 px-4 py-2 text-[0.6875rem] text-fg-3 backdrop-blur"
              >
                <app-icon name="info" [size]="13" />
                Schematic view — add a Google Maps key in
                <code class="rounded bg-surface-3 px-1.5 py-0.5 text-[0.625rem] text-fg-2">environment.ts</code>
                for live streets.
              </p>
            </div>
          </div>
        }

        <!-- Selected vendor sheet -->
        @if (selectedVendor(); as vendor) {
          <div
            class="glass absolute inset-x-4 bottom-20 rounded-lg p-4 shadow-lg scale-in md:inset-x-auto md:bottom-6 md:right-6 md:w-[22rem]"
          >
            <div class="flex items-start gap-3">
              <div class="h-12 w-12 flex-none overflow-hidden rounded-md bg-surface-3">
                @if (vendor.shopImage || vendor.coverImage) {
                  <img
                    [src]="vendor.shopImage || vendor.coverImage"
                    [alt]="vendor.shopName"
                    class="h-full w-full object-cover"
                  />
                } @else {
                  <span class="flex h-full w-full items-center justify-center text-fg-3">
                    <app-icon name="store" [size]="20" />
                  </span>
                }
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="flex items-center gap-1.5 truncate text-sm font-bold text-fg">
                  <span class="truncate">{{ vendor.shopName }}</span>
                  @if (vendor.isVerified) {
                    <span class="text-brand-bright"><app-icon name="shield-check" [size]="13" /></span>
                  }
                </h3>
                <app-rating-stars [rating]="vendor.rating" [showValue]="true" [size]="12" />
              </div>

              <button type="button" class="btn-icon h-8 w-8" (click)="clearSelection()" aria-label="Close">
                <app-icon name="close" [size]="14" />
              </button>
            </div>

            <div class="mt-3 flex items-center gap-3 text-[0.6875rem] text-fg-3">
              <span class="flex items-center gap-1"><app-icon name="clock" [size]="12" />{{ vendor.openingHours }}–{{ vendor.closingHours }}</span>
              @if (vendor.distance != null) {
                <span class="flex items-center gap-1"><app-icon name="navigation" [size]="12" />{{ formatDistance(vendor.distance) }}</span>
              }
            </div>

            <div class="mt-4 flex gap-2">
              <a [routerLink]="['/customer/vendor', vendor.id]" class="btn btn-primary btn-sm flex-1">
                View shop
              </a>
              <a [href]="getDirectionsUrl(vendor)" target="_blank" rel="noopener" class="btn btn-outline btn-sm flex-1">
                <app-icon name="route" [size]="15" /> Navigate
              </a>
              <a [href]="'tel:' + vendor.phone" class="btn-icon h-9 w-9" [attr.aria-label]="'Call ' + vendor.shopName">
                <app-icon name="phone" [size]="15" />
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Mobile view switch -->
      <div
        class="fixed inset-x-0 bottom-0 z-[210] flex border-t border-line bg-surface/90 backdrop-blur md:hidden"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="mobileView() === 'list'"
          class="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-wider transition-colors"
          [class.text-brand-bright]="mobileView() === 'list'"
          [class.text-fg-3]="mobileView() !== 'list'"
          (click)="mobileView.set('list')"
        >
          <app-icon name="list" [size]="18" /> List
        </button>
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="mobileView() === 'map'"
          class="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[0.6875rem] font-bold uppercase tracking-wider transition-colors"
          [class.text-brand-bright]="mobileView() === 'map'"
          [class.text-fg-3]="mobileView() !== 'map'"
          (click)="mobileView.set('map')"
        >
          <app-icon name="map" [size]="18" /> Map
        </button>
      </div>
    </div>
  `,
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;

  private vendorService = inject(VendorService);
  private chatService = inject(ChatService);
  private notifService = inject(NotificationService);
  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  readonly radiusOptions = RADIUS_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;

  vendors = signal<Vendor[]>([]);
  selectedVendor = signal<Vendor | null>(null);
  loading = signal(false);
  mapLoading = signal(true);
  mapReady = signal(false);
  mobileView = signal<'list' | 'map'>('list');
  userLocation = signal<{ lat: number; lng: number } | null>(null);

  searchQuery = '';
  filters: Partial<NearbyVendorsRequest> = {
    radius: 2,
    sort: 'distance',
    inStockOnly: false,
    organicOnly: false,
  };

  /** Deterministic schematic layout used by the no-API-key fallback map. */
  readonly pins = computed(() =>
    this.vendors()
      .slice(0, 9)
      .map((vendor, i) => {
        const angle = (i / 9) * Math.PI * 2 + 0.6;
        const ring = 16 + (i % 3) * 11;
        return {
          id: vendor.id,
          vendor,
          x: 50 + Math.cos(angle) * ring * 1.45,
          y: 48 + Math.sin(angle) * ring,
        };
      })
  );

  private map: any;
  private markers: any[] = [];
  private subscription?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.getUserLocation();
    try {
      this.chatService.connect();
    } catch {
      /* realtime is optional */
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.loadGoogleMaps();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    clearTimeout(this.searchTimer);
    this.chatService.disconnect();
  }

  getUserLocation(): void {
    if (!navigator.geolocation) {
      this.notifService.error('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userLocation.set(loc);
        this.refreshVendors();
        this.map?.setCenter(loc);
      },
      () => {
        this.userLocation.set({ lat: 28.6139, lng: 77.209 });
        this.refreshVendors();
        this.notifService.info('Using a default location. Enable GPS for precise results.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  refreshVendors(): void {
    const loc = this.userLocation();
    if (!loc) return;
    this.loading.set(true);
    const req: NearbyVendorsRequest = {
      lat: loc.lat,
      lng: loc.lng,
      radius: Number(this.filters.radius ?? 2),
      sort: this.filters.sort as NearbyVendorsRequest['sort'],
      inStockOnly: this.filters.inStockOnly,
      organicOnly: this.filters.organicOnly,
      product: this.searchQuery || undefined,
    };
    this.vendorService.getNearbyVendors(req).subscribe({
      next: (res) => {
        this.vendors.set(res.content);
        this.loading.set(false);
        this.updateMapMarkers(res.content);
        res.content.forEach((v) => {
          try {
            this.chatService.subscribeToVendorStock(v.id);
          } catch {
            /* realtime is optional */
          }
        });
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.refreshVendors(), 400);
  }

  resetFilters(): void {
    this.filters = { radius: 5, sort: 'distance', inStockOnly: false, organicOnly: false };
    this.searchQuery = '';
    this.refreshVendors();
  }

  selectVendor(vendor: Vendor): void {
    this.selectedVendor.set(vendor);
    if (this.map) {
      this.map.panTo({ lat: vendor.lat, lng: vendor.lng });
      this.map.setZoom(16);
    }
  }

  clearSelection(): void {
    this.selectedVendor.set(null);
  }

  getDirectionsUrl(vendor: Vendor): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${vendor.lat},${vendor.lng}`;
  }

  formatDistance(d: number): string {
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  }

  // ── Google Maps ───────────────────────────────────────────

  private loadGoogleMaps(): void {
    if ((window as any).google?.maps) {
      this.initMap();
      return;
    }
    const apiKey = environment.googleMapsApiKey;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      this.mapLoading.set(false);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.initMap();
    script.onerror = () => this.mapLoading.set(false);
    document.head.appendChild(script);
  }

  private initMap(): void {
    const center = this.userLocation() ?? { lat: 28.6139, lng: 77.209 };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      styles: this.themeService.isDark() ? DARK_MAP_STYLE : LIGHT_MAP_STYLE,
    });

    new google.maps.Marker({
      position: center,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#7B9699',
        fillOpacity: 1,
        strokeColor: '#0E0E0E',
        strokeWeight: 3,
      },
      title: 'You are here',
      zIndex: 999,
    });

    this.mapLoading.set(false);
    this.mapReady.set(true);
    if (this.vendors().length) this.updateMapMarkers(this.vendors());
  }

  private updateMapMarkers(vendors: Vendor[]): void {
    if (!this.map) return;
    this.markers.forEach((m) => m.setMap(null));
    this.markers = [];
    vendors.forEach((vendor) => {
      const color = !vendor.isOpen ? '#7D7D7D' : vendor.status === 'LOW_STOCK' ? '#FFDBBB' : '#BAC8B1';
      const marker = new google.maps.Marker({
        position: { lat: vendor.lat, lng: vendor.lng },
        map: this.map,
        title: vendor.shopName,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#0E0E0E',
          strokeWeight: 1.5,
          scale: 1.4,
          anchor: new google.maps.Point(12, 22),
        },
      });
      marker.addListener('click', () => this.selectVendor(vendor));
      this.markers.push(marker);
    });
  }
}
