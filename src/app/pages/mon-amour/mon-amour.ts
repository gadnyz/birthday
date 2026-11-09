import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { Countdown } from '../../components/countdown';
import { DecoFrame } from '../../components/deco-frame';
import { Envelope } from '../../components/envelope';
import { Icon } from '../../components/icon';
import { Lightbox, LightboxItem } from '../../components/lightbox';
import { RoseRain } from '../../components/rose-rain';

interface LoveContent {
  from: string;
  letter: { title: string; paragraphs: string[] };
  reasons: string[];
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
  /** Un sur trois : un petit cœur rose au lieu d'un pétale. */
  heart: boolean;
}

const COUPONS_KEY = 'vn-coupons';

/** Chanson KS Bloom - « La Mour », lue en boucle à partir de la 30e seconde. */
const SONG_URL = '/KS_BLOOM_-_La_Mour_Clip_officiel.mp3';
const SONG_START = 30;
/** Gestes qui autorisent le son (sur mobile, c'est la fin du toucher qui compte). */
const UNLOCK_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'] as const;

@Component({
  selector: 'app-mon-amour',
  imports: [FormsModule, TranslocoPipe, RoseRain, Envelope, Countdown, Lightbox, Icon, DecoFrame],
  templateUrl: './mon-amour.html',
  styleUrl: './mon-amour.css',
  host: {
    '(pointermove)': 'trail($event)',
    '(pointerdown)': 'trail($event, true)',
  },
})
export class MonAmour implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);

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
  /** Cœurs roses et bleu ciel pour la pluie de cœurs. */
  protected readonly pinkHearts = ['#F49AC1', '#E8648F', '#F7B6D2', '#87CEEB'];

  protected readonly media = computed<LightboxItem[]>(() => {
    const c = this.content();
    if (!c) return [];
    return c.photos.filter((p) => p.url).map((p) => ({ type: 'photo', url: p.url!, caption: p.caption }));
  });


  protected readonly nextDateMs = computed(() => {
    const at = this.content()?.nextDate.at;
    const t = at ? new Date(at).getTime() : NaN;
    return Number.isFinite(t) && t > Date.now() ? t : null;
  });

  // ---------- Musique ----------
  protected readonly playing = signal(false);
  /** Le navigateur a bloqué le son : on affiche l'écran « touche pour commencer ». */
  protected readonly needsTap = signal(false);
  private song?: HTMLAudioElement;
  private gestureStart = 0;
  private readonly unlockAudio = () => {
    this.gestureStart = performance.now();
    this.playSong();
  };

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
    this.playSong(); // dans le geste du clic : le navigateur autorise le son
    try {
      await firstValueFrom(this.http.post('/api/mon-amour/unlock', { code: this.code() }));
      await this.load();
    } catch {
      this.badCode.set(true);
      this.song?.pause();
    } finally {
      this.busy.set(false);
    }
  }

  private async load() {
    const c = await firstValueFrom(this.http.get<LoveContent>('/api/mon-amour/content'));
    this.content.set(c);
    this.state.set('open');
    this.playSong();
  }

  /**
   * Lance la chanson à 30 s. Si le navigateur bloque la lecture automatique,
   * elle démarre au premier toucher ou clic sur la page.
   */
  playSong() {
    if (!this.song) {
      // #t=30 : démarre directement à la 30e seconde.
      this.song = new Audio(SONG_URL + '#t=' + SONG_START);
      this.song.preload = 'auto';
      this.song.addEventListener('loadedmetadata', () => {
        if (this.song!.currentTime < SONG_START - 1) this.song!.currentTime = SONG_START;
      });
      // Fin du morceau : on reprend à la 30e seconde, tant que la page reste ouverte.
      this.song.addEventListener('ended', () => {
        this.song!.currentTime = SONG_START;
        void this.song!.play();
      });
      this.song.addEventListener('play', () => this.playing.set(true));
      this.song.addEventListener('pause', () => this.playing.set(false));
    }
    this.song
      .play()
      .then(() => {
        this.needsTap.set(false);
        this.removeUnlock();
      })
      .catch(() => {
        // Lecture bloquée sans geste : on attend le premier vrai toucher / clic.
        this.needsTap.set(true);
        for (const ev of UNLOCK_EVENTS) document.addEventListener(ev, this.unlockAudio, { once: true });
      });
  }

  toggleSong() {
    // Le toucher qui vient de débloquer le son ne doit pas le remettre en pause.
    if (performance.now() - this.gestureStart < 600) return;
    if (this.song && !this.song.paused) this.song.pause();
    else this.playSong();
  }

  private removeUnlock() {
    for (const ev of UNLOCK_EVENTS) document.removeEventListener(ev, this.unlockAudio);
  }

  ngOnDestroy() {
    this.removeUnlock();
    this.song?.pause();
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

  /** Pétales et cœurs qui tombent au survol de la souris et au toucher. */
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
      heart: this.petalId % 3 === 0,
    }));
    this.petals.update((p) => [...p.slice(-40), ...add]);
    const ids = new Set(add.map((p) => p.id));
    setTimeout(() => this.petals.update((p) => p.filter((x) => !ids.has(x.id))), 1600);
  }
}
