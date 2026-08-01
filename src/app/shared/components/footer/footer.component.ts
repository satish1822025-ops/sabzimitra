import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="relative mt-20 border-t border-line bg-bg-deep">
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-px"
        style="background: linear-gradient(90deg, transparent, var(--brand-ring), transparent)"
      ></div>

      <div class="page-container py-14">
        <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <!-- Brand -->
          <div>
            <div class="mb-5 flex items-center gap-2.5">
              <span
                class="flex h-10 w-10 items-center justify-center rounded-[13px] border border-line-2 bg-surface-2 text-brand-bright"
              >
                <app-icon name="leaf" [size]="21" />
              </span>
              <span class="font-display text-[1.5rem] tracking-tight text-fg">SabziMitra</span>
            </div>

            <p class="max-w-sm text-sm leading-relaxed text-fg-3">
              A curated marketplace for neighbourhood produce. Live inventory, honest prices, and a direct line to the
              people who grow and sell your food.
            </p>

            <div class="mt-6 flex flex-wrap gap-2">
              <span class="badge badge-success"><app-icon name="sprout" [size]="12" /> Fresh daily</span>
              <span class="badge badge-brand"><app-icon name="store" [size]="12" /> Local vendors</span>
              <span class="badge badge-neutral"><app-icon name="shield-check" [size]="12" /> Verified</span>
            </div>
          </div>

          <!-- Platform -->
          <nav aria-labelledby="footer-platform">
            <h5 id="footer-platform" class="eyebrow mb-4">Platform</h5>
            <ul class="flex flex-col gap-3">
              <li><a routerLink="/customer/map" class="footer-link">Find vendors</a></li>
              <li><a routerLink="/customer/search" class="footer-link">Search produce</a></li>
              <li><a routerLink="/customer/favorites" class="footer-link">Saved shops</a></li>
              <li><a routerLink="/chat" class="footer-link">Messages</a></li>
            </ul>
          </nav>

          <!-- Vendors -->
          <nav aria-labelledby="footer-vendors">
            <h5 id="footer-vendors" class="eyebrow mb-4">For vendors</h5>
            <ul class="flex flex-col gap-3">
              <li><a routerLink="/auth/register" class="footer-link">Become a vendor</a></li>
              <li><a routerLink="/vendor/dashboard" class="footer-link">Seller dashboard</a></li>
              <li><a routerLink="/vendor/inventory" class="footer-link">Manage inventory</a></li>
              <li><a routerLink="/vendor/add-product" class="footer-link">List an item</a></li>
            </ul>
          </nav>

          <!-- Support -->
          <div>
            <h5 class="eyebrow mb-4">Support</h5>
            <ul class="flex flex-col gap-3.5">
              <li class="flex items-center gap-2.5 text-sm text-fg-3">
                <span class="text-brand-bright"><app-icon name="phone" [size]="15" /></span>
                <a href="tel:+919876543210" class="footer-link">+91 98765 43210</a>
              </li>
              <li class="flex items-center gap-2.5 text-sm text-fg-3">
                <span class="text-brand-bright"><app-icon name="mail" [size]="15" /></span>
                <a href="mailto:help@sabzimitra.in" class="footer-link">help&#64;sabzimitra.in</a>
              </li>
              <li class="flex items-center gap-2.5 text-sm text-fg-3">
                <span class="text-brand-bright"><app-icon name="clock" [size]="15" /></span>
                Mon – Sat · 8 AM to 8 PM
              </li>
            </ul>
          </div>
        </div>

        <div class="hairline my-10"></div>

        <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p class="text-xs text-fg-3">© 2026 SabziMitra. Crafted in India.</p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-xs text-fg-3 transition-colors hover:text-fg-2">Privacy</a>
            <a href="#" class="text-xs text-fg-3 transition-colors hover:text-fg-2">Terms</a>
            <a href="#" class="text-xs text-fg-3 transition-colors hover:text-fg-2">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer-link {
        font-size: 0.875rem;
        color: var(--fg-3);
        transition: color 200ms ease;
      }
      .footer-link:hover {
        color: var(--fg);
      }
    `,
  ],
})
export class FooterComponent {}
