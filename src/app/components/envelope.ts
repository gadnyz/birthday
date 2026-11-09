import { Component, input, output, signal } from '@angular/core';
import { Icon } from './icon';

/** Enveloppe scellée d'un cachet de cire : un toucher l'ouvre et fait glisser la lettre. */
@Component({
  selector: 'app-envelope',
  imports: [Icon],
  template: `
    <div class="mx-auto w-full max-w-md select-none" [class.opened]="opened()">
      @if (!opened()) {
        <p class="mb-4 text-center font-sans text-sm tracking-widest text-creme/60 uppercase">{{ hint() }}</p>
      }
      <div class="envelope relative mx-auto aspect-[4/3] w-full">
        <div class="back absolute inset-0 rounded-lg"></div>
        <div class="letter absolute inset-x-4 top-4 bottom-2 rounded-md bg-creme p-4 text-nuit shadow-inner">
          <p class="font-script text-3xl text-rose">{{ title() }}</p>
        </div>
        <div class="front absolute inset-0 rounded-lg"></div>
        <div class="flap absolute inset-x-0 top-0 h-1/2"></div>
        <button
          type="button"
          class="seal absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-xl"
          (click)="open()"
          [attr.aria-label]="hint()"
        >
          <app-icon name="heart" [filled]="true" class="size-7" />
        </button>
      </div>
    </div>
  `,
  styles: `
    .envelope { perspective: 900px; }
    .back { background: #7a0a1c; }
    .front {
      background:
        linear-gradient(to top right, #a50d26 50%, transparent 50%) left / 50% 100% no-repeat,
        linear-gradient(to top left, #a50d26 50%, transparent 50%) right / 50% 100% no-repeat;
      z-index: 2;
    }
    .flap {
      background: #c8102e;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      transform-origin: top;
      transition: transform 0.8s ease, z-index 0s 0.4s;
      z-index: 3;
    }
    .letter {
      transition: transform 1s ease 0.6s;
      z-index: 1;
    }
    .seal {
      z-index: 4;
      background: radial-gradient(circle at 35% 35%, #e0314b, #8c0b20);
      color: #f7f3ee;
      transition: opacity 0.4s, transform 0.4s;
      animation: pulse 2s ease-in-out infinite;
    }
    .opened .flap { transform: rotateX(180deg); z-index: 0; }
    .opened .letter { transform: translateY(-55%); }
    .opened .seal { opacity: 0; transform: translate(-50%, -50%) scale(1.6); pointer-events: none; }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgb(200 16 46 / 0.6); }
      50% { box-shadow: 0 0 0 14px rgb(200 16 46 / 0); }
    }
  `,
})
export class Envelope {
  readonly title = input('');
  readonly hint = input('');
  readonly opened = signal(false);
  readonly opens = output<void>();

  open() {
    if (this.opened()) return;
    this.opened.set(true);
    this.opens.emit();
  }
}
