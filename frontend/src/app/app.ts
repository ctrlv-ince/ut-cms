import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponent } from './components/website.component';
import { StudioComponent } from './components/studio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WebsiteComponent, StudioComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(StudioComponent) studioComp?: StudioComponent;

  // Active view: 'website' (Public corporate showcase) or 'studio' (Directus CMS)
  activeMode = signal<'website' | 'studio'>('website');

  switchToWebsite() {
    this.activeMode.set('website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  switchToStudio(section: string = 'dashboard') {
    this.activeMode.set('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (this.studioComp) {
        this.studioComp.activeSection.set(section as any);
      }
    }, 50);
  }
}
