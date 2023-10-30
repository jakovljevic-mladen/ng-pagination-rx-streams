import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable, of, throwError, concat, timer, ignoreElements } from 'rxjs';
import { delay } from 'rxjs/operators';
import { faker } from '@faker-js/faker';

import { FakeFeedResponse, FeedFilterType, FeedItem } from './models';

export class Interceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/feed')) {
      const params = req.params;
      const body = this.getRandomData(params);

      const response = new HttpResponse({ body });

      const nextPage = +req.params.get('nextPage');

      if (nextPage > 1 && Math.random() < 0.2) { // 20 % chance to fail
        return concat(
          timer(1_000).pipe(ignoreElements()),
          throwError(() => new Error('Fake error occurred'))
        );
      }

      return of(response).pipe(delay(300));
    }

    return next.handle(req);
  }

  getRandomData(params: HttpParams): FakeFeedResponse {
    const page = +params.get('nextPage') || 1;
    const feedFilter: FeedFilterType = params.get('feedFilter') as FeedFilterType || '';
    const items: FeedItem[] = [];

    const maxItemsPerPage = 12;

    for (let i = 0; i < maxItemsPerPage; i++) {
      items.push(this.getRandomDataItem(((page - 1) * maxItemsPerPage + i).toString(), feedFilter));
    }

    return {
      page,
      nextPage: page <= 5 ? page + 1 : null,
      items
    };
  }

  getRandomDataItem(id: string, feedFilter: FeedFilterType): FeedItem {
    const text = feedFilter ? feedFilter === 'onlyText' : faker.datatype.boolean();

    return {
      id,
      user: {
        name: faker.name.firstName() + ' ' + faker.name.lastName(),
        avatar: faker.image.avatar()
      },
      type: text ? 'text' : 'image',
      created: faker.date.past(),
      text: text ? faker.lorem.sentences(5) : undefined,
      imageURL: text ? undefined : faker.image.image()
    };
  }
}
