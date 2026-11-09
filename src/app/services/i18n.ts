import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import {
  getBrowserLang,
  provideTransloco,
  Translation,
  TranslocoLoader,
  TranslocoService,
} from '@jsverse/transloco';
import type { Lang } from './messages.service';

export const LANGS: Lang[] = ['fr', 'en'];
const STORAGE_KEY = 'vn-lang';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}

export function provideI18n() {
  return provideTransloco({
    config: {
      availableLangs: LANGS,
      defaultLang: 'fr',
      fallbackLang: 'fr',
      reRenderOnLangChange: true,
      missingHandler: { useFallbackTranslation: true },
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader,
  });
}

/** Langue initiale : choix mémorisé, sinon langue du navigateur, sinon français. */
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && LANGS.includes(saved)) return saved;
  } catch {
    /* stockage indisponible */
  }
  const browser = getBrowserLang() as Lang | undefined;
  return browser && LANGS.includes(browser) ? browser : 'fr';
}

export function setLang(transloco: TranslocoService, lang: Lang): void {
  transloco.setActiveLang(lang);
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* stockage indisponible */
  }
}
