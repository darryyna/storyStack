import { Component, HostBinding, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() isMobile = false;
  @HostBinding('class') className = '';
  menuOpen = false;

  constructor(protected translate: TranslateService, protected themeService: ThemeService ) {}

  public get logoSrc(): string {
    return this.themeService.getCurrentTheme() === 'dark-theme'
      ? '/assets/images/dark-logo.png'
      : '/assets/images/light-logo.png';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    localStorage.setItem('ui-culture', lang);
    this.translate.use(lang);
  }

  toggleDarkTheme(): void {
    this.themeService.toggleTheme();
  }
}
