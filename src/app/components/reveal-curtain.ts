import { Component, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { DecoFrame } from './deco-frame';
import { Icon } from './icon';
import { RoseRain } from './rose-rain';

/** Écran d'ouverture du soir J : carte d'accueil, puis confettis et pétales. */
@Component({
  selector: 'app-reveal-curtain',
  imports: [TranslocoPipe, RoseRain, DecoFrame, Icon],
  template: `
    @if (state() !== 'done') {
      <div class="screen fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" [class.leaving]="state() === 'opening'">
        <div class="w-full max-w-md animate-float-up">
          <app-deco-frame>
            <p class="eyebrow">{{ 'home.forYou' | transloco }}</p>
            <p class="title-script mt-4 text-5xl sm:text-6xl">{{ 'home.birthday' | transloco }}</p>
            <h1 class="title-display mt-3 text-6xl sm:text-7xl">Victorine</h1>
            <p class="mt-4 text-sm text-creme/80">09 · 11 · 2026</p>
            <button type="button" class="btn btn-ciel mt-8" (click)="open()">
              <app-icon name="mail" class="size-4" /> {{ 'home.tapToOpen' | transloco }}
            </button>
          </app-deco-frame>
        </div>
      </div>
    }
    @if (state() !== 'closed') {
      <app-rose-rain kind="confetti" [count]="70" [spread]="2" />
      <app-rose-rain kind="roses" [count]="24" [spread]="5" />
    }
  `,
  styles: `
    .screen {
      background: linear-gradient(180deg, #13202a, var(--color-noir) 70%);
      transition: opacity 0.9s ease, transform 0.9s ease;
    }
    .screen.leaving {
      opacity: 0;
      transform: scale(1.06);
      pointer-events: none;
    }
  `,
})
export class RevealCurtain {
  protected readonly state = signal<'closed' | 'opening' | 'done'>('closed');
  readonly opened = output<void>();

  open() {
    this.state.set('opening');
    this.opened.emit();
    setTimeout(() => this.state.set('done'), 950);
  }
}
