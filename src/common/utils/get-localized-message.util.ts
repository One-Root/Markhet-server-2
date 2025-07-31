import { join } from 'path';

import { Language } from '../enums/user.enum';

import { TranslationMap } from '../types/locale.type';

const locales: Record<Language, TranslationMap> = {} as Record<
  Language,
  TranslationMap
>;

const load = () => {
  Object.values(Language).forEach((lang) => {
    try {
      const path = join(__dirname, '..', 'locales', `${lang}.json`);

      locales[lang] = require(path);
    } catch (error) {
      console.error(
        `error loading localization file for language ${lang}`,
        error,
      );
    }
  });
};

// load locales
load();

export const getLocalizedMessage = (
  key: string,
  lang: Language,
  params: Record<string, string> = {},
): string => {
  const messages = locales[lang] || locales[Language.EN];
  let message = messages[key] || key;

  // replace placeholders with dynamic values
  Object.entries(params).forEach(([paramKey, value]) => {
    message = message.replace(`{${paramKey}}`, value);
  });

  return message;
};
