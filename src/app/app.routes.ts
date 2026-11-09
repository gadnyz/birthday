import { Routes } from '@angular/router';
import { monAmourGuard } from './guards/mon-amour.guard';

/** Seule la page /mon-amour est utilisée : toute autre adresse y redirige. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mon-amour' },
  {
    path: 'mon-amour',
    canActivate: [monAmourGuard],
    title: 'Heureux anniversaire, chérie !!!',
    loadComponent: () => import('./pages/mon-amour/mon-amour').then((m) => m.MonAmour),
  },
  { path: '**', redirectTo: 'mon-amour' },
];
