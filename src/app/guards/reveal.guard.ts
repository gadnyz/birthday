import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RevealService } from '../services/reveal.service';

/**
 * Redirige vers l'accueil avant la révélation.
 * Confort d'affichage uniquement : même en contournant ce guard,
 * /api/messages ne renvoie rien avant REVEAL_AT.
 */
export const revealGuard: CanActivateFn = async () => {
  const reveal = inject(RevealService);
  const router = inject(Router);
  await reveal.ready;
  return reveal.revealed() ? true : router.parseUrl('/');
};
