import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, timer } from 'rxjs';

import { FeedService } from '../feed-service/feed.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  feed$ = this.feedService.feed$;

  refresh$ = timer(0, 30000);

  constructor(private feedService: FeedService) {
  }

  ngOnInit(): void {
    this.subscription = this.refresh$.subscribe(this.feedService.refresh$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
