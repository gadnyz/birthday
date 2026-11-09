import { Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RevealService } from '../services/reveal.service';

/** Compte à rebours jours / heures / minutes / secondes jusqu'à `target` (ms). */
@Component({
  selector: 'app-countdown',
  imports: [TranslocoPipe],
  template: `
    <div class="grid grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="off">
      @for (p of parts(); track p.key) {
        <div
          class="flex flex-col items-center rounded-2xl border px-2 py-3 sm:px-4 sm:py-5"
          [class]="accent() === 'rose' ? 'border-rose/30 bg-rose/5' : 'border-ciel/25 bg-ciel/5'"
        >
          <span
            class="font-sans text-3xl font-semibold tabular-nums sm:text-5xl"
            [class]="accent() === 'rose' ? 'text-rose' : 'text-ciel'"
            >{{ p.value }}</span
          >
          <span class="mt-1 font-sans text-[10px] tracking-widest text-creme/60 uppercase sm:text-xs">{{
            'countdown.' + p.key | transloco
          }}</span>
        </div>
      }
    </div>
  `,
})
export class Countdown {
  private readonly clock = inject(RevealService);
  readonly target = input.required<number>();
  readonly accent = input<'ciel' | 'rose'>('ciel');

  protected readonly parts = computed(() => {
    let s = Math.max(0, Math.floor((this.target() - this.clock.now()) / 1000));
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    const seconds = s - minutes * 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return [
      { key: 'days', value: String(days) },
      { key: 'hours', value: pad(hours) },
      { key: 'minutes', value: pad(minutes) },
      { key: 'seconds', value: pad(seconds) },
    ];
  });
}
