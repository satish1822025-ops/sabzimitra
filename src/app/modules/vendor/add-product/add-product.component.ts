import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QualityGrade, ProductIdentifyResponse } from '../../../core/models';

const COMMON_ITEMS = [
  { name: 'Tomato', nameHindi: 'टमाटर', emoji: '🍅', defaultPrice: 40 },
  { name: 'Potato', nameHindi: 'आलू', emoji: '🥔', defaultPrice: 25 },
  { name: 'Onion', nameHindi: 'प्याज', emoji: '🧅', defaultPrice: 30 },
  { name: 'Spinach', nameHindi: 'पालक', emoji: '🥬', defaultPrice: 20 },
  { name: 'Carrot', nameHindi: 'गाजर', emoji: '🥕', defaultPrice: 35 },
  { name: 'Cauliflower', nameHindi: 'फूलगोभी', emoji: '🥦', defaultPrice: 45 },
  { name: 'Cucumber', nameHindi: 'खीरा', emoji: '🥒', defaultPrice: 25 },
  { name: 'Peas', nameHindi: 'मटर', emoji: '🫛', defaultPrice: 60 }
];

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] pb-16">
      <div class="page-container py-6 max-w-lg mx-auto">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <a routerLink="/vendor/inventory" class="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E6E6E6] text-[#252525] hover:bg-[#F2F0EF] text-lg">←</a>
          <h1 class="text-xl font-bold text-[#252525]">Add Item</h1>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center mb-8">
          <div *ngFor="let s of steps; let i = index; let last = last" class="flex items-center flex-1">
            <div class="flex flex-col items-center">
              <div [class]="step() > i + 1 ? 'w-8 h-8 rounded-full bg-[#7B9699] text-white flex items-center justify-center text-sm font-bold' :
                            step() === i + 1 ? 'w-8 h-8 rounded-full bg-[#404E3B] text-white flex items-center justify-center text-sm font-bold' :
                            'w-8 h-8 rounded-full bg-[#CFCFCF] text-[#7D7D7D] flex items-center justify-center text-sm font-bold'">
                {{ step() > i + 1 ? '✓' : (i + 1) }}
              </div>
              <span class="text-[9px] text-[#7D7D7D] mt-1 whitespace-nowrap">{{ s }}</span>
            </div>
            <div *ngIf="!last" class="flex-1 h-0.5 mb-4" [class]="step() > i + 1 ? 'bg-[#7B9699]' : 'bg-[#CFCFCF]'"></div>
          </div>
        </div>

        <!-- ─── STEP 1: Choose Method ────────────────────────── -->
        <div *ngIf="step() === 1" class="fade-in">
          <div class="sm-card p-6 mb-4">
            <h2 class="text-lg font-bold text-[#252525] mb-2">How do you want to add?</h2>
            <p class="text-sm text-[#7D7D7D] mb-5">Take a photo and let AI identify it, or pick from common items</p>

            <!-- Photo Upload -->
            <input #fileInput type="file" accept="image/*" capture="environment"
                   class="hidden" (change)="onFileSelected($event)">
            <button (click)="fileInput.click()"
                    class="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[#7B9699] bg-[#F2F0EF] hover:bg-[#BAC8B1]/20 transition-colors mb-3">
              <span class="text-5xl">📸</span>
              <div class="text-center">
                <p class="font-semibold text-[#252525]">Take / Upload Photo</p>
                <p class="text-xs text-[#7D7D7D] mt-1">AI will identify the vegetable automatically</p>
              </div>
            </button>

            <div class="text-center text-[#7D7D7D] text-sm my-4">— or pick from common items —</div>
          </div>

          <!-- Common Items Grid -->
          <div class="sm-card p-5">
            <h3 class="font-semibold text-[#252525] mb-3">🛒 Quick Add</h3>
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let item of commonItems" (click)="selectCommonItem(item)"
                      class="flex flex-col items-center gap-1 p-3 rounded-xl border border-[#E6E6E6] bg-[#F2F0EF] hover:border-[#7B9699] hover:bg-[#BAC8B1]/20 transition-all">
                <span class="text-2xl">{{ item.emoji }}</span>
                <span class="text-[10px] font-medium text-[#252525] text-center leading-tight">{{ item.name }}</span>
                <span class="text-[9px] text-[#7D7D7D]">{{ item.nameHindi }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ─── STEP 2: Identify / Confirm ──────────────────── -->
        <div *ngIf="step() === 2" class="fade-in">
          <div class="sm-card p-6">
            <div *ngIf="identifying()" class="text-center py-8">
              <div class="w-16 h-16 border-4 border-[#7B9699] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="font-semibold text-[#252525]">Identifying vegetable...</p>
              <p class="text-xs text-[#7D7D7D] mt-1">AI is analyzing your photo</p>
            </div>

            <!-- Preview Image -->
            <div *ngIf="previewUrl() && !identifying()" class="mb-5">
              <img [src]="previewUrl()!" alt="Preview" class="w-full h-52 object-cover rounded-xl">
            </div>

            <!-- Predictions -->
            <div *ngIf="predictions().length && !identifying()">
              <h3 class="font-semibold text-[#252525] mb-1">Is this correct?</h3>
              <p class="text-xs text-[#7D7D7D] mb-4">AI identified — tap the correct one</p>
              <div class="space-y-2">
                <button *ngFor="let pred of predictions()" (click)="confirmPrediction(pred)"
                        [class]="selectedPrediction()?.name === pred.name ? 'w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#7B9699] bg-[#F2F0EF]' : 'w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#E6E6E6] bg-white hover:border-[#BAC8B1]'"
                        class="transition-all">
                  <div class="w-12 h-12 rounded-lg overflow-hidden bg-[#BAC8B1] flex-shrink-0 flex items-center justify-center">
                    <img *ngIf="pred.image" [src]="pred.image" [alt]="pred.name" class="w-full h-full object-cover">
                    <span *ngIf="!pred.image" class="text-2xl">🥬</span>
                  </div>
                  <div class="text-left flex-1">
                    <p class="font-semibold text-[#252525]">{{ pred.name }}</p>
                    <p class="text-sm text-[#7D7D7D]">{{ pred.nameHindi }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold" [class]="pred.confidence > 80 ? 'text-[#7B9699]' : 'text-[#997E67]'">
                      {{ pred.confidence }}%
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Manual Entry fallback -->
            <div *ngIf="!predictions().length && !identifying()" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Vegetable Name (English)</label>
                <input [(ngModel)]="manualName" type="text" placeholder="e.g. Tomato" class="sm-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">नाम (हिंदी)</label>
                <input [(ngModel)]="manualNameHindi" type="text" placeholder="e.g. टमाटर" class="sm-input">
              </div>
            </div>

            <div class="flex gap-3 mt-5">
              <button (click)="step.set(1)" class="btn-secondary flex-1">← Back</button>
              <button (click)="goToStep3()" [disabled]="!canProceedStep2()"
                      class="btn-primary flex-1">
                Next →
              </button>
            </div>
          </div>
        </div>

        <!-- ─── STEP 3: Quantity & Price ──────────────────────── -->
        <div *ngIf="step() === 3" class="fade-in">
          <div class="sm-card p-6">
            <!-- Selected product header -->
            <div class="flex items-center gap-3 p-3 bg-[#F2F0EF] rounded-xl mb-6">
              <span class="text-3xl">{{ getSelectedEmoji() }}</span>
              <div>
                <p class="font-bold text-[#252525]">{{ productName() }}</p>
                <p class="text-sm text-[#7D7D7D]">{{ productNameHindi() }}</p>
              </div>
            </div>

            <!-- Price per kg -->
            <div class="mb-5">
              <label class="block text-sm font-semibold text-[#252525] mb-2">
                💰 Price per kg (₹)
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D7D7D] font-semibold text-lg">₹</span>
                <input type="number" [(ngModel)]="price" min="1" max="9999"
                       class="sm-input pl-8 text-2xl font-bold h-14">
              </div>
            </div>

            <!-- Quantity Slider -->
            <div class="mb-5">
              <div class="flex justify-between mb-2">
                <label class="text-sm font-semibold text-[#252525]">📦 Quantity</label>
                <span class="text-[#7B9699] font-bold">{{ quantity }} kg</span>
              </div>
              <input type="range" [(ngModel)]="quantity" min="0.5" max="100" step="0.5"
                     class="w-full h-2 bg-[#CFCFCF] rounded-full appearance-none cursor-pointer accent-[#7B9699]">
              <div class="flex justify-between text-xs text-[#7D7D7D] mt-1">
                <span>0.5 kg</span>
                <span>50 kg</span>
                <span>100 kg</span>
              </div>
            </div>

            <!-- Quality Grade -->
            <div class="mb-5">
              <label class="block text-sm font-semibold text-[#252525] mb-3">⭐ Quality Grade</label>
              <div class="grid grid-cols-3 gap-3">
                <button *ngFor="let g of grades" (click)="quality = g.value"
                        [class]="quality === g.value ? 'p-3 rounded-xl border-2 border-[#7B9699] bg-[#F2F0EF] text-center' : 'p-3 rounded-xl border-2 border-[#E6E6E6] bg-white text-center hover:border-[#BAC8B1]'"
                        class="transition-all">
                  <div class="text-2xl mb-1">{{ g.icon }}</div>
                  <div class="font-semibold text-sm text-[#252525]">Grade {{ g.value }}</div>
                  <div class="text-xs text-[#7D7D7D]">{{ g.desc }}</div>
                </button>
              </div>
            </div>

            <!-- Discount -->
            <div class="mb-6">
              <div class="flex justify-between mb-2">
                <label class="text-sm font-semibold text-[#252525]">🎉 Discount (optional)</label>
                <span class="text-[#997E67] font-bold">{{ discount }}%</span>
              </div>
              <input type="range" [(ngModel)]="discount" min="0" max="70" step="5"
                     class="w-full h-2 bg-[#CFCFCF] rounded-full appearance-none cursor-pointer accent-[#997E67]">
            </div>

            <!-- Preview effective price -->
            <div *ngIf="discount > 0" class="bg-[#FFDBBB]/40 rounded-xl p-3 mb-5 flex items-center justify-between">
              <span class="text-sm text-[#664930]">🎉 Discounted price:</span>
              <div>
                <span class="text-[#7D7D7D] line-through text-sm mr-2">₹{{ price }}</span>
                <span class="text-[#664930] font-bold text-lg">₹{{ effectivePrice }}</span>
                <span class="text-xs text-[#7D7D7D]">/kg</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button (click)="step.set(2)" class="btn-secondary flex-1">← Back</button>
              <button (click)="goLive()" [disabled]="submitting() || price <= 0"
                      class="btn-primary flex-1 text-base">
                {{ submitting() ? 'Going Live...' : '🚀 Go Live!' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ─── STEP 4: Success ──────────────────────────────── -->
        <div *ngIf="step() === 4" class="text-center py-12 fade-in">
          <div class="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 class="text-[#252525] mb-2">Item is Live!</h2>
          <p class="text-[#7D7D7D] text-sm mb-8">Customers near you can see <strong>{{ productName() }}</strong> now</p>
          <div class="flex flex-col gap-3 max-w-xs mx-auto">
            <button (click)="addAnother()" class="btn-primary justify-center">➕ Add Another Item</button>
            <a routerLink="/vendor/inventory" class="btn-secondary justify-center">📦 View Inventory</a>
            <a routerLink="/vendor/dashboard" class="text-sm text-[#7B9699] hover:underline">← Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddProductComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private vendorService = inject(VendorService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  step = signal(1);
  identifying = signal(false);
  submitting = signal(false);
  previewUrl = signal<string | null>(null);
  predictions = signal<ProductIdentifyResponse['predictions']>([]);
  selectedPrediction = signal<ProductIdentifyResponse['predictions'][0] | null>(null);

  productName = signal('');
  productNameHindi = signal('');
  selectedProductId = signal<number | null>(null);

  manualName = '';
  manualNameHindi = '';
  price = 0;
  quantity = 5;
  quality: QualityGrade = 'A';
  discount = 0;

  steps = ['Choose', 'Identify', 'Details', 'Done'];
  commonItems = COMMON_ITEMS;
  grades = [
    { value: 'A' as QualityGrade, icon: '🌟', desc: 'Premium' },
    { value: 'B' as QualityGrade, icon: '✅', desc: 'Good' },
    { value: 'C' as QualityGrade, icon: '👍', desc: 'Regular' }
  ];

  get effectivePrice(): number {
    return this.discount > 0 ? Math.round(this.price * (1 - this.discount / 100)) : this.price;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
    this.step.set(2);
    this.identifying.set(true);
    this.predictions.set([]);

    const formData = new FormData();
    formData.append('image', file);
    this.vendorService.identifyProduct(formData).subscribe({
      next: (res: ProductIdentifyResponse) => {
        this.predictions.set(res.predictions);
        this.identifying.set(false);
      },
      error: () => {
        this.identifying.set(false);
        this.notifService.warning('Could not identify. Please enter manually.');
      }
    });
  }

  selectCommonItem(item: typeof COMMON_ITEMS[0]): void {
    this.productName.set(item.name);
    this.productNameHindi.set(item.nameHindi);
    this.price = item.defaultPrice;
    this.step.set(3);
  }

  confirmPrediction(pred: ProductIdentifyResponse['predictions'][0]): void {
    this.selectedPrediction.set(pred);
    this.productName.set(pred.name);
    this.productNameHindi.set(pred.nameHindi);
    this.selectedProductId.set(pred.productId ?? null);
  }

  canProceedStep2(): boolean {
    if (this.identifying()) return false;
    if (this.selectedPrediction()) return true;
    return !!(this.manualName.trim());
  }

  goToStep3(): void {
    if (!this.selectedPrediction() && this.manualName) {
      this.productName.set(this.manualName);
      this.productNameHindi.set(this.manualNameHindi);
    }
    this.step.set(3);
  }

  goLive(): void {
    this.submitting.set(true);
    this.vendorService.addInventoryItem({
      productId: this.selectedProductId() ?? undefined,
      productNameEnglish: this.productName(),
      productNameHindi: this.productNameHindi(),
      quantityKg: this.quantity,
      pricePerKg: this.price,
      qualityGrade: this.quality,
      discountPercent: this.discount
    }).subscribe({
      next: () => { this.submitting.set(false); this.step.set(4); },
      error: () => { this.submitting.set(false); this.notifService.error('Failed to add item. Try again.'); }
    });
  }

  addAnother(): void {
    this.step.set(1);
    this.previewUrl.set(null);
    this.predictions.set([]);
    this.selectedPrediction.set(null);
    this.productName.set('');
    this.productNameHindi.set('');
    this.price = 0; this.quantity = 5; this.quality = 'A'; this.discount = 0;
    this.manualName = ''; this.manualNameHindi = '';
  }

  getSelectedEmoji(): string {
    const found = COMMON_ITEMS.find(i => i.name === this.productName());
    return found?.emoji ?? '🥬';
  }
}
