import { Component, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RoseRain } from './rose-rain';

/** Animation d'ouverture du soir J : rideau, puis confettis et roses. */
@Component({
  selector: 'app-reveal-curtain',
  imports: [TranslocoPipe, RoseRain],
  template: `
    @if (state() !== 'done') {
      <div class="fixed inset-0 z-50 overflow-hidden" [class.opening]="state() === 'opening'">
        <div class="curtain left-0"></div>
        <div class="curtain right-0"></div>
        @if (state() === 'closed') {
          <button
            type="button"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-center"
            (click)="open()"
          >
            <span class="font-script text-6xl text-ciel drop-shadow-lg sm:text-8xl">Victorine</span>
            <span class="animate-pulse font-sans text-sm tracking-[0.3em] text-creme/80 uppercase">{{ 'home.tapToOpen' | transloco }}</span>
          </button>
        }
      </div>
    }
    @if (state() !== 'closed') {
      <app-rose-rain kind="confetti" [count]="70" [spread]="2" />
      <app-rose-rain kind="roses" [count]="24" [spread]="5" />
    }
  `,
  styles: `
    .curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 50.5%;
      background:
        repeating-linear-gradient(90deg, rgb(0 0 0 / 0.35) 0 6px, transparent 6px 40px),
        linear-gradient(180deg, #1a3f52, #0b0b0f);
      transition: transform 1.8s cubic-bezier(0.7, 0, 0.3, 1);
      box-shadow: inset 0 -40px 80px rgb(0 0 0 / 0.6);
    }
    .curtain.left-0 { transform-origin: left; }
    .opening .curtain.left-0 { transform: translateX(-100%); }
    .opening .curtain.right-0 { transform: translateX(100%); }
  `,
})
export class RevealCurtain {
  protected readonly state = signal<'closed' | 'opening' | 'done'>('closed');
  readonly opened = output<void>();

  open() {
    this.state.set('opening');
    this.opened.emit();
    setTimeout(() => this.state.set('done'), 1900);
  }
}
