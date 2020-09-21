import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription, fromEvent, merge, defer, Observable } from 'rxjs';
import { map, filter, take, delay, repeatWhen } from 'rxjs/operators';

import { FeedService } from '../feed-service/feed.service';
import { FeedFilter } from '../models';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements AfterViewInit, OnDestroy {

  private subscription: Subscription;

  private scrollPercent$: Observable<number> = fromEvent(document, 'scroll')
    .pipe(
      map(() => {
        const scrollTop = this.articles.nativeElement.getBoundingClientRect().top;
        const docHeight = this.articles.nativeElement.getBoundingClientRect().height;
        const winHeight = window.innerHeight;
        const scroll = scrollTop / (winHeight - docHeight);

        return Math.round(scroll * 100);
      })
    );

  private loadMore$: Observable<number> = this.scrollPercent$
    .pipe(
      filter(percent => percent >= 80),
      take(1),
      repeatWhen(() => this.feedLoadingStops$)
    );

  private filterSeed$: Observable<FeedFilter> = defer(() => merge(
    this.loadMore$.pipe(map(() => this.form.value)),
    this.form.valueChanges
  ));

  @ViewChild('articles') articles: ElementRef;
  @ViewChild('form') form: NgForm;

  feed$ = this.feedService.feed$;

  loading$ = this.feedService.loading$.pipe(delay(10));

  private feedLoadingStops$ = this.loading$.pipe(map(v => !v), filter(v => v));

  constructor(private feedService: FeedService) {
  }

  ngAfterViewInit(): void {
    this.subscription = this.filterSeed$.subscribe(this.feedService.filter$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
