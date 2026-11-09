import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LangSwitch } from './components/lang-switch';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LangSwitch],
  template: `
    <header
      class="no-print sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-md sm:px-8"
      [class]="isLove() ? 'bg-noir/60' : 'bg-noir/70'"
    >
      <a routerLink="/" class="font-script text-2xl" [class]="isLove() ? 'text-rose' : 'text-ciel'">Victorine</a>
      <app-lang-switch [accent]="isLove() ? 'rose' : 'ciel'" />
    </header>
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {
  private readonly router = inject(Router);
  protected readonly isLove = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects.startsWith('/mon-amour')),
    ),
    { initialValue: false },
  );
}
