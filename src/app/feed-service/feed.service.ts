import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, catchError, EMPTY, exhaustMap, Observable, Subject, switchMap, tap } from 'rxjs';

import { FakeFeedResponse, FeedFilterType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  private loadingChange$ = new Subject<boolean>();
  private nextPage: number | null = 1;

  loadMore$ = new BehaviorSubject(null);
  filterChange$ = new Subject<FeedFilterType>();

  feed$: Observable<FakeFeedResponse> = this.filterChange$.pipe(
    switchMap(feedFilter => {
      this.nextPage = 1;
      return this.loadMore$.pipe(exhaustMap(() =>
        this.nextPage
          ? this.http.get<FakeFeedResponse>('/feed', { params: { nextPage: this.nextPage, feedFilter } })
            .pipe(
              catchError(() => EMPTY),
              tap({
                subscribe: () => this.loadingChange$.next(true),
                next: ({ nextPage }) => this.nextPage = nextPage,
                finalize: () => this.loadingChange$.next(false)
              })
            )
          : EMPTY
      ));
    }));
  loading$: Observable<boolean> = this.loadingChange$.asObservable();

  constructor(private http: HttpClient) {
  }
}
