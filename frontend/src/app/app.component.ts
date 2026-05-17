import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ToasterComponent } from './shared/components/toaster/toaster.component';
import { checkAuthStatus } from './shared/store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    ToasterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isMobileView = signal(false);
  selectedLanguage = signal('uk');

  private readonly translateService = inject(TranslateService);
  private readonly store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(checkAuthStatus());
    this.setLocale();
    this.checkIfMobile(window);
  }

  @HostListener('window:resize', ['$event.target'])
  onResize(event: Window): void {
    this.checkIfMobile(event);
  }

  private checkIfMobile(window: Window): void {
    this.isMobileView.set(window.innerWidth < 800);
  }

  private setLocale(): void {
    const lang = localStorage.getItem('ui-culture') ?? 'ua';
    this.selectedLanguage.set(lang);
    this.translateService.setDefaultLang('ua');
    this.translateService.use(lang);
  }
}
