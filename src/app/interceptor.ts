import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { DefaultUrlSerializer, Params } from '@angular/router';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { name, date, image, lorem, random } from 'faker';

import { FakeFeedResponse, FeedItem, FeedFilterType } from './models';

export class Interceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/feed')) {
      const urlSerializer = new DefaultUrlSerializer();
      const params = urlSerializer.parse(req.url).queryParams;

      const response = new HttpResponse({
        body: this.getRandomData(params)
      });

      return of(response).pipe(delay(300));
    }

    return next.handle(req);
  }

  getRandomData(params: Params): FakeFeedResponse {
    const page = +params.page || 1;
    const feedFilter = params.feedFilter;
    const items: FeedItem[] = [];

    for (let i = 0; i < 12; i++) {
      items.push(this.getRandomDataItem(feedFilter));
    }

    return {
      nextPage: page <= 5 ? page + 1 : null,
      items
    };
  }

  getRandomDataItem(feedFilter: FeedFilterType): FeedItem {
    const decide = feedFilter ? feedFilter === 'onlyText' : random.boolean();

    return {
      user: {
        name: name.firstName() + ' ' + name.lastName(),
        avatar: image.avatar()
      },
      type: decide ? 'text' : 'image',
      created: date.past(),
      text: decide ? lorem.sentences(5) : undefined,
      imageURL: decide ? undefined : random.image()
    };
  }
}
