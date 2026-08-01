import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header glass sticky top-0 z-[200] border-b border-[#CFCFCF]">
      <div class="page-container flex items-center justify-between h-16">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 no-underline">
          <div class="w-9 h-9 bg-[#7B9699] rounded-xl flex items-center justify-center shadow-sm">
            <span class="text-white text-lg font-bold">S</span>
          </div>
          <span class="text-[#252525] font-bold text-xl font-[Poppins]">SabziMitra</span>
        </a>

        <!-- Desktop Nav — signal call with () -->
        <nav class="hidden md:flex items-center gap-6" *ngIf="authService.currentUser()">
          <ng-container *ngIf="authService.currentUser()?.role === 'CUSTOMER'">
            <a routerLink="/customer/map" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">🗺️ Map</a>
            <a routerLink="/customer/search" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">🔍 Search</a>
            <a routerLink="/customer/favorites" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">❤️ Favorites</a>
          </ng-container>
          <ng-container *ngIf="authService.currentUser()?.role === 'VENDOR'">
            <a routerLink="/vendor/dashboard" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">📊 Dashboard</a>
            <a routerLink="/vendor/inventory" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">📦 Inventory</a>
            <a routerLink="/vendor/add-product" routerLinkActive="text-[#7B9699] font-semibold"
               class="text-[#545454] hover:text-[#7B9699] transition-colors text-sm font-medium">➕ Add Item</a>
          </ng-container>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-3">
          <ng-container *ngIf="authService.currentUser(); else guestActions">
            <!-- Notification bell -->
            <button (click)="toggleNotifications()"
                    class="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#E6E6E6] transition-colors">
              <span class="text-lg">🔔</span>
              <span *ngIf="(notifService.unreadCount$ | async)! > 0"
                    class="absolute top-0.5 right-0.5 w-4 h-4 bg-[#997E67] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {{ notifService.unreadCount$ | async }}
              </span>
            </button>

            <!-- Avatar + dropdown -->
            <div class="relative">
              <button (click)="toggleMenu()"
                      class="flex items-center gap-2 bg-[#F2F0EF] px-3 py-1.5 rounded-full hover:bg-[#E6E6E6] transition-colors">
                <div class="w-7 h-7 bg-[#7B9699] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ (authService.currentUser()?.name || 'U')[0].toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-[#252525] max-w-[100px] truncate">
                  {{ authService.currentUser()?.name }}
                </span>
                <span class="text-xs text-[#7D7D7D]">▾</span>
              </button>

              <div *ngIf="menuOpen()"
                   class="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-[0_8px_32px_rgba(37,37,37,0.12)] py-2 border border-[#E6E6E6] z-50 fade-in">
                <a routerLink="/vendor/profile" *ngIf="authService.currentUser()?.role === 'VENDOR'"
                   class="flex items-center gap-2 px-4 py-2.5 text-sm text-[#252525] hover:bg-[#F2F0EF] transition-colors">
                  ⚙️ My Shop
                </a>
                <a routerLink="/chat"
                   class="flex items-center gap-2 px-4 py-2.5 text-sm text-[#252525] hover:bg-[#F2F0EF] transition-colors">
                  💬 Messages
                </a>
                <div class="sm-divider my-1"></div>
                <button (click)="logout()"
                        class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[#F5E9E7] transition-colors">
                  🚪 Logout
                </button>
              </div>
            </div>
          </ng-container>

          <ng-template #guestActions>
            <a routerLink="/auth/login" class="btn-secondary text-sm py-2 px-5">Sign In</a>
            <a routerLink="/auth/register" class="btn-primary text-sm py-2 px-5">Get Started</a>
          </ng-template>

          <!-- Mobile hamburger -->
          <button (click)="mobileMenu.set(!mobileMenu())"
                  class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#E6E6E6]">
            <span class="text-lg">☰</span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="mobileMenu()"
           class="md:hidden bg-white border-t border-[#E6E6E6] px-4 py-3 flex flex-col gap-3">
        <ng-container *ngIf="authService.currentUser()?.role === 'CUSTOMER'">
          <a routerLink="/customer/map" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">🗺️ Map</a>
          <a routerLink="/customer/search" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">🔍 Search</a>
          <a routerLink="/customer/favorites" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">❤️ Favorites</a>
        </ng-container>
        <ng-container *ngIf="authService.currentUser()?.role === 'VENDOR'">
          <a routerLink="/vendor/dashboard" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">📊 Dashboard</a>
          <a routerLink="/vendor/inventory" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">📦 Inventory</a>
          <a routerLink="/vendor/add-product" (click)="mobileMenu.set(false)" class="text-[#252525] py-2 font-medium">➕ Add Item</a>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`.header { transition: box-shadow 0.3s; }`]
})
export class HeaderComponent {
  authService  = inject(AuthService);
  notifService = inject(NotificationService);

  menuOpen   = signal(false);
  mobileMenu = signal(false);
  notifOpen  = signal(false);

  toggleMenu(): void           { this.menuOpen.update(v => !v); }
  toggleNotifications(): void  { this.notifOpen.update(v => !v); }
  logout(): void               { this.menuOpen.set(false); this.authService.logout(); }
}
