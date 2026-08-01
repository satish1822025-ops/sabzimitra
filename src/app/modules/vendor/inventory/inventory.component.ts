import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { InventoryItem, QualityGrade } from '../../../core/models';

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SkeletonLoaderComponent],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] pb-16">
      <div class="page-container py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="mb-1">📦 My Inventory</h1>
            <p class="text-sm text-[#7D7D7D]">{{ activeItems() }} items active</p>
          </div>
          <div class="flex gap-2">
            <button (click)="markAllSoldOut()" class="btn-secondary text-sm py-2 px-4">
              🔴 All Sold Out
            </button>
            <a routerLink="/vendor/add-product" class="btn-primary text-sm py-2 px-4">
              ➕ Add Item
            </a>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex bg-white rounded-xl p-1 mb-5 shadow-sm">
          <button *ngFor="let f of filterTabs" (click)="filter.set(f.value)"
                  [class]="filter() === f.value ? 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#7B9699] text-white transition-all' : 'flex-1 py-2.5 rounded-lg text-sm text-[#7D7D7D] hover:text-[#252525] transition-all'">
            {{ f.label }}
          </button>
        </div>

        <div *ngIf="loading()" class="space-y-3">
          <app-skeleton-loader type="inventory-item" *ngFor="let i of [1,2,3,4,5]"></app-skeleton-loader>
        </div>

        <div *ngIf="!loading() && filteredItems().length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-[#252525] mb-2">No items here</h3>
          <p class="text-[#7D7D7D] text-sm mb-4">Start adding products to your inventory</p>
          <a routerLink="/vendor/add-product" class="btn-primary">📸 Add by Photo</a>
        </div>

        <div class="space-y-3">
          <div *ngFor="let item of filteredItems(); trackBy: trackById"
               class="bg-white rounded-xl border border-[#E6E6E6] overflow-hidden hover:shadow-sm transition-shadow">

            <div class="flex items-center gap-3 p-4">
              <!-- Image -->
              <div class="w-16 h-16 rounded-lg overflow-hidden bg-[#BAC8B1] flex-shrink-0 relative">
                <img [src]="item.customPhoto || item.product.defaultImage || 'assets/placeholder-veg.jpg'"
                     [alt]="item.product.nameEnglish" class="w-full h-full object-cover" loading="lazy">
                <div *ngIf="item.discountPercent > 0"
                     class="absolute -top-1 -right-1 bg-[#997E67] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  -{{ item.discountPercent }}%
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-[#252525] truncate">{{ item.product.nameEnglish }}</p>
                  <span class="text-xs text-[#7D7D7D]">{{ item.product.nameHindi }}</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="price-tag text-base">₹{{ getEffectivePrice(item) }}<span class="per-unit">/kg</span></span>
                  <span class="text-xs text-[#7D7D7D]">{{ item.quantityKg }} kg</span>
                  <span class="text-xs bg-[#E6E6E6] text-[#545454] px-2 py-0.5 rounded-full">Grade {{ item.qualityGrade }}</span>
                </div>
              </div>

              <!-- Toggle Available -->
              <div class="flex flex-col items-end gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [checked]="item.isAvailable"
                         (change)="toggleAvailability(item, $event)" class="sr-only peer">
                  <div class="w-10 h-6 bg-[#7D7D7D] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7B9699]"></div>
                </label>
                <span [class]="item.isAvailable ? 'badge-in-stock' : 'badge-out-of-stock'">
                  {{ item.isAvailable ? 'In Stock' : 'Sold Out' }}
                </span>
              </div>
            </div>

            <!-- Editing Row (inline edit price & quantity) -->
            <div *ngIf="editingId() === item.id" class="px-4 pb-4 pt-0 border-t border-[#F2F0EF] fade-in">
              <div class="flex gap-3 items-center">
                <div class="flex-1">
                  <label class="text-xs text-[#7D7D7D] block mb-1">Price/kg (₹)</label>
                  <input type="number" [(ngModel)]="editPrice" class="sm-input h-9 text-sm" min="1">
                </div>
                <div class="flex-1">
                  <label class="text-xs text-[#7D7D7D] block mb-1">Qty (kg)</label>
                  <input type="number" [(ngModel)]="editQty" class="sm-input h-9 text-sm" min="0.1" step="0.5">
                </div>
                <div class="flex-1">
                  <label class="text-xs text-[#7D7D7D] block mb-1">Discount %</label>
                  <input type="number" [(ngModel)]="editDiscount" class="sm-input h-9 text-sm" min="0" max="90">
                </div>
                <div class="flex gap-2 mt-4">
                  <button (click)="saveEdit(item)" class="btn-primary text-xs py-2 px-3">Save</button>
                  <button (click)="editingId.set(null)" class="btn-secondary text-xs py-2 px-3">Cancel</button>
                </div>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="flex border-t border-[#F2F0EF]">
              <button (click)="startEdit(item)"
                      class="flex-1 py-2.5 text-xs font-medium text-[#7B9699] hover:bg-[#F2F0EF] transition-colors">
                ✏️ Edit
              </button>
              <div class="w-px bg-[#F2F0EF]"></div>
              <button (click)="setDiscount(item)"
                      class="flex-1 py-2.5 text-xs font-medium text-[#997E67] hover:bg-[#FFDBBB]/30 transition-colors">
                🎉 Discount
              </button>
              <div class="w-px bg-[#F2F0EF]"></div>
              <button (click)="deleteItem(item)"
                      class="flex-1 py-2.5 text-xs font-medium text-red-400 hover:bg-[#F5E9E7] transition-colors">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorInventoryComponent implements OnInit {
  private vendorService = inject(VendorService);
  private notifService = inject(NotificationService);

  items = signal<InventoryItem[]>([]);
  loading = signal(true);
  filter = signal<'all' | 'available' | 'sold_out'>('all');
  editingId = signal<number | null>(null);
  editPrice = 0; editQty = 0; editDiscount = 0;

  filterTabs = [
    { value: 'all' as const, label: '📋 All' },
    { value: 'available' as const, label: '✅ In Stock' },
    { value: 'sold_out' as const, label: '🔴 Sold Out' }
  ];

  // Single filteredItems implementation — returns a plain array (called in template as filteredItems())
  filteredItems = (): InventoryItem[] => {
    const all = this.items();
    const f = this.filter();
    if (f === 'available') return all.filter(i => i.isAvailable);
    if (f === 'sold_out') return all.filter(i => !i.isAvailable);
    return all;
  };

  activeItems = (): number => this.items().filter(i => i.isAvailable).length;

  ngOnInit(): void {
    this.vendorService.getMyInventory().subscribe({
      next: items => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getEffectivePrice(item: InventoryItem): number {
    return item.discountPercent > 0
      ? Math.round(item.pricePerKg * (1 - item.discountPercent / 100))
      : item.pricePerKg;
  }

  toggleAvailability(item: InventoryItem, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.vendorService.updateInventoryItem(item.id, { isAvailable: checked } as any).subscribe({
      next: updated => this.items.update(items => items.map(i => i.id === item.id ? updated : i)),
      error: () => this.notifService.error('Failed to update status')
    });
  }

  startEdit(item: InventoryItem): void {
    this.editingId.set(item.id);
    this.editPrice = item.pricePerKg;
    this.editQty = item.quantityKg;
    this.editDiscount = item.discountPercent;
  }

  saveEdit(item: InventoryItem): void {
    this.vendorService.updateInventoryItem(item.id, {
      pricePerKg: this.editPrice,
      quantityKg: this.editQty,
      discountPercent: this.editDiscount
    } as any).subscribe({
      next: updated => {
        this.items.update(items => items.map(i => i.id === item.id ? updated : i));
        this.editingId.set(null);
        this.notifService.success('Item updated!');
      },
      error: () => this.notifService.error('Update failed')
    });
  }

  setDiscount(item: InventoryItem): void {
    this.startEdit(item);
  }

  deleteItem(item: InventoryItem): void {
    if (!confirm(`Remove ${item.product.nameEnglish} from inventory?`)) return;
    this.vendorService.deleteInventoryItem(item.id).subscribe({
      next: () => { this.items.update(items => items.filter(i => i.id !== item.id)); this.notifService.info('Item removed'); },
      error: () => this.notifService.error('Failed to delete')
    });
  }

  markAllSoldOut(): void {
    this.vendorService.markAllSoldOut().subscribe({
      next: () => { this.items.update(items => items.map(i => ({ ...i, isAvailable: false }))); this.notifService.info('All items marked sold out'); }
    });
  }

  trackById(_: number, item: InventoryItem): number { return item.id; }
}
