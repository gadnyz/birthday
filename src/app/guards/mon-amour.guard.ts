import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Meta } from '@angular/platform-browser';

/**
 * /mon-amour n'est jamais bloquée côté navigateur : la page affiche le formulaire
 * du code secret, et le contenu n'est servi par l'API qu'avec un jeton valide.
 * Ce guard renforce simplement la consigne « ne pas indexer ».
 */
export const monAmourGuard: CanActivateFn = () => {
  inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' });
  return true;
};
