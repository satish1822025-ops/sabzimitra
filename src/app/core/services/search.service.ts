import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  private _query = new BehaviorSubject<string>('');
  query$ = this._query.asObservable();

  suggestions$: Observable<string[]> = this._query.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => q.length > 1 ? this.getSuggestions(q) : of([]))
  );

  setQuery(q: string): void { this._query.next(q); }

  getSuggestions(q: string): Observable<string[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<string[]>(`${environment.apiUrl}/search/suggestions`, { params });
  }

  getSeasonalItems(): Observable<Array<{ name: string; nameHindi: string; image: string; season: string }>> {
    return this.http.get<any[]>(`${environment.apiUrl}/search/seasonal`);
  }
}
