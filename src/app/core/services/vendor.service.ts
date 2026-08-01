import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  Vendor, VendorDetail, NearbyVendorsRequest, PagedResponse,
  InventoryItem, InventoryRequest, DashboardStats, VendorOnboardRequest
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);

  private _nearbyVendors = new BehaviorSubject<Vendor[]>([]);
  nearbyVendors$ = this._nearbyVendors.asObservable();

  private _selectedVendor = new BehaviorSubject<VendorDetail | null>(null);
  selectedVendor$ = this._selectedVendor.asObservable();

  // ── Customer APIs ──────────────────────────────────────────

  getNearbyVendors(req: NearbyVendorsRequest): Observable<PagedResponse<Vendor>> {
    let params = new HttpParams()
      .set('lat', req.lat.toString())
      .set('lng', req.lng.toString())
      .set('radius', req.radius.toString());
    if (req.product) params = params.set('product', req.product);
    if (req.sort)    params = params.set('sort', req.sort);
    if (req.minPrice != null) params = params.set('minPrice', req.minPrice.toString());
    if (req.maxPrice != null) params = params.set('maxPrice', req.maxPrice.toString());
    if (req.inStockOnly) params = params.set('inStockOnly', 'true');
    if (req.organicOnly) params = params.set('organicOnly', 'true');

    return this.http.get<PagedResponse<Vendor>>(`${environment.apiUrl}/vendors/nearby`, { params }).pipe(
      tap(res => this._nearbyVendors.next(res.content))
    );
  }

  getVendorById(id: number): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${environment.apiUrl}/vendors/${id}`).pipe(
      tap(v => this._selectedVendor.next(v))
    );
  }

  getVendorReviews(vendorId: number, page = 0): Observable<PagedResponse<any>> {
    const params = new HttpParams().set('page', page.toString()).set('size', '10');
    return this.http.get<PagedResponse<any>>(`${environment.apiUrl}/vendors/${vendorId}/reviews`, { params });
  }

  addToFavorites(vendorId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/vendors/${vendorId}/favorite`, {});
  }

  removeFromFavorites(vendorId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/vendors/${vendorId}/favorite`);
  }

  getFavorites(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${environment.apiUrl}/customer/favorites`);
  }

  addReview(vendorId: number, rating: number, comment: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reviews`, { vendorId, rating, comment });
  }

  requestItem(vendorId: number, productName: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/vendors/${vendorId}/request-item`, { productName });
  }

  // ── Vendor Management APIs ─────────────────────────────────

  getMyProfile(): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${environment.apiUrl}/vendor/profile`);
  }

  updateProfile(data: Partial<VendorOnboardRequest>): Observable<VendorDetail> {
    return this.http.put<VendorDetail>(`${environment.apiUrl}/vendor/profile`, data);
  }

  updateStatus(isOpen: boolean): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/vendor/status`, { isOpen });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/vendor/dashboard`);
  }

  getMyInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${environment.apiUrl}/vendor/inventory`);
  }

  addInventoryItem(data: InventoryRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${environment.apiUrl}/vendor/inventory`, data);
  }

  updateInventoryItem(id: number, data: Partial<InventoryRequest>): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${environment.apiUrl}/vendor/inventory/${id}`, data);
  }

  deleteInventoryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/vendor/inventory/${id}`);
  }

  markAllSoldOut(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/vendor/inventory/mark-sold-out`, {});
  }

  duplicateYesterdayStock(): Observable<InventoryItem[]> {
    return this.http.post<InventoryItem[]>(`${environment.apiUrl}/vendor/inventory/duplicate-yesterday`, {});
  }

  identifyProduct(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/vendor/identify-product`, formData);
  }

  uploadShopImage(formData: FormData): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/vendor/upload-image`, formData);
  }
}
