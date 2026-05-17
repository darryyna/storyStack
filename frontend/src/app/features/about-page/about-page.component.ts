import { AfterViewInit, Component, ElementRef, inject, OnDestroy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectIsAuthenticated } from 'src/app/shared/store/auth/auth.selectors';

@Component({
  selector: 'app-about-page',
  imports: [
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent implements AfterViewInit, OnDestroy {

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly store = inject(Store);
  private observer?: IntersectionObserver;

  protected readonly isAuthenticated = toSignal(
    this.store.select(selectIsAuthenticated),
    { initialValue: false }
  );

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        }
      },
      { threshold: 0.15 }
    );

    const sections = this.host.nativeElement.querySelectorAll('section');

    sections.forEach((section: Element) => this.observer?.observe(section));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
