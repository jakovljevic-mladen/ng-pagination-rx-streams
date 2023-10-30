import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';

import { filter, from, map, mergeAll, Observable, scan, Subject, switchMap, takeUntil, fromEvent, tap, merge } from 'rxjs';

import { FeedService } from '../feed-service/feed.service';
import { fromIntersectionObserver } from '../fromIntersectionObserver';
import { FeedItem } from '../models';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements AfterViewInit, OnDestroy {

  private destroy$ = new Subject<void>();
  error: string;

  loading$: Observable<boolean> = this.feedService.loading$.pipe(
    tap(loading => loading && (this.error = null))
  );
  feed$: Observable<FeedItem[]> = this.feedService.feed$.pipe(
    scan((acc, res) => {
      if ('error' in res) {
        this.error = res.error.message;

        return acc;
      }

      if ('items' in res) {
        const { items, page } = res;

        return page === 1 ? items : acc.concat(items);
      }
    }, [])
  );

  @ViewChild('form') form: NgForm;
  @ViewChild('errorWrapper') errorEl: ElementRef<HTMLDivElement>;
  @ViewChildren('article') articles: QueryList<ElementRef<HTMLElement>>;

  constructor(private feedService: FeedService) {
  }

  ngAfterViewInit(): void {
    merge(
      this.articles.changes.pipe(
        map(queryList => queryList.toArray().splice(-3).map(({ nativeElement }) => nativeElement)), // take the last 3 <article> tags
        switchMap(elements => from(elements.map(el => fromIntersectionObserver(el))).pipe(mergeAll())),
        filter(({ isIntersecting }) => isIntersecting)
      ),
      fromEvent(this.errorEl.nativeElement, 'click')
    ).pipe(
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
