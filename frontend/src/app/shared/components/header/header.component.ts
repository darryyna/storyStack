import { Component, HostListener, input, inject, signal, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { Store } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { logoutUser } from '../../store/auth/auth.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';
import { MenuType } from '../../helpers/ui-models';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, MatIconModule, MatButtonModule, RouterModule, UpperCasePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isMobile = input<boolean>(false);
  protected readonly translate = inject(TranslateService);
  protected readonly themeService = inject(ThemeService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = toSignal(
    this.store.select(selectIsAuthenticated),
    { initialValue: false }
  );

  protected readonly currentUser = toSignal(
    this.store.select(selectCurrentUser),
    { initialValue: undefined }
  );
  private readonly activeMenu = signal<MenuType>(null);

  // derived signals
  protected readonly isMenuOpen = computed(
    () => this.activeMenu() === 'main'
  );
  protected readonly isUserMenuOpen = computed(
    () => this.activeMenu() === 'user'
  );
  protected readonly isLanguageMenuOpen = computed(
    () => this.activeMenu() === 'language'
  );
  protected toggleMenu(type: MenuType): void {
    this.activeMenu.update(current =>
      current === type ? null : type
    );
  }

  protected closeMenu(): void {
    this.activeMenu.set(null);
  }

  protected toggleDarkTheme(): void {
    this.themeService.toggleTheme();
  }

  protected navigateToCabinet(): void {
    this.closeMenu();
    this.router.navigate(['/personal-cabinet']);
  }

  protected onLogout(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.store.dispatch(logoutUser());
    this.closeMenu();
    this.router.navigate(['/']);
  }

  protected changeLanguage(lang: string): void {
    localStorage.setItem('ui-culture', lang);
    this.translate.use(lang);
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.custom-language-select') &&
      !target.closest('.user-info') &&
      !target.closest('.burger-btn')
    ) {
      this.closeMenu();
    }
  }
}
