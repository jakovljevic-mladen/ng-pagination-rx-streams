import { Component } from '@angular/core';

import { FeedService } from '../feed-service/feed.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent {

  feed$ = this.feedService.feed$;

  constructor(private feedService: FeedService) {
  }
}
