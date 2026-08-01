import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, ToastComponent],
  // Explicit template — do not rely on app.html
  template: `
    <div class="min-h-screen flex flex-col bg-[#F2F0EF]">
      <app-header></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-toast></app-toast>
    </div>
  `
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);

  ngOnInit(): void {
    // Refresh user session on app startup
    if (this.authService.getAccessToken()) {
      this.authService.fetchCurrentUser().subscribe({ error: () => {} });
      this.notifService.loadNotifications().subscribe({ error: () => {} });
    }
  }
}
