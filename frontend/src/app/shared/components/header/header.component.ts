import { Component, ElementRef, HostBinding, HostListener, input, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { Store, select } from '@ngrx/store';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../models/user.model';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { logoutUser } from '../../store/auth/auth.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { UpperCasePipe } from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, MatIconModule, MatButtonModule, RouterModule, UpperCasePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMobile = input<boolean>(false);
  @HostBinding('class') className = '';

  protected readonly translate = inject(TranslateService);
  protected readonly themeService = inject(ThemeService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  isAuthenticated = toSignal(this.store.pipe(select(selectIsAuthenticated)), { initialValue: false });
  currentUser = toSignal(this.store.pipe(select(selectCurrentUser)), { initialValue: undefined as User | undefined });

  menuOpen = false;
  userMenuOpen = false;
  languageMenuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  changeLanguage(lang: string): void {
    localStorage.setItem('ui-culture', lang);
    this.translate.use(lang);
    this.languageMenuOpen = false;
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
    this.store.dispatch(logoutUser());
    this.router.navigate(['/']);
    this.userMenuOpen = false;
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.languageMenuOpen = false;
    }
  }
}
