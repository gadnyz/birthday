import { Component, computed, HostListener, input, model, output } from '@angular/core';
import { Icon } from './icon';

export interface LightboxItem {
  type: 'photo' | 'video';
  url: string;
  caption?: string;
}

/** Visionneuse plein écran pour photos et vidéos (flèches, Échap, glisser sur mobile). */
@Component({
  selector: 'app-lightbox',
  imports: [Icon],
  template: `
    @if (current(); as item) {
      <div class="fixed inset-0 z-50 flex flex-col bg-noir/95 backdrop-blur" role="dialog" aria-modal="true" (click)="close.emit()">
        <div class="flex justify-end p-3">
          <button type="button" class="rounded-full p-3 leading-none text-creme/80 hover:text-creme" aria-label="Fermer" (click)="close.emit()">
            <app-icon name="x" class="size-7" />
          </button>
        </div>
        <div
          class="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4"
          (touchstart)="touchX = $any($event).changedTouches[0].clientX"
          (touchend)="swipe($any($event).changedTouches[0].clientX)"
        >
          @if (item.type === 'photo') {
            <img [src]="item.url" [alt]="item.caption ?? ''" class="max-h-full max-w-full rounded-lg object-contain shadow-2xl" (click)="$event.stopPropagation()" />
          } @else {
            <video [src]="item.url" controls autoplay playsinline class="max-h-full max-w-full rounded-lg" (click)="$event.stopPropagation()"></video>
          }
          @if (items().length > 1) {
            <button type="button" class="nav left-2" aria-label="Précédent" (click)="go(-1, $event)"><app-icon name="chevron-left" class="size-6" /></button>
            <button type="button" class="nav right-2" aria-label="Suivant" (click)="go(1, $event)"><app-icon name="chevron-right" class="size-6" /></button>
          }
        </div>
        @if (item.caption) {
          <p class="px-6 pb-6 text-center text-lg text-creme/80 italic">{{ item.caption }}</p>
        }
      </div>
    }
  `,
  styles: `
    .nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      background: rgb(22 22 29 / 0.7);
      color: var(--color-ciel);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class Lightbox {
  readonly items = input.required<LightboxItem[]>();
  readonly index = model<number | null>(null);
  readonly close = output<void>();
  protected touchX = 0;

  protected readonly current = computed(() => {
    const i = this.index();
    return i === null ? null : (this.items()[i] ?? null);
  });

  go(step: number, e?: Event) {
    e?.stopPropagation();
    const n = this.items().length;
    const i = this.index();
    if (i === null || !n) return;
    this.index.set((i + step + n) % n);
  }

  swipe(x: number) {
    const dx = x - this.touchX;
    if (Math.abs(dx) > 50) this.go(dx < 0 ? 1 : -1);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.index() === null) return;
    if (e.key === 'Escape') this.close.emit();
    if (e.key === 'ArrowRight') this.go(1);
    if (e.key === 'ArrowLeft') this.go(-1);
  }
}
