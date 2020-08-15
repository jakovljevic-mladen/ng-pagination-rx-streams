import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { exhaustMap, share, scan } from 'rxjs/operators';

import { FakeFeedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  getFeed$ = this.http.get<FakeFeedResponse[]>('/feed').pipe(share());

  refresh$ = new BehaviorSubject(null);

  feed$: Observable<FakeFeedResponse[]> = this.refresh$.pipe(
    exhaustMap(() => this.getFeed$),
    scan((acc, value) => acc.concat(value), [])
  );

  constructor(private http: HttpClient) {
  }
}
