import { Component, computed, input } from '@angular/core';

export type RainKind = 'roses' | 'hearts' | 'confetti' | 'petals';

interface Drop {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  sway: number;
  color: string;
}

// Bleus ciel, blanc et argent : les couleurs de Victorine
const CONFETTI = ['#87CEEB', '#B9E4F5', '#4FA9D1', '#FFFFFF', '#DDE7EE', '#5B9BD5'];

/**
 * Pluie décorative plein écran (roses, cœurs, confettis, pétales).
 * Purement CSS : aucune boucle JS, et `pointer-events: none` pour ne rien bloquer.
 */
@Component({
  selector: 'app-rose-rain',
  template: `
    <div class="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      @for (d of drops(); track d.id) {
        <span
          class="drop absolute -top-16 select-none"
          [class.loop]="loop()"
          [style.left.%]="d.left"
          [style.font-size.px]="d.size"
          [style.animation-delay.s]="d.delay"
          [style.animation-duration.s]="d.duration"
          [style.--sway]="d.sway + 'px'"
          [style.--rot]="d.rotate + 'deg'"
        >
          @switch (kind()) {
            @case ('hearts') {
              <svg [attr.width]="d.size" [attr.height]="d.size" viewBox="0 0 24 24">
                <path [attr.fill]="d.color" d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />
              </svg>
            }
            @case ('confetti') {
              <i class="block" [style.width.px]="d.size / 2.5" [style.height.px]="d.size / 1.2" [style.background]="d.color"></i>
            }
            @case ('petals') {
              <i class="petal block" [style.width.px]="d.size / 1.6" [style.height.px]="d.size" [style.background]="d.color"></i>
            }
            @default {
              <i class="petal block" [style.width.px]="d.size / 1.4" [style.height.px]="d.size / 1.1" [style.background]="d.color"></i>
            }
          }
        </span>
      }
    </div>
  `,
  styles: `
    .drop {
      animation-name: fall;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-iteration-count: 1;
    }
    .drop.loop {
      animation-iteration-count: infinite;
    }
    .petal {
      border-radius: 80% 0 80% 0;
      box-shadow: inset -2px -2px 6px rgb(0 0 0 / 0.25);
    }
    @keyframes fall {
      0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      50% { transform: translate3d(var(--sway), 50vh, 0) rotate(calc(var(--rot) / 2)); }
      90% { opacity: 1; }
      100% { transform: translate3d(0, 110vh, 0) rotate(var(--rot)); opacity: 0; }
    }
  `,
})
export class RoseRain {
  readonly kind = input<RainKind>('roses');
  readonly count = input(36);
  /** true : pluie continue ; false : une seule vague. */
  readonly loop = input(false);
  /** Durée de la vague (s), utilisée pour étaler les départs. */
  readonly spread = input(4);

  protected readonly drops = computed<Drop[]>(() => {
    const kind = this.kind();
    return Array.from({ length: this.count() }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * this.spread(),
      duration: 5 + Math.random() * 5,
      size: kind === 'confetti' ? 14 + Math.random() * 10 : 18 + Math.random() * 22,
      rotate: (Math.random() - 0.5) * 720,
      sway: (Math.random() - 0.5) * 160,
      color:
        kind === 'hearts'
          ? ['#87CEEB', '#B9E4F5', '#4FA9D1'][id % 3]!
          : kind === 'petals' || kind === 'roses'
            ? ['#C8102E', '#A50D26', '#E0314B'][id % 3]!
            : CONFETTI[id % CONFETTI.length]!,
    }));
  });
}
