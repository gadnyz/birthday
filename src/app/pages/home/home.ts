import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContributionForm } from '../../components/contribution-form';
import { Countdown } from '../../components/countdown';
import { Icon } from '../../components/icon';
import { Lightbox, LightboxItem } from '../../components/lightbox';
import { RevealCurtain } from '../../components/reveal-curtain';
import { RoseRain } from '../../components/rose-rain';
import { MessagesService } from '../../services/messages.service';
import { RevealService } from '../../services/reveal.service';

const CURTAIN_KEY = 'vn-curtain-seen';

@Component({
  selector: 'app-home',
  imports: [TranslocoPipe, RouterLink, Countdown, ContributionForm, RevealCurtain, RoseRain, Lightbox, Icon],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  protected readonly reveal = inject(RevealService);
  private readonly api = inject(MessagesService);

  protected readonly count = signal<number | null>(null);
  protected readonly showForm = signal(false);
  protected readonly showCurtain = signal(false);
  protected readonly hearts = signal(0);
  protected readonly lightboxIndex = signal<number | null>(null);

  /** Photos publiques de l'accueil (public/img/accueil). */
  protected readonly gallery: LightboxItem[] = ['principal', '1', '2', '3', '4'].map((n) => ({
    type: 'photo',
    url: `/img/accueil/${n}.jpeg`,
  }));

  private typed = '';

  async ngOnInit() {
    await this.reveal.ready;
    if (this.reveal.revealed()) {
      try {
        this.showCurtain.set(!sessionStorage.getItem(CURTAIN_KEY));
      } catch {
        this.showCurtain.set(true);
      }
    }
    this.refreshCount();
  }

  async refreshCount() {
    try {
      this.count.set((await this.api.list()).count);
    } catch {
      this.count.set(null);
    }
  }

  curtainOpened() {
    try {
      sessionStorage.setItem(CURTAIN_KEY, '1');
    } catch {
      /* rien */
    }
  }

  /** Easter egg : taper « Victorine » déclenche une pluie de cœurs bleu ciel. */
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key.length !== 1) return;
    this.typed = (this.typed + e.key.toLowerCase()).slice(-9);
    if (this.typed === 'victorine') {
      this.typed = '';
      this.hearts.update((n) => n + 1);
      setTimeout(() => this.hearts.update((n) => Math.max(0, n - 1)), 11000);
    }
  }
}
