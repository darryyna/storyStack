import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isMobileView = false;
  public selectedLanguage: string = 'uk';

  constructor(
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.setLocale();
    this.checkIfMobile(window);
  }

  @HostListener('window:resize', ['$event.target'])
  onResize(event: Window): void {
    this.checkIfMobile(event);
  }

  private checkIfMobile(window: Window): void {
    this.isMobileView = window.innerWidth < 800;
  }

  private setLocale(): void {
    this.selectedLanguage = localStorage.getItem('preffered-lang') ?? 'uk';
    this.translateService.setDefaultLang('uk');
    this.translateService.use(this.selectedLanguage);
  }
}
