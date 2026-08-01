import { Component, inject, signal, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { ChatService } from '../../../core/services/chat.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { Vendor, NearbyVendorsRequest } from '../../../core/models';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SkeletonLoaderComponent, RatingStarsComponent],
  template: `
    <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F2F0EF]">
      <!-- LEFT: Vendor List Panel -->
      <div class="w-full md:w-[420px] flex-shrink-0 flex flex-col h-full overflow-hidden bg-white shadow-[2px_0_12px_rgba(37,37,37,0.08)]"
           [class.hidden]="mobileView() === 'map'">

        <!-- Search & Filters -->
        <div class="p-4 border-b border-[#E6E6E6] flex-shrink-0">
          <div class="relative mb-3">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7D7D]">🔍</span>
            <input [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
                   type="text" placeholder="Search vegetables, fruits..."
                   class="sm-input pl-9 pr-4 h-11">
          </div>

          <!-- Filters Row -->
          <div class="flex gap-2 overflow-x-auto scrollbar-none">
            <select [(ngModel)]="filters.radius" (ngModelChange)="refreshVendors()"
                    class="text-xs bg-[#F2F0EF] border border-[#CFCFCF] rounded-full px-3 py-2 flex-shrink-0 text-[#252525] cursor-pointer focus:outline-none focus:border-[#7B9699]">
              <option value="0.5">500m</option>
              <option value="1">1 km</option>
              <option value="2" selected>2 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
            <select [(ngModel)]="filters.sort" (ngModelChange)="refreshVendors()"
                    class="text-xs bg-[#F2F0EF] border border-[#CFCFCF] rounded-full px-3 py-2 flex-shrink-0 text-[#252525] cursor-pointer focus:outline-none focus:border-[#7B9699]">
              <option value="distance">Nearest</option>
              <option value="rating">Top Rated</option>
              <option value="price">Cheapest</option>
              <option value="freshness">Freshest</option>
            </select>
            <button (click)="filters.inStockOnly = !filters.inStockOnly; refreshVendors()"
                    [class]="filters.inStockOnly ? 'badge-in-stock flex-shrink-0 cursor-pointer' : 'text-xs bg-[#F2F0EF] border border-[#CFCFCF] rounded-full px-3 py-2 flex-shrink-0 cursor-pointer text-[#545454]'">
              ✅ In Stock
            </button>
            <button (click)="filters.organicOnly = !filters.organicOnly; refreshVendors()"
                    [class]="filters.organicOnly ? 'badge-verified flex-shrink-0 cursor-pointer' : 'text-xs bg-[#F2F0EF] border border-[#CFCFCF] rounded-full px-3 py-2 flex-shrink-0 cursor-pointer text-[#545454]'">
              🌱 Organic
            </button>
          </div>
        </div>

        <!-- Results count -->
        <div class="px-4 py-2 flex-shrink-0 border-b border-[#F2F0EF]">
          <p class="text-xs text-[#7D7D7D]">
            <span class="font-semibold text-[#252525]">{{ vendors().length }}</span> vendors found
            <span *ngIf="userLocation">near you</span>
          </p>
        </div>

        <!-- Vendor List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Loading skeletons -->
          <ng-container *ngIf="loading()">
            <app-skeleton-loader type="vendor-card" *ngFor="let i of [1,2,3,4]"></app-skeleton-loader>
          </ng-container>

          <!-- No location -->
          <div *ngIf="!loading() && !userLocation" class="text-center py-12">
            <div class="text-6xl mb-4">📍</div>
            <h3 class="text-[#252525] font-semibold mb-2">Enable Location</h3>
            <p class="text-[#7D7D7D] text-sm mb-4">Share your location to find vendors near you</p>
            <button (click)="getUserLocation()" class="btn-primary mx-auto">
              📍 Share Location
            </button>
          </div>

          <!-- No results -->
          <div *ngIf="!loading() && userLocation && vendors().length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">🥬</div>
            <h3 class="text-[#252525] font-semibold mb-2">No vendors found</h3>
            <p class="text-[#7D7D7D] text-sm">Try expanding the radius or removing filters</p>
          </div>

          <!-- Vendor Cards -->
          <div *ngFor="let vendor of vendors(); trackBy: trackById"
               (click)="selectVendor(vendor)"
               [class]="selectedVendor()?.id === vendor.id ? 'vendor-card border-2 border-[#7B9699]' : 'vendor-card border-2 border-transparent'"
               class="cursor-pointer">

            <!-- Cover Image -->
            <div class="relative h-36 bg-[#BAC8B1] overflow-hidden">
              <img *ngIf="vendor.coverImage" [src]="vendor.coverImage" [alt]="vendor.shopName"
                   class="w-full h-full object-cover">
              <div *ngIf="!vendor.coverImage" class="w-full h-full flex items-center justify-center text-5xl">🏪</div>
              <!-- Status Overlay -->
              <div class="absolute top-2 left-2">
                <span [class]="getStatusBadge(vendor)" class="text-xs font-semibold px-2.5 py-1 rounded-full glass">
                  <span [class]="getStatusDot(vendor)" class="mr-1 inline-block rounded-full w-2 h-2"></span>
                  {{ vendor.isOpen ? (vendor.status === 'LOW_STOCK' ? 'Low Stock' : 'Open') : 'Closed' }}
                </span>
              </div>
              <!-- Subscription badge -->
              <div *ngIf="vendor.subscriptionTier !== 'FREE'" class="absolute top-2 right-2">
                <span class="badge-pro text-xs">⭐ {{ vendor.subscriptionTier }}</span>
              </div>
            </div>

            <div class="p-3">
              <div class="flex items-start justify-between gap-2 mb-1">
                <div class="flex items-center gap-1.5">
                  <h3 class="font-semibold text-[#252525] text-sm">{{ vendor.shopName }}</h3>
                  <span *ngIf="vendor.isVerified" class="text-xs">✅</span>
                </div>
                <app-rating-stars [rating]="vendor.rating" [count]="vendor.reviewCount"
                                  [showCount]="true" [size]="12"></app-rating-stars>
              </div>
              <p class="text-xs text-[#7D7D7D] mb-2 truncate">📍 {{ vendor.address }}</p>
              <div class="flex items-center justify-between">
                <div class="flex gap-1.5 flex-wrap">
                  <span *ngFor="let method of vendor.paymentMethods.slice(0, 2)"
                        class="text-xs bg-[#F2F0EF] text-[#545454] px-2 py-0.5 rounded-full">
                    {{ method }}
                  </span>
                </div>
                <span *ngIf="vendor.distance != null" class="text-xs text-[#7B9699] font-medium flex-shrink-0">
                  📍 {{ formatDistance(vendor.distance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Map -->
      <div class="flex-1 relative" [class.hidden]="mobileView() === 'list'">
        <div #mapContainer id="google-map" class="w-full h-full"></div>

        <!-- Map Loading overlay -->
        <div *ngIf="mapLoading()" class="absolute inset-0 bg-[#F2F0EF] flex items-center justify-center">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-[#7B9699] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-[#7D7D7D] text-sm">Loading map...</p>
          </div>
        </div>

        <!-- No map API key placeholder -->
        <div *ngIf="!mapLoading() && !mapReady()"
             class="absolute inset-0 bg-gradient-to-br from-[#BAC8B1] to-[#7B9699] flex flex-col items-center justify-center">
          <div class="text-center text-white px-6">
            <div class="text-6xl mb-4">🗺️</div>
            <h3 class="text-xl font-bold mb-2">Map View</h3>
            <p class="text-sm opacity-90 mb-4">Add your Google Maps API key in<br><code class="bg-black/20 px-2 py-0.5 rounded text-xs">environment.ts</code></p>
            <p class="text-xs opacity-75">Vendors will appear as pins once configured</p>
          </div>
        </div>

        <!-- Selected Vendor Popup (mobile/desktop) -->
        <div *ngIf="selectedVendor()"
             class="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 glass rounded-2xl shadow-lg p-4 fade-in">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#BAC8B1] flex-shrink-0">
              <img *ngIf="selectedVendor()!.shopImage" [src]="selectedVendor()!.shopImage"
                   [alt]="selectedVendor()!.shopName" class="w-full h-full object-cover">
              <span *ngIf="!selectedVendor()!.shopImage" class="w-full h-full flex items-center justify-center text-2xl">🏪</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-[#252525] truncate">{{ selectedVendor()!.shopName }}</h3>
              <app-rating-stars [rating]="selectedVendor()!.rating" [showValue]="true" [size]="13"></app-rating-stars>
            </div>
            <button (click)="clearSelection()" class="text-[#7D7D7D] hover:text-[#252525] text-xl">✕</button>
          </div>
          <div class="flex gap-2">
            <a [routerLink]="['/customer/vendor', selectedVendor()!.id]" class="btn-primary text-sm py-2 px-4 flex-1 justify-center">
              View Shop
            </a>
            <a [href]="getDirectionsUrl(selectedVendor()!)" target="_blank"
               class="btn-secondary text-sm py-2 px-4 flex-1 justify-center">
              🗺️ Navigate
            </a>
            <a [href]="'tel:' + selectedVendor()!.phone"
               class="w-10 h-10 flex items-center justify-center bg-[#BAC8B1] text-[#404E3B] rounded-full hover:bg-[#7B9699] hover:text-white transition-colors">
              📞
            </a>
          </div>
        </div>
      </div>

      <!-- Mobile Toggle Tabs -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E6E6] flex z-50">
        <button (click)="mobileView.set('list')"
                [class]="mobileView() === 'list' ? 'flex-1 py-3 text-[#7B9699] font-semibold text-sm' : 'flex-1 py-3 text-[#7D7D7D] text-sm'"
                class="flex flex-col items-center gap-0.5">
          <span>📋</span><span>List</span>
        </button>
        <button (click)="mobileView.set('map')"
                [class]="mobileView() === 'map' ? 'flex-1 py-3 text-[#7B9699] font-semibold text-sm' : 'flex-1 py-3 text-[#7D7D7D] text-sm'"
                class="flex flex-col items-center gap-0.5">
          <span>🗺️</span><span>Map</span>
        </button>
      </div>
    </div>
  `
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private vendorService = inject(VendorService);
  private chatService = inject(ChatService);
  private notifService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  vendors = signal<Vendor[]>([]);
  selectedVendor = signal<Vendor | null>(null);
  loading = signal(false);
  mapLoading = signal(true);
  mapReady = signal(false);
  mobileView = signal<'list' | 'map'>('list');

  userLocation: { lat: number; lng: number } | null = null;
  searchQuery = '';
  filters: Partial<NearbyVendorsRequest> = {
    radius: 2,
    sort: 'distance',
    inStockOnly: false,
    organicOnly: false
  };

  private map: any;
  private markers: any[] = [];
  private subscription?: Subscription;

  ngOnInit(): void {
    this.getUserLocation();
    // WebSocket connection is optional — only connect if backend is available.
    // Errors are swallowed in ChatService so this won't crash the map page.
    try { this.chatService.connect(); } catch {}
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMaps();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.chatService.disconnect();
  }

  getUserLocation(): void {
    if (!navigator.geolocation) {
      this.notifService.error('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.refreshVendors();
        if (this.map) this.map.setCenter(this.userLocation);
      },
      () => {
        // Default to Delhi NCR for demo
        this.userLocation = { lat: 28.6139, lng: 77.2090 };
        this.refreshVendors();
        this.notifService.info('Using default location. Enable GPS for accurate results.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  refreshVendors(): void {
    if (!this.userLocation) return;
    this.loading.set(true);
    const req: NearbyVendorsRequest = {
      lat: this.userLocation.lat,
      lng: this.userLocation.lng,
      radius: this.filters.radius ?? 2,
      sort: this.filters.sort as any,
      inStockOnly: this.filters.inStockOnly,
      organicOnly: this.filters.organicOnly,
      product: this.searchQuery || undefined
    };
    this.vendorService.getNearbyVendors(req).subscribe({
      next: (res) => {
        this.vendors.set(res.content);
        this.loading.set(false);
        this.updateMapMarkers(res.content);
        res.content.forEach(v => {
          try { this.chatService.subscribeToVendorStock(v.id); } catch {}
        });
      },
      error: () => {
        // Backend not running — show empty state gracefully
        this.loading.set(false);
      }
    });
  }

  onSearchChange(q: string): void {
    clearTimeout((this as any)._searchTimer);
    (this as any)._searchTimer = setTimeout(() => this.refreshVendors(), 400);
  }

  selectVendor(vendor: Vendor): void {
    this.selectedVendor.set(vendor);
    if (this.map) {
      this.map.panTo({ lat: vendor.lat, lng: vendor.lng });
      this.map.setZoom(16);
    }
  }

  clearSelection(): void { this.selectedVendor.set(null); }

  getDirectionsUrl(vendor: Vendor): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${vendor.lat},${vendor.lng}`;
  }

  formatDistance(d: number): string {
    return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
  }

  trackById(_: number, v: Vendor): number { return v.id; }

  getStatusBadge(v: Vendor): string {
    if (!v.isOpen) return 'bg-red-50 text-red-600';
    if (v.status === 'LOW_STOCK') return 'bg-yellow-50 text-yellow-700';
    return 'bg-green-50 text-green-700';
  }

  getStatusDot(v: Vendor): string {
    if (!v.isOpen) return 'bg-red-500 status-closed';
    if (v.status === 'LOW_STOCK') return 'bg-yellow-400 status-low';
    return 'bg-green-500 status-open';
  }

  // ── Google Maps ─────────────────────────────────────────────

  private loadGoogleMaps(): void {
    if ((window as any).google?.maps) {
      this.initMap();
      return;
    }
    const apiKey = environment.googleMapsApiKey;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      // No API key set — just hide the loading spinner and show placeholder
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
    const center = this.userLocation ?? { lat: 28.6139, lng: 77.2090 };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8d5e2' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f2f0ef' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#545454' }] }
      ]
    });

    // User location marker
    new google.maps.Marker({
      position: center,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#7B9699',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3
      },
      title: 'You are here'
    });

    this.mapLoading.set(false);
    this.mapReady.set(true);
    if (this.vendors().length) this.updateMapMarkers(this.vendors());
  }

  private updateMapMarkers(vendors: Vendor[]): void {
    if (!this.map) return;
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    vendors.forEach(vendor => {
      const color = vendor.isOpen ? (vendor.status === 'LOW_STOCK' ? '#FFC107' : '#4CAF50') : '#F44336';
      const marker = new google.maps.Marker({
        position: { lat: vendor.lat, lng: vendor.lng },
        map: this.map,
        title: vendor.shopName,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22)
        }
      });
      marker.addListener('click', () => this.selectVendor(vendor));
      this.markers.push(marker);
    });
  }
}
