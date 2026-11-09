import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { LANGS, setLang } from '../services/i18n';
import type { Lang } from '../services/messages.service';

/** Sélecteur FR | EN | SW, sans rechargement de la page. */
@Component({
  selector: 'app-lang-switch',
  template: `
    <nav class="flex items-center gap-1 rounded-[4px] border border-or/30 p-1 font-sans text-xs" aria-label="Langue / Language">
      @for (l of langs; track l) {
        <button
          type="button"
          (click)="choose(l)"
          [attr.aria-pressed]="active() === l"
          class="rounded-[3px] px-3 py-1.5 uppercase tracking-wider transition"
          [class]="
            active() === l
              ? accent() === 'rose'
                ? 'bg-rose text-creme'
                : 'bg-or text-nuit'
              : 'text-creme/60 hover:text-creme'
          "
        >
          {{ l }}
        </button>
      }
    </nav>
  `,
})
export class LangSwitch {
  private readonly transloco = inject(TranslocoService);
  readonly accent = input<'or' | 'rose'>('or');
  protected readonly langs = LANGS;
  protected readonly active = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  choose(lang: Lang) {
    setLang(this.transloco, lang);
  }
}
