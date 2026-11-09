import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';

/** 9 novembre 2026, 20h00 à GMT+2. La valeur faisant foi est celle du serveur (/api/reveal). */
export const DEFAULT_REVEAL_AT = '2026-11-09T18:00:00Z';

interface RevealResponse {
  now: string;
  revealAt: string;
  revealed: boolean;
}

/**
 * Horloge de la révélation.
 * Attention : côté navigateur, ceci ne sert qu'à l'affichage : la vraie protection
 * est faite par l'API, qui ne renvoie aucun message avant REVEAL_AT.
 */
@Injectable({ providedIn: 'root' })
export class RevealService {
  private readonly http = inject(HttpClient);

  /** Décalage entre l'horloge du serveur et celle du téléphone. */
  private offset = 0;

  readonly revealAt = signal(new Date(DEFAULT_REVEAL_AT).getTime());
  readonly now = signal(Date.now());
  readonly remainingMs = computed(() => Math.max(0, this.revealAt() - this.now()));
  readonly revealed = computed(() => this.remainingMs() === 0);

  /** Résolue une fois l'heure du serveur connue (ou en cas d'échec, avec l'heure locale). */
  readonly ready: Promise<void>;

  constructor() {
    setInterval(() => this.now.set(Date.now() + this.offset), 1000);
    this.ready = this.sync();
  }

  private async sync(): Promise<void> {
    try {
      const r = await firstValueFrom(this.http.get<RevealResponse>('/api/reveal').pipe(timeout(4000)));
      this.offset = new Date(r.now).getTime() - Date.now();
      this.revealAt.set(new Date(r.revealAt).getTime());
      this.now.set(Date.now() + this.offset);
    } catch {
      // API indisponible (ex. `ng serve` sans `vercel dev`) : on garde l'heure locale.
    }
  }
}
