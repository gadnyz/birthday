import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Countdown } from '../../components/countdown';
import { Icon } from '../../components/icon';
import { RevealService } from '../../services/reveal.service';

interface AdminMessage {
  id: string;
  author_name: string;
  relation: string;
  lang: string;
  body: string;
  hearts: number;
  hidden: boolean;
  created_at: string;
  photo_url: string | null;
  video_url: string | null;
}

interface AdminData {
  revealed: boolean;
  revealAt: string;
  stats: { total: number; visible: number; photos: number; videos: number };
  messages: AdminMessage[];
}

const EXPECTED_KEY = 'vn-admin-expected';

/** Espace organisateur : modération, compteur, relances et QR code. */
@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe, Countdown, Icon],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly reveal = inject(RevealService);

  protected readonly state = signal<'checking' | 'login' | 'ready'>('checking');
  protected readonly password = signal('');
  protected readonly loginError = signal(false);
  protected readonly data = signal<AdminData | null>(null);
  protected readonly expected = signal('');
  protected readonly siteUrl = signal(location.origin);
  private readonly qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('qr');

  /** Noms attendus qui n'ont pas encore écrit (comparaison souple, sans accents). */
  protected readonly missing = computed(() => {
    const authors = (this.data()?.messages ?? []).map((m) => normalize(m.author_name));
    return this.expected()
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean)
      .filter((n) => {
        const k = normalize(n);
        return !authors.some((a) => a.includes(k) || k.includes(a));
      });
  });

  constructor() {
    try {
      this.expected.set(localStorage.getItem(EXPECTED_KEY) ?? '');
    } catch {
      /* rien */
    }
    effect(() => {
      try {
        localStorage.setItem(EXPECTED_KEY, this.expected());
      } catch {
        /* rien */
      }
    });
    effect(async () => {
      const canvas = this.qrCanvas()?.nativeElement;
      const url = this.siteUrl();
      if (!canvas) return;
      const mod = await import('qrcode');
      const QR = (mod as unknown as { default?: typeof mod }).default ?? mod;
      QR.toCanvas(canvas, url, { width: 220, margin: 2, color: { dark: '#0B0B0F', light: '#F7F3EE' } });
    });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    try {
      this.data.set(await firstValueFrom(this.http.get<AdminData>('/api/admin/moderate')));
      this.state.set('ready');
    } catch {
      this.state.set('login');
    }
  }

  async login() {
    this.loginError.set(false);
    try {
      await firstValueFrom(this.http.post('/api/admin/moderate', { action: 'login', password: this.password() }));
      this.password.set('');
      await this.load();
    } catch {
      this.loginError.set(true);
    }
  }

  async logout() {
    await firstValueFrom(this.http.post('/api/admin/moderate', { action: 'logout' })).catch(() => undefined);
    this.data.set(null);
    this.state.set('login');
  }

  async act(m: AdminMessage, action: 'hide' | 'show' | 'delete') {
    if (action === 'delete' && !confirm(`Supprimer définitivement le message de ${m.author_name} ?`)) return;
    await firstValueFrom(this.http.post('/api/admin/moderate', { action, id: m.id }));
    await this.load();
  }

  downloadQr() {
    const canvas = this.qrCanvas()?.nativeElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'qr-anniversaire-victorine.png';
    a.click();
  }
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
