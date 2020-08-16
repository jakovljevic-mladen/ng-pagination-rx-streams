import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { DefaultUrlSerializer } from '@angular/router';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { name, date, image, lorem, random } from 'faker';

import { FakeFeedResponse, FeedItem } from './models';

export class Interceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/feed')) {
      const urlSerializer = new DefaultUrlSerializer();
      const params = urlSerializer.parse(req.url).queryParams;

      const response = new HttpResponse({
        body: this.getRandomData(+params.page || 1)
      });

      return of(response).pipe(delay(300));
    }

    return next.handle(req);
  }

  getRandomData(page: number): FakeFeedResponse {
    return {
      nextPageURL: page <= 5 ? `/feed?page=${ page + 1 }` : null,
      items: Array.from(Array(12), this.getRandomDataItem)
    };
  }

  getRandomDataItem(): FeedItem {
    const decide = random.boolean();

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
