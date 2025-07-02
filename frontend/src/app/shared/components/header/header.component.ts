import { Component, HostBinding, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { Select, Store } from '@ngxs/store';
import { AuthState } from '../../store/registration.state';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { LogoutUser } from '../../store/registration.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.getUser) currentUser$!: Observable<User | undefined>;

  @Input() isMobile = false;
  @HostBinding('class') className = '';
  menuOpen = false;
  userMenuOpen = false;

  constructor(protected translate: TranslateService, protected themeService: ThemeService,
              protected store: Store, protected router: Router) {}

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

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    setTimeout(() => {
      this.userMenuOpen = false;
    }, 200);
  }

  onLogout(): void {
    this.store.dispatch(new LogoutUser());
    this.router.navigate(['/']);
    this.userMenuOpen = false;
  }
}
