import { Routes } from '@angular/router';
import { authGuard, vendorGuard, customerGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/customer/map', pathMatch: 'full' },

  // Auth routes (guests only)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./modules/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Customer routes
  {
    path: 'customer',
    children: [
      {
        path: 'map',
        loadComponent: () => import('./modules/customer/map/map.component').then(m => m.MapComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./modules/customer/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'vendor/:id',
        loadComponent: () => import('./modules/customer/vendor-detail/vendor-detail.component').then(m => m.VendorDetailComponent)
      },
      {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () => import('./modules/customer/favorites/favorites.component').then(m => m.FavoritesComponent)
      },
      { path: '', redirectTo: 'map', pathMatch: 'full' }
    ]
  },

  // Vendor routes
  {
    path: 'vendor',
    canActivate: [authGuard, vendorGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/vendor/dashboard/dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./modules/vendor/inventory/inventory.component').then(m => m.VendorInventoryComponent)
      },
      {
        path: 'add-product',
        loadComponent: () => import('./modules/vendor/add-product/add-product.component').then(m => m.AddProductComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./modules/vendor/profile/profile.component').then(m => m.VendorProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Chat
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/chat/chat.component').then(m => m.ChatComponent)
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./modules/customer/map/map.component').then(m => m.MapComponent)
  }
];
