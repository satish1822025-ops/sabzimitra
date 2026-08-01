import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-[#252525] text-white mt-16">
      <div class="page-container py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-10 h-10 bg-[#7B9699] rounded-xl flex items-center justify-center">
                <span class="text-white text-xl font-bold">S</span>
              </div>
              <span class="text-white font-bold text-2xl font-[Poppins]">SabziMitra</span>
            </div>
            <p class="text-[#CFCFCF] text-sm leading-relaxed max-w-xs">
              Connecting you with the freshest vegetables and fruits from vendors right in your neighborhood. Farm to fork, the smart way.
            </p>
            <div class="flex gap-3 mt-4">
              <span class="bg-[#404E3B] text-[#BAC8B1] text-xs px-3 py-1.5 rounded-full font-medium">🌱 Fresh Daily</span>
              <span class="bg-[#3D2E1F] text-[#FFDBBB] text-xs px-3 py-1.5 rounded-full font-medium">🏪 Local Vendors</span>
            </div>
          </div>

          <!-- Links -->
          <div>
            <h5 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h5>
            <ul class="space-y-2.5">
              <li><a routerLink="/customer/map" class="text-[#CFCFCF] text-sm hover:text-[#7B9699] transition-colors">Find Vendors</a></li>
              <li><a routerLink="/customer/search" class="text-[#CFCFCF] text-sm hover:text-[#7B9699] transition-colors">Search Products</a></li>
              <li><a routerLink="/auth/register" class="text-[#CFCFCF] text-sm hover:text-[#7B9699] transition-colors">Become a Vendor</a></li>
              <li><a routerLink="/chat" class="text-[#CFCFCF] text-sm hover:text-[#7B9699] transition-colors">Messages</a></li>
            </ul>
          </div>

          <div>
            <h5 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h5>
            <ul class="space-y-2.5">
              <li><span class="text-[#CFCFCF] text-sm">📞 +91 98765 43210</span></li>
              <li><span class="text-[#CFCFCF] text-sm">✉️ help&#64;sabzimitra.in</span></li>
              <li><span class="text-[#CFCFCF] text-sm">🕐 Mon–Sat 8 AM – 8 PM</span></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-[#404040] mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-[#7D7D7D] text-xs">© 2026 SabziMitra. All rights reserved. Made with 🌿 in India.</p>
          <div class="flex gap-4">
            <span class="text-[#7D7D7D] text-xs hover:text-[#CFCFCF] cursor-pointer">Privacy Policy</span>
            <span class="text-[#7D7D7D] text-xs hover:text-[#CFCFCF] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
