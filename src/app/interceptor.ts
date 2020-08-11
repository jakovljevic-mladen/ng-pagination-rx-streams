import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { name, date, image, lorem, random } from 'faker';

import { FakeFeedResponse } from './models';

export class Interceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/feed')) {
      const response = new HttpResponse({
        body: this.getRandomData()
      });

      return of(response).pipe(delay(300));
    }

    return next.handle(req);
  }

  getRandomData(): FakeFeedResponse[] {
    return Array.from(Array(12), this.getRandomDataItem);
  }

  getRandomDataItem(): FakeFeedResponse {
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
