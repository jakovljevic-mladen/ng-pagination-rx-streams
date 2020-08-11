import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FakeFeedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  feed$ = this.http.get<FakeFeedResponse[]>('/feed');

  constructor(private http: HttpClient) {
  }
}
