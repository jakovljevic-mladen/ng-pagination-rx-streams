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

  getFeed$: Observable<FeedItem[]> = defer(() => {
    return this.nextPageURL
      ? this.http.get<FakeFeedResponse>(this.nextPageURL)
      : NEVER;
  }).pipe(
    catchError(() => /* Potentially handle this.nextPageURL here */EMPTY),
    tap(response => this.nextPageURL = response.nextPageURL),
    map(response => response.items),
    share()
  );

  refresh$ = new BehaviorSubject(null);

  feed$: Observable<FeedItem[]> = this.refresh$.pipe(
    exhaustMap(() => this.getFeed$),
    scan((acc, value) => acc.concat(value), [])
  );

  constructor(private http: HttpClient) {
  }
}
