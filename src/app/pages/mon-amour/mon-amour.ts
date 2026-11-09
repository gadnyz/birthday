import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { Countdown } from '../../components/countdown';
import { Envelope } from '../../components/envelope';
import { Icon } from '../../components/icon';
import { Lightbox, LightboxItem } from '../../components/lightbox';
import { RoseRain } from '../../components/rose-rain';

interface LoveContent {
  from: string;
  youtubeId: string;
  letter: { title: string; paragraphs: string[] };
  reasons: string[];
  timeline: { date: string; title: string; text: string; photoUrl: string | null }[];
  photos: { path: string; caption: string; url: string | null }[];
  video: { path: string; caption: string; url: string | null };
  coupons: { icon: string; title: string; text: string }[];
  nextDate: { label: string; at: string };
}

interface Petal {
  id: number;
  x: number;
  y: number;
  r: number;
}

const COUPONS_KEY = 'vn-coupons';

@Component({
  selector: 'app-mon-amour',
  imports: [FormsModule, TranslocoPipe, RoseRain, Envelope, Countdown, Lightbox, Icon],
  templateUrl: './mon-amour.html',
  styleUrl: './mon-amour.css',
  host: {
    '(pointermove)': 'trail($event)',
    '(pointerdown)': 'trail($event, true)',
  },
})
export class MonAmour implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly state = signal<'checking' | 'locked' | 'open'>('checking');
  protected readonly code = signal('');
  protected readonly busy = signal(false);
  protected readonly badCode = signal(false);
  protected readonly content = signal<LoveContent | null>(null);
  protected readonly letterOpen = signal(false);
  protected readonly flipped = signal<Set<number>>(new Set());
  protected readonly used = signal<Set<number>>(new Set());
  protected readonly petals = signal<Petal[]>([]);
  protected readonly lightboxIndex = signal<number | null>(null);

  protected readonly media = computed<LightboxItem[]>(() => {
    const c = this.content();
    if (!c) return [];
    return c.photos.filter((p) => p.url).map((p) => ({ type: 'photo', url: p.url!, caption: p.caption }));
  });

  protected readonly songUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.content()?.youtubeId;
    if (!id || !this.letterOpen()) return null;
    // Le clic sur l'enveloppe autorise la lecture automatique avec le son.
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`,
    );
  });

  protected readonly nextDateMs = computed(() => {
    const at = this.content()?.nextDate.at;
    const t = at ? new Date(at).getTime() : NaN;
    return Number.isFinite(t) && t > Date.now() ? t : null;
  });

  private petalId = 0;
  private lastPetal = 0;

  async ngOnInit() {
    try {
      const used = JSON.parse(localStorage.getItem(COUPONS_KEY) ?? '[]') as number[];
      this.used.set(new Set(used));
    } catch {
      /* rien */
    }
    try {
      const { unlocked } = await firstValueFrom(this.http.get<{ unlocked: boolean }>('/api/mon-amour/unlock'));
      if (unlocked) return await this.load();
    } catch {
      /* API indisponible */
    }
    this.state.set('locked');
  }

  async unlock() {
    if (this.busy() || !this.code().trim()) return;
    this.busy.set(true);
    this.badCode.set(false);
    try {
      await firstValueFrom(this.http.post('/api/mon-amour/unlock', { code: this.code() }));
      await this.load();
    } catch {
      this.badCode.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private async load() {
    const c = await firstValueFrom(this.http.get<LoveContent>('/api/mon-amour/content'));
    this.content.set(c);
    this.state.set('open');
  }

  toggleReason(i: number) {
    this.flipped.update((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }

  useCoupon(i: number) {
    this.used.update((s) => new Set(s).add(i));
    try {
      localStorage.setItem(COUPONS_KEY, JSON.stringify([...this.used()]));
    } catch {
      /* rien */
    }
  }

  /** Pétales qui tombent au survol de la souris et au toucher. */
  trail(e: PointerEvent, burst = false) {
    if (this.state() !== 'open') return;
    const now = performance.now();
    if (!burst && now - this.lastPetal < 70) return;
    this.lastPetal = now;
    const add: Petal[] = Array.from({ length: burst ? 6 : 1 }, () => ({
      id: this.petalId++,
      x: e.clientX + (Math.random() - 0.5) * (burst ? 60 : 10),
      y: e.clientY,
      r: Math.random() * 360,
    }));
    this.petals.update((p) => [...p.slice(-40), ...add]);
    const ids = new Set(add.map((p) => p.id));
    setTimeout(() => this.petals.update((p) => p.filter((x) => !ids.has(x.id))), 1600);
  }
}
