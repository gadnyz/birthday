import { DatePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from './icon';
import type { Message } from '../services/messages.service';

/** Carte d'un message du mur des souvenirs (texte, photo, vidéo). */
@Component({
  selector: 'app-message-card',
  imports: [TranslocoPipe, DatePipe, Icon],
  template: `
    @let m = message();
    <article class="card print-card mb-4 break-inside-avoid overflow-hidden animate-float-up">
      @if (m.photo_url) {
        <button type="button" class="block w-full" (click)="openMedia.emit('photo')" aria-label="Agrandir la photo">
          <img [src]="m.photo_url" alt="" loading="lazy" class="w-full object-cover" />
        </button>
      }
      @if (m.video_url) {
        <button type="button" class="relative block w-full bg-black" (click)="openMedia.emit('video')" aria-label="Lire la vidéo">
          <video [src]="m.video_url + '#t=0.5'" preload="metadata" muted playsinline class="w-full"></video>
          <span class="absolute inset-0 flex items-center justify-center">
            <span class="flex h-14 w-14 items-center justify-center rounded-full bg-ciel/90 text-noir shadow-lg"><app-icon name="play" [filled]="true" class="ml-1 size-6" /></span>
          </span>
        </button>
      }
      <div class="p-5">
        @if (m.body) {
          <p class="text-xl leading-relaxed whitespace-pre-line text-creme/95" [attr.lang]="m.lang">{{ m.body }}</p>
        }
        <footer class="mt-4 flex items-end justify-between gap-3 font-sans">
          <div>
            <p class="font-semibold text-ciel">{{ m.author_name }}</p>
            <p class="text-xs text-creme/50">
              {{ 'form.relations.' + m.relation | transloco }}
              @if (m.city) {
                · <app-icon name="map-pin" class="size-3" /> {{ m.city }}
              }
              · {{ m.created_at | date: 'd MMM' }}
            </p>
          </div>
          <button
            type="button"
            class="no-print flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition"
            [class]="liked() ? 'border-ciel bg-ciel/15 text-ciel' : 'border-white/10 text-creme/70 hover:border-ciel/50'"
            (click)="like()"
            aria-label="J'aime"
          >
            <app-icon name="heart" [filled]="liked()" class="size-4 transition" [class.scale-125]="liked()" />
            <span class="tabular-nums">{{ m.hearts }}</span>
          </button>
        </footer>
      </div>
    </article>
  `,
})
export class MessageCard {
  readonly message = input.required<Message>();
  readonly openMedia = output<'photo' | 'video'>();
  readonly heart = output<void>();
  protected readonly liked = signal(false);

  like() {
    this.liked.set(true);
    this.heart.emit();
  }
}
