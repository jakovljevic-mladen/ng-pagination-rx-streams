import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { faker } from '@faker-js/faker';

import { FakeFeedResponse, FeedFilterType, FeedItem } from './models';

export class Interceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/feed')) {
      const params = req.params;
      const body = this.getRandomData(params);

      const response = new HttpResponse({ body });

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
      nextPage: page <= 5 ? page + 1 : null,
      items
    };
  }

  getRandomDataItem(id: string, feedFilter: FeedFilterType): FeedItem {
    const decide = feedFilter ? feedFilter === 'onlyText' : faker.datatype.boolean();

    return {
      id,
      user: {
        name: faker.name.firstName() + ' ' + faker.name.lastName(),
        avatar: faker.image.avatar()
      },
      type: decide ? 'text' : 'image',
      created: faker.date.past(),
      text: decide ? faker.lorem.sentences(5) : undefined,
      imageURL: decide ? undefined : faker.image.image()
    };
  }
}
