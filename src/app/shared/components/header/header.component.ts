import { Component, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: 'Explore', icon: 'map', path: '/customer/map' },
  { label: 'Search', icon: 'search', path: '/customer/search' },
  { label: 'Saved', icon: 'heart', path: '/customer/favorites' },
];

const VENDOR_NAV: NavItem[] = [
  { label: 'Overview', icon: 'layout-dashboard', path: '/vendor/dashboard' },
  { label: 'Inventory', icon: 'package', path: '/vendor/inventory' },
  { label: 'Add Item', icon: 'plus', path: '/vendor/add-product' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, DatePipe, IconComponent],
  template: `
    <header
      class="sticky top-0 z-[200] border-b border-line"
      [class.is-scrolled]="scrolled()"
      [class.bg-transparent]="!scrolled()"
      style="backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);"
      [style.background]="scrolled() ? 'color-mix(in srgb, var(--bg) 82%, transparent)' : 'color-mix(in srgb, var(--bg) 60%, transparent)'"
    >
      <div class="page-container flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <!-- Brand -->
        <a routerLink="/" class="group flex items-center gap-2.5" aria-label="SabziMitra home">
          <span
            class="relative flex h-9 w-9 items-center justify-center rounded-[12px] border border-line-2 bg-surface-2 transition-transform duration-300 group-hover:-rotate-6"
            style="box-shadow: inset 0 1px 0 var(--sheen)"
          >
            <span class="text-brand-bright"><app-icon name="leaf" [size]="19" /></span>
          </span>
          <span class="flex flex-col leading-none">
            <span class="font-display text-[1.3rem] tracking-tight text-fg">SabziMitra</span>
            <span class="hidden text-[0.5625rem] font-bold uppercase tracking-[0.22em] text-fg-3 sm:block">
              Fresh, sourced near you
            </span>
          </span>
        </a>

        <!-- Desktop nav -->
        @if (navItems().length) {
          <nav class="hidden items-center gap-1 rounded-full border border-line bg-surface-2/60 p-1 md:flex">
            @for (item of navItems(); track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="nav-active"
                class="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-fg-3 transition-colors hover:text-fg"
              >
                <app-icon [name]="item.icon" [size]="16" />
                {{ item.label }}
              </a>
            }
          </nav>
        }

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-icon"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
          >
            <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="17" />
          </button>

          @if (auth.currentUser(); as user) {
            <!-- Notifications -->
            <div class="relative">
              <button
                type="button"
                class="btn-icon"
                (click)="toggle('notif')"
                aria-label="Notifications"
                [attr.aria-expanded]="open() === 'notif'"
              >
                <app-icon name="bell" [size]="17" />
                @if ((notif.unreadCount$ | async) || 0) {
                  <span
                    class="absolute right-1 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-extrabold text-accent-fg"
                  >
                    {{ notif.unreadCount$ | async }}
                  </span>
                }
              </button>

              @if (open() === 'notif') {
                <div
                  class="absolute right-0 top-[calc(100%+0.6rem)] w-[21rem] overflow-hidden rounded-lg border border-line-2 bg-surface shadow-lg scale-in"
                  role="menu"
                >
                  <div class="flex items-center justify-between border-b border-line px-4 py-3">
                    <span class="text-sm font-bold text-fg">Notifications</span>
                    <button type="button" class="text-xs font-semibold text-brand-bright hover:underline" (click)="markAll()">
                      Mark all read
                    </button>
                  </div>
                  <div class="max-h-[19rem] overflow-y-auto">
                    @for (n of (notif.notifications$ | async) || []; track n.id) {
                      <button
                        type="button"
                        class="flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-2"
                        (click)="notif.markAsRead(n.id).subscribe()"
                      >
                        <span
                          class="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full"
                          [style.background]="'var(--brand-soft)'"
                          [style.color]="'var(--brand-bright)'"
                        >
                          <app-icon [name]="notifIcon(n.type)" [size]="15" />
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="flex items-center gap-2">
                            <span class="truncate text-[0.8125rem] font-semibold text-fg">{{ n.title }}</span>
                            @if (!n.isRead) {
                              <span class="dot dot-open"></span>
                            }
                          </span>
                          <span class="mt-0.5 block line-clamp-2 text-xs text-fg-3">{{ n.body }}</span>
                          <span class="mt-1 block text-[0.6875rem] text-fg-3">{{ n.createdAt | date: 'short' }}</span>
                        </span>
                      </button>
                    } @empty {
                      <div class="flex flex-col items-center gap-2 px-4 py-10 text-center">
                        <span class="text-fg-3"><app-icon name="bell" [size]="26" /></span>
                        <p class="text-xs text-fg-3">You're all caught up.</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Account -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-2.5 transition-colors hover:border-line-2 hover:bg-surface-3"
                (click)="toggle('menu')"
                [attr.aria-expanded]="open() === 'menu'"
              >
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[0.6875rem] font-extrabold text-brand-fg"
                >
                  {{ initials(user.name) }}
                </span>
                <span class="hidden max-w-[7rem] truncate text-[0.8125rem] font-semibold text-fg sm:block">
                  {{ user.name }}
                </span>
                <span class="text-fg-3"><app-icon name="chevron-down" [size]="14" /></span>
              </button>

              @if (open() === 'menu') {
                <div
                  class="absolute right-0 top-[calc(100%+0.6rem)] w-56 overflow-hidden rounded-lg border border-line-2 bg-surface p-1.5 shadow-lg scale-in"
                  role="menu"
                >
                  <div class="mb-1 flex items-center gap-3 rounded-md px-2.5 py-2.5">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-extrabold text-brand-fg"
                    >
                      {{ initials(user.name) }}
                    </span>
                    <span class="min-w-0">
                      <span class="block truncate text-[0.8125rem] font-bold text-fg">{{ user.name }}</span>
                      <span class="block truncate text-[0.6875rem] uppercase tracking-wider text-fg-3">
                        {{ user.role }}
                      </span>
                    </span>
                  </div>
                  <div class="hairline my-1"></div>

                  @if (user.role === 'VENDOR') {
                    <a routerLink="/vendor/profile" class="menu-item" (click)="open.set(null)">
                      <app-icon name="store" [size]="16" /> My Shop
                    </a>
                  }
                  <a routerLink="/chat" class="menu-item" (click)="open.set(null)">
                    <app-icon name="message" [size]="16" /> Messages
                  </a>
                  <div class="hairline my-1"></div>
                  <button type="button" class="menu-item menu-item-danger" (click)="logout()">
                    <app-icon name="log-out" [size]="16" /> Sign out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm hidden sm:inline-flex">Sign in</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">
              Get started
              <app-icon name="arrow-right" [size]="15" />
            </a>
          }

          @if (navItems().length) {
            <button
              type="button"
              class="btn-icon md:hidden"
              (click)="toggle('mobile')"
              aria-label="Open menu"
              [attr.aria-expanded]="open() === 'mobile'"
            >
              <app-icon [name]="open() === 'mobile' ? 'close' : 'menu'" [size]="18" />
            </button>
          }
        </div>
      </div>

      <!-- Mobile drawer -->
      @if (open() === 'mobile') {
        <div class="border-t border-line bg-surface md:hidden slide-up">
          <nav class="page-container flex flex-col py-2">
            @for (item of navItems(); track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-fg"
                (click)="open.set(null)"
                class="flex items-center gap-3 border-b border-line py-3.5 text-sm font-semibold text-fg-2 last:border-0"
              >
                <span class="text-brand-bright"><app-icon [name]="item.icon" [size]="18" /></span>
                {{ item.label }}
                <span class="ml-auto text-fg-3"><app-icon name="chevron-right" [size]="16" /></span>
              </a>
            }
          </nav>
        </div>
      }
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .nav-active {
        background: var(--surface-4);
        color: var(--fg) !important;
        box-shadow: inset 0 1px 0 var(--sheen);
      }

      .menu-item {
        display: flex;
        width: 100%;
        align-items: center;
        gap: 0.625rem;
        border-radius: 10px;
        padding: 0.625rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--fg-2);
        transition: background-color 140ms ease, color 140ms ease;
      }
      .menu-item:hover {
        background: var(--surface-3);
        color: var(--fg);
      }
      .menu-item-danger {
        color: var(--danger);
      }
      .menu-item-danger:hover {
        background: var(--danger-soft);
        color: var(--danger);
      }
    `,
  ],
})
export class HeaderComponent {
  auth = inject(AuthService);
  notif = inject(NotificationService);
  theme = inject(ThemeService);
  private host = inject(ElementRef<HTMLElement>);

  readonly open = signal<'menu' | 'notif' | 'mobile' | null>(null);
  readonly scrolled = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.auth.currentUser()?.role;
    if (role === 'CUSTOMER') return CUSTOMER_NAV;
    if (role === 'VENDOR') return VENDOR_NAV;
    return [];
  });

  toggle(panel: 'menu' | 'notif' | 'mobile'): void {
    this.open.update((cur) => (cur === panel ? null : panel));
  }

  initials(name?: string): string {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  notifIcon(type: string): string {
    switch (type) {
      case 'STOCK_UPDATE':
        return 'package';
      case 'REQUEST':
        return 'clock';
      case 'CHAT':
        return 'message';
      default:
        return 'sparkles';
    }
  }

  markAll(): void {
    this.notif.markAllRead().subscribe({ error: () => {} });
  }

  logout(): void {
    this.open.set(null);
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(null);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
