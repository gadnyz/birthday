import { Component } from '@angular/core';

/**
 * Carte d'accueil : panneau texturé, cadre fin bleu ciel en retrait,
 * et deux coins Art déco (rayons + points lumineux) en haut à droite et en bas à gauche.
 */
@Component({
  selector: 'app-deco-frame',
  template: `
    <div class="panel relative overflow-hidden">
      <div class="pointer-events-none absolute inset-3 border border-ciel/45 sm:inset-4"></div>

      <svg class="corner top-0 right-0" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M120 0 L0 0 L120 120 Z" fill="#050507" />
        <g stroke="#87ceeb" stroke-opacity="0.75" stroke-width="0.8">
          <line x1="120" y1="0" x2="18" y2="0" />
          <line x1="120" y1="0" x2="34" y2="22" />
          <line x1="120" y1="0" x2="56" y2="40" />
          <line x1="120" y1="0" x2="80" y2="58" />
          <line x1="120" y1="0" x2="98" y2="86" />
          <line x1="120" y1="0" x2="120" y2="104" />
        </g>
        <g fill="#e3f6fd" class="glow">
          <circle cx="34" cy="22" r="2.2" />
          <circle cx="80" cy="58" r="2.6" />
          <circle cx="56" cy="8" r="1.6" />
          <circle cx="120" cy="104" r="2.2" />
        </g>
      </svg>

      <svg class="corner bottom-0 left-0 rotate-180" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M120 0 L0 0 L120 120 Z" fill="#050507" />
        <g stroke="#87ceeb" stroke-opacity="0.75" stroke-width="0.8">
          <line x1="120" y1="0" x2="18" y2="0" />
          <line x1="120" y1="0" x2="34" y2="22" />
          <line x1="120" y1="0" x2="56" y2="40" />
          <line x1="120" y1="0" x2="80" y2="58" />
          <line x1="120" y1="0" x2="98" y2="86" />
          <line x1="120" y1="0" x2="120" y2="104" />
        </g>
        <g fill="#e3f6fd" class="glow">
          <circle cx="34" cy="22" r="2.2" />
          <circle cx="80" cy="58" r="2.6" />
          <circle cx="120" cy="104" r="2.2" />
        </g>
      </svg>

      <div class="relative px-8 py-14 text-center sm:px-14 sm:py-20">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .corner {
      position: absolute;
      width: 5.5rem;
      height: 5.5rem;
      pointer-events: none;
    }
    @media (min-width: 640px) {
      .corner { width: 7.5rem; height: 7.5rem; }
    }
    .glow {
      filter: drop-shadow(0 0 3px #b9e4f5) drop-shadow(0 0 6px #87ceeb);
      animation: twinkle 3s ease-in-out infinite;
    }
    @keyframes twinkle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
  `,
})
export class DecoFrame {}
