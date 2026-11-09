import { Routes } from '@angular/router';
import { monAmourGuard } from './guards/mon-amour.guard';
import { revealGuard } from './guards/reveal.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  {
    path: 'souvenirs',
    canActivate: [revealGuard],
    loadComponent: () => import('./pages/souvenirs/souvenirs').then((m) => m.Souvenirs),
  },
  {
    path: 'mon-amour',
    canActivate: [monAmourGuard],
    title: 'Victorine',
    loadComponent: () => import('./pages/mon-amour/mon-amour').then((m) => m.MonAmour),
  },
  { path: 'admin', title: 'Admin', loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin) },
  { path: '**', redirectTo: '' },
];
