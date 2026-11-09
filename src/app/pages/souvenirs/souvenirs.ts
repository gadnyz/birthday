import { Component, computed, effect, HostListener, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '../../components/icon';
import { Lightbox, LightboxItem } from '../../components/lightbox';
import { MapPoint, MemoryMap } from '../../components/memory-map';
import { MessageCard } from '../../components/message-card';
import { LANGS } from '../../services/i18n';
import { Lang, Message, MessagesService } from '../../services/messages.service';

type TypeFilter = 'all' | 'text' | 'photo' | 'video';

@Component({
  selector: 'app-souvenirs',
  imports: [TranslocoPipe, RouterLink, MessageCard, Lightbox, MemoryMap, Icon],
  templateUrl: './souvenirs.html',
})
export class Souvenirs implements OnInit, OnDestroy {
  private readonly api = inject(MessagesService);
  private readonly router = inject(Router);

  /** Paramètre d'URL ?mode=diaporama (liaison automatique via withComponentInputBinding). */
  readonly mode = input<string>();

  protected readonly langs = LANGS;
  protected readonly loading = signal(true);
  protected readonly locked = signal(false);
  protected readonly messages = signal<Message[]>([]);
  protected readonly type = signal<TypeFilter>('all');
  protected readonly lang = signal<Lang | 'all'>('all');
  protected readonly lightboxIndex = signal<number | null>(null);

  protected readonly filtered = computed(() =>
    this.messages().filter((m) => {
      const t = this.type();
      if (t === 'photo' && !m.photo_url) return false;
      if (t === 'video' && !m.video_url) return false;
      if (t === 'text' && (m.photo_url || m.video_url)) return false;
      return this.lang() === 'all' || m.lang === this.lang();
    }),
  );

  /** Tous les médias du filtre courant, pour la visionneuse. */
  protected readonly media = computed(() =>
    this.filtered().flatMap((m) => {
      const items: (LightboxItem & { id: string })[] = [];
      const caption = `${m.author_name}${m.city ? ' · ' + m.city : ''}`;
      if (m.photo_url) items.push({ id: m.id + ':photo', type: 'photo', url: m.photo_url, caption });
      if (m.video_url) items.push({ id: m.id + ':video', type: 'video', url: m.video_url, caption });
      return items;
    }),
  );

  protected readonly mapPoints = computed<MapPoint[]>(() => {
    const byCity = new Map<string, MapPoint>();
    for (const m of this.messages()) {
      if (m.lat == null || m.lng == null || !m.city) continue;
      const key = m.city.trim().toLowerCase();
      const p = byCity.get(key) ?? { lat: m.lat, lng: m.lng, city: m.city, names: [] };
      p.names.push(m.author_name);
      byCity.set(key, p);
    }
    return [...byCity.values()];
  });

  // ---------- Diaporama ----------
  protected readonly slideshow = computed(() => this.mode() === 'diaporama');
  protected readonly slide = signal(0);
  protected readonly playing = signal(true);
  protected readonly current = computed(() => {
    const list = this.messages();
    return list.length ? list[this.slide() % list.length]! : null;
  });
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      // Relance la minuterie à chaque diapositive (sauf vidéo : on attend la fin).
      const m = this.current();
      clearTimeout(this.timer);
      if (!this.slideshow() || !this.playing() || !m || m.video_url) return;
      const words = m.body.split(/\s+/).length;
      this.timer = setTimeout(() => this.next(), Math.min(20000, 7000 + words * 250));
    });
  }

  async ngOnInit() {
    try {
      const r = await this.api.list();
      this.locked.set(!r.revealed);
      this.messages.set(r.messages);
    } catch {
      this.locked.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  openMedia(m: Message, kind: 'photo' | 'video') {
    const i = this.media().findIndex((x) => x.id === `${m.id}:${kind}`);
    this.lightboxIndex.set(i >= 0 ? i : null);
  }

  async heart(m: Message) {
    try {
      const { hearts } = await this.api.heart(m.id);
      this.messages.update((list) => list.map((x) => (x.id === m.id ? { ...x, hearts } : x)));
    } catch {
      /* rien */
    }
  }

  print() {
    window.print();
  }

  startSlideshow() {
    this.slide.set(0);
    this.playing.set(true);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    this.router.navigate([], { queryParams: { mode: 'diaporama' } });
  }

  exitSlideshow() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    this.router.navigate([], { queryParams: {} });
  }

  next() {
    this.slide.update((i) => (i + 1) % Math.max(1, this.messages().length));
  }

  prev() {
    const n = Math.max(1, this.messages().length);
    this.slide.update((i) => (i - 1 + n) % n);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.slideshow()) return;
    if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === ' ') {
      e.preventDefault();
      this.playing.update((p) => !p);
    } else if (e.key === 'Escape') this.exitSlideshow();
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
