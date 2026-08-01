import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../../core/services/vendor.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VendorDetail, InventoryItem, Review } from '../../../core/models';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, RatingStarsComponent, SkeletonLoaderComponent],
  template: `
    <div class="min-h-screen bg-[#F2F0EF]">
      <!-- Loading -->
      <div *ngIf="loading()" class="page-container py-8">
        <app-skeleton-loader type="profile" class="block mb-4"></app-skeleton-loader>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <app-skeleton-loader *ngFor="let i of [1,2,3,4]" type="inventory-item"></app-skeleton-loader>
        </div>
      </div>

      <ng-container *ngIf="!loading() && vendor()">
        <!-- Hero Cover -->
        <div class="relative h-56 md:h-72 bg-[#BAC8B1] overflow-hidden">
          <img *ngIf="vendor()!.coverImage" [src]="vendor()!.coverImage" [alt]="vendor()!.shopName"
               class="w-full h-full object-cover">
          <div *ngIf="!vendor()!.coverImage"
               class="w-full h-full flex items-center justify-center"
               style="background: linear-gradient(135deg, #BAC8B1, #7B9699)">
            <span class="text-8xl">🏪</span>
          </div>
          <!-- Gradient overlay -->
          <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(37,37,37,0.7) 0%, transparent 60%)"></div>
          <!-- Back button -->
          <a routerLink="/customer/map" class="absolute top-4 left-4 glass w-10 h-10 rounded-full flex items-center justify-center text-[#252525] hover:bg-white/90 transition-colors">
            ←
          </a>
          <!-- Favorite button -->
          <button (click)="toggleFavorite()" class="absolute top-4 right-4 glass w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-white/90 transition-colors">
            {{ isFavorite() ? '❤️' : '🤍' }}
          </button>
        </div>

        <!-- Vendor Info Card -->
        <div class="page-container -mt-16 relative z-10">
          <div class="sm-card p-6 mb-4">
            <div class="flex items-start gap-4">
              <div class="w-20 h-20 rounded-2xl overflow-hidden bg-[#BAC8B1] shadow-lg flex-shrink-0 -mt-12 border-4 border-white">
                <img *ngIf="vendor()!.shopImage" [src]="vendor()!.shopImage" [alt]="vendor()!.shopName" class="w-full h-full object-cover">
                <span *ngIf="!vendor()!.shopImage" class="w-full h-full flex items-center justify-center text-3xl">🏪</span>
              </div>
              <div class="flex-1 min-w-0 pt-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-[#252525]">{{ vendor()!.shopName }}</h1>
                  <span *ngIf="vendor()!.isVerified" class="badge-verified text-xs">✅ Verified</span>
                  <span *ngIf="vendor()!.subscriptionTier !== 'FREE'" class="badge-pro text-xs">{{ vendor()!.subscriptionTier }}</span>
                </div>
                <div class="flex items-center gap-3 mt-1">
                  <app-rating-stars [rating]="vendor()!.rating" [count]="vendor()!.reviewCount"
                                    [showCount]="true" [showValue]="true" [size]="14"></app-rating-stars>
                </div>
                <p class="text-[#7D7D7D] text-sm mt-1 truncate">📍 {{ vendor()!.address }}</p>
              </div>
            </div>

            <!-- Status & Hours -->
            <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#E6E6E6]">
              <div class="flex items-center gap-1.5">
                <span [class]="vendor()!.isOpen ? 'status-open' : 'status-closed'"></span>
                <span class="text-sm font-medium" [class]="vendor()!.isOpen ? 'text-green-600' : 'text-red-500'">
                  {{ vendor()!.isOpen ? 'Open Now' : 'Closed' }}
                </span>
              </div>
              <span class="text-[#7D7D7D] text-sm">🕐 {{ vendor()!.openingHours }} – {{ vendor()!.closingHours }}</span>
              <div class="flex gap-1.5">
                <span *ngFor="let m of vendor()!.paymentMethods"
                      class="text-xs bg-[#F2F0EF] text-[#545454] px-2.5 py-1 rounded-full border border-[#E6E6E6]">
                  {{ m }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mt-4">
              <a [href]="'tel:' + vendor()!.phone" class="btn-primary flex-1 justify-center text-sm py-2.5">
                📞 Call
              </a>
              <a [href]="getWhatsAppUrl()" target="_blank" class="bg-[#25D366] text-white flex-1 justify-center rounded-full text-sm font-semibold py-2.5 flex items-center gap-1.5 hover:bg-[#1da851] transition-colors">
                💬 WhatsApp
              </a>
              <a [href]="getDirectionsUrl()" target="_blank" class="btn-secondary flex-1 justify-center text-sm py-2.5">
                🗺️ Navigate
              </a>
              <a [routerLink]="['/chat']" [queryParams]="{userId: vendor()!.userId}"
                 class="w-11 h-11 flex items-center justify-center bg-[#F2F0EF] text-[#252525] rounded-full hover:bg-[#E6E6E6] border border-[#E6E6E6] transition-colors text-lg">
                ✉️
              </a>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex bg-white rounded-xl p-1 mb-4 shadow-sm">
            <button *ngFor="let tab of tabs" (click)="activeTab.set(tab.id)"
                    [class]="activeTab() === tab.id ? 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#7B9699] text-white transition-all' : 'flex-1 py-2.5 rounded-lg text-sm font-medium text-[#7D7D7D] hover:text-[#252525] transition-all'">
              {{ tab.label }}
            </button>
          </div>

          <!-- Inventory Tab -->
          <div *ngIf="activeTab() === 'inventory'" class="fade-in">
            <div class="flex items-center justify-between mb-3">
              <h2 class="section-title mb-0">Available Items</h2>
              <span class="text-xs text-[#7D7D7D]">Updated {{ lastUpdated() }}</span>
            </div>

            <div *ngIf="!vendor()!.inventory?.length" class="text-center py-10">
              <div class="text-5xl mb-3">📭</div>
              <p class="text-[#7D7D7D]">No items listed yet</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div *ngFor="let item of vendor()!.inventory; trackBy: trackById"
                   class="bg-white rounded-xl overflow-hidden border border-[#E6E6E6] hover:shadow-md transition-shadow">
                <div class="flex gap-3 p-3">
                  <div class="w-16 h-16 rounded-lg overflow-hidden bg-[#BAC8B1] flex-shrink-0">
                    <img [src]="item.customPhoto || item.product.defaultImage || 'assets/placeholder-veg.jpg'"
                         [alt]="item.product.nameEnglish" class="w-full h-full object-cover"
                         loading="lazy">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-1">
                      <div>
                        <p class="font-semibold text-sm text-[#252525]">{{ item.product.nameEnglish }}</p>
                        <p class="text-xs text-[#7D7D7D]">{{ item.product.nameHindi }}</p>
                      </div>
                      <span [class]="item.isAvailable ? 'badge-in-stock' : 'badge-out-of-stock'">
                        {{ item.isAvailable ? 'In Stock' : 'Out' }}
                      </span>
                    </div>
                    <div class="flex items-end justify-between mt-2">
                      <div>
                        <span *ngIf="item.discountPercent > 0" class="price-tag text-sm">
                          <span class="strikethrough text-sm">₹{{ item.pricePerKg }}</span>
                          ₹{{ getEffectivePrice(item) }}<span class="per-unit">/kg</span>
                        </span>
                        <span *ngIf="!item.discountPercent" class="price-tag text-sm">
                          ₹{{ item.pricePerKg }}<span class="per-unit">/kg</span>
                        </span>
                        <div class="text-xs text-[#7D7D7D] mt-0.5">{{ item.quantityKg }}kg · Grade {{ item.qualityGrade }}</div>
                      </div>
                      <button *ngIf="!item.isAvailable" (click)="requestItem(item)"
                              class="text-xs text-[#7B9699] border border-[#7B9699] px-2.5 py-1 rounded-full hover:bg-[#7B9699] hover:text-white transition-colors">
                        Request
                      </button>
                    </div>
                  </div>
                </div>
                <div *ngIf="item.discountPercent > 0" class="bg-[#FFDBBB] px-3 py-1 flex items-center gap-1">
                  <span class="text-xs font-semibold text-[#664930]">🎉 {{ item.discountPercent }}% OFF today!</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div *ngIf="activeTab() === 'reviews'" class="fade-in">
            <!-- Add Review -->
            <div *ngIf="authService.currentUser()?.role === 'CUSTOMER'" class="sm-card p-4 mb-4">
              <h3 class="font-semibold text-[#252525] mb-3">Leave a Review</h3>
              <app-rating-stars (ratingChange)="newRating = $event" [rating]="newRating" [interactive]="true" [size]="28"></app-rating-stars>
              <textarea [(ngModel)]="newComment" placeholder="Share your experience..."
                        rows="3" class="sm-input mt-3 resize-none"></textarea>
              <button (click)="submitReview()" [disabled]="newRating === 0 || submittingReview()"
                      class="btn-primary mt-3 py-2 px-6">
                {{ submittingReview() ? 'Posting...' : 'Post Review' }}
              </button>
            </div>

            <!-- Reviews List -->
            <div *ngIf="vendor()!.reviews?.length === 0" class="text-center py-10">
              <div class="text-5xl mb-3">⭐</div>
              <p class="text-[#7D7D7D]">No reviews yet. Be the first!</p>
            </div>
            <div *ngFor="let review of vendor()!.reviews" class="sm-card p-4 mb-3">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-[#7B9699] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ review.customerName[0] }}
                  </div>
                  <span class="font-medium text-sm text-[#252525]">{{ review.customerName }}</span>
                </div>
                <app-rating-stars [rating]="review.rating" [size]="14"></app-rating-stars>
              </div>
              <p class="text-[#545454] text-sm">{{ review.comment }}</p>
              <p class="text-xs text-[#7D7D7D] mt-2">{{ review.createdAt | date:'mediumDate' }}</p>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class VendorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private vendorService = inject(VendorService);
  authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private chatService = inject(ChatService);

  vendor = signal<VendorDetail | null>(null);
  loading = signal(true);
  isFavorite = signal(false);
  activeTab = signal<'inventory' | 'reviews'>('inventory');
  submittingReview = signal(false);
  newRating = 0;
  newComment = '';

  tabs = [
    { id: 'inventory' as const, label: '🛒 Inventory' },
    { id: 'reviews' as const, label: '⭐ Reviews' }
  ];

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.vendorService.getVendorById(id).subscribe({
      next: (v) => { this.vendor.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    // Subscribe to live stock updates
    this.chatService.stockUpdates$.subscribe(update => {
      if (update.vendorId === id && this.vendor()) {
        // Refresh inventory item
        const inv = this.vendor()!.inventory.map(item =>
          item.id === update.itemId ? { ...item, ...update } : item
        );
        this.vendor.set({ ...this.vendor()!, inventory: inv });
      }
    });
  }

  lastUpdated(): string {
    const inv = this.vendor()?.inventory;
    if (!inv?.length) return 'N/A';
    const latest = inv.reduce((a, b) => new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b);
    const diff = (Date.now() - new Date(latest.updatedAt).getTime()) / 60000;
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  }

  getEffectivePrice(item: InventoryItem): number {
    return Math.round(item.pricePerKg * (1 - item.discountPercent / 100));
  }

  toggleFavorite(): void {
    const id = this.vendor()!.id;
    if (this.isFavorite()) {
      this.vendorService.removeFromFavorites(id).subscribe({ next: () => { this.isFavorite.set(false); this.notifService.info('Removed from favorites'); } });
    } else {
      this.vendorService.addToFavorites(id).subscribe({ next: () => { this.isFavorite.set(true); this.notifService.success('Added to favorites! ❤️'); } });
    }
  }

  getWhatsAppUrl(): string {
    const v = this.vendor()!;
    const items = v.inventory.filter(i => i.isAvailable).slice(0, 2)
      .map(i => `${i.product.nameEnglish} ₹${i.pricePerKg}/kg`).join(', ');
    const msg = `Hi ${v.shopName}, I saw you have ${items || 'fresh produce'}. Is it still available?`;
    return `https://wa.me/${v.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  }

  getDirectionsUrl(): string {
    const v = this.vendor()!;
    return `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`;
  }

  requestItem(item: InventoryItem): void {
    this.vendorService.requestItem(this.vendor()!.id, item.product.nameEnglish).subscribe({
      next: () => this.notifService.success(`Request sent to ${this.vendor()!.shopName}!`)
    });
  }

  submitReview(): void {
    if (this.newRating === 0) return;
    this.submittingReview.set(true);
    this.vendorService.addReview(this.vendor()!.id, this.newRating, this.newComment).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.notifService.success('Review posted! Thank you 🙏');
        this.newRating = 0;
        this.newComment = '';
      },
      error: () => this.submittingReview.set(false)
    });
  }

  trackById(_: number, item: InventoryItem): number { return item.id; }
}
