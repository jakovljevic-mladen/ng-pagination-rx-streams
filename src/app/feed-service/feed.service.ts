import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, defer, EMPTY, NEVER, Subject } from 'rxjs';
import { share, scan, catchError, map, tap, switchMap } from 'rxjs/operators';

import { FakeFeedResponse, FeedItem, FeedFilter } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  private nextPage: number | null = 1;
  private filter: FeedFilter;
  private loadingSubject$ = new BehaviorSubject(false);

  getFeed$: Observable<FeedItem[]> = defer(() => {
    if (this.nextPage) {
      this.loadingSubject$.next(true);
      const url = appendQuery('/feed', { page: this.nextPage, feedFilter: this.filter.feedFilter });
      return this.http.get<FakeFeedResponse>(url);
    } else {
      return NEVER;
    }
  }).pipe(
    catchError(() => /* Potentially handle this.nextPage here */EMPTY),
    tap(response => {
      this.nextPage = response.nextPage;
      this.loadingSubject$.next(false);
    }),
    map(response => response.items),
    share()
  );

  filter$ = new Subject<FeedFilter>();

  loading$: Observable<boolean> = this.loadingSubject$.asObservable();

  feed$: Observable<FeedItem[]> = this.filter$.pipe(
    switchMap(filter => {
      if (filter !== this.filter) {
        this.filter = filter;
        this.nextPage = 1;
        this.shouldReset = true;
      }
      return this.getFeed$;
    }),
    scan((acc, value) => {
      if (this.shouldReset) {
        this.shouldReset = false;
        return value;
      }

      return acc.concat(value);
    }, [])
  );

  shouldReset = false;

  constructor(private http: HttpClient) {
  }
}

function appendQuery(url: string, q: any): string {
  let query = '';

  for (const key in q) {
    if (q.hasOwnProperty(key) && q[key] != null) {
      if (Array.isArray(q[key])) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < q[key].length; i++) {
          query += query.length === 0 ? '?' : '&';
          query += `${ key }=${ encodeURIComponent(q[key][i]) }`;
        }
      } else {
        query += query.length === 0 ? '?' : '&';
        query += `${ key }=${ encodeURIComponent(q[key]) }`;
      }
    }
  }

  return url + query;
}
