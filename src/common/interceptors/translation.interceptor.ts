import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslationService } from '../../modules/translation/translation.service';

import { Language } from '../enums/user.enum';

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  private readonly languages: Set<Language>;

  constructor(private readonly translationService: TranslationService) {
    this.languages = new Set(Object.values(Language));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const language = request.headers['accept-language'];

    if (!this.languages.has(language)) {
      throw new BadRequestException(
        `language '${language}' is not supported. supported languages are ${[...this.languages].join(', ')}.`,
      );
    }

    // if the language is english, skip translation
    if (language === 'en') {
      return next.handle();
    }

    // else, apply translation
    return next.handle().pipe(
      map(async (response) => {
        // skip translation if from cache
        if (request.fromCache) return response;

        return await this.translationService.translateJson(response, language);
      }),
    );
  }
}
