import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: string = 'light-theme';

  constructor(private readonly rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.applyTheme();
    this.saveTheme();
  }

  private applyTheme(): void {
    if (this.currentTheme === 'dark-theme') {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  private saveTheme(): void {
    localStorage.setItem('app-theme', this.currentTheme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
