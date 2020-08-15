import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Subscription, fromEvent } from 'rxjs';
import { map, filter, take, repeat } from 'rxjs/operators';

import { FeedService } from '../feed-service/feed.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  @ViewChild('articles') articles: ElementRef;

  scrollPercent$ = fromEvent(document, 'scroll')
    .pipe(
      map(() => {
        const scrollTop = this.articles.nativeElement.getBoundingClientRect().top;
        const docHeight = this.articles.nativeElement.getBoundingClientRect().height;
        const winHeight = window.innerHeight;
        const scroll = scrollTop / (winHeight - docHeight);

        return Math.round(scroll * 100);
      })
    );

  loadMore$ = this.scrollPercent$
    .pipe(
      filter(percent => percent >= 80),
      take(1),
      repeat()
    );

  feed$ = this.feedService.feed$;

  constructor(private feedService: FeedService) {
  }

  ngOnInit(): void {
    this.subscription = this.loadMore$.subscribe(this.feedService.refresh$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
