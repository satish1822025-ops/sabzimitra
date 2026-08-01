import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VendorDetail } from '../../../core/models';

declare const google: any;

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SkeletonLoaderComponent],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] pb-16">
      <div class="page-container py-6 max-w-2xl mx-auto">
        <div class="flex items-center gap-3 mb-6">
          <a routerLink="/vendor/dashboard" class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E6E6E6] text-lg">←</a>
          <h1 class="text-xl font-bold text-[#252525]">⚙️ Shop Settings</h1>
        </div>

        <div *ngIf="loading()" class="space-y-4">
          <app-skeleton-loader type="profile"></app-skeleton-loader>
        </div>

        <ng-container *ngIf="!loading()">
          <!-- Shop Image Upload -->
          <div class="sm-card p-6 mb-4">
            <h2 class="font-semibold text-[#252525] mb-4">Shop Photos</h2>
            <div class="flex gap-4">
              <div class="text-center">
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-[#BAC8B1] mb-2 flex items-center justify-center text-3xl">
                  <img *ngIf="shopImagePreview()" [src]="shopImagePreview()!" class="w-full h-full object-cover">
                  <span *ngIf="!shopImagePreview()">🏪</span>
                </div>
                <label class="text-xs text-[#7B9699] cursor-pointer hover:underline">
                  Change Logo
                  <input type="file" accept="image/*" class="hidden" (change)="onShopImageChange($event, 'logo')">
                </label>
              </div>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="sm-card p-6 mb-4">
            <h2 class="font-semibold text-[#252525] mb-4">Basic Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Shop Name</label>
                <input [(ngModel)]="form.shopName" type="text" class="sm-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Address</label>
                <input [(ngModel)]="form.address" type="text" class="sm-input" placeholder="Enter full address">
              </div>
            </div>
          </div>

          <!-- Hours -->
          <div class="sm-card p-6 mb-4">
            <h2 class="font-semibold text-[#252525] mb-4">🕐 Opening Hours</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Opens at</label>
                <input [(ngModel)]="form.openingHours" type="time" class="sm-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Closes at</label>
                <input [(ngModel)]="form.closingHours" type="time" class="sm-input">
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="sm-card p-6 mb-4">
            <h2 class="font-semibold text-[#252525] mb-4">💳 Payment Methods</h2>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let method of paymentMethods"
                      (click)="togglePayment(method)"
                      [class]="form.paymentMethods.includes(method) ? 'px-4 py-2 rounded-full bg-[#7B9699] text-white text-sm font-medium' : 'px-4 py-2 rounded-full border border-[#CFCFCF] text-[#545454] text-sm hover:border-[#7B9699]'"
                      class="transition-all">
                {{ method }}
              </button>
            </div>
          </div>

          <!-- Location Map -->
          <div class="sm-card p-6 mb-6">
            <h2 class="font-semibold text-[#252525] mb-2">📍 Shop Location</h2>
            <p class="text-xs text-[#7D7D7D] mb-4">Drag the marker to your exact shop location</p>
            <div id="profile-map" class="w-full h-52 rounded-xl bg-[#BAC8B1]"></div>
            <p class="text-xs text-[#7D7D7D] mt-2">
              Lat: {{ form.lat?.toFixed(6) }}, Lng: {{ form.lng?.toFixed(6) }}
            </p>
          </div>

          <!-- Save Button -->
          <button (click)="saveProfile()" [disabled]="saving()" class="btn-primary w-full justify-center text-base py-3">
            {{ saving() ? 'Saving...' : '💾 Save Changes' }}
          </button>
        </ng-container>
      </div>
    </div>
  `
})
export class VendorProfileComponent implements OnInit {
  private vendorService = inject(VendorService);
  private notifService = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);
  shopImagePreview = signal<string | null>(null);

  form = {
    shopName: '',
    address: '',
    openingHours: '06:00',
    closingHours: '20:00',
    paymentMethods: ['Cash'] as string[],
    lat: 28.6139,
    lng: 77.2090
  };

  paymentMethods = ['Cash', 'UPI', 'Paytm', 'PhonePe', 'Google Pay', 'Card'];

  ngOnInit(): void {
    this.vendorService.getMyProfile().subscribe({
      next: (v) => {
        this.form = {
          shopName: v.shopName,
          address: v.address,
          openingHours: v.openingHours,
          closingHours: v.closingHours,
          paymentMethods: v.paymentMethods ?? ['Cash'],
          lat: v.lat,
          lng: v.lng
        };
        this.shopImagePreview.set(v.shopImage ?? null);
        this.loading.set(false);
        setTimeout(() => this.initMap(), 300);
      },
      error: () => this.loading.set(false)
    });
  }

  togglePayment(method: string): void {
    const idx = this.form.paymentMethods.indexOf(method);
    if (idx >= 0) this.form.paymentMethods.splice(idx, 1);
    else this.form.paymentMethods.push(method);
  }

  onShopImageChange(event: Event, _type: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.shopImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    const fd = new FormData();
    fd.append('image', file);
    this.vendorService.uploadShopImage(fd).subscribe();
  }

  saveProfile(): void {
    this.saving.set(true);
    this.vendorService.updateProfile(this.form).subscribe({
      next: () => { this.saving.set(false); this.notifService.success('Shop profile updated! ✅'); },
      error: () => { this.saving.set(false); this.notifService.error('Failed to save. Try again.'); }
    });
  }

  private initMap(): void {
    if (!(window as any).google?.maps) return;
    const map = new google.maps.Map(document.getElementById('profile-map'), {
      center: { lat: this.form.lat, lng: this.form.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false
    });
    const marker = new google.maps.Marker({
      position: { lat: this.form.lat, lng: this.form.lng },
      map,
      draggable: true,
      title: 'Your shop location'
    });
    marker.addListener('dragend', (e: any) => {
      this.form.lat = e.latLng.lat();
      this.form.lng = e.latLng.lng();
    });
  }
}
