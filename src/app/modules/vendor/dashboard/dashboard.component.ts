import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorService } from '../../../core/services/vendor.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DashboardStats, VendorDetail } from '../../../core/models';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] pb-16">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-[#404E3B] to-[#7B9699] text-white py-8">
        <div class="page-container">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-white text-2xl font-bold mb-1">Good morning 👋</h1>
              <p class="text-[#BAC8B1] text-sm">{{ vendor()?.shopName || 'Your Shop' }}</p>
            </div>
            <div class="flex items-center gap-3">
              <!-- Live Toggle -->
              <div class="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <div [class]="isOpen() ? 'status-open' : 'status-closed'"></div>
                <span class="text-sm font-semibold">{{ isOpen() ? 'LIVE' : 'OFFLINE' }}</span>
                <label class="relative inline-flex items-center cursor-pointer ml-2">
                  <input type="checkbox" [checked]="isOpen()" (change)="toggleStatus($event)" class="sr-only peer">
                  <div class="w-10 h-6 bg-[#7D7D7D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                </label>
              </div>
              <a routerLink="/vendor/add-product" class="bg-white text-[#7B9699] font-semibold rounded-full px-5 py-2 text-sm hover:bg-[#F2F0EF] transition-colors flex items-center gap-1.5">
                ➕ Add Item
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="page-container py-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <ng-container *ngIf="loading()">
            <div *ngFor="let i of [1,2,3,4]" class="skeleton h-24 rounded-xl"></div>
          </ng-container>
          <ng-container *ngIf="!loading() && stats()">
            <div class="sm-card p-5">
              <p class="text-xs text-[#7D7D7D] uppercase tracking-wider mb-1">Today's Views</p>
              <p class="text-2xl font-bold text-[#252525]">{{ stats()!.totalViews }}</p>
              <span class="text-xs text-[#7B9699]">👁️ customers viewed</span>
            </div>
            <div class="sm-card p-5">
              <p class="text-xs text-[#7D7D7D] uppercase tracking-wider mb-1">Active Items</p>
              <p class="text-2xl font-bold text-[#252525]">{{ stats()!.activeItems }}</p>
              <span class="text-xs text-[#7B9699]">✅ in inventory</span>
            </div>
            <div class="sm-card p-5">
              <p class="text-xs text-[#7D7D7D] uppercase tracking-wider mb-1">Pending Requests</p>
              <p class="text-2xl font-bold text-[#997E67]">{{ stats()!.pendingRequests }}</p>
              <span class="text-xs text-[#997E67]">🔔 customers waiting</span>
            </div>
            <div class="sm-card p-5">
              <p class="text-xs text-[#7D7D7D] uppercase tracking-wider mb-1">Weekly Revenue</p>
              <p class="text-2xl font-bold text-[#404E3B]">₹{{ getTotalRevenue() }}</p>
              <span class="text-xs text-[#7B9699]">📈 this week</span>
            </div>
          </ng-container>
        </div>

        <!-- Quick Actions -->
        <div class="sm-card p-5 mb-6">
          <h2 class="text-lg font-bold text-[#252525] mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a routerLink="/vendor/add-product"
               class="flex flex-col items-center gap-2 p-4 bg-[#F2F0EF] rounded-xl hover:bg-[#BAC8B1]/30 transition-colors cursor-pointer">
              <span class="text-3xl">📸</span>
              <span class="text-xs font-semibold text-[#252525] text-center">Add by Photo</span>
            </a>
            <button (click)="markAllSoldOut()"
                    class="flex flex-col items-center gap-2 p-4 bg-[#F2F0EF] rounded-xl hover:bg-[#F5E9E7] transition-colors">
              <span class="text-3xl">🔴</span>
              <span class="text-xs font-semibold text-[#252525] text-center">Mark All Sold Out</span>
            </button>
            <button (click)="duplicateYesterday()" [disabled]="duplicating()"
                    class="flex flex-col items-center gap-2 p-4 bg-[#F2F0EF] rounded-xl hover:bg-[#BAC8B1]/30 transition-colors disabled:opacity-50">
              <span class="text-3xl">🔄</span>
              <span class="text-xs font-semibold text-[#252525] text-center">{{ duplicating() ? 'Copying...' : "Yesterday's Stock" }}</span>
            </button>
            <a routerLink="/vendor/inventory"
               class="flex flex-col items-center gap-2 p-4 bg-[#F2F0EF] rounded-xl hover:bg-[#BAC8B1]/30 transition-colors">
              <span class="text-3xl">📦</span>
              <span class="text-xs font-semibold text-[#252525] text-center">Manage Items</span>
            </a>
          </div>
        </div>

        <!-- Weekly Revenue Chart (Simple bar chart using CSS) -->
        <div *ngIf="stats()?.weeklyRevenue?.length" class="sm-card p-5 mb-6">
          <h2 class="text-lg font-bold text-[#252525] mb-4">📈 Weekly Revenue</h2>
          <div class="flex items-end gap-2 h-28">
            <div *ngFor="let val of stats()!.weeklyRevenue; let i = index"
                 class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-[#7D7D7D] font-medium">₹{{ val }}</span>
              <div class="w-full rounded-t-md transition-all duration-500"
                   [style.height.%]="getBarHeight(val)"
                   [style.background]="i === 6 ? '#7B9699' : '#BAC8B1'"
                   style="min-height: 4px; max-height: 80px;"></div>
              <span class="text-xs text-[#7D7D7D]">{{ getDayLabel(i) }}</span>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div *ngIf="stats()?.topProducts?.length" class="sm-card p-5">
          <h2 class="text-lg font-bold text-[#252525] mb-4">🏆 Top Products This Week</h2>
          <div class="space-y-3">
            <div *ngFor="let p of stats()!.topProducts; let i = index" class="flex items-center gap-3">
              <span class="w-6 h-6 bg-[#7B9699] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {{ i + 1 }}
              </span>
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-[#252525]">{{ p.name }}</span>
                  <span class="text-sm font-bold text-[#7B9699]">{{ p.count }} sold</span>
                </div>
                <div class="h-1.5 bg-[#E6E6E6] rounded-full">
                  <div class="h-1.5 bg-[#7B9699] rounded-full transition-all duration-700"
                       [style.width.%]="getTopBarWidth(p.count)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VendorDashboardComponent implements OnInit {
  private vendorService = inject(VendorService);
  private notifService = inject(NotificationService);

  vendor = signal<VendorDetail | null>(null);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  isOpen = signal(false);
  duplicating = signal(false);

  private readonly DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  ngOnInit(): void {
    this.vendorService.getMyProfile().subscribe({ next: v => { this.vendor.set(v); this.isOpen.set(v.isOpen); }, error: () => {} });
    this.vendorService.getDashboardStats().subscribe({ next: s => { this.stats.set(s); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  toggleStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.vendorService.updateStatus(checked).subscribe({
      next: () => { this.isOpen.set(checked); this.notifService.success(checked ? 'Your shop is now LIVE! 🟢' : 'Shop set to offline'); }
    });
  }

  markAllSoldOut(): void {
    this.vendorService.markAllSoldOut().subscribe({ next: () => this.notifService.info('All items marked as sold out') });
  }

  duplicateYesterday(): void {
    this.duplicating.set(true);
    this.vendorService.duplicateYesterdayStock().subscribe({
      next: () => { this.duplicating.set(false); this.notifService.success("Yesterday's stock duplicated! ✅"); },
      error: () => this.duplicating.set(false)
    });
  }

  getTotalRevenue(): string {
    const total = this.stats()?.weeklyRevenue?.reduce((a, b) => a + b, 0) ?? 0;
    return total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toString();
  }

  getBarHeight(val: number): number {
    const max = Math.max(...(this.stats()?.weeklyRevenue ?? [1]));
    return max > 0 ? Math.round((val / max) * 100) : 4;
  }

  getDayLabel(i: number): string { return this.DAYS[i] ?? ''; }

  getTopBarWidth(count: number): number {
    const max = Math.max(...(this.stats()?.topProducts?.map(p => p.count) ?? [1]));
    return max > 0 ? Math.round((count / max) * 100) : 10;
  }
}
