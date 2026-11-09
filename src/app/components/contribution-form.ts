import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Icon } from './icon';
import { Lang, MessagesService, Relation, RELATIONS } from '../services/messages.service';

const PROFILE_KEY = 'vn-author';

/** Formulaire « Laisse un mot à Victorine » : nom, lien, message et photo facultative. */
@Component({
  selector: 'app-contribution-form',
  imports: [FormsModule, TranslocoPipe, Icon],
  template: `
    @if (done()) {
      <div class="panel-inner p-8 text-center animate-float-up">
        <app-icon name="heart" [filled]="true" class="size-12 text-ciel" />
        <p class="mt-4 text-2xl text-creme">{{ (revealed() ? 'form.thanksRevealed' : 'form.thanks') | transloco }}</p>
        <button type="button" class="btn btn-ghost mt-6" (click)="reset()">{{ 'form.another' | transloco }}</button>
      </div>
    } @else {
      <form class="panel-inner relative space-y-5 p-5 sm:p-7" (ngSubmit)="submit()" novalidate>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="label" for="name">{{ 'form.name' | transloco }}</label>
            <input id="name" name="name" class="field" maxlength="80" autocomplete="name"
              [placeholder]="'form.namePlaceholder' | transloco" [(ngModel)]="name" required />
          </div>
          <div>
            <label class="label" for="relation">{{ 'form.relation' | transloco }}</label>
            <select id="relation" name="relation" class="field" [(ngModel)]="relation">
              @for (r of relations; track r) {
                <option [value]="r">{{ 'form.relations.' + r | transloco }}</option>
              }
            </select>
          </div>
        </div>

        <div>
          <label class="label" for="body">{{ 'form.memory' | transloco }}</label>
          <textarea id="body" name="body" class="field min-h-40" maxlength="2000"
            [placeholder]="'form.memoryPlaceholder' | transloco" [(ngModel)]="body"></textarea>
          <p class="mt-1.5 text-right font-sans text-xs text-creme/50 tabular-nums">{{ body().length }}/2000</p>
        </div>

        <div>
          <span class="label">{{ 'form.photo' | transloco }} <em class="text-creme/40">({{ 'form.optional' | transloco }})</em></span>
          @if (photoPreview(); as src) {
            <div class="relative overflow-hidden rounded-[3px]">
              <img [src]="src" alt="" class="max-h-72 w-full object-cover" />
              <button type="button" class="absolute top-2 right-2 rounded-full bg-noir/80 px-3 py-1 font-sans text-xs" (click)="clearPhoto()">
                {{ 'form.remove' | transloco }}
              </button>
            </div>
          } @else {
            <label class="drop-zone">
              <app-icon name="camera" [stroke]="1.5" class="size-8" />
              <span>{{ 'form.choosePhoto' | transloco }}</span>
              <input type="file" accept="image/*" class="sr-only" (change)="pickPhoto($event)" />
            </label>
          }
        </div>

        <!-- Champ piège anti-robots : invisible pour les humains -->
        <div class="absolute -left-[9999px]" aria-hidden="true">
          <label>Website <input name="website" tabindex="-1" autocomplete="off" [(ngModel)]="website" /></label>
        </div>

        @if (error()) {
          <p class="rounded-[3px] border border-rose/40 bg-rose/10 px-4 py-3 font-sans text-sm text-creme" role="alert">
            {{ 'form.errors.' + error() | transloco }}
          </p>
        }

        <button type="submit" class="btn btn-ciel w-full py-3.5 text-base sm:w-auto sm:px-10" [disabled]="busy()">
          @if (progress() !== null) {
            {{ 'form.uploading' | transloco: { p: progress() } }}
          } @else if (busy()) {
            {{ 'form.sending' | transloco }}
          } @else {
            <app-icon name="mail" class="size-5" /> {{ 'form.submit' | transloco }}
          }
        </button>
      </form>
    }
  `,
  styles: `
    .drop-zone {
      display: flex;
      min-height: 9rem;
      cursor: pointer;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: 3px;
      border: 1.5px dashed rgb(135 206 235 / 0.45);
      background: rgb(135 206 235 / 0.05);
      font-family: var(--font-sans);
      font-size: 0.875rem;
      color: var(--color-ciel-clair);
      transition: background 0.2s;
    }
    .drop-zone:hover { background: rgb(135 206 235 / 0.12); }
  `,
})
export class ContributionForm implements OnDestroy {
  private readonly api = inject(MessagesService);
  private readonly transloco = inject(TranslocoService);

  readonly revealed = input(false);
  readonly submitted = output<void>();

  protected readonly relations = RELATIONS;

  protected readonly name = signal('');
  protected readonly relation = signal<Relation>('ami');
  protected readonly body = signal('');
  protected readonly website = signal('');

  private photo: Blob | null = null;
  protected readonly photoPreview = signal<string | null>(null);

  protected readonly busy = signal(false);
  protected readonly progress = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal(false);

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null');
      if (saved) {
        this.name.set(saved.name ?? '');
        this.relation.set(saved.relation ?? 'ami');
      }
    } catch {
      /* rien */
    }
  }

  async pickPhoto(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.error.set(null);
    try {
      this.photo = await compressImage(file);
      this.setPreview(this.photo);
    } catch {
      this.error.set('photoInvalid');
    }
  }

  clearPhoto() {
    this.photo = null;
    this.setPreview(null);
  }

  async submit() {
    if (this.busy()) return;
    this.error.set(null);
    if (!this.name().trim()) return this.error.set('name');
    if (!this.body().trim() && !this.photo) return this.error.set('empty');

    this.busy.set(true);
    try {
      let photo_path: string | null = null;
      if (this.photo) {
        this.progress.set(0);
        photo_path = await this.api.upload(this.photo, 'image/jpeg', (p) => this.progress.set(p));
        this.progress.set(null);
      }

      await this.api.create({
        author_name: this.name().trim(),
        relation: this.relation(),
        // La langue n'est pas demandée : on enregistre celle de l'interface.
        lang: this.transloco.getActiveLang() as Lang,
        body: this.body().trim(),
        photo_path,
        website: this.website(),
      });

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: this.name(), relation: this.relation() }));
      } catch {
        /* rien */
      }
      this.done.set(true);
      this.submitted.emit();
    } catch (err) {
      this.error.set(err instanceof HttpErrorResponse && err.status === 429 ? 'tooMany' : 'generic');
    } finally {
      this.busy.set(false);
      this.progress.set(null);
    }
  }

  reset() {
    this.body.set('');
    this.clearPhoto();
    this.done.set(false);
  }

  private setPreview(blob: Blob | null) {
    const old = this.photoPreview();
    if (old) URL.revokeObjectURL(old);
    this.photoPreview.set(blob ? URL.createObjectURL(blob) : null);
  }

  ngOnDestroy() {
    this.clearPhoto();
  }
}

/** Redimensionne la photo (1600 px max) et la ré-encode en JPEG avant l'envoi. */
async function compressImage(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', quality),
  );
}
