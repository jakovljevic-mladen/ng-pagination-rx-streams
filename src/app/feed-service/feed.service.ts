import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, defer, EMPTY, NEVER } from 'rxjs';
import { exhaustMap, share, scan, catchError, map, tap } from 'rxjs/operators';

import { FakeFeedResponse, FeedItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  private nextPageURL = '/feed';
  private loadingSubject$ = new BehaviorSubject(false);

  getFeed$: Observable<FeedItem[]> = defer(() => {
    if (this.nextPageURL) {
      this.loadingSubject$.next(true);
      return this.http.get<FakeFeedResponse>(this.nextPageURL);
    } else {
      return NEVER;
    }
  }).pipe(
    catchError(() => /* Potentially handle this.nextPageURL here */EMPTY),
    tap(response => {
      this.nextPageURL = response.nextPageURL;
      this.loadingSubject$.next(false);
    }),
    map(response => response.items),
    share()
  );

  refresh$ = new BehaviorSubject(null);

  loading$: Observable<boolean> = this.loadingSubject$.asObservable();

  feed$: Observable<FeedItem[]> = this.refresh$.pipe(
    exhaustMap(() => this.getFeed$),
    scan((acc, value) => acc.concat(value), [])
  );

  constructor(private http: HttpClient) {
  }
}
