import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8 fade-in">
          <a routerLink="/" class="inline-flex items-center gap-2 mb-6">
            <div class="w-12 h-12 bg-[#7B9699] rounded-2xl flex items-center justify-center shadow-md">
              <span class="text-white text-2xl font-bold">S</span>
            </div>
          </a>
          <h1 class="text-[#252525] mb-2">Welcome back</h1>
          <p class="text-[#7D7D7D]">Sign in to find fresh produce near you</p>
        </div>

        <div class="sm-card p-8 fade-in">
          <!-- Tab Toggle -->
          <div class="flex bg-[#F2F0EF] rounded-xl p-1 mb-6">
            <button (click)="mode.set('phone')"
                    [class]="mode() === 'phone' ? 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#252525] shadow-sm transition-all' : 'flex-1 py-2.5 rounded-lg text-sm font-medium text-[#7D7D7D] transition-all'">
              📱 Phone OTP
            </button>
            <button (click)="mode.set('password')"
                    [class]="mode() === 'password' ? 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#252525] shadow-sm transition-all' : 'flex-1 py-2.5 rounded-lg text-sm font-medium text-[#7D7D7D] transition-all'">
              🔒 Password
            </button>
          </div>

          <form (ngSubmit)="handleSubmit()" #loginForm="ngForm">
            <!-- Phone OTP Mode -->
            <ng-container *ngIf="mode() === 'phone'">
              <div class="mb-4">
                <label class="block text-sm font-medium text-[#252525] mb-2">Phone Number</label>
                <div class="flex gap-2">
                  <span class="sm-input w-16 text-center bg-[#F2F0EF] text-[#545454]">+91</span>
                  <input [(ngModel)]="phone" name="phone" type="tel"
                         placeholder="98765 43210" maxlength="10"
                         class="sm-input flex-1"
                         [disabled]="otpSent()">
                </div>
              </div>
              <div *ngIf="otpSent()" class="mb-4 fade-in">
                <label class="block text-sm font-medium text-[#252525] mb-2">Enter OTP</label>
                <input [(ngModel)]="otp" name="otp" type="text"
                       placeholder="6-digit OTP" maxlength="6"
                       class="sm-input text-center text-2xl tracking-widest font-bold">
                <p class="text-xs text-[#7D7D7D] mt-1">OTP sent to +91 {{ phone }}</p>
              </div>

              <button *ngIf="!otpSent()" type="button" (click)="sendOtp()"
                      [disabled]="loading() || phone.length < 10"
                      class="btn-primary w-full justify-center mb-4">
                {{ loading() ? 'Sending...' : 'Send OTP' }}
              </button>
              <button *ngIf="otpSent()" type="submit"
                      [disabled]="loading() || otp.length < 6"
                      class="btn-primary w-full justify-center mb-4">
                {{ loading() ? 'Verifying...' : 'Verify & Login' }}
              </button>

              <button *ngIf="otpSent()" type="button" (click)="resendOtp()"
                      [disabled]="resendTimer() > 0"
                      class="w-full text-center text-sm text-[#7B9699] hover:underline">
                {{ resendTimer() > 0 ? 'Resend in ' + resendTimer() + 's' : 'Resend OTP' }}
              </button>
            </ng-container>

            <!-- Password Mode -->
            <ng-container *ngIf="mode() === 'password'">
              <div class="mb-4">
                <label class="block text-sm font-medium text-[#252525] mb-2">Phone or Email</label>
                <input [(ngModel)]="emailOrPhone" name="emailOrPhone" type="text"
                       placeholder="Enter phone or email"
                       class="sm-input">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-medium text-[#252525] mb-2">Password</label>
                <div class="relative">
                  <input [(ngModel)]="password" name="password"
                         [type]="showPassword() ? 'text' : 'password'"
                         placeholder="Your password"
                         class="sm-input pr-12">
                  <button type="button" (click)="showPassword.update(v => !v)"
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7D7D] hover:text-[#252525]">
                    {{ showPassword() ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
              <button type="submit" [disabled]="loading()"
                      class="btn-primary w-full justify-center">
                {{ loading() ? 'Signing in...' : 'Sign In' }}
              </button>
            </ng-container>
          </form>

          <!-- Error -->
          <div *ngIf="errorMsg()" class="mt-4 p-3 bg-[#F5E9E7] rounded-lg text-sm text-red-600">
            {{ errorMsg() }}
          </div>
        </div>

        <p class="text-center text-sm text-[#7D7D7D] mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-[#7B9699] font-semibold hover:underline ml-1">Create one</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  mode = signal<'phone' | 'password'>('phone');
  loading = signal(false);
  otpSent = signal(false);
  showPassword = signal(false);
  errorMsg = signal('');
  resendTimer = signal(0);

  phone = '';
  otp = '';
  emailOrPhone = '';
  password = '';

  sendOtp(): void {
    if (this.phone.length < 10) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.authService.sendOtp('+91' + this.phone).subscribe({
      next: () => {
        this.loading.set(false);
        this.otpSent.set(true);
        this.notifService.success('OTP sent to your phone!');
        this.startResendTimer();
      },
      error: (e) => {
        this.loading.set(false);
        this.errorMsg.set(e?.error?.message || 'Failed to send OTP. Please try again.');
      }
    });
  }

  resendOtp(): void {
    this.otp = '';
    this.otpSent.set(false);
    setTimeout(() => this.sendOtp(), 100);
  }

  handleSubmit(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    if (this.mode() === 'phone') {
      this.authService.verifyOtp({ phone: '+91' + this.phone, otp: this.otp }).subscribe({
        next: () => this.navigateAfterLogin(),
        error: (e) => { this.loading.set(false); this.errorMsg.set(e?.error?.message || 'Invalid OTP. Please try again.'); }
      });
    } else {
      const isPhone = /^\d+$/.test(this.emailOrPhone);
      this.authService.login({
        phone: isPhone ? this.emailOrPhone : undefined,
        email: !isPhone ? this.emailOrPhone : undefined,
        password: this.password
      }).subscribe({
        next: () => this.navigateAfterLogin(),
        error: (e) => { this.loading.set(false); this.errorMsg.set(e?.error?.message || 'Invalid credentials.'); }
      });
    }
  }

  private navigateAfterLogin(): void {
    this.loading.set(false);
    const user = this.authService.currentUser();
    if (user?.role === 'VENDOR') this.router.navigate(['/vendor/dashboard']);
    else this.router.navigate(['/customer/map']);
  }

  private startResendTimer(): void {
    this.resendTimer.set(30);
    const interval = setInterval(() => {
      this.resendTimer.update(v => { if (v <= 1) { clearInterval(interval); return 0; } return v - 1; });
    }, 1000);
  }
}
