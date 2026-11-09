import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LANGS } from '../services/i18n';
import { Icon } from './icon';
import { Lang, MessagesService, Relation, RELATIONS } from '../services/messages.service';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 30;
const PROFILE_KEY = 'vn-author';

/** Formulaire « Laisse un mot à Victorine ». */
@Component({
  selector: 'app-contribution-form',
  imports: [FormsModule, TranslocoPipe, Icon],
  template: `
    @if (done()) {
      <div class="card p-8 text-center animate-float-up">
        <app-icon name="heart" [filled]="true" class="size-12 text-ciel" />
        <p class="mt-4 text-2xl text-creme">{{ (revealed() ? 'form.thanksRevealed' : 'form.thanks') | transloco }}</p>
        <button type="button" class="btn btn-ghost mt-6" (click)="reset()">{{ 'form.another' | transloco }}</button>
      </div>
    } @else {
      <form class="card space-y-5 p-5 sm:p-8" (ngSubmit)="submit()" novalidate>
        <h2 class="title-script text-4xl sm:text-5xl">{{ 'form.title' | transloco }}</h2>

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
          <textarea id="body" name="body" class="field min-h-40 font-serif text-lg" maxlength="2000"
            [placeholder]="'form.memoryPlaceholder' | transloco" [(ngModel)]="body"></textarea>
          <div class="mt-1.5 flex items-center justify-between gap-3 font-sans text-xs text-creme/50">
            <span class="flex items-center gap-2">
              {{ 'form.lang' | transloco }} :
              @for (l of langs; track l) {
                <button type="button" class="rounded-full border px-2 py-0.5 uppercase"
                  [class]="lang() === l ? 'border-ciel text-ciel' : 'border-white/10'" (click)="lang.set(l)">{{ l }}</button>
              }
            </span>
            <span class="tabular-nums">{{ body().length }}/2000</span>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Photo -->
          <div>
            <span class="label">{{ 'form.photo' | transloco }} <em class="text-creme/40">({{ 'form.optional' | transloco }})</em></span>
            @if (photoPreview(); as src) {
              <div class="relative overflow-hidden rounded-xl">
                <img [src]="src" alt="" class="max-h-56 w-full object-cover" />
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
          <!-- Vidéo -->
          <div>
            <span class="label">{{ 'form.video' | transloco }} <em class="text-creme/40">({{ 'form.videoHint' | transloco }})</em></span>
            @if (videoPreview(); as src) {
              <div class="relative overflow-hidden rounded-xl bg-black">
                <video [src]="src" controls playsinline class="max-h-56 w-full"></video>
                <button type="button" class="absolute top-2 right-2 rounded-full bg-noir/80 px-3 py-1 font-sans text-xs" (click)="clearVideo()">
                  {{ 'form.remove' | transloco }}
                </button>
              </div>
            } @else {
              <label class="drop-zone">
                <app-icon name="video" [stroke]="1.5" class="size-8" />
                <span>{{ 'form.chooseVideo' | transloco }}</span>
                <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" class="sr-only" (change)="pickVideo($event)" />
              </label>
            }
          </div>
        </div>

        <div>
          <label class="label" for="city">{{ 'form.city' | transloco }} <em class="text-creme/40">({{ 'form.optional' | transloco }})</em></label>
          <input id="city" name="city" class="field" maxlength="80" autocomplete="address-level2"
            [placeholder]="'form.cityPlaceholder' | transloco" [(ngModel)]="city" />
        </div>

        <!-- Champ piège anti-robots : invisible pour les humains -->
        <div class="absolute -left-[9999px]" aria-hidden="true">
          <label>Website <input name="website" tabindex="-1" autocomplete="off" [(ngModel)]="website" /></label>
        </div>

        @if (error()) {
          <p class="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 font-sans text-sm text-creme" role="alert">
            {{ 'form.errors.' + error() | transloco }}
          </p>
        }

        <button type="submit" class="btn btn-ciel w-full py-4 text-base" [disabled]="busy()">
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
      border-radius: 0.75rem;
      border: 1.5px dashed rgb(135 206 235 / 0.35);
      background: rgb(135 206 235 / 0.04);
      font-family: var(--font-sans);
      font-size: 0.875rem;
      color: var(--color-ciel-clair);
      transition: background 0.2s;
    }
    .drop-zone:hover { background: rgb(135 206 235 / 0.1); }
  `,
})
export class ContributionForm implements OnDestroy {
  private readonly api = inject(MessagesService);
  private readonly transloco = inject(TranslocoService);

  readonly revealed = input(false);
  readonly submitted = output<void>();

  protected readonly relations = RELATIONS;
  protected readonly langs = LANGS;

  protected readonly name = signal('');
  protected readonly relation = signal<Relation>('ami');
  protected readonly body = signal('');
  protected readonly lang = signal<Lang>(this.transloco.getActiveLang() as Lang);
  protected readonly city = signal('');
  protected readonly website = signal('');

  private photo: Blob | null = null;
  private video: File | null = null;
  protected readonly photoPreview = signal<string | null>(null);
  protected readonly videoPreview = signal<string | null>(null);

  protected readonly busy = signal(false);
  protected readonly progress = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal(false);
  protected readonly canSubmit = computed(() => !!this.name().trim());

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null');
      if (saved) {
        this.name.set(saved.name ?? '');
        this.relation.set(saved.relation ?? 'ami');
        this.city.set(saved.city ?? '');
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
      this.setPreview(this.photoPreview, this.photo);
    } catch {
      this.error.set('photoInvalid');
    }
  }

  async pickVideo(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.error.set(null);
    if (file.size > MAX_VIDEO_BYTES) return this.error.set('videoTooBig');
    try {
      const duration = await videoDuration(file);
      if (duration > MAX_VIDEO_SECONDS + 1) return this.error.set('videoTooLong');
    } catch {
      // Certains formats (ex. .mov sur Android) ne se lisent pas dans le navigateur : on accepte quand même.
    }
    this.video = file;
    this.setPreview(this.videoPreview, file);
  }

  clearPhoto() {
    this.photo = null;
    this.setPreview(this.photoPreview, null);
  }

  clearVideo() {
    this.video = null;
    this.setPreview(this.videoPreview, null);
  }

  async submit() {
    if (this.busy()) return;
    this.error.set(null);
    if (!this.name().trim()) return this.error.set('name');
    if (!this.body().trim() && !this.photo && !this.video) return this.error.set('empty');

    this.busy.set(true);
    try {
      let photo_path: string | null = null;
      let video_path: string | null = null;
      if (this.photo) {
        this.progress.set(0);
        photo_path = await this.api.upload(this.photo, 'image/jpeg', (p) => this.progress.set(p));
      }
      if (this.video) {
        this.progress.set(0);
        video_path = await this.api.upload(this.video, videoType(this.video), (p) => this.progress.set(p));
      }
      this.progress.set(null);

      await this.api.create({
        author_name: this.name().trim(),
        relation: this.relation(),
        lang: this.lang(),
        body: this.body().trim(),
        city: this.city().trim(),
        photo_path,
        video_path,
        website: this.website(),
      });

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: this.name(), relation: this.relation(), city: this.city() }));
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
    this.clearVideo();
    this.done.set(false);
  }

  private setPreview(target: ReturnType<typeof signal<string | null>>, blob: Blob | null) {
    const old = target();
    if (old) URL.revokeObjectURL(old);
    target.set(blob ? URL.createObjectURL(blob) : null);
  }

  ngOnDestroy() {
    this.clearPhoto();
    this.clearVideo();
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

function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    const url = URL.createObjectURL(file);
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('video'));
    };
    v.src = url;
  });
}

function videoType(file: File): string {
  if (file.type && file.type.startsWith('video/')) return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext === 'mov' ? 'video/quicktime' : ext === 'webm' ? 'video/webm' : 'video/mp4';
}
