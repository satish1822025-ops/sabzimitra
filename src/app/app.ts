import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <div class="relative flex min-h-dvh flex-col bg-bg text-fg">
      <a
        href="#main"
        class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[600] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-fg"
      >
        Skip to content
      </a>

      <app-header />

      <main id="main" class="relative z-[1] flex-1">
        <router-outlet />
      </main>

      <app-footer />
      <app-toast />
    </div>
  `,
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  // Instantiated so the stored theme is applied and kept in sync app-wide.
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    if (this.authService.getAccessToken()) {
      this.authService.fetchCurrentUser().subscribe({ error: () => {} });
      this.notifService.loadNotifications().subscribe({ error: () => {} });
    }
  }
}
