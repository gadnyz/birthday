import { Component, computed, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RevealService } from '../services/reveal.service';

/** Compte à rebours en carrés pleins (bleu ciel, ou rose sur /mon-amour) jusqu'à `target` (ms). */
@Component({
  selector: 'app-countdown',
  imports: [TranslocoPipe],
  template: `
    <div class="flex justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
      @for (p of parts(); track p.key) {
        <div
          class="flex w-16 flex-col items-center rounded-[3px] py-2.5 sm:w-20 sm:py-3"
          [class]="accent() === 'rose' ? 'bg-rose text-noir' : 'bg-ciel text-noir'"
        >
          <span class="font-display text-3xl leading-none tabular-nums sm:text-4xl">{{ p.value }}</span>
          <span class="mt-1 font-sans text-[10px] sm:text-xs">{{ 'countdown.' + p.key | transloco }}</span>
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
