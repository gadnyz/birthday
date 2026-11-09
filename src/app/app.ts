import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LangSwitch } from './components/lang-switch';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LangSwitch],
  template: `
    <header class="no-print sticky top-0 z-30 flex items-center justify-between bg-noir/70 px-4 py-3 backdrop-blur-md sm:px-8">
      <a routerLink="/" class="font-script text-2xl text-ciel">Victorine</a>
      <app-lang-switch />
    </header>
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
