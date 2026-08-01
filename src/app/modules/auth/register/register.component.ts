import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#F2F0EF] flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <div class="text-center mb-8 fade-in">
          <a routerLink="/" class="inline-flex items-center gap-2 mb-4">
            <div class="w-12 h-12 bg-[#7B9699] rounded-2xl flex items-center justify-center shadow-md">
              <span class="text-white text-2xl font-bold">S</span>
            </div>
          </a>
          <h1 class="text-[#252525] mb-2">Create Account</h1>
          <p class="text-[#7D7D7D]">Join thousands of vendors and customers</p>
        </div>

        <!-- Role Picker (Step 1) -->
        <div *ngIf="step() === 1" class="fade-in">
          <div class="sm-card p-8">
            <h2 class="text-[#252525] text-xl mb-2">I am a...</h2>
            <p class="text-[#7D7D7D] text-sm mb-6">Choose your role to get started</p>
            <div class="grid grid-cols-2 gap-4">
              <button (click)="selectRole('CUSTOMER')"
                      [class]="role() === 'CUSTOMER' ? 'p-6 rounded-2xl border-2 border-[#7B9699] bg-[#F2F0EF] text-center transition-all' : 'p-6 rounded-2xl border-2 border-[#CFCFCF] bg-white text-center hover:border-[#BAC8B1] transition-all'">
                <div class="text-4xl mb-3">🛒</div>
                <div class="font-semibold text-[#252525] mb-1">Customer</div>
                <div class="text-xs text-[#7D7D7D]">Find fresh produce near me</div>
              </button>
              <button (click)="selectRole('VENDOR')"
                      [class]="role() === 'VENDOR' ? 'p-6 rounded-2xl border-2 border-[#7B9699] bg-[#F2F0EF] text-center transition-all' : 'p-6 rounded-2xl border-2 border-[#CFCFCF] bg-white text-center hover:border-[#BAC8B1] transition-all'">
                <div class="text-4xl mb-3">🏪</div>
                <div class="font-semibold text-[#252525] mb-1">Vendor</div>
                <div class="text-xs text-[#7D7D7D]">Sell my vegetables online</div>
              </button>
            </div>
            <button (click)="step.set(2)" [disabled]="!role()"
                    class="btn-primary w-full justify-center mt-6">
              Continue →
            </button>
          </div>
        </div>

        <!-- Details Form (Step 2) -->
        <div *ngIf="step() === 2" class="fade-in">
          <div class="sm-card p-8">
            <button (click)="step.set(1)" class="flex items-center gap-1 text-[#7D7D7D] text-sm mb-4 hover:text-[#252525]">
              ← Back
            </button>
            <h2 class="text-[#252525] text-xl mb-6">
              {{ role() === 'VENDOR' ? '🏪 Vendor Details' : '👤 Your Details' }}
            </h2>
            <form (ngSubmit)="handleRegister()" #regForm="ngForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Full Name</label>
                <input [(ngModel)]="name" name="name" type="text" placeholder="Your name"
                       required class="sm-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Phone Number</label>
                <div class="flex gap-2">
                  <span class="sm-input w-16 text-center bg-[#F2F0EF] text-[#545454] flex-shrink-0">+91</span>
                  <input [(ngModel)]="phone" name="phone" type="tel" placeholder="98765 43210"
                         maxlength="10" required class="sm-input flex-1">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Email <span class="text-[#7D7D7D] font-normal">(optional)</span></label>
                <input [(ngModel)]="email" name="email" type="email" placeholder="you@example.com"
                       class="sm-input">
              </div>
              <div>
                <label class="block text-sm font-medium text-[#252525] mb-2">Password</label>
                <div class="relative">
                  <input [(ngModel)]="password" name="password"
                         [type]="showPwd() ? 'text' : 'password'"
                         placeholder="Min 8 characters" minlength="8"
                         required class="sm-input pr-12">
                  <button type="button" (click)="showPwd.update(v => !v)"
                          class="absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7D7D]">
                    {{ showPwd() ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <!-- Terms -->
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" [(ngModel)]="agreed" name="agreed" class="mt-0.5 accent-[#7B9699] w-4 h-4">
                <span class="text-sm text-[#545454]">
                  I agree to the <span class="text-[#7B9699] cursor-pointer hover:underline">Terms of Service</span>
                  and <span class="text-[#7B9699] cursor-pointer hover:underline">Privacy Policy</span>
                </span>
              </label>

              <div *ngIf="errorMsg()" class="p-3 bg-[#F5E9E7] rounded-lg text-sm text-red-600">
                {{ errorMsg() }}
              </div>

              <button type="submit" [disabled]="loading() || !agreed || regForm.invalid"
                      class="btn-primary w-full justify-center">
                {{ loading() ? 'Creating account...' : 'Create Account' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Success Step 3 - Send OTP -->
        <div *ngIf="step() === 3" class="fade-in">
          <div class="sm-card p-8 text-center">
            <div class="text-6xl mb-4">📱</div>
            <h2 class="text-[#252525] mb-2">Verify your number</h2>
            <p class="text-[#7D7D7D] text-sm mb-6">We sent a 6-digit OTP to +91 {{ phone }}</p>
            <input [(ngModel)]="otp" type="text" placeholder="Enter OTP"
                   maxlength="6" class="sm-input text-center text-2xl tracking-widest font-bold mb-4">
            <button (click)="verifyOtp()" [disabled]="loading() || otp.length < 6"
                    class="btn-primary w-full justify-center">
              {{ loading() ? 'Verifying...' : 'Verify & Start' }}
            </button>
            <div *ngIf="errorMsg()" class="mt-3 p-3 bg-[#F5E9E7] rounded-lg text-sm text-red-600">
              {{ errorMsg() }}
            </div>
          </div>
        </div>

        <p class="text-center text-sm text-[#7D7D7D] mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-[#7B9699] font-semibold hover:underline ml-1">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private router = inject(Router);

  step = signal(1);
  role = signal<UserRole | null>(null);
  loading = signal(false);
  showPwd = signal(false);
  errorMsg = signal('');

  name = '';
  phone = '';
  email = '';
  password = '';
  otp = '';
  agreed = false;

  selectRole(r: UserRole): void { this.role.set(r); }

  handleRegister(): void {
    if (!this.role() || !this.agreed) return;
    this.loading.set(true);
    this.errorMsg.set('');
    this.authService.register({
      name: this.name,
      phone: '+91' + this.phone,
      email: this.email || undefined,
      password: this.password,
      role: this.role()!
    }).subscribe({
      next: () => {
        this.loading.set(false);
        // Send OTP for verification
        this.authService.sendOtp('+91' + this.phone).subscribe();
        this.step.set(3);
      },
      error: (e) => { this.loading.set(false); this.errorMsg.set(e?.error?.message || 'Registration failed.'); }
    });
  }

  verifyOtp(): void {
    this.loading.set(true);
    this.authService.verifyOtp({ phone: '+91' + this.phone, otp: this.otp }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notifService.success('Welcome to SabziMitra! 🎉');
        if (this.role() === 'VENDOR') this.router.navigate(['/vendor/profile']);
        else this.router.navigate(['/customer/map']);
      },
      error: (e) => { this.loading.set(false); this.errorMsg.set(e?.error?.message || 'Invalid OTP.'); }
    });
  }
}
