import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { Translate } from '@google-cloud/translate/build/src/v2';

import {
  excludeKeys,
  excludeTypes,
} from '../../common/constants/translation.constants';

@Injectable()
export class TranslationService {
  private translateClient: Translate;

  constructor() {
    const file = process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS;

    if (!file) {
      throw new Error(
        'GCP service account credentials file path is not set in env variables',
      );
    }

    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(file);

    this.translateClient = new Translate();
  }

  private isTranslatable(key: string, value: any): boolean {
    return (
      !excludeKeys.has(key) &&
      value != null &&
      !excludeTypes.has(value.constructor)
    );
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const [translation] = await this.translateClient.translate(
      text,
      targetLanguage,
    );

    return translation;
  }

  async translateJson(json: any, targetLanguage: string): Promise<any> {
    if (typeof json === 'string') {
      return await this.translateText(json, targetLanguage);
    }

    if (Array.isArray(json)) {
      // if it's an array, recursively translate each item
      return Promise.all(
        json.map((item) => this.translateJson(item, targetLanguage)),
      );
    }

    if (typeof json === 'object' && json !== null) {
      // if it's an object, recurse on each key-value pair
      const translatedObject: Record<string, any> = {};

      for (const [key, value] of Object.entries(json)) {
        if (!this.isTranslatable(key, value)) {
          translatedObject[key] = value;

          continue;
        }

        translatedObject[key] = await this.translateJson(value, targetLanguage);
      }

      return translatedObject;
    }

    // if it's not a string, object, or array, return it as is (e.g., numbers, booleans)
    return json;
  }
}
