import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';

import { filter, from, map, mergeAll, Observable, scan, Subject, switchMap, takeUntil } from 'rxjs';

import { FeedService } from '../feed-service/feed.service';
import { asIntersectionObservable } from '../asIntersectionObservable';
import { FeedItem } from '../models';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.feedService.loading$;
  feed$: Observable<FeedItem[]> = this.feedService.feed$.pipe(
    scan((acc, { items, nextPage }) => nextPage === 2 ? items : acc.concat(items), [])
  );

  @ViewChild('form') form: NgForm;
  @ViewChildren('article') articles: QueryList<ElementRef<HTMLElement>>;

  constructor(private feedService: FeedService) {
  }

  ngAfterViewInit(): void {
    this.articles.changes.pipe(
      map(queryList => queryList.toArray().splice(-3).map(({ nativeElement }) => nativeElement)), // take the last 3 <article> tags
      switchMap(elements => from(elements.map(el => asIntersectionObservable(el))).pipe(mergeAll())),
      filter(({ isIntersecting }) => isIntersecting),
      takeUntil(this.destroy$)
    ).subscribe(this.feedService.loadMore$);

    this.form.valueChanges.pipe(
      map(({ feedFilter }) => feedFilter),
      takeUntil(this.destroy$)
    ).subscribe(this.feedService.filterChange$);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFeedItem(index: number, feedItem: FeedItem) {
    return feedItem.id;
  }
}
